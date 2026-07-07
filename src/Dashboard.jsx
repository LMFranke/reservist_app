import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomCard from './components/RoomCard';
import ReservationModal from './components/ReservationModal';
import './Dashboard.css';

const ROOM_DATA = [
    { id: 1, title: 'Sala de Reuniões 1', footerText: 'Clique para reservar' },
    { id: 2, title: 'Sala de Reuniões 2', footerText: 'Clique para reservar' },
    { id: 3, title: 'Sala de Treinamento', footerText: 'Livre após as 15:30', occupantMock: 'Equipe de Automação - Testes' },
    { id: 4, title: 'Sala Executiva', ocupadaODiaTodo: true, occupantMock: 'Diretoria - Estratégias de Vendas', footerText: 'Sem horários livres hoje' }
];

const MOCK_OCCUPATIONS = {
    3: { '07:30 às 09:30': 'Equipe de Automação', '09:30 às 12:30': 'Equipe de Automação', '12:30 às 14:00': 'Equipe de Automação', '14:00 às 15:30': 'Equipe de Automação' },
    4: { '07:30 às 09:30': 'Diretoria', '09:30 às 12:30': 'Diretoria', '12:30 às 14:00': 'Diretoria', '14:00 às 15:30': 'Diretoria', '15:30 às 17:00': 'Diretoria', '17:00 às 18:00': 'Diretoria' }
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('');
    const [activeModalRoomId, setActiveModalRoomId] = useState(null);
    const [minhasReservas, setMinhasReservas] = useState({});

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        if (!email) {
            navigate('/');
            return;
        }
        setUserEmail(email);

        const reservasSalvas = {};
        ROOM_DATA.forEach(room => {
            reservasSalvas[room.id] = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(`reservaSala${room.id}_`)) {
                    const dataChave = key.replace(`reservaSala${room.id}_`, '');
                    const savedData = localStorage.getItem(key);
                    try {
                        // Tenta ler como uma lista (novo padrão)
                        const parsed = JSON.parse(savedData);
                        reservasSalvas[room.id][dataChave] = Array.isArray(parsed) ? parsed : [savedData];
                    } catch (e) {
                        // Se der erro, é porque é o dado antigo, então transformamos numa lista
                        reservasSalvas[room.id][dataChave] = [savedData];
                    }
                }
            }
        });
        setMinhasReservas(reservasSalvas);
    }, [navigate]);

    const hojeChave = new Date().toISOString().split('T')[0];

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    // Atualizado para remover apenas o horário clicado, ou o dia todo se vier do card
    const handleCancelReservation = (roomId, dataChave = hojeChave, timeText = null) => {
        setMinhasReservas(prev => {
            const roomReservations = { ...prev[roomId] };

            if (timeText && roomReservations[dataChave]) {
                // Remove apenas o horário específico
                const updatedReservations = roomReservations[dataChave].filter(t => t !== timeText);
                if (updatedReservations.length > 0) {
                    localStorage.setItem(`reservaSala${roomId}_${dataChave}`, JSON.stringify(updatedReservations));
                    roomReservations[dataChave] = updatedReservations;
                } else {
                    localStorage.removeItem(`reservaSala${roomId}_${dataChave}`);
                    delete roomReservations[dataChave];
                }
            } else {
                // Remove o dia inteiro (quando clica no botão "Cancelar" direto do Card)
                localStorage.removeItem(`reservaSala${roomId}_${dataChave}`);
                delete roomReservations[dataChave];
            }

            return { ...prev, [roomId]: roomReservations };
        });
    };

    // Atualizado para salvar na lista
    const handleConfirmReservation = (roomId, dataChave, timeText) => {
        setMinhasReservas(prev => {
            const roomReservations = prev[roomId] || {};
            const currentDayReservations = roomReservations[dataChave] || [];

            // Adiciona o horário apenas se ele já não existir na lista
            if (!currentDayReservations.includes(timeText)) {
                const updatedDayReservations = [...currentDayReservations, timeText];
                localStorage.setItem(`reservaSala${roomId}_${dataChave}`, JSON.stringify(updatedDayReservations));

                return {
                    ...prev,
                    [roomId]: {
                        ...roomReservations,
                        [dataChave]: updatedDayReservations
                    }
                };
            }
            return prev;
        });
    };

    return (
        <div className="dashboard-body">
            <header className="topbar">
                <div className="user-info">
                    <div className="avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div>
                        <strong>Reservista</strong>
                        <span id="user-email-display">{userEmail}</span>
                    </div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Sair
                </button>
            </header>

            <main className="main-content">
                <div className="page-header">
                    <h2>Salas Disponíveis</h2>
                    <p>Visualize e reserve salas de reunião</p>
                </div>

                <div className="room-grid">
                    {ROOM_DATA.map(room => (
                        <RoomCard
                            key={room.id}
                            room={room}
                            minhasReservasNoDia={minhasReservas[room.id]?.[hojeChave]}
                            ocupacoesMock={MOCK_OCCUPATIONS[room.id]} /* <--- ADICIONE ESTA LINHA AQUI */
                            onClick={(id) => setActiveModalRoomId(id)}
                            onCancel={(roomId) => handleCancelReservation(roomId, hojeChave)}
                        />
                    ))}
                </div>
            </main>

            {/* Modal */}
            {activeModalRoomId && (
                <ReservationModal
                    room={ROOM_DATA.find(r => r.id === activeModalRoomId)}
                    ocupacoesMock={MOCK_OCCUPATIONS[activeModalRoomId]}
                    // O Modal recebe o objeto inteiro de datas daquela sala, ou um objeto vazio de fallback
                    minhasReservas={minhasReservas[activeModalRoomId] || {}}
                    onClose={() => setActiveModalRoomId(null)}
                    onConfirm={handleConfirmReservation}
                    onCancel={handleCancelReservation}
                />
            )}
        </div>
    );
}