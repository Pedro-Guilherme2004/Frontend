import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import InputField from "../components/InputField";
import api from "../services/api"; // <-- IMPORTANTE

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

      // Salva tokens e card_id localmente
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("card_id", data.card_id);

      if (data.card_id) {
        try {
          const resp = await api.get(`/card/${data.card_id}`);
          const cardData = resp.data;
          console.log("Dados do card retornado:", cardData);

          // Verifica campos essenciais
          const camposEssenciais = ["biografia", "nome", "instagram"];
          const preenchido = camposEssenciais.some((campo) => 
            cardData && cardData[campo] && String(cardData[campo]).trim() !== ""
          );

          if (preenchido) {
            navigate(`/card/view/${data.card_id}`);
          } else {
            navigate("/card/create");
          }
        } catch (e) {
          navigate("/card/create");
        }
      } else {
        navigate("/card/create");
      }

    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Erro inesperado.");
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
