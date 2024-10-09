import { Link } from 'react-router-dom';

const Provas = () => {
    return (
        <div>
            <ul>
                <li><Link to="/simulado/1">Simulado 1</Link></li>
                <li><Link to="/simulado/2">Simulado 2</Link></li>
                <li><Link to="/simulado/3">Simulado 3</Link></li>
            </ul>
        </div>
    );
}

export default Provas;
