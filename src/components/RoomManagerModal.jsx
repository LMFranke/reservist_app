import React, { useState, useEffect } from 'react';

export default function RoomManagerModal({ roomToEdit, onClose, onSave, onDelete }) {
    const [title, setTitle] = useState('');

    useEffect(() => {
        if (roomToEdit) {
            setTitle(roomToEdit.title || '');
        } else {
            setTitle(''); // Limpa ao criar nova
        }
    }, [roomToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) {
            alert("O nome da sala é obrigatório!");
            return;
        }

        // Mantém as propriedades ocultas (como os mocks) intactas caso a sala já as tenha
        const roomData = {
            ...roomToEdit,
            id: roomToEdit ? roomToEdit.id : Date.now(),
            title: title.trim(),
            footerText: roomToEdit ? roomToEdit.footerText : 'Clique para reservar',
            ocupadaODiaTodo: roomToEdit ? roomToEdit.ocupadaODiaTodo : false,
            occupantMock: roomToEdit ? roomToEdit.occupantMock : null
        };

        onSave(roomData);
    };

    const handleDelete = () => {
        onDelete(roomToEdit.id);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '450px' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.25rem', color: '#0f172a' }}>
                        {roomToEdit ? 'Editar Sala' : 'Nova Sala'}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Nome da Sala</label>
                            <input
                                type="text"
                                className="form-control"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Sala de Inovação"
                                autoFocus
                            />
                        </div>

                        <div className="confirm-actions" style={{ marginTop: '0.5rem', justifyContent: roomToEdit ? 'space-between' : 'flex-end', display: 'flex', alignItems: 'center' }}>
                            {/* O botão de excluir só aparece se for uma edição */}
                            {roomToEdit ? (
                                <button type="button" className="btn-danger" onClick={handleDelete} style={{ margin: 0, padding: '0.6rem 1rem' }}>
                                    Excluir Sala
                                </button>
                            ) : (
                                <div></div> /* Espaçador fantasma */
                            )}

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn-outline" onClick={onClose}>Cancelar</button>
                                <button type="submit" className="btn-primary" style={{ margin: 0 }}>Salvar</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}