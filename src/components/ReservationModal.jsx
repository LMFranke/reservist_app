import React, { useState } from 'react';
import './ReservationModal.css';

const SCHEDULE_TIMES = [
    '07:30 às 09:30', '09:30 às 12:30', '12:30 às 14:00',
    '14:00 às 15:30', '15:30 às 17:00', '17:00 às 18:00'
];

export default function ReservationModal({ room, ocupacoesMock, minhasReservas, reservasTerceiros, isAdmin, onClose, onConfirm, onCancel }) {
    const [selectedTime, setSelectedTime] = useState(null);
    const [actionType, setActionType] = useState(null);

    const [dataSelecionada, setDataSelecionada] = useState(new Date());
    const hoje = new Date();
    const limiteFuturo = new Date();
    limiteFuturo.setDate(hoje.getDate() + 7);

    const formatarChaveData = (date) => date.toISOString().split('T')[0];
    const formatarDataExibicao = (date) => date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    const chaveDataAtual = formatarChaveData(dataSelecionada);
    const minhasReservasNoDia = minhasReservas[chaveDataAtual] || [];

    const terceirosNoDia = reservasTerceiros[chaveDataAtual] || {};

    const isHoje = chaveDataAtual === formatarChaveData(hoje);
    const isLimite = chaveDataAtual === formatarChaveData(limiteFuturo);

    const isSlotInPast = (timeString) => {
        if (!isHoje) return false;
        const [, end] = timeString.split(' às ');
        const [endH, endM] = end.split(':').map(Number);
        const agora = new Date();
        const currentTotal = agora.getHours() * 60 + agora.getMinutes();
        const endTotal = endH * 60 + endM;
        return currentTotal >= endTotal;
    };

    const avancarDia = () => {
        const proximo = new Date(dataSelecionada);
        proximo.setDate(proximo.getDate() + 1);
        if (proximo <= limiteFuturo) { setDataSelecionada(proximo); setSelectedTime(null); setActionType(null); }
    };

    const voltarDia = () => {
        const anterior = new Date(dataSelecionada);
        anterior.setDate(anterior.getDate() - 1);
        if (anterior.setHours(0,0,0,0) >= hoje.setHours(0,0,0,0)) { setDataSelecionada(anterior); setSelectedTime(null); setActionType(null); }
    };

    const handleItemClick = (time, isFree, isMinhaReservaAqui, isOcupadoPorTerceiro) => {
        if (isFree) {
            setSelectedTime(time);
            setActionType('reserve');
        } else if (isMinhaReservaAqui) {
            setSelectedTime(time);
            setActionType('cancel');
        } else if (isAdmin && isOcupadoPorTerceiro) {
            setSelectedTime(time);
            setActionType('admin_override');
        }
    };

    const handleConfirm = () => {
        if (actionType === 'reserve') {
            onConfirm(room.id, chaveDataAtual, selectedTime);
        } else if (actionType === 'cancel') {
            onCancel(room.id, chaveDataAtual, selectedTime, false);
        } else if (actionType === 'admin_override') {
            const isMockDelete = isHoje && ocupacoesMock?.[selectedTime] && !terceirosNoDia[selectedTime];
            onCancel(room.id, chaveDataAtual, selectedTime, !!isMockDelete);
        }
        setSelectedTime(null);
        setActionType(null);
    };

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="main-modal-title">
            <div className="modal-content">
                <header className="modal-header">
                    <div className="modal-title-group">
                        <div className="icon-box" style={{ backgroundColor: isAdmin ? '#fef2f2' : '#f1f5f9', color: isAdmin ? '#ef4444' : '#64748b' }}>
                            {isAdmin ? <span style={{ fontSize: '1.2rem' }}>🛡️</span> : <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
                        </div>
                        <div>
                            <h2 id="main-modal-title">{room.title} {isAdmin && <span style={{fontSize:'0.8rem', color:'#ef4444', marginLeft:'0.5rem'}}>Modo Admin</span>}</h2>
                            <p>Agende horários com até 1 semana de antecedência</p>
                        </div>
                    </div>
                    <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar janela">
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </header>

                <nav className="date-navigation" aria-label="Navegação de datas">
                    <button type="button" className="nav-date-btn" onClick={voltarDia} disabled={isHoje} aria-label="Dia anterior">&larr;</button>
                    <time className="current-date-display" dateTime={chaveDataAtual}>{formatarDataExibicao(dataSelecionada)}</time>
                    <button type="button" className="nav-date-btn" onClick={avancarDia} disabled={isLimite} aria-label="Próximo dia">&rarr;</button>
                </nav>

                <main className="modal-body">
                    <section className="schedule-section" aria-label="Lista de horários">
                        <ul className="schedule-list" style={{ listStyle: 'none', padding: 0 }}>
                            {SCHEDULE_TIMES.map((time) => {
                                const isMinhaReservaAqui = minhasReservasNoDia.includes(time);
                                const ocupanteUsuarioReal = terceirosNoDia[time];
                                const ocupanteMock = isHoje ? ocupacoesMock?.[time] : null;

                                const ocupanteFinal = ocupanteUsuarioReal || ocupanteMock;

                                const passou = isSlotInPast(time);

                                const isOcupadoPorTerceiro = !!ocupanteFinal;
                                const isFree = !isMinhaReservaAqui && !isOcupadoPorTerceiro && !passou;
                                const isSelected = selectedTime === time;

                                let itemClass = 'schedule-item';
                                if (!isFree && !isMinhaReservaAqui) itemClass += ' occupied';
                                if (isMinhaReservaAqui) itemClass += ' my-reservation';
                                if (isSelected) itemClass += ' selected';
                                if (isAdmin && !isFree && !passou && isOcupadoPorTerceiro) itemClass += ' admin-clickable';

                                const isClickable = isFree || isMinhaReservaAqui || (isAdmin && isOcupadoPorTerceiro && !passou);

                                return (
                                    <li
                                        key={time}
                                        className={itemClass}
                                        onClick={() => isClickable && handleItemClick(time, isFree, isMinhaReservaAqui, isOcupadoPorTerceiro)}
                                        style={{ cursor: isClickable ? 'pointer' : 'default' }}
                                    >
                                        <div className="time-info">
                                            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                            <span>{time}</span>
                                        </div>

                                        {isFree && <span className="pill green" style={{ marginBottom: 0 }}>Livre</span>}
                                        {isMinhaReservaAqui && <div className="occupant-info" style={{ color: 'var(--primary)', fontWeight: 500 }}>Sua Reserva</div>}

                                        {ocupanteFinal && !isMinhaReservaAqui && (
                                            <div className="occupant-info" style={{ color: 'var(--text-muted)' }}>
                                                {ocupanteFinal}
                                            </div>
                                        )}

                                        {passou && !isMinhaReservaAqui && !ocupanteFinal && <div className="occupant-info" style={{ color: 'var(--text-muted)' }}>Encerrado</div>}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                </main>

                {selectedTime && (
                    <aside className="confirm-box" role="alert" style={{ display: 'block', backgroundColor: actionType === 'admin_override' ? '#fef2f2' : '#f8fafc', borderColor: actionType === 'admin_override' ? '#fca5a5' : '#e2e8f0' }}>
                        <p id="confirmTimeText" style={{ color: actionType === 'admin_override' ? '#991b1b' : '#1e293b' }}>
                            {actionType === 'reserve' && `Confirmar agendamento para ${dataSelecionada.getDate()}/${dataSelecionada.getMonth()+1} das ${selectedTime}?`}
                            {actionType === 'cancel' && `Deseja cancelar sua reserva das ${selectedTime}?`}
                            {actionType === 'admin_override' && `ATENÇÃO: Forçar exclusão da reserva de terceiros das ${selectedTime}?`}
                        </p>
                        <div className="confirm-actions">
                            <button type="button" className="btn-outline" onClick={() => { setSelectedTime(null); setActionType(null); }}>Voltar</button>
                            {actionType === 'reserve' && <button type="button" className="btn-primary" onClick={handleConfirm}>Confirmar Reserva</button>}
                            {(actionType === 'cancel' || actionType === 'admin_override') && (
                                <button type="button" className="btn-danger" style={{ backgroundColor: '#ef4444' }} onClick={handleConfirm}>
                                    {actionType === 'admin_override' ? 'Forçar Exclusão' : 'Cancelar Reserva'}
                                </button>
                            )}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}