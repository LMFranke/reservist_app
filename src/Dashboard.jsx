import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomCard from './components/RoomCard';
import ReservationModal from './components/ReservationModal';
import RoomManagerModal from './components/RoomManagerModal';
import './Dashboard.css';
import ConfirmModal from './components/ConfirmModal';

const DEFAULT_ROOMS = [
    { id: 1, title: 'Sala de Reuniões 1', footerText: 'Clique para reservar' },
    { id: 2, title: 'Sala de Reuniões 2', footerText: 'Clique para reservar' },
    { id: 3, title: 'Sala de Treinamento', footerText: 'Livre após as 15:30', occupantMock: 'Equipe de Automação - Testes' },
    { id: 4, title: 'Sala Executiva', ocupadaODiaTodo: true, occupantMock: 'Diretoria - Estratégias de Vendas', footerText: 'Sem horários livres hoje' }
];

const DEFAULT_MOCKS = {
    3: { '07:30 às 09:30': 'Equipe de Automação', '09:30 às 12:30': 'Equipe de Automação', '12:30 às 14:00': 'Equipe de Automação', '14:00 às 15:30': 'Equipe de Automação' },
    4: { '07:30 às 09:30': 'Diretoria', '09:30 às 12:30': 'Diretoria', '12:30 às 14:00': 'Diretoria', '14:00 às 15:30': 'Diretoria', '15:30 às 17:00': 'Diretoria', '17:00 às 18:00': 'Diretoria' }
};

