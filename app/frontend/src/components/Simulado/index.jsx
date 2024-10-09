import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Simulado = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [questoes, setQuestoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    
    const username = localStorage.getItem('username');

    useEffect(() => {
        const uniqueKey = `${username}_simulado_${id}`;
        const savedAnswers = localStorage.getItem(uniqueKey);
        const isSubmitted = localStorage.getItem(`${uniqueKey}_submitted`);

        if (savedAnswers) {
            setSelectedAnswers(JSON.parse(savedAnswers));
        }

        if (isSubmitted === 'true') {
            setSubmitted(true);
            setLoading(false);
        } else {
            const fetchQuestoes = async () => {
                try {
                    const response = await fetch('http://localhost:5000/api/prova');
                    if (response.ok) {
                        const data = await response.json();
                        setQuestoes(data);
                    } else {
                        console.error('Erro ao buscar as questões:', response.status);
                    }
                } catch (error) {
                    console.error('Erro de rede:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchQuestoes();
        }
    }, [id, username]);

    const handleAnswerChange = (index, value) => {
        const newAnswers = { ...selectedAnswers, [index]: value };
        setSelectedAnswers(newAnswers);
        const uniqueKey = `${username}_simulado_${id}`;
        localStorage.setItem(uniqueKey, JSON.stringify(newAnswers));
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        const uniqueKey = `${username}_simulado_${id}`;
        localStorage.setItem(`${uniqueKey}_submitted`, 'true');

        const results = questoes.map((questao, index) => ({
            usuario: username,
            id_prova: id,
            id_questao: questao.id,
            correto: questao.answer === selectedAnswers[index] ? 1 : 0,
        }));

        try {
            const response = await fetch('http://localhost:5000/api/save_answers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(results),
            });

            if (response.ok) {
                console.log('Respostas enviadas com sucesso!');
            } else {
                console.error('Erro ao enviar as respostas:', response.status);
            }
        } catch (error) {
            console.error('Erro de rede ao enviar as respostas:', error);
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh', 
            padding: '10px 25px'  
        }}>
            <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>Simulado {id}</h2>
            {loading ? (
                <p>Carregando questões...</p>
            ) : (
                <div style={{ 
                    maxHeight: '80vh', // Increased height from 60vh to 80vh
                    overflowY: 'auto', 
                    width: '100%', 
                    padding: '10px',
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center' 
                }}>
                    {questoes.map((questao, index) => (
                        <div key={index} style={{ 
                            backgroundColor: '#f0f0f0', 
                            border: '1px solid #ccc', 
                            borderRadius: '5px', 
                            padding: '20px', 
                            margin: '10px', 
                            width: '400px', 
                            textAlign: 'left' 
                        }}>
                            <p>{questao.question_text}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
                                {['a', 'b', 'c', 'd', 'e'].map(option => (
                                    <label key={option}>
                                        <input
                                            type="radio"
                                            name={`questao${index}`}
                                            value={option}
                                            disabled={submitted}
                                            checked={selectedAnswers[index] === option}
                                            onChange={() => handleAnswerChange(index, option)}
                                        />
                                        {questao.alternatives[option]}
                                    </label>
                                ))}
                            </div>
                            {submitted && (
                                <p style={{ color: questao.answer === selectedAnswers[index] ? 'green' : 'red' }}>
                                    Resposta correta: {questao.answer.toUpperCase()}
                                </p>
                            )}
                        </div>
                    ))}
                    {submitted ? (
                        <p style={{ marginTop: '20px', fontWeight: 'bold' }}>
                            Você já realizou esse simulado!
                        </p>
                    ) : (
                        <button onClick={handleSubmit} style={{ marginTop: '20px' }}>
                            Enviar
                        </button>
                    )}
                    <button onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
                        Voltar para Home
                    </button>
                </div>
            )}
        </div>
    );
};

export default Simulado;
