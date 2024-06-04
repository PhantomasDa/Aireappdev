// init.js

document.addEventListener('DOMContentLoaded', () => {
    initPage();
    setupMenuToggle();
    checkAuthAndLoadProfile();
});

function initPage() {
    actualizarClasesDisponibles();
    cargarProximasClases();
    cargarNombreUsuario();
    inicializarCalendario();
}

function setupMenuToggle() {
    loadComponent('menu', 'menu.html', initializeMenu);
    loadComponent('footer', 'footer.html');
    loadComponent('sidebar-container', 'sidebar.html'); // Asegúrate de que este ID existe en tu HTML

    function initializeMenu() {
        const toggleButton = document.getElementById('navbar-toggle');
        const closeButton = document.getElementById('close-button');
        const fullscreenMenu = document.getElementById('fullscreen-menu');

        if (toggleButton && closeButton && fullscreenMenu) {
            toggleButton.addEventListener('click', () => {
                fullscreenMenu.classList.add('open');
            });

            closeButton.addEventListener('click', () => {
                fullscreenMenu.classList.remove('open');
            });
        }
    }
}

function checkAuthAndLoadProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    fetch('http://localhost:3000/profile', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (response.status === 401) {
            window.location.href = '/login.html';
        } else {
            return response.json();
        }
    })
    .then(data => {
        if (data) {
            console.log(data);
            // Aquí puedes agregar el código para mostrar la información del usuario en la página
        }
    })
    .catch(error => console.error('Error:', error));
}
