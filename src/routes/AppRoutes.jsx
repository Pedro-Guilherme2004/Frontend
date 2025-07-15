import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import CardCreate from "../pages/CardCreate";
import CardEdit from "../pages/CardEdit";
import CardView from "../pages/CardView";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/card/create" element={<CardCreate />} />
    <Route path="/card/edit/:id" element={<CardEdit />} />
    <Route path="/card/view/:id" element={<CardView />} />
  </Routes>
);

export default AppRoutes;