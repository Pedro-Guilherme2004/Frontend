//CardView.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import api from "../services/api";
import "../styles/cardedit.css";

const CardView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dados, setDados] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const response = await api.get(`/card/${id}`);
        setDados(response.data || {});
        setError(null);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          localStorage.removeItem("card_id");
          setError("Cartão não encontrado.");
        } else {
          setError("Erro ao carregar o cartão.");
        }
        setDados({});
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (loading) return <p>Carregando...</p>;

  const cardUrl = `${window.location.origin}/card/view/${dados.card_id}`;
  const backendUrl = "https://geticard.onrender.com";

  // --- Função para excluir cartão
  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita!")) {
      try {
        await api.delete(`/card/${dados.card_id}`);
        localStorage.removeItem("card_id");
        alert("Cartão excluído com sucesso!");
        navigate("/");
      } catch (err) {
        alert("Erro ao excluir o cartão.");
      }
    }
  };

  // Decide qual foto mostrar
  let fotoPerfilSrc = "/user-default.png";
  if (dados.foto_perfil) {
    fotoPerfilSrc = dados.foto_perfil.startsWith("http")
      ? dados.foto_perfil
      : `${backendUrl}${dados.foto_perfil}`;
  }

  return (
    <div className="card-view-container">
      <div className="border-type1">

        {/* FOTO de perfil ou padrão */}
        <img
          src={fotoPerfilSrc}
          alt="Avatar"
          className="avatar"
        />

        {/* NOME */}
        {dados.nome && (
          <h2 className="name">{dados.nome}</h2>
        )}

        {/* E-MAIL DE CONTATO */}
        {dados.emailContato && (
          <div style={{ textAlign: "center", color: "white", marginBottom: 8 }}>
            <strong>Email: {dados.emailContato}</strong>
          </div>
        )}

        {/* --- BLOCOS ARREDONDADOS DE INFORMAÇÕES --- */}
        {dados.empresa && (
          <div className="info-block">{dados.empresa}</div>
        )}
        {dados.biografia && (
          <div className="info-block">{dados.biografia}</div>
        )}
        {dados.chave_pix && (
          <div className="info-block">
            Pix: {dados.chave_pix}
          </div>
        )}
        {dados.whatsapp && (
          <div className="info-block">
            WhatsApp: {dados.whatsapp}
          </div>
        )}

        {/* Botão Editar */}
        <button
          style={{ marginBottom: 10, marginTop: 6 }}
          onClick={() => navigate(`/card/edit/${dados.card_id}`)}
        >
          Editar Cartão
        </button>

        {/* Botão Excluir */}
        <button
          style={{
            marginBottom: 18,
            background: "#b30d0d",
            color: "white",
            borderRadius: "8px",
            border: "none",
            padding: "8px 20px",
            cursor: "pointer"
          }}
          onClick={handleDelete}
        >
          Excluir Cartão
        </button>

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
                  <button>
                    <img src="/insta.png" alt="Instagram" className="icon" />
                  </button>
                </a>
              )}
              {dados.linkedin && (
                <a href={dados.linkedin} target="_blank" rel="noopener noreferrer">
                  <button>
                    <img src="/linkedin.png" alt="LinkedIn" className="icon" />
                  </button>
                </a>
              )}
              {dados.site && (
                <a href={dados.site} target="_blank" rel="noopener noreferrer">
                  <button>
                    <img src="/website.png" alt="Site" className="icon" />
                  </button>
                </a>
              )}
            </div>
          </>
        )}

        {/* GALERIA */}
        {dados.galeria?.length > 0 && (
          <>
            <p className="section-title white">Galeria:</p>
            <div className="gallery">
              {dados.galeria.map((img, idx) => (
                <img
                  key={idx}
                  src={`data:image/png;base64,${img.split(",")[1]}`}
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