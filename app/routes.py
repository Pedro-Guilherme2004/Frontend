#routes.py

from flask import Blueprint, request, jsonify, send_from_directory
from app.models import User, Card
from pydantic import ValidationError
import jwt
from datetime import datetime, timedelta
from boto3.dynamodb.conditions import Attr
import boto3
import uuid
from app.services import (
    hash_password,
    salvar_imagem_local,
)
from app.config import Config
import os

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')

# Conexão com DynamoDB
dynamodb = boto3.resource(
    'dynamodb',
    region_name=Config.AWS_REGION,
    aws_access_key_id=os.getenv("AKIARI22QTZIH7OEW4GC"),
    aws_secret_access_key=os.getenv("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")
)
users_table = dynamodb.Table("GetiCardUsers")
cards_table = dynamodb.Table("Testecard")  # Ou "GetiCardCards" se preferir

routes = Blueprint("api", __name__)
SECRET_KEY = Config.SECRET_KEY

# ------------------ REGISTRO USUÁRIO ------------------
@routes.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        user = User(**data)
        user_dict = user.dict()
        user_dict["password"] = hash_password(user_dict["password"])

        # Verifica se já existe usuário com esse e-mail
        if users_table.get_item(Key={"email": user_dict["email"]}).get("Item"):
            return jsonify({"error": "Usuário já existe"}), 409

        users_table.put_item(Item=user_dict)
        return jsonify({"message": "Usuário criado com sucesso"}), 201

    except ValidationError as e:
        return jsonify(e.errors()), 400
    except Exception as e:
        print("Erro ao registrar:", e)
        return jsonify({"error": str(e)}), 500

# ------------------ LOGIN USUÁRIO ------------------
@routes.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    # Busca usuário na tabela de usuários
    resp = users_table.get_item(Key={"email": email})
    user = resp.get("Item")
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 401
    if user["password"] != hash_password(password):
        return jsonify({"error": "Senha inválida"}), 401

    token = jwt.encode({
        "sub": email,
        "exp": datetime.utcnow() + timedelta(minutes=15)
    }, SECRET_KEY, algorithm="HS256")

    # Busca cartão associado ao emailContato do usuário (importante: emailContato, não email de login)
    card_resp = cards_table.scan(FilterExpression=Attr('emailContato').eq(email))
    cards = card_resp.get('Items', [])
    card_id = cards[0]["card_id"] if cards else None

    return jsonify({"access_token": token, "card_id": card_id}), 200

# ------------------ CRIAR CARTÃO ------------------
@routes.route("/card", methods=["POST"])
def create_card():
    try:
        data = request.json

        # Email de contato deve ser obrigatório
        emailContato = data.get("emailContato")
        if not emailContato:
            return jsonify({"error": "Email para contato obrigatório!"}), 400

        # Verifica se já existe cartão para este emailContato
        resp = cards_table.scan(
            FilterExpression=Attr('emailContato').eq(emailContato)
        )
        if resp.get('Items'):
            card_existente = resp['Items'][0]
            return jsonify({
                "message": "Já existe um cartão para este email.",
                "card_id": card_existente["card_id"]
            }), 200

        # Criação do cartão
        card_id = f"card-{uuid.uuid4().hex[:8]}"
        card = Card(**data)
        card_dict = card.dict()
        card_dict["card_id"] = card_id

        if card.foto_perfil:
            card_dict["foto_perfil"] = salvar_imagem_local(card.foto_perfil, card_id)
        cards_table.put_item(Item=card_dict)
        return jsonify({"message": "Cartão criado com sucesso", "card_id": card_id}), 201

    except ValidationError as e:
        return jsonify(e.errors()), 400
    except Exception as e:
        print("Erro ao criar cartão:", e)
        return jsonify({"error": str(e)}), 500

# ------------------ GET CARD ------------------
@routes.route("/card/<card_id>", methods=["GET"])
def get_card(card_id):
    try:
        response = cards_table.get_item(Key={"card_id": card_id})
        item = response.get("Item")
        if not item:
            return jsonify({"error": "Cartão não encontrado"}), 404
        return jsonify(item), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@routes.route("/card/<card_id>", methods=["PUT"])
def update_card(card_id):
    try:
        data = request.json
        # Busca o cartão pelo ID
        response = cards_table.get_item(Key={"card_id": card_id})
        card = response.get("Item")
        if not card:
            return jsonify({"error": "Cartão não encontrado"}), 404

        # Atualiza os campos permitidos (ajuste conforme sua modelagem!)
        campos_editaveis = ["nome", "biografia", "empresa", "telefone", "emailContato", "foto_perfil"]
        for campo in campos_editaveis:
            if campo in data:
                card[campo] = data[campo]

        cards_table.put_item(Item=card)
        return jsonify({"message": "Cartão atualizado com sucesso"}), 200
    except Exception as e:
        print("Erro ao atualizar cartão:", e)
        return jsonify({"error": str(e)}), 500

# ------------------ UPLOADS ------------------
@routes.route("/uploads/<path:filename>")
def servir_arquivo(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# ------------------ SEGREDO (PROTEGIDO) ------------------
def token_required(f):
    from functools import wraps
    def decorator(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Token ausente'}), 401
        try:
            token = auth_header.split(' ')[1]
            jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        except Exception as e:
            return jsonify({'error': str(e)}), 403
        return f(*args, **kwargs)
    return wraps(f)(decorator)

@routes.route("/segredo", methods=["GET"])
@token_required
def segredo():
    return jsonify({"mensagem": "Você tem acesso autorizado"}), 200

# ------------------ DEBUG DYNAMO (opcional) ------------------
@routes.route("/debug-dynamo", methods=["GET"])
def debug_dynamo():
    try:
        response = cards_table.scan()
        print("Itens da tabela:", response.get("Items", []))
        return jsonify(response.get("Items", [])), 200
    except Exception as e:
        print("Erro DynamoDB:", str(e))
        return jsonify({"error": str(e)}), 500
