import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { LogMessage, Provas, Simulado, NavBar } from './components';

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
      localStorage.setItem('username', username);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, handleLogin, handleLogout }}>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/simulado/:id" element={<Simulado_page />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

function Home() {
  const { handleLogin, isAuthenticated } = useAuth(); 
  const [username, setUsername] = useState('');
  const [pwd, setPwd] = useState('');
  const [message, setMessage] = useState('');

  async function handleRegister() {
    try {
      const response = await apiRequest('http://localhost:5000/api/register', 'POST', { username, pwd });
      setMessage(response.message);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const handleLoginClick = async () => {
    try {
      await handleLogin(username, pwd);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <>
      <div>
        {isAuthenticated ? (
          <>
            <NavBar />
            <div className='container-homepage'>
              <h1>Bem-vindo! Selecione o simulado:</h1>
              <Provas />
            </div>
          </>
        ) : (
          <>
            <div className='background-blur'></div>
            <div className='container-homepage'>
              <div className='form-box'>
                <h1>Login/Registro</h1>
                <div className='input-container'>
                  <input
                    type="text"
                    placeholder="Usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    aria-label="Usuário"
                  />
                  <input
                    type="password"
                    placeholder="Senha"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    aria-label="Senha"
                  />
                </div>
                <div className='button-container'>
                  <button onClick={handleRegister}>Registrar</button>
                  <button onClick={handleLoginClick}>Login</button>
                </div>
                {message && <p>{message}</p>}
              </div>
            </div>
          </>
        )}
      </div>
      <div>
        {!isAuthenticated && <LogMessage />}
      </div>
    </>
  );
}

function Simulado_page() {
  return (
    <>
      <NavBar />
      <Simulado />
    </>
  );
}

export default App;
