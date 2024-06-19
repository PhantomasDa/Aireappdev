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
