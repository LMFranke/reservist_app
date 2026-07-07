import React, {useState, useEffect} from 'react';

const SCHEDULE_TIMES = [
    '07:30 às 09:30', '09:30 às 12:30', '12:30 às 14:00',
    '14:00 às 15:30', '15:30 às 17:00', '17:00 às 18:00'
];

export default function RoomCard({
                                     room,
                                     minhasReservasNoDia,
                                     ocupacoesMock,
                                     isAdmin,
                                     onClick,
                                     onCancel,
                                     onEdit,
                                     onDelete
                                 }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const parseTimeString = (timeString) => {
        const [start, end] = timeString.split(' às ');
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        return {startH, startM, endH, endM};
    };

    const isTimeInCurrentSlot = (timeString) => {
        if (!timeString) return false;
        const {startH, startM, endH, endM} = parseTimeString(timeString);
        const currentTotal = currentTime.getHours() * 60 + currentTime.getMinutes();
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;
        return currentTotal >= startTotal && currentTotal < endTotal;
    };

    const isSlotInPast = (timeString) => {
        const {endH, endM} = parseTimeString(timeString);
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

    const slotsLivresHoje = SCHEDULE_TIMES.filter(time => {
        if (isSlotInPast(time)) return false;
        if (minhasReservasNoDia && minhasReservasNoDia.includes(time)) return false;
        if (ocupacoesMock && ocupacoesMock[time]) return false;
        if (room.ocupadaODiaTodo) return false;
        return true;
    });

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

    let displayFooterText = room.footerText;
    if (isTotalmenteOcupada) {
        displayFooterText = 'Sem horários livres hoje';
    } else if (temReservaHoje) {
        displayFooterText = '';
    }

    const handleCancelClick = (e) => {
        e.stopPropagation();
        onCancel(room.id);
    };

    return (
        <article className="room-card" onClick={() => onClick(room.id)} style={{cursor: 'pointer'}}>
            <div className="card-main-content">
                <header className="card-header">
                    <h2 className="card-title" style={{maxWidth: '80%'}}>{room.title}</h2>

                    {/* Agrupamento do Status e Botão Admin */}
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                        {isAdmin && (
                            <button
                                className="btn-edit-room"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                title="Editar configurações da sala"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                        )}
                        <span className={dotClass}></span>
                    </div>
                </header>

                <span className={pillClass}>{pillText}</span>
                {isOcupadaAgora && !isMinhaReservaAgora && (
                    <p className="card-occupant">{ocupanteAtual}</p>
                )}
            </div>

            <div className="card-extended-info">
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
                {temReservaHoje && (
                    <div className="info-tags">
                        <span className="info-label">Reservas agendadas:</span>
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
                    <button type="button" className="btn-cancelar-reserva" onClick={handleCancelClick}
                            title="Cancelar todas de hoje">
                        Cancelar Hoje
                    </button>
                )}
            </footer>
        </article>
    );
}