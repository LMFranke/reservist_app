document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('mockIniciado')) {
        localStorage.setItem('reservaSala2', '14:00 às 15:30');
        localStorage.setItem('mockIniciado', 'true');
    }

    const userEmail = localStorage.getItem('userEmail');
    if(userEmail) {
        document.getElementById('user-email-display').textContent = userEmail;
    }

    const rooms = [1, 2, 3, 4];

    rooms.forEach(id => {
        const reserva = localStorage.getItem('reservaSala' + id);
        const btnCancelar = document.getElementById('btnCancelarReserva' + id);

        if (reserva) {
            document.getElementById('sala' + id + '-dot').className = 'status-dot red';

            const pill = document.getElementById('sala' + id + '-pill');
            pill.className = 'pill primary';
            pill.textContent = 'Sua Reserva';

            document.getElementById('sala' + id + '-occupant').textContent = 'Reservado: ' + reserva;
            document.getElementById('sala' + id + '-footer-text').textContent = 'Horário confirmado';

            btnCancelar.style.display = 'block';

            btnCancelar.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                localStorage.removeItem('reservaSala' + id);
                window.location.reload();
            });
        }
    });
});