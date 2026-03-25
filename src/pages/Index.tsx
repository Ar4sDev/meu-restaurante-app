import { Navigate } from "react-router-dom";

const Index = () => {
  // Isso diz ao navegador: "Sempre que alguém chegar na raiz do site, mande para /login"
  return <Navigate to="/login" replace />;
};

export default Index;