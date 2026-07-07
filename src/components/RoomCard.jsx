import React, { useState, useEffect } from 'react';

const SCHEDULE_TIMES = [
    '07:30 às 09:30', '09:30 às 12:30', '12:30 às 14:00',
    '14:00 às 15:30', '15:30 às 17:00', '17:00 às 18:00'
];

export default function RoomCard({ room, minhasReservasNoDia, ocupacoesMock, onClick, onCancel }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const parseTimeString = (timeString) => {
        const [start, end] = timeString.split(' às ');
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        return { startH, startM, endH, endM };
    };

    const isTimeInCurrentSlot = (timeString) => {
        if (!timeString) return false;
        const { startH, startM, endH, endM } = parseTimeString(timeString);
        const currentTotal = currentTime.getHours() * 60 + currentTime.getMinutes();
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;
        return currentTotal >= startTotal && currentTotal < endTotal;
    };

    const isSlotInPast = (timeString) => {
        const { endH, endM } = parseTimeString(timeString);
        const currentTotal = currentTime.getHours() * 60 + currentTime.getMinutes();
        const endTotal = endH * 60 + endM;
        return currentTotal >= endTotal;
    };

    let isOcupadaAgora = false;
    let isMinhaReservaAgora = false;
    let ocupanteAtual = null;
    const temReservaHoje = minhasReservasNoDia && minhasReservasNoDia.length > 0;

    if (room.ocupadaODiaTodo) {
        isOcupadaAgora = true;
        ocupanteAtual = room.occupantMock;
    } else {
        if (temReservaHoje && minhasReservasNoDia.some(time => isTimeInCurrentSlot(time))) {
            isOcupadaAgora = true;
            isMinhaReservaAgora = true;
        } else if (ocupacoesMock) {
            for (const [time, occupant] of Object.entries(ocupacoesMock)) {
                if (isTimeInCurrentSlot(time)) {
                    isOcupadaAgora = true;
                    ocupanteAtual = occupant;
                    break;
                }
            }
        }
    }

    // Calcula métricas de disponibilidade
    const slotsLivresHoje = SCHEDULE_TIMES.filter(time => {
        if (isSlotInPast(time)) return false;
        if (minhasReservasNoDia && minhasReservasNoDia.includes(time)) return false;
        if (ocupacoesMock && ocupacoesMock[time]) return false;
        if (room.ocupadaODiaTodo) return false;
        return true;
    });

    // --- NOVA LÓGICA DE EXIBIÇÃO ---
    const isTotalmenteOcupada = slotsLivresHoje.length === 0;
    const proximoLivre = !isTotalmenteOcupada ? slotsLivresHoje[0] : null;

    const dotClass = isOcupadaAgora ? 'status-dot red' : 'status-dot green';
    let pillClass = 'pill green';
    let pillText = 'Livre Agora';

    if (isMinhaReservaAgora) {
        pillClass = 'pill primary';
        pillText = 'Sua Reunião (Agora)';
    } else if (isOcupadaAgora) {
        pillClass = 'pill red';
        pillText = 'Ocupada Agora';
    }

    // Define o texto dinâmico do rodapé
    let displayFooterText = room.footerText;
    if (isTotalmenteOcupada) {
        displayFooterText = 'Sem horários livres hoje';
    } else if (temReservaHoje) {
        displayFooterText = ''; // Oculta o texto padrão se houver agendamentos, mas ainda houver horários livres
    }

    const handleCancelClick = (e) => {
        e.stopPropagation();
        onCancel(room.id);
    };

    return (
        <article className="room-card" onClick={() => onClick(room.id)} style={{ cursor: 'pointer' }}>
            <div className="card-main-content">
                <header className="card-header">
                    <h2 className="card-title">{room.title}</h2>
                    <span className={dotClass}></span>
                </header>

                <span className={pillClass}>{pillText}</span>

                {isOcupadaAgora && !isMinhaReservaAgora && (
                    <p className="card-occupant">{ocupanteAtual}</p>
                )}
            </div>

            <div className="card-extended-info">
                {/* Só exibe a "Disponibilidade hoje" se a sala NÃO estiver totalmente ocupada */}
                {!room.ocupadaODiaTodo && !isTotalmenteOcupada && (
                    <div className="info-row">
                        <span className="info-label">Disponibilidade hoje:</span>
                        <span className="info-value">{slotsLivresHoje.length} horários</span>
                    </div>
                )}

                {proximoLivre && !isMinhaReservaAgora && (
                    <div className="info-row">
                        <span className="info-label">Próximo livre:</span>
                        <span className="info-value highlight">{proximoLivre}</span>
                    </div>
                )}

                {/* As suas tags de reserva continuam aparecendo normalmente */}
                {temReservaHoje && (
                    <div className="info-tags">
                        <span className="info-label">Suas reservas agendadas:</span>
                        <div className="tags-container">
                            {minhasReservasNoDia.map(time => (
                                <span key={time} className="time-tag">{time}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <footer className="card-footer">
                <span>{displayFooterText}</span>
                {temReservaHoje && (
                    <button type="button" className="btn-cancelar-reserva" onClick={handleCancelClick} title="Cancelar todas de hoje">
                        Cancelar Hoje
                    </button>
                )}
            </footer>
        </article>
    );
}