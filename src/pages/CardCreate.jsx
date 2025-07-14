// CardCreate.jsx

import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";

// utilitário para converter File em Base64
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const CardCreate = () => {
  const [avatarFile, setAvatarFile] = useState(null);
  const [nome, setNome] = useState("");
  const [biografia, setBiografia] = useState("");
  const [empresa, setEmpresa] = useState("");         // Novo campo
  const [whatsapp, setWhatsapp] = useState("");
  const [emailContato, setEmailContato] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [site, setSite] = useState("");
  const [pix, setPix] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);

  const navigate = useNavigate();

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

    let foto_perfil = null;
    if (avatarFile) {
      try {
        foto_perfil = await toBase64(avatarFile);
      } catch (err) {
        console.error("Erro ao converter avatar:", err);
        return;
      }
    }

    const gallery_base64 = [];
    for (let file of galleryFiles) {
      try {
        const b64 = await toBase64(file);
        gallery_base64.push(b64);
      } catch (err) {
        console.error("Erro ao converter galeria:", err);
      }
    }

    const dados = {
      nome,
      biografia,
      empresa,               // Novo campo
      whatsapp,
      emailContato,
      foto_perfil,
      instagram,
      linkedin,
      site,
      chave_pix: pix,
      galeria: gallery_base64,
    };

    try {
      const resp = await api.post("/card", dados);

      if (resp.data && resp.data.card_id) {
        if (resp.data.message && resp.data.message.includes("Já existe")) {
          alert("Você já possui um cartão. Redirecionando para seu cartão...");
        }
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
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2>Criar Cartão</h2>
      {/* Foto de Avatar */}
      <label>Foto de Avatar:</label>
      <br />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setAvatarFile(e.target.files[0])}
      />
      <br /><br />

      {/* Nome */}
      <InputField
        label="Nome"
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      {/* Bio */}
      <div>
        <label>Biografia (breve descrição):</label>
        <br />
        <textarea
          value={biografia}
          onChange={(e) => setBiografia(e.target.value)}
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
        onChange={(e) => setEmpresa(e.target.value)}
      />

      {/* WhatsApp */}
      <InputField
        label="WhatsApp"
        type="text"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
      />

      {/* Email para contato */}
      <InputField
        label="Email para contato"
        type="email"
        value={emailContato}
        onChange={(e) => setEmailContato(e.target.value)}
      />

      {/* Links */}
      <InputField
        label="Instagram"
        type="url"
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
        required={false}
      />
      <InputField
        label="LinkedIn"
        type="url"
        value={linkedin}
        onChange={(e) => setLinkedin(e.target.value)}
        required={false}
      />
      <InputField
        label="Site Personalizado"
        type="url"
        value={site}
        onChange={(e) => setSite(e.target.value)}
        required={false}
      />
      <InputField
        label="Chave Pix"
        type="text"
        value={pix}
        onChange={(e) => setPix(e.target.value)}
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
  );
};

export default CardCreate;
