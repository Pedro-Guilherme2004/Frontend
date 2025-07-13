// Register.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // backend pode retornar lista de erros do Pydantic ou objeto com 'error'
        if (Array.isArray(data) && data.length > 0 && data[0].msg) {
          setError(data[0].msg);
        } else if (data.error) {
          setError(data.error);
        } else {
          setError("Erro ao criar usuário");
        }
        return;
      }

      // Cadastro ok: redireciona para login
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Erro inesperado");
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
