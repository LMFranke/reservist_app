import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erroEmail, setErroEmail] = useState(false);
    const [erroSenha, setErroSenha] = useState(false);

    const navigate = useNavigate(); // Hook do React Router para mudar de página

    const handleSubmit = (e) => {
        e.preventDefault();
        let isValid = true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex.test(email)) {
            setErroEmail(true);
            isValid = false;
        } else {
            setErroEmail(false);
        }

        if (senha.length < 8) {
            setErroSenha(true);
            isValid = false;
        } else {
            setErroSenha(false);
        }

        if (isValid) {
            localStorage.setItem('userEmail', email);
            navigate('/dashboard'); // Navega para a rota do dashboard em vez de mudar o window.location
        }
    };

    return (
        <div className="login-body">
            <div className="login-card">
                <div className="logo-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h1 className="login-title">Reservista</h1>
                <p className="login-subtitle">Sistema de Reserva de Salas</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="text"
                            id="email"
                            className="form-control"
                            placeholder="seu@email.com"
                            style={{ borderColor: erroEmail ? 'var(--red-text)' : '' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {erroEmail && <div className="error-msg">Por favor, insira um e-mail válido.</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="senha">Senha</label>
                        <input
                            type="password"
                            id="senha"
                            className="form-control"
                            placeholder="••••••••"
                            style={{ borderColor: erroSenha ? 'var(--red-text)' : '' }}
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                        />
                        {erroSenha && <div className="error-msg">A senha deve ter pelo menos 8 caracteres.</div>}
                    </div>

                    <button type="submit" className="btn btn-primary">Entrar</button>
                </form>
            </div>
        </div>
    );
}