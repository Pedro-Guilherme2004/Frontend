import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import InputField from "../components/InputField";
import api from "../services/api"; // <-- Importante!
import "../styles/login.css"; // <--- novo

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Faz login: POST /api/login
      const response = await api.post("/login", { email, password });
      const data = response.data;

      // Salva tokens e card_id localmente
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("card_id", data.card_id);

      if (data.card_id) {
        try {
          // Busca os dados do cartão após login (GET /api/card/:id)
          const resp = await api.get(`/card/${data.card_id}`);
          console.log("URL chamada:", resp.request?.responseURL);
          const cardData = resp.data;
          console.log("Dados do card retornado:", cardData);

          // Verifica se o cartão tem pelo menos um campo essencial preenchido
          const camposEssenciais = ["biografia", "nome", "instagram"];
          const preenchido = camposEssenciais.some(
            (campo) =>
              cardData && cardData[campo] && String(cardData[campo]).trim() !== ""
          );

          if (preenchido) {
            navigate(`/card/view/${data.card_id}`);
          } else {
            navigate("/card/create");
          }
        } catch (e) {
          // Se falhar ao buscar o card, redireciona para criação
          navigate("/card/create");
        }
      } else {
        // Se não veio card_id, redireciona para criar cartão
        navigate("/card/create");
      }
    } catch (err) {
      // Trata erros de login
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Erro inesperado ao tentar fazer login.");
      }
    }
  };

  return (
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
  );
};

export default Login;
