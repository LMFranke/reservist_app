document.addEventListener('DOMContentLoaded', () => {
    const userEmail = localStorage.getItem('userEmail');
    if(userEmail) document.getElementById('modal-email-display').textContent = userEmail;

    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId') || '1';

    const roomNames = {
        '1': 'Sala de Reuniões 1',
        '2': 'Sala de Reuniões 2',
        '3': 'Sala de Treinamento',
        '4': 'Sala Executiva'
    };
    const roomName = roomNames[roomId] || ('Sala ' + roomId);

    document.getElementById('main-modal-title').textContent = roomName;
    document.getElementById('bg-card-title').textContent = roomName;

    const ocupacoesMockadas = {
        '3': {
            '07:30 às 09:30': 'Equipe de Automação',
            '09:30 às 12:30': 'Equipe de Automação',
            '12:30 às 14:00': 'Equipe de Automação',
            '14:00 às 15:30': 'Equipe de Automação'
        },
        '4': {
            '07:30 às 09:30': 'Diretoria',
            '09:30 às 12:30': 'Diretoria',
            '12:30 às 14:00': 'Diretoria',
            '14:00 às 15:30': 'Diretoria',
            '15:30 às 17:00': 'Diretoria',
            '17:00 às 18:00': 'Diretoria'
        }
    };

    const slots = document.querySelectorAll('.schedule-item');

    slots.forEach(slot => {
        const timeText = slot.querySelector('.time-info span').textContent;

        if (ocupacoesMockadas[roomId] && ocupacoesMockadas[roomId][timeText]) {
            slot.className = 'schedule-item occupied';
            slot.removeAttribute('data-time');

            slot.innerHTML = `
                <div class="time-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>${timeText}</span>
                </div>
                <div class="occupant-info" style="color: var(--text-muted);">${ocupacoesMockadas[roomId][timeText]}</div>
            `;
        }
    });

    const reserva = localStorage.getItem('reservaSala' + roomId);
    if (reserva) {
        slots.forEach(slot => {
            const timeText = slot.querySelector('.time-info span').textContent;
            if(timeText === reserva) {
                slot.className = 'schedule-item occupied';
                slot.removeAttribute('data-time');
                slot.innerHTML = `
                    <div class="time-info">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span>${timeText}</span>
                    </div>
                    <div class="occupant-info" style="color: var(--primary); font-weight: 500;">Sua Reserva</div>
                `;
            }
        });
    }

    const freeSlots = document.querySelectorAll('.schedule-item.free');
    const confirmBox = document.getElementById('confirmBox');
    const confirmTimeText = document.getElementById('confirmTimeText');
    const btnCancelar = document.getElementById('btnCancelar');
    const btnConfirmar = document.getElementById('btnConfirmar');

    freeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            freeSlots.forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');

            const timeText = this.getAttribute('data-time');
            confirmTimeText.textContent = 'Horário selecionado: ' + timeText;
            confirmBox.style.display = 'block';

            document.querySelector('.modal-body').scrollTo({
                top: document.querySelector('.modal-body').scrollHeight,
                behavior: 'smooth'
            });
        });
    });

    btnCancelar.addEventListener('click', function() {
        freeSlots.forEach(s => s.classList.remove('selected'));
        confirmBox.style.display = 'none';
    });

    btnConfirmar.addEventListener('click', function() {
        const selectedSlot = document.querySelector('.schedule-item.selected');
        if (selectedSlot) {
            const timeText = selectedSlot.getAttribute('data-time');
            localStorage.setItem('reservaSala' + roomId, timeText);
            window.location.href = 'dashboard.html';
        }
    });
});