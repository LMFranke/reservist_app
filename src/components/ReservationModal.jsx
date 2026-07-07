import React, { useState } from 'react';
import './ReservationModal.css';

const SCHEDULE_TIMES = [
    '07:30 às 09:30', '09:30 às 12:30', '12:30 às 14:00',
    '14:00 às 15:30', '15:30 às 17:00', '17:00 às 18:00'
];

export default function ReservationModal({ room, ocupacoesMock, minhasReservas, onClose, onConfirm, onCancel }) {
    const [selectedTime, setSelectedTime] = useState(null);
    const [actionType, setActionType] = useState(null);

    const [dataSelecionada, setDataSelecionada] = useState(new Date());
    const hoje = new Date();

    const limiteFuturo = new Date();
    limiteFuturo.setDate(hoje.getDate() + 7);

    const formatarChaveData = (date) => {
        return date.toISOString().split('T')[0];
    };

    const formatarDataExibicao = (date) => {
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    const chaveDataAtual = formatarChaveData(dataSelecionada);
    const minhasReservasNoDia = minhasReservas[chaveDataAtual] || [];

    const isHoje = chaveDataAtual === formatarChaveData(hoje);
    const isLimite = chaveDataAtual === formatarChaveData(limiteFuturo);

    // --- NOVA LÓGICA: Verifica se o horário já passou ---
    const isSlotInPast = (timeString) => {
        // Se a data selecionada for de amanhã em diante, nenhum horário passou
        if (!isHoje) return false;

        // Pega apenas a hora final do texto (Ex: de "14:00 às 15:30", pega "15:30")
        const [, end] = timeString.split(' às ');
        const [endH, endM] = end.split(':').map(Number);

        const agora = new Date();
        const currentTotal = agora.getHours() * 60 + agora.getMinutes();
        const endTotal = endH * 60 + endM;

        // Se a hora atual for maior ou igual ao fim do horário da sala, ele encerrou
        return currentTotal >= endTotal;
    };

    const avancarDia = () => {
        const proximo = new Date(dataSelecionada);
        proximo.setDate(proximo.getDate() + 1);
        if (proximo <= limiteFuturo) {
            setDataSelecionada(proximo);
            setSelectedTime(null);
            setActionType(null);
        }
    };

    const voltarDia = () => {
        const anterior = new Date(dataSelecionada);
        anterior.setDate(anterior.getDate() - 1);
        if (anterior.setHours(0,0,0,0) >= hoje.setHours(0,0,0,0)) {
            setDataSelecionada(anterior);
            setSelectedTime(null);
            setActionType(null);
        }
    };

    const handleItemClick = (time, isFree, isMinhaReservaAqui) => {
        if (isFree) {
            setSelectedTime(time);
            setActionType('reserve');
        } else if (isMinhaReservaAqui) {
            setSelectedTime(time);
            setActionType('cancel');
        }
    };

    const handleConfirm = () => {
        if (actionType === 'reserve') {
            onConfirm(room.id, chaveDataAtual, selectedTime);
        } else if (actionType === 'cancel') {
            // Agora enviamos o horário específico que queremos deletar
            onCancel(room.id, chaveDataAtual, selectedTime);
        }
        setSelectedTime(null);
        setActionType(null);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title-group">
                        <div className="icon-box">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <div>
                            <h2 id="main-modal-title">{room.title}</h2>
                            <p>Agende horários com até 1 semana de antecedência</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <nav className="date-navigation" aria-label="Navegação de datas">
                    <button
                        className="nav-date-btn"
                        onClick={voltarDia}
                        disabled={isHoje}
                        title="Dia anterior"
                    >
                        &larr;
                    </button>
                    <time className="current-date-display" dateTime={chaveDataAtual}>
                        {formatarDataExibicao(dataSelecionada)}
                    </time>
                    <button
                        className="nav-date-btn"
                        onClick={avancarDia}
                        disabled={isLimite}
                        title="Próximo dia"
                    >
                        &rarr;
                    </button>
                </nav>

                <div className="modal-body">
                    <section className="schedule-section">
                        <ul className="schedule-list" style={{ listStyle: 'none', padding: 0 }}>
                            {SCHEDULE_TIMES.map((time) => {
                                const isMinhaReservaAqui = minhasReservasNoDia.includes(time);
                                const ocupanteMock = isHoje ? ocupacoesMock?.[time] : null;

                                // Nova verificação de encerramento do horário
                                const passou = isSlotInPast(time);

                                // Só será livre se não for meu, não for do mock, E NÃO TIVER PASSADO
                                const isFree = !isMinhaReservaAqui && !ocupanteMock && !passou;
                                const isSelected = selectedTime === time;

                                let itemClass = 'schedule-item';
                                if (!isFree && !isMinhaReservaAqui) itemClass += ' occupied';
                                if (isMinhaReservaAqui) itemClass += ' my-reservation';
                                if (isSelected) itemClass += ' selected';

                                return (
                                    <li
                                        key={time}
                                        className={itemClass}
                                        onClick={() => handleItemClick(time, isFree, isMinhaReservaAqui)}
                                        style={{ cursor: (isFree || isMinhaReservaAqui) ? 'pointer' : 'default' }}
                                    >
                                        <div className="time-info">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                            <span>{time}</span>
                                        </div>

                                        {isFree && <span className="pill green" style={{ marginBottom: 0 }}>Livre</span>}

                                        {/* Status baseados nas condições: */}
                                        {isMinhaReservaAqui && <div className="occupant-info" style={{ color: 'var(--primary)', fontWeight: 500 }}>Sua Reserva</div>}

                                        {ocupanteMock && !isMinhaReservaAqui && <div className="occupant-info" style={{ color: 'var(--text-muted)' }}>{ocupanteMock}</div>}

                                        {/* Mostra "Encerrado" apenas se não houver dono nem mock e a hora já passou */}
                                        {passou && !isMinhaReservaAqui && !ocupanteMock && <div className="occupant-info" style={{ color: 'var(--text-muted)' }}>Encerrado</div>}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                </div>

                {selectedTime && (
                    <div className="confirm-box" style={{ display: 'block' }}>
                        <p id="confirmTimeText">
                            {actionType === 'reserve'
                                ? `Confirmar agendamento para o dia ${dataSelecionada.getDate()}/${dataSelecionada.getMonth()+1} das ${selectedTime}?`
                                : `Deseja cancelar sua reserva do dia ${dataSelecionada.getDate()}/${dataSelecionada.getMonth()+1} das ${selectedTime}?`
                            }
                        </p>
                        <div className="confirm-actions">
                            <button className="btn-outline" onClick={() => { setSelectedTime(null); setActionType(null); }}>
                                Voltar
                            </button>
                            {actionType === 'reserve' ? (
                                <button className="btn-primary" onClick={handleConfirm}>Confirmar Reserva</button>
                            ) : (
                                <button className="btn-danger" onClick={handleConfirm}>Cancelar Reserva</button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}