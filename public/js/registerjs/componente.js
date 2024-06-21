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
function selectGender(gender) {
    // Obtener todas las opciones
    const options = document.querySelectorAll('.option');

    // Remover la clase 'selected' de todas las opciones
    options.forEach(option => {
        option.classList.remove('selected');
    });

    // Agregar la clase 'selected' a la opción seleccionada
    document.getElementById(`option-${gender}`).classList.add('selected');

    // Actualizar el valor del input hidden
    document.getElementById('genero').value = gender;
}
