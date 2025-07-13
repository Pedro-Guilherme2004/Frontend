//CardEdit.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";

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
        const response = await fetch(`/api/card/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Erro ao buscar cartão");

        const data = await response.json();
        setDados(prev => ({
          ...prev,
          ...data
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

      const response = await fetch(`/api/card/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dadosAtualizados),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao atualizar cartão");
      }

      setMensagem("Cartão atualizado com sucesso!");
      navigate(`/card/view/${id}`);
    } catch (error) {
      setErro(error.message || "Erro ao atualizar cartão.");
    }
  };

  const handleDelete = async () => {
    const confirmar = window.confirm("Deseja realmente excluir este cartão?");
    if (!confirmar) return;

    try {
      const response = await fetch(`/api/card/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao deletar cartão");
      }

      alert("Cartão deletado com sucesso!");
      navigate("/");
    } catch (error) {
      alert(error.message || "Erro ao deletar cartão.");
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
          src={dados.foto_perfil.startsWith("/") ? "http://localhost:5000" + dados.foto_perfil : dados.foto_perfil}
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
      <button
        type="button"
        onClick={handleDelete}
        style={{ background: "red", color: "white", marginLeft: "1rem" }}
      >
        Excluir Cartão
      </button>
    </form>
  );
};

export default CardEdit;
