// CardEdit.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import api from "../services/api";

const backendUrl = "https://geticard.onrender.com";

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
    foto_perfil: ""
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
          headers: { Authorization: `Bearer ${token}` }
        });
        setDados((prev) => ({
          ...prev,
          ...response.data,
        }));
      } catch (error) {
        setErro("Erro ao carregar cartão.");
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [id, token]);

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value });
  };

  // Atualiza nova foto para upload
  const handleFotoChange = (e) => {
    setNovaFoto(e.target.files[0]);
  };

  // Atualiza galeria para upload
  const handleGalleryChange = (e) => {
    setNovaGaleria(Array.from(e.target.files));
  };

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

      // Foto de perfil (só adiciona se foi alterada)
      if (novaFoto) {
        formData.append("foto_perfil", novaFoto);
      }

      // Nova galeria (se houver upload novo)
      for (let file of novaGaleria) {
        formData.append("galeria", file);
      }

      await api.put(`/card/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
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

  if (loading) return <p>Carregando...</p>;
  if (erro) return <p style={{ color: "red" }}>{erro}</p>;

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <h2>Editar Cartão</h2>
      {mensagem && <p style={{ color: "green" }}>{mensagem}</p>}

      {/* Avatar Atual */}
      {dados.foto_perfil && (
        <img
          src={
            dados.foto_perfil.startsWith("http")
              ? dados.foto_perfil
              : `${backendUrl}${dados.foto_perfil}`
          }
          alt="Foto atual"
          style={{ maxWidth: "200px", marginBottom: "1rem" }}
        />
      )}
      {/* Trocar foto */}
      <label>Nova Foto:</label>
      <input type="file" accept="image/*" onChange={handleFotoChange} />

      {/* Nome */}
      <InputField
        label="Nome"
        name="nome"
        value={dados.nome}
        onChange={handleChange}
      />

      {/* Biografia */}
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

      {/* Empresa */}
      <InputField
        label="Empresa"
        name="empresa"
        value={dados.empresa}
        onChange={handleChange}
      />

      {/* WhatsApp */}
      <InputField
        label="WhatsApp"
        name="whatsapp"
        value={dados.whatsapp}
        onChange={handleChange}
      />

      {/* Email para contato */}
      <InputField
        label="Email para contato"
        name="emailContato"
        value={dados.emailContato}
        onChange={handleChange}
      />

      {/* Instagram */}
      <InputField
        label="Instagram"
        name="instagram"
        value={dados.instagram}
        onChange={handleChange}
      />

      {/* LinkedIn */}
      <InputField
        label="LinkedIn"
        name="linkedin"
        value={dados.linkedin}
        onChange={handleChange}
      />

      {/* Site */}
      <InputField
        label="Site Personalizado"
        name="site"
        value={dados.site}
        onChange={handleChange}
      />

      {/* Chave Pix */}
      <InputField
        label="Chave Pix"
        name="chave_pix"
        value={dados.chave_pix}
        onChange={handleChange}
      />

      {/* Galeria de Fotos */}
      <div>
        <label>Galeria de Fotos (produtos):</label>
        <br />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryChange}
        />
        <br /><br />
      </div>

      <button type="submit">Salvar Alterações</button>
    </form>
  );
};

export default CardEdit;
