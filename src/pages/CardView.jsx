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
        // Use sempre o api do axios com baseURL já setado!
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

  // Gera o link do cartão para QRCode e botão copiar
  const cardUrl = `${window.location.origin}/card/view/${dados.card_id}`;

  // Ajusta o caminho da imagem para usar o backend correto (Render em produção)
  // (troca para o seu domínio Render se necessário)
  const backendUrl = "https://geticard.onrender.com";

  return (
    <div className="card-view-container">
      <div className="border-type1">
        {/* FOTO e NOME */}
        {dados.foto_perfil && (
          <img
            src={
              dados.foto_perfil.startsWith("http")
                ? dados.foto_perfil
                : `${backendUrl}${dados.foto_perfil}`
            }
            alt="Avatar"
            className="avatar"
          />
        )}
        <h2 className="name">{dados.nome}</h2>

        {/* Botão Editar */}
        <button
          style={{ marginBottom: 18, marginTop: 6 }}
          onClick={() => navigate(`/card/edit/${dados.card_id}`)}
        >
          Editar Cartão
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
          {/* QR CODE GERADO */}
          <div style={{ marginTop: 18 }}>
            <QRCode value={cardUrl} size={130} />
            <div style={{ fontSize: 13, marginTop: 8 }}>
              Escaneie o QR code para acessar este cartão!
            </div>
          </div>
        </div>
        {/* FIM BLOCO DE LINK */}

        {/* BIOGRAFIA */}
        {dados.biografia && (
          <div className="border-type3">
            <p className="bio">
              <strong>{dados.biografia}</strong>
            </p>
          </div>
        )}

        {/* PIX */}
        {dados.chave_pix && (
          <div className="border-type4">
            <p className="pix">
              <strong>Pix: {dados.chave_pix}</strong>
            </p>
          </div>
        )}

        {/* WHATSAPP */}
        {dados.whatsapp && (
          <div className="border-type5">
            <p className="whatsapp">
              <strong>WhatsApp: {dados.whatsapp}</strong>
            </p>
          </div>
        )}

        {/* Redes Sociais */}
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

        {/* Galeria */}
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
