// sidebar.js
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.add('collapsed'); // Asegura que el sidebar esté cerrado por defecto
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}
