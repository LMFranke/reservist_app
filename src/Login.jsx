import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [erroLogin, setErroLogin] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setErroLogin('');

        if (email === 'admin' && senha === 'admin') {
            localStorage.setItem('userEmail', 'admin@sistema.com');
            localStorage.setItem('userName', 'Administrador do Sistema');
            localStorage.setItem('userRole', 'ADMIN');
            navigate('/dashboard');
            return;
        }

        if (!email || !senha) {
            setErroLogin('Preencha e-mail e senha.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('appUsers') || '[]');
        const validUser = users.find(u => u.email === email && u.password === senha);

        if (validUser) {
            localStorage.setItem('userEmail', validUser.email);
            localStorage.setItem('userName', validUser.username);
            localStorage.setItem('userRole', validUser.role);
            navigate('/dashboard');
        } else {
            setErroLogin('E-mail ou senha incorretos.');
        }
    };

    return (
        <main className="login-body">
            <section className="login-card" aria-labelledby="login-title">
                <div className="logo-icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h1 id="login-title" className="login-title">Reservista</h1>
                <p className="login-subtitle">Sistema de Reserva de Salas</p>

                {erroLogin && <div role="alert" className="alert-box" style={{ marginBottom: '1rem', padding: '0.75rem', fontSize: '0.85rem' }}>{erroLogin}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input type="text" id="email" className="form-control" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="senha">Senha</label>
                        <div className="password-wrapper">
                            <input type={showPassword ? "text" : "password"} id="senha" className="form-control password-input" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} />
                            <button type="button" className="btn-toggle-password" onClick={() => setShowPassword(!showPassword)} title={showPassword ? "Ocultar senha" : "Mostrar senha"} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary">Entrar</button>
                </form>

                <nav className="login-links" style={{ marginTop: '1.5rem' }} aria-label="Navegação secundária">
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Não possui uma conta? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Criar uma conta</Link>
                    </p>
                </nav>
            </section>
        </main>
    );
}