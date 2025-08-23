import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import api from "../services/api";
import "../styles/cardedit.css"; // .edit-page / .edit-main / .edit-surface / .edit-footer

const backendUrl = "https://geticard.onrender.com";

// Normaliza qualquer caminho de imagem vindo do backend
const normalizeImgUrl = (raw) => {
  if (!raw) return "";
  let s = String(raw).trim().replace(/\\/g, "/"); // \ -> /
  if (/^https?:\/\//i.test(s) || s.startsWith("data:image")) return s;
  if (s.startsWith("/")) return `${backendUrl}${s}`;
  return `${backendUrl}/${s.replace(/^\.?\//, "")}`;
};

const CardEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dados, setDados] = useState({
    nome: "",
    biografia: "",
    empresa: "",
    whatsapp: "",
    emailContato: "",
    instagram: "",
    linkedin: "",
    site: "",
    chave_pix: "",
    galeria: [],
    foto_perfil: "",
  });
  const [novaFoto, setNovaFoto] = useState(null);
  const [novaGaleria, setNovaGaleria] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const response = await api.get(`/card/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const payload = response.data || {};
        setDados((prev) => ({
          ...prev,
          ...payload,
          // garante que a galeria é sempre um array de strings normalizadas
          galeria: Array.isArray(payload.galeria)
            ? payload.galeria.map((g) => normalizeImgUrl(g))
            : [],
          // mantém o valor bruto (para enviar) mas já teremos preview normalizado
        }));
      } catch {
        setErro("Erro ao carregar cartão.");
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, [id, token]);

  const handleChange = (e) =>
    setDados({ ...dados, [e.target.name]: e.target.value });

  const handleFotoChange = (e) => setNovaFoto(e.target.files[0]);

  const handleGalleryChange = (e) =>
    setNovaGaleria(Array.from(e.target.files));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");

    try {
      const formData = new FormData();
      formData.append("nome", dados.nome);
      formData.append("biografia", dados.biografia);
      formData.append("empresa", dados.empresa);
      formData.append("whatsapp", dados.whatsapp);
      formData.append("emailContato", dados.emailContato);
      formData.append("instagram", dados.instagram);
      formData.append("linkedin", dados.linkedin);
      formData.append("site", dados.site);
      formData.append("chave_pix", dados.chave_pix);

      // Só envia foto nova se realmente trocou
      if (novaFoto) formData.append("foto_perfil", novaFoto);

      // Só envia novas imagens de galeria se selecionou
      for (let file of novaGaleria) formData.append("galeria", file);

      await api.put(`/card/${id}`, formData, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "multipart/form-data",
        },
      });

      setMensagem("Cartão atualizado com sucesso!");
      navigate(`/card/view/${id}`);
    } catch (error) {
      setErro(
        error?.response?.data?.error ||
          error?.message ||
          "Erro ao atualizar cartão."
      );
    }
  };

  const fotoAtual = normalizeImgUrl(dados.foto_perfil);

  return (
    <div className="edit-page">
      <main className="edit-main">
        <div className="edit-surface">
          {loading ? (
            <p>Carregando...</p>
          ) : erro ? (
            <p style={{ color: "red" }}>{erro}</p>
          ) : (
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <h2>Editar Cartão</h2>
              {mensagem && <p style={{ color: "green" }}>{mensagem}</p>}

              {/* Avatar atual (URL normalizada) */}
              {fotoAtual && (
                <img
                  src={fotoAtual}
                  alt="Foto atual"
                  style={{
                    maxWidth: 200,
                    marginBottom: "1rem",
                    display: "block",
                    borderRadius: 12,
                  }}
                />
              )}

              {/* Trocar foto */}
              <label>Nova Foto:</label>
              <input type="file" accept="image/*" onChange={handleFotoChange} />

              {/* Campos */}
              <InputField
                label="Nome"
                name="nome"
                value={dados.nome}
                onChange={handleChange}
              />

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontWeight: "bold" }}>Biografia</label>
                <textarea
                  name="biografia"
                  value={dados.biografia}
                  onChange={handleChange}
                  rows={3}
                  style={{ width: "100%", padding: "6px" }}
                />
              </div>

              <InputField
                label="Empresa"
                name="empresa"
                value={dados.empresa}
                onChange={handleChange}
              />
              <InputField
                label="WhatsApp"
                name="whatsapp"
                value={dados.whatsapp}
                onChange={handleChange}
              />
              <InputField
                label="Email para contato"
                name="emailContato"
                value={dados.emailContato}
                onChange={handleChange}
              />
              <InputField
                label="Instagram"
                name="instagram"
                value={dados.instagram}
                onChange={handleChange}
              />
              <InputField
                label="LinkedIn"
                name="linkedin"
                value={dados.linkedin}
                onChange={handleChange}
              />
              <InputField
                label="Site Personalizado"
                name="site"
                value={dados.site}
                onChange={handleChange}
              />
              <InputField
                label="Chave Pix"
                name="chave_pix"
                value={dados.chave_pix}
                onChange={handleChange}
              />

              {/* Galeria atual (preview com URLs normalizadas) */}
              {Array.isArray(dados.galeria) && dados.galeria.length > 0 && (
                <div style={{ margin: "10px 0" }}>
                  <label style={{ fontWeight: 700, display: "block" }}>
                    Galeria atual:
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(100px,1fr))",
                      gap: 10,
                      marginTop: 6,
                    }}
                  >
                    {dados.galeria.map((g, i) => (
                      <img
                        key={i}
                        src={normalizeImgUrl(g)}
                        alt={`galeria-${i}`}
                        style={{
                          width: "100%",
                          height: 100,
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid #e0e6ee",
                        }}
                        loading="lazy"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Adicionar novas imagens */}
              <div>
                <label>Adicionar novas fotos (produtos):</label>
                <br />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                />
                <br />
                <br />
              </div>

              <button type="submit">Salvar Alterações</button>
            </form>
          )}
        </div>
      </main>

      <footer className="edit-footer">
        © 2025 GETICARD — Editando seu cartão
      </footer>
    </div>
  );
};

export default CardEdit;
