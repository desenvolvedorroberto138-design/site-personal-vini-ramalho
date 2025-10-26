// mobile.js

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('nav .nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Fechar o menu ao clicar em um link
    if (navLinks) {
        navLinks.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    }
});
