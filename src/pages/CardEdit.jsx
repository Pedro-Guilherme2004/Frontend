// CardEdit.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import api from "../services/api"; // <-- Importa a instância do axios

const backendUrl = "https://geticard.onrender.com"; // Troque se seu backend for outro

const CardEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dados, setDados] = useState({
    nome: "",
    biografia: "",
    empresa: "",
    telefone: "",
    emailContato: "",
    foto_perfil: "",
  });
  const [novaFoto, setNovaFoto] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchCard = async () => {
      try {
        // Usa o axios já com baseURL
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

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNovaFoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");
    try {
      const dadosAtualizados = { ...dados };
      if (novaFoto) {
        dadosAtualizados.foto_perfil = novaFoto;
      }
      // Usa PUT via axios
      await api.put(`/card/${id}`, dadosAtualizados, {
        headers: {
          Authorization: `Bearer ${token}`,
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
    <form onSubmit={handleSubmit}>
      <h2>Editar Cartão</h2>
      {mensagem && <p style={{ color: "green" }}>{mensagem}</p>}

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

      <label>Nova Foto:</label>
      <input type="file" accept="image/*" onChange={handleFotoChange} />

      <InputField
        label="Nome"
        name="nome"
        value={dados.nome}
        onChange={handleChange}
      />
      {/* Use textarea para biografia */}
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
        label="Telefone"
        name="telefone"
        value={dados.telefone}
        onChange={handleChange}
      />
      <InputField
        label="Email para contato"
        name="emailContato"
        value={dados.emailContato}
        onChange={handleChange}
      />

      <button type="submit">Salvar Alterações</button>
      {/* Se não usar DELETE, remova o botão abaixo */}
      {/* <button
        type="button"
        onClick={handleDelete}
        style={{ background: "red", color: "white", marginLeft: "1rem" }}
      >
        Excluir Cartão
      </button> */}
    </form>
  );
};

export default CardEdit;
