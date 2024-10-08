import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useParams } from 'react-router-dom';

// Create Context for Authentication
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const apiRequest = async (url, method, body) => {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }
  return response.json();
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');

  const handleLogin = async (username, pwd) => {
    const response = await apiRequest('http://localhost:5000/api/login', 'POST', { username, pwd });
    if (response.message === 'Login bem-sucedido!') {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, handleLogin, handleLogout }}>
      <Router>
        <div style={{ maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/prova" /> : <Login />} />
            <Route path="/prova" element={<Prova />} />
            <Route path="/pagina/:numero" element={<Pagina />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

function Login() {
  const { handleLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [pwd, setPwd] = useState('');
  const [message, setMessage] = useState('');
  const [redirect, setRedirect] = useState(false);

  const handleRegister = async () => {
    try {
      const response = await apiRequest('http://localhost:5000/api/register', 'POST', { username, pwd });
      setMessage(response.message);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleLoginClick = async () => {
    try {
      await handleLogin(username, pwd);
      setRedirect(true);
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <h1>Login ou Registro</h1>
      <input type="text" placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Senha" value={pwd} onChange={(e) => setPwd(e.target.value)} />
      <button onClick={handleRegister}>Registrar</button>
      <button onClick={handleLoginClick}>Login</button>
      {message && <p>{message}</p>}
      
      {/* Lista de links */}
      <h2>Páginas</h2>
      <ul>
        <li><Link to="/pagina/1">Página 1</Link></li>
        <li><Link to="/pagina/2">Página 2</Link></li>
        <li><Link to="/pagina/3">Página 3</Link></li>
      </ul>
    </>
  );
}

function Prova() {
  const { handleLogout } = useAuth();
  const [prova, setProva] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProva = async () => {
      try {
        const data = await apiRequest('http://localhost:5000/api/prova', 'GET');
        setProva(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProva();
  }, []);

  return (
    <div>
      <h2>Provas</h2>
      {loading ? <p>Loading...</p> : error ? <p>{error}</p> : (
        <ul>
          {prova.map(prova => <li key={prova.id}>{prova.titulo}</li>)}
        </ul>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

// Componente para as páginas
function Pagina() {
  const { numero } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  return (
    <div>
      <h2>{`Conteúdo da Página ${numero}`}</h2>
      {loading ? <p>Loading...</p> : error ? <p>{error}</p> : (
        <ul>
          {data.map(item => (
            <li key={item.id}>{item.nome}</li> // Ajuste o campo conforme a sua resposta da API
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;

//TODO: Adicionar os links das provas para a home ("/") e rotear para a prova respectiva caso o usuário esteja autenticado
//TODO: Personalizar paginas, fazer transição entre as páginas...
//TODO: Botão de logout a partir da pagina da prova.