export default function Dashboard() {
    const navigate = useNavigate();

    const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
    const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'USER');

    const [rooms, setRooms] = useState([]);
    const [mocks, setMocks] = useState({});

    const [minhasReservas, setMinhasReservas] = useState({});
    const [reservasTerceiros, setReservasTerceiros] = useState({});

    const [activeModalRoomId, setActiveModalRoomId] = useState(null);
    const [isRoomManagerOpen, setIsRoomManagerOpen] = useState(false);
    const [roomToEdit, setRoomToEdit] = useState(null);
    const [roomToDelete, setRoomToDelete] = useState(null);

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        const role = localStorage.getItem('userRole');
        const name = localStorage.getItem('userName');
        if (!email) { navigate('/'); return; }

        setUserEmail(email);
        setUserRole(role);

        const storedRooms = localStorage.getItem('appRooms');
        let currentRooms = storedRooms ? JSON.parse(storedRooms) : DEFAULT_ROOMS;
        setRooms(currentRooms);
        if (!storedRooms) localStorage.setItem('appRooms', JSON.stringify(DEFAULT_ROOMS));

        const storedMocks = localStorage.getItem('appMocks');
        if (storedMocks) setMocks(JSON.parse(storedMocks));
        else { setMocks(DEFAULT_MOCKS); localStorage.setItem('appMocks', JSON.stringify(DEFAULT_MOCKS)); }

        const minhasReservasAtuais = {};
        const terceirosAtuais = {};

        currentRooms.forEach(room => {
            minhasReservasAtuais[room.id] = {};
            terceirosAtuais[room.id] = {};

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(`reservaSala${room.id}_`)) {
                    const dataChave = key.replace(`reservaSala${room.id}_`, '');
                    const savedData = localStorage.getItem(key);

                    try {
                        const parsed = JSON.parse(savedData);
                        let dayData = {};

                        if (Array.isArray(parsed)) {
                            parsed.forEach(t => dayData[t] = 'Usuário Antigo');
                        } else {
                            dayData = parsed;
                        }

                        for (const [time, ownerEmail] of Object.entries(dayData)) {
                            if (ownerEmail === email) {
                                if (!minhasReservasAtuais[room.id][dataChave]) minhasReservasAtuais[room.id][dataChave] = [];
                                minhasReservasAtuais[room.id][dataChave].push(time);
                            } else {
                                if (!terceirosAtuais[room.id][dataChave]) terceirosAtuais[room.id][dataChave] = {};
                                terceirosAtuais[room.id][dataChave][time] = ownerEmail;
                            }
                        }
                    } catch (e) {
                        console.error("Erro ao ler dados locais:", e);
                    }
                }
            }
        });

        setMinhasReservas(minhasReservasAtuais);
        setReservasTerceiros(terceirosAtuais);
    }, [navigate]);

    const hojeChave = new Date().toISOString().split('T')[0];
    const isAdmin = userRole === 'ADMIN';

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        navigate('/');
    };

    const handleSaveRoom = (roomData) => {
        let updatedRooms = roomToEdit ? rooms.map(r => r.id === roomData.id ? roomData : r) : [...rooms, roomData];
        setRooms(updatedRooms);
        localStorage.setItem('appRooms', JSON.stringify(updatedRooms));
        setIsRoomManagerOpen(false);
        setRoomToEdit(null);
    };

    const handleDeleteRoom = (roomId) => {
        setRoomToDelete(roomId);
    };

    const executeDeleteRoom = () => {
        if (roomToDelete) {
            const updatedRooms = rooms.filter(r => r.id !== roomToDelete);
            setRooms(updatedRooms);
            localStorage.setItem('appRooms', JSON.stringify(updatedRooms));

            setIsRoomManagerOpen(false);
            setRoomToEdit(null);
            setRoomToDelete(null);
        }
    };

    const openEditRoomModal = (room) => {
        setRoomToEdit(room);
        setIsRoomManagerOpen(true);
    };

    const handleConfirmReservation = (roomId, dataChave, timeText) => {
        const key = `reservaSala${roomId}_${dataChave}`;
        let dayData = JSON.parse(localStorage.getItem(key) || '{}');

        if (Array.isArray(dayData)) {
            let temp = {}; dayData.forEach(t => temp[t] = 'Usuário Antigo'); dayData = temp;
        }

        dayData[timeText] = userEmail;
        localStorage.setItem(key, JSON.stringify(dayData));

        setMinhasReservas(prev => {
            const roomRes = prev[roomId] || {};
            const dayRes = roomRes[dataChave] || [];
            return { ...prev, [roomId]: { ...roomRes, [dataChave]: [...dayRes, timeText] } };
        });
    };

    const handleCancelReservation = (roomId, dataChave = hojeChave, timeText = null, isAdminDeletingMock = false) => {
        const key = `reservaSala${roomId}_${dataChave}`;
        let dayData = JSON.parse(localStorage.getItem(key) || '{}');

        if (Array.isArray(dayData)) {
            let temp = {}; dayData.forEach(t => temp[t] = 'Usuário Antigo'); dayData = temp;
        }

        if (isAdminDeletingMock) {
            if (dayData[timeText]) {
                delete dayData[timeText];
                if (Object.keys(dayData).length === 0) localStorage.removeItem(key);
                else localStorage.setItem(key, JSON.stringify(dayData));

                setReservasTerceiros(prev => {
                    const roomT = { ...prev[roomId] };
                    const dayT = { ...roomT[dataChave] };
                    delete dayT[timeText];
                    return { ...prev, [roomId]: { ...roomT, [dataChave]: dayT } };
                });
            } else {
                setMocks(prev => {
                    const roomMocks = { ...prev[roomId] };
                    delete roomMocks[timeText];
                    const newMocks = { ...prev, [roomId]: roomMocks };
                    localStorage.setItem('appMocks', JSON.stringify(newMocks));
                    return newMocks;
                });
            }
            return;
        }

        if (timeText) {
            delete dayData[timeText];
            if (Object.keys(dayData).length === 0) localStorage.removeItem(key);
            else localStorage.setItem(key, JSON.stringify(dayData));

            setMinhasReservas(prev => {
                const roomRes = { ...prev[roomId] };
                roomRes[dataChave] = roomRes[dataChave].filter(t => t !== timeText);
                return { ...prev, [roomId]: roomRes };
            });
        } else {
            const myTimes = minhasReservas[roomId]?.[dataChave] || [];
            myTimes.forEach(t => delete dayData[t]);
            if (Object.keys(dayData).length === 0) localStorage.removeItem(key);
            else localStorage.setItem(key, JSON.stringify(dayData));

            setMinhasReservas(prev => {
                const roomRes = { ...prev[roomId] };
                roomRes[dataChave] = [];
                return { ...prev, [roomId]: roomRes };
            });
        }
    };

    const getDisplayName = () => {
        if (isAdmin) {
            return 'Administrador';
        }

        if (userName && userName !== 'undefined' && userName !== 'null' && userName.trim() !== '') {
            return userName;
        }

        const prefix = userEmail.split('@')[0];
        return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    };

    const getAvatarLetter = () => {
        if (isAdmin) {
            return 'A';
        }
        if (userName && userName !== 'undefined' && userName !== 'null' && userName.trim() !== '') {
            return userName.charAt(0).toUpperCase();
        }
        return userEmail.charAt(0).toUpperCase();
    };

    const displayName = getDisplayName();
    const avatarLetter = getAvatarLetter();

    return (
        <div className="dashboard-body">
            <header className="topbar">
                <div className="user-info">
                    <div
                        className="avatar"
                        style={{
                            backgroundColor: isAdmin ? '#fef2f2' : '#e0f2fe',
                            color: isAdmin ? '#ef4444' : '#0284c7',
                            fontWeight: '600'
                        }}
                    >
                        {avatarLetter}
                    </div>
                    <div>
                        <strong>{displayName}</strong>
                        <span id="user-email-display">{userEmail}</span>
                    </div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>Sair</button>
            </header>

            <main className="main-content">
                <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Salas Disponíveis</h1>
                        <p>Visualize e reserve salas de reunião</p>
                    </div>
                    {isAdmin && (
                        <button className="btn-add-room" onClick={() => { setRoomToEdit(null); setIsRoomManagerOpen(true); }} aria-label="Criar nova sala">
                            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Nova Sala
                        </button>
                    )}
                </header>

                <section className="room-grid" aria-label="Lista de Salas de Reunião">
                    {rooms.map(room => {
                        const terceirosHoje = reservasTerceiros[room.id]?.[hojeChave] || {};
                        const mocksHoje = mocks[room.id] || {};
                        const ocupacoesCombinadas = { ...mocksHoje, ...terceirosHoje };

                        return (
                            <RoomCard
                                key={room.id}
                                room={room}
                                minhasReservasNoDia={minhasReservas[room.id]?.[hojeChave]}
                                ocupacoesMock={ocupacoesCombinadas}
                                isAdmin={isAdmin}
                                onClick={(id) => setActiveModalRoomId(id)}
                                onCancel={(roomId) => handleCancelReservation(roomId, hojeChave)}
                                onEdit={() => openEditRoomModal(room)}
                            />
                        );
                    })}
                </section>
            </main>

            {activeModalRoomId && (
                <ReservationModal
                    room={rooms.find(r => r.id === activeModalRoomId)}
                    ocupacoesMock={mocks[activeModalRoomId]}
                    minhasReservas={minhasReservas[activeModalRoomId] || {}}
                    reservasTerceiros={reservasTerceiros[activeModalRoomId] || {}}
                    isAdmin={isAdmin}
                    onClose={() => setActiveModalRoomId(null)}
                    onConfirm={handleConfirmReservation}
                    onCancel={handleCancelReservation}
                />
            )}

            {isRoomManagerOpen && (
                <RoomManagerModal
                    roomToEdit={roomToEdit}
                    onClose={() => setIsRoomManagerOpen(false)}
                    onSave={handleSaveRoom}
                    onDelete={handleDeleteRoom}
                />
            )}

            {roomToDelete && (
                <ConfirmModal
                    title="Excluir Sala Definitivamente?"
                    message="ATENÇÃO: Você está prestes a excluir esta sala do sistema. Todos os horários vinculados a ela serão perdidos. Essa ação não pode ser desfeita."
                    onConfirm={executeDeleteRoom}
                    onCancel={() => setRoomToDelete(null)}
                />
            )}
        </div>
    );
}