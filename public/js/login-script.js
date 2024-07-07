document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Normalizar email: eliminar puntos de la parte local
    email = email.replace(/\.(?=.*@)/g, '');

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            window.location.href = '/profile';
        } else {
            alert('Login fallido: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error durante el login:', error);
        alert('Error durante el login: ' + error.message);
    });
});

function loadComponent(id, url, callback) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
            if (callback) callback();
        })
        .catch(error => console.error('Error loading component:', error));
}

document.addEventListener("DOMContentLoaded", function() {
    loadComponent('menu', 'menu.html', initializeMenu);
    loadComponent('footer', 'footer.html');
    loadComponent('sidebar-container', 'sidebar.html');

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
});
