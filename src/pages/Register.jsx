import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import api from "../services/api"; // <-- Importa a instância axios

const Register = () => {
  const [name, setName] = useState("");      // Continua usando "name" localmente no React
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // ENVIA "nome" para o backend
      const response = await api.post("/register", { 
        nome: name,           // <-- Aqui é o campo certo para o backend
        email, 
        password 
      });

      if (response.status !== 201 && response.status !== 200) {
        setError(response.data.error || "Erro ao criar usuário");
        return;
      }

      // Cadastro ok: redireciona para login
      navigate("/");
    } catch (err) {
      if (err.response && Array.isArray(err.response.data) && err.response.data[0].msg) {
        setError(err.response.data[0].msg);
      } else if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Erro inesperado");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Criar Conta</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <InputField
        label="Nome"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <InputField
        label="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Cadastrar</button>
    </form>
  );
};

export default Register;
