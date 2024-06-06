document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    initPage();
    setupMenuToggle();
    checkAuthAndLoadProfile();
});

function initPage() {
    console.log('Initializing page...');
    actualizarClasesDisponibles();
    cargarProximasClases();
    cargarNombreUsuario();
    inicializarCalendario();
}

function setupMenuToggle() {
    console.log('Setting up menu toggle...');
    loadComponent('menu', 'menu.html', initializeMenu);
    loadComponent('footer', 'footer.html');
    loadComponent('sidebar-container', 'sidebar.html'); // Asegúrate de que este ID exista en tu HTML

    function initializeMenu() {
        console.log('Initializing menu...');
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
    console.log('Checking authentication...');
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    fetch('/profile', {
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
            console.log('Profile data:', data);
            // Aquí puedes agregar el código para mostrar la información del usuario en la página
        }
    })
    .catch(error => console.error('Error:', error));
}
