import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import InputField from "../components/InputField";
import api from "../services/api"; // <-- Importante!
import "../styles/login.css";      // <-- estilos SÓ do login

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/login", { email, password });
      const data = response.data;

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("card_id", data.card_id);

      if (data.card_id) {
        try {
          const resp = await api.get(`/card/${data.card_id}`);
          const cardData = resp.data;

          const camposEssenciais = ["biografia", "nome", "instagram"];
          const preenchido = camposEssenciais.some(
            (campo) => cardData && cardData[campo] && String(cardData[campo]).trim() !== ""
          );

          if (preenchido) {
            navigate(`/card/view/${data.card_id}`);
          } else {
            navigate("/card/create");
          }
        } catch {
          navigate("/card/create");
        }
      } else {
        navigate("/card/create");
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Erro inesperado ao tentar fazer login.");
      }
    }
  };

  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-card">
          <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

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

            <button type="submit">Entrar</button>

            <p style={{ marginTop: "16px" }}>
              Não tem uma conta? <Link to="/register">Cadastre-se aqui</Link>
            </p>
          </form>
        </div>
      </main>

      <footer className="login-footer">
        © 2025 GETICARD — Todos os direitos reservados
      </footer>
    </div>
  );
};

export default Login;
