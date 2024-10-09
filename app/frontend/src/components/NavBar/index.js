import React from 'react';
import { useAuth } from '../../App'; 
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
    const { handleLogout } = useAuth();
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        handleLogout();
        navigate('/');
    };

    return (
        <div style={styles.navBar}>
            <h1 style={styles.title}>Plataforma de Simulados</h1>
            <button onClick={handleLogoutClick} style={styles.logoutButton}>Sair</button>
        </div>
    );
};

const styles = {
    navBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2px 10px',
        backgroundColor: '#e0e7ef',
        color: '#333',
        width: '100%',
        position: 'fixed',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    title: {
        margin: 0,
        fontSize: '1.0rem',
        color: '#0077cc',
    },
    logoutButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 15px',
        cursor: 'pointer',
        marginRight: '20px',
        transition: 'background-color 0.3s',
    },
};

export default NavBar;
