// src/pages/CardCreate.jsx
import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import "../styles/cardcreate.css"; // layout exclusivo desta página

const CardCreate = () => {
  const [avatarFile, setAvatarFile] = useState(null);
  const [nome, setNome] = useState("");
  const [biografia, setBiografia] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [emailContato, setEmailContato] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [site, setSite] = useState("");
  const [pix, setPix] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);

  const navigate = useNavigate();

  // Recupera dados temporários do cartão se existirem
  useEffect(() => {
    const temp = localStorage.getItem("card_temp_data");
    if (temp) {
      try {
        const obj = JSON.parse(temp);
        setNome(obj.nome || "");
        setBiografia(obj.biografia || "");
        setEmpresa(obj.empresa || "");
        setWhatsapp(obj.whatsapp || "");
        setEmailContato(obj.emailContato || "");
        setInstagram(obj.instagram || "");
        setLinkedin(obj.linkedin || "");
        setSite(obj.site || "");
        setPix(obj.chave_pix || "");
      } catch {}
      // Limpa os temporários depois de preencher
      localStorage.removeItem("card_temp_data");
    }
  }, []);

  // Auto-save simples no localStorage (exceto arquivos)
  useEffect(() => {
    const tempData = {
      nome, biografia, empresa, whatsapp, emailContato,
      instagram, linkedin, site, chave_pix: pix
    };
    localStorage.setItem("card_temp_data", JSON.stringify(tempData));
  }, [nome, biografia, empresa, whatsapp, emailContato, instagram, linkedin, site, pix]);

  // Protege contra múltiplos cartões
  useEffect(() => {
    const card_id = localStorage.getItem("card_id");
    if (card_id) {
      api.get(`/card/${card_id}`)
        .then(res => {
          if (res.data && !res.data.error) {
            navigate(`/card/edit/${card_id}`);
          }
        })
        .catch(() => {
          localStorage.removeItem("card_id");
        });
    }
  }, [navigate]);

  const handleGalleryChange = (e) => {
    setGalleryFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // FormData para arquivos + campos
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("biografia", biografia);
    formData.append("empresa", empresa);
    formData.append("whatsapp", whatsapp);
    formData.append("emailContato", emailContato);
    formData.append("instagram", instagram);
    formData.append("linkedin", linkedin);
    formData.append("site", site);
    formData.append("chave_pix", pix);

    if (avatarFile) {
      formData.append("foto_perfil", avatarFile);
    }
    for (let file of galleryFiles) {
      formData.append("galeria", file);
    }

    try {
      const resp = await api.post("/card", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (resp.data && resp.data.card_id) {
        if (resp.data.message && resp.data.message.includes("Já existe")) {
          alert("Você já possui um cartão. Redirecionando para seu cartão...");
        }
        localStorage.removeItem("card_temp_data"); // limpa temporários
        navigate(`/card/view/${resp.data.card_id}`);
      } else {
        alert("Erro: card_id não retornado pelo backend!");
      }
    } catch (error) {
      console.error("Erro ao criar o cartão:", error.response?.data || error.message);
      alert("Erro ao criar o cartão: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="create-page">
      <main className="create-main">
        <div className="create-card">
          <div
            style={{
              background: "#f7eabb",
              border: "1px solid #e5c252",
              borderRadius: 7,
              padding: "14px 18px",
              marginBottom: 18,
              color: "#444",
              fontWeight: 500,
              fontSize: 15,
              boxShadow: "0 2px 6px #0001"
            }}
          >
            <strong>Atenção:</strong> Só será possível <b>editar</b> ou <b>excluir</b> seu cartão se
            você estiver logado com o mesmo <b>e-mail</b> cadastrado abaixo.<br />
            <span style={{ fontSize: 13, color: "#a66" }}>
              Guarde bem este e-mail! Ele será usado para autenticação e proteção do seu cartão.
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "0 auto" }} encType="multipart/form-data">
            <h2>Criar Cartão</h2>

            {/* Foto de Avatar */}
            <label>Foto de Avatar:</label>
            <br />
            <input
              type="file"
              accept="image/*"
              onChange={e => setAvatarFile(e.target.files[0])}
            />
            <br /><br />

            {/* Nome */}
            <InputField
              label="Nome"
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />

            {/* Bio */}
            <div>
              <label>Biografia (breve descrição):</label>
              <br />
              <textarea
                value={biografia}
                onChange={e => setBiografia(e.target.value)}
                rows={3}
                style={{ width: "100%" }}
              />
              <br /><br />
            </div>

            {/* Empresa */}
            <InputField
              label="Empresa"
              type="text"
              value={empresa}
              onChange={e => setEmpresa(e.target.value)}
            />

            {/* WhatsApp */}
            <InputField
              label="WhatsApp"
              type="text"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
            />

            {/* Email para contato */}
            <InputField
              label="Email para contato"
              type="email"
              value={emailContato}
              onChange={e => setEmailContato(e.target.value)}
            />

            {/* Links */}
            <InputField
              label="Instagram"
              type="url"
              value={instagram}
              onChange={e => setInstagram(e.target.value)}
              required={false}
            />
            <InputField
              label="LinkedIn"
              type="url"
              value={linkedin}
              onChange={e => setLinkedin(e.target.value)}
              required={false}
            />
            <InputField
              label="Site Personalizado"
              type="url"
              value={site}
              onChange={e => setSite(e.target.value)}
              required={false}
            />
            <InputField
              label="Chave Pix"
              type="text"
              value={pix}
              onChange={e => setPix(e.target.value)}
              required={false}
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

            <button type="submit">Salvar</button>
          </form>
        </div>
      </main>

      <footer className="create-footer">
        © 2025 GETICARD — Crie seu cartão digital
      </footer>
    </div>
  );
};

export default CardCreate;
