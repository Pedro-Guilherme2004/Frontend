//CardView.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import api from "../services/api";
import jwt_decode from "jwt-decode"; // <--- IMPORTANTE!
import "../styles/cardedit.css";

const backendUrl = "https://geticard.onrender.com";

const CardView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function fetchCard() {
      try {
        const response = await api.get(`/card/${id}`);
        if (response.data && !response.data.error) {
          setDados(response.data);
          setError(null);
        } else {
          setDados(null);
          setError("Cartão não encontrado.");
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          localStorage.removeItem("card_id");
          setError("Cartão não encontrado.");
        } else {
          setError("Erro ao carregar o cartão.");
        }
        setDados(null);
      } finally {
        setLoading(false);
      }
    }
    fetchCard();
  }, [id]);

  // Checa se o usuário autenticado é o dono do cartão
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && dados && dados.emailContato) {
      try {
        const decoded = jwt_decode(token);
        // O backend coloca o email em 'sub' do token JWT
        setIsOwner(decoded.sub === dados.emailContato);
      } catch (e) {
        setIsOwner(false);
      }
    } else {
      setIsOwner(false);
    }
  }, [dados]);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!dados) return null;

  const cardUrl = `${window.location.origin}/card/view/${dados.card_id}`;

  let fotoPerfilSrc = "/user-default.png";
  if (dados.foto_perfil) {
    if (dados.foto_perfil.startsWith("/uploads/")) {
      fotoPerfilSrc = `${backendUrl}${dados.foto_perfil}`;
    } else if (
      dados.foto_perfil.startsWith("data:image") ||
      dados.foto_perfil.startsWith("http")
    ) {
      fotoPerfilSrc = dados.foto_perfil;
    }
  }

  // Função para deletar cartão
  async function handleDelete() {
    if (
      window.confirm(
        "Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita!"
      )
    ) {
      try {
        await api.delete(`/card/${dados.card_id}`);
        localStorage.removeItem("card_id");
        alert("Cartão excluído com sucesso!");
        navigate("/");
      } catch (err) {
        alert("Erro ao excluir o cartão.");
      }
    }
  }

  const renderGalleryImg = (img) => {
    if (!img) return "";
    if (img.startsWith("/uploads/")) {
      return `${backendUrl}${img}`;
    }
    if (img.startsWith("data:image")) {
      return img;
    }
    return img;
  };

  return (
    <div className="card-view-container">
      <div className="border-type1">
        {/* TOPO: AVATAR + NOME */}
        <div className="avatar-nome-block">
          <img src={fotoPerfilSrc} alt="Avatar" className="avatar" />
          <h2 className="name">{dados.nome || "Sem Nome"}</h2>
        </div>

        {/* BLOCO DE INFORMAÇÕES */}
        {dados.emailContato && (
          <div className="info-block">
            <strong>Email: </strong>{dados.emailContato}
          </div>
        )}
        {dados.empresa && (
          <div className="info-block">
            <strong>Empresa: </strong>{dados.empresa}
          </div>
        )}
        {dados.biografia && (
          <div className="info-block">
            <strong>Bio: </strong>{dados.biografia}
          </div>
        )}
        {dados.chave_pix && (
          <div className="info-block">
            <strong>Pix: </strong>{dados.chave_pix}
          </div>
        )}
        {dados.whatsapp && (
          <div className="info-block">
            <strong>WhatsApp: </strong>{dados.whatsapp}
          </div>
        )}

        {/* Botões só aparecem para o dono do cartão */}
        {isOwner && (
          <>
            <button
              style={{ marginBottom: 10, marginTop: 10 }}
              onClick={() => navigate(`/card/edit/${dados.card_id}`)}
            >
              Editar Cartão
            </button>
            <button
              style={{
                marginBottom: 18,
                background: "#b30d0d",
                color: "white",
                borderRadius: "8px",
                border: "none",
                padding: "8px 20px",
                cursor: "pointer",
              }}
              onClick={handleDelete}
            >
              Excluir Cartão
            </button>
          </>
        )}

        {/* BLOCO DE LINK PARA NFC/QR CODE */}
        <div style={{ margin: "20px 0", textAlign: "center" }}>
          <strong>Link do Cartão:</strong>
          <input
            type="text"
            value={cardUrl}
            readOnly
            style={{ width: "90%", margin: "8px 0" }}
            onClick={e => e.target.select()}
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(cardUrl);
              alert("Link copiado para área de transferência!");
            }}
          >
            Copiar Link
          </button>
          <div style={{ marginTop: 18 }}>
            <QRCode value={cardUrl} size={130} />
            <div style={{ fontSize: 13, marginTop: 8 }}>
              Escaneie o QR code para acessar este cartão!
            </div>
          </div>
        </div>

        {/* REDES SOCIAIS */}
        {(dados.instagram || dados.linkedin || dados.site) && (
          <>
            <p className="section-title white">Redes Sociais:</p>
            <div className="button-group">
              {dados.instagram && (
                <a href={dados.instagram} target="_blank" rel="noopener noreferrer">
                  <button type="button">
                    <img src="/insta.png" alt="Instagram" className="icon" />
                  </button>
                </a>
              )}
              {dados.linkedin && (
                <a href={dados.linkedin} target="_blank" rel="noopener noreferrer">
                  <button type="button">
                    <img src="/linkedin.png" alt="LinkedIn" className="icon" />
                  </button>
                </a>
              )}
              {dados.site && (
                <a href={dados.site} target="_blank" rel="noopener noreferrer">
                  <button type="button">
                    <img src="/website.png" alt="Site" className="icon" />
                  </button>
                </a>
              )}
            </div>
          </>
        )}

        {/* GALERIA */}
        {Array.isArray(dados.galeria) && dados.galeria.length > 0 && (
          <>
            <p className="section-title white">Galeria:</p>
            <div className="gallery">
              {dados.galeria.map((img, idx) => (
                <img
                  key={idx}
                  src={renderGalleryImg(img)}
                  alt={`produto-${idx}`}
                  className="gallery-img"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CardView;
