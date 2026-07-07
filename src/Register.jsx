import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Reaproveitamos o estilo do Login

export default function Register() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmaSenha, setConfirmaSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [erro, setErro] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setErro('');

        // Validações Básicas
        if (!email || !username || !senha || !confirmaSenha) {
            setErro('Preencha todos os campos.');
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            setErro('Insira um e-mail válido.');
            return;
        }

        if (senha.length < 8) {
            setErro('A senha deve ter pelo menos 8 caracteres.');
            return;
        }

        if (senha !== confirmaSenha) {
            setErro('As senhas não coincidem.');
            return;
        }

        // Busca o banco de usuários existente
        const users = JSON.parse(localStorage.getItem('appUsers') || '[]');

        // Checa se o e-mail já está cadastrado
        if (users.some(u => u.email === email)) {
            setErro('Este e-mail já está cadastrado.');
            return;
        }

        // Cria o novo usuário e salva
        const newUser = {
            email: email,
            username: username.trim(),
            password: senha,
            role: 'USER' // Sempre cria como usuário comum
        };

        users.push(newUser);
        localStorage.setItem('appUsers', JSON.stringify(users));

        // Redireciona para o login após sucesso
        alert('Conta criada com sucesso! Faça login para continuar.');
        navigate('/');
    };

    return (
        <div className="login-body">
            <div className="login-card" style={{ maxWidth: '450px' }}>
                <div className="logo-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
                </div>
                <h1 className="login-title">Criar Conta</h1>
                <p className="login-subtitle">Junte-se ao Reservista</p>

                {erro && <div className="alert-box" style={{ marginBottom: '1rem', padding: '0.75rem', fontSize: '0.85rem' }}>{erro}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>E-mail</label>
                        <input type="text" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
                    </div>

                    <div className="form-group">
                        <label>Nome Completo (Username)</label>
                        <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ex: João Silva" />
                    </div>

                    <div className="form-group">
                        <label>Senha</label>
                        <div className="password-wrapper">
                            <input type={showPassword ? "text" : "password"} className="form-control password-input" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
                            <button type="button" className="btn-toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? '👁️‍🗨️' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirmar Senha</label>
                        <input type={showPassword ? "text" : "password"} className="form-control" value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)} placeholder="••••••••" />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Cadastrar</button>
                </form>

                <div className="login-links" style={{ marginTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Já tem uma conta? <Link to="/" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Fazer Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}