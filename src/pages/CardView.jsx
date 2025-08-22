//CardView.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";
import "../styles/cardview.css";

const backendUrl = "https://geticard.onrender.com";

const CardView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [emailMismatch, setEmailMismatch] = useState(false);

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

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && dados && dados.emailContato) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.sub === dados.emailContato) {
          setIsOwner(true);
          setEmailMismatch(false);
        } else {
          setIsOwner(false);
          setEmailMismatch(true);
        }
      } catch (e) {
        setIsOwner(false);
        setEmailMismatch(false);
      }
    } else {
      setIsOwner(false);
      setEmailMismatch(false);
    }
  }, [dados]);

  // Função para salvar dados do cartão e retornar ao create sem perder os campos
  const handleBackToEdit = () => {
    localStorage.setItem(
      "card_temp_data",
      JSON.stringify({
        nome: dados.nome || "",
        biografia: dados.biografia || "",
        empresa: dados.empresa || "",
        whatsapp: dados.whatsapp || "",
        emailContato: dados.emailContato || "",
        instagram: dados.instagram || "",
        linkedin: dados.linkedin || "",
        site: dados.site || "",
        chave_pix: dados.chave_pix || "",
        // galeria/foto_perfil não são restauráveis como files!
      })
    );
    navigate("/card/create");
  };

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

  async function handleDelete() {
    if (
      window.confirm("Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita!")
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

        {/* AVISO de e-mail diferente do cadastro */}
        {emailMismatch && (
          <div style={{
            background: "#ffe6e6",
            border: "1px solid #d66767",
            borderRadius: 8,
            padding: "16px 18px",
            color: "#822",
            marginBottom: 18,
            textAlign: "center"
          }}>
            <b>O e-mail do cartão não é o mesmo do seu login!</b><br />
            Só é possível editar ou excluir o cartão se o e-mail cadastrado no cartão for igual ao do seu login.<br /><br />
            <button
              style={{
                background: "#c62828",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 18px",
                fontWeight: 600,
                marginTop: 10,
                cursor: "pointer"
              }}
              onClick={handleBackToEdit}
            >
              Voltar e corrigir e-mail do cartão
            </button>
            <div style={{ fontSize: 13, color: "#a88", marginTop: 8 }}>
              Seus dados preenchidos serão mantidos!
            </div>
          </div>
        )}

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
