document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const emailError = document.getElementById('emailError');
    const senhaError = document.getElementById('senhaError');

    emailError.style.display = 'none';
    senhaError.style.display = 'none';
    emailInput.style.borderColor = '';
    senhaInput.style.borderColor = '';

    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailInput.value || !emailRegex.test(emailInput.value)) {
        emailError.style.display = 'block';
        emailInput.style.borderColor = 'var(--red-text)';
        isValid = false;
    }

    if (senhaInput.value.length < 8) {
        senhaError.style.display = 'block';
        senhaInput.style.borderColor = 'var(--red-text)';
        isValid = false;
    }

    if (isValid) {
        localStorage.setItem('userEmail', emailInput.value);
        window.location.href = 'dashboard.html';
    }
});