import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AdminPanel from "./pages/AdminPanel";

// Componente que usa o contexto de autenticação
function AppContent() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" />} />
      <Route
        path="/"
        element={
          currentUser ? (
            currentUser.role === "admin" ? (
              <AdminPanel />
            ) : (
              <Home />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

// Componente principal que fornece o contexto de autenticação
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
