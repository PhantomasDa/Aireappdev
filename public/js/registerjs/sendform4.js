 // Inicializar con el paquete "completo" preseleccionado
 document.addEventListener("DOMContentLoaded", function() {
    selectPackage('completo');
});


function selectPackage(paquete) {
const paqueteInput = document.getElementById('paquete');
const selectedOption = document.getElementById(`option-${paquete}`);

// Verificar si los elementos existen
if (!paqueteInput) {
    console.error('No se encontró el input hidden para el paquete.');
    return;
}

if (!selectedOption) {
    console.error(`No se encontró el elemento para el paquete: ${paquete}`);
    return;
}

paqueteInput.value = paquete;

const options = document.querySelectorAll('.option');
options.forEach(option => option.classList.remove('selected'));

selectedOption.classList.add('selected');

const packageDetails = document.getElementById('packageDetails');
const packageCost = document.getElementById('packageCost');

switch(paquete) {
    case 'Paquete básico':
        packageDetails.innerHTML = `
            <li>4 clases por mes</li>
            <li>Duración de un mes</li>
            <li>Acceso a contenido exclusivo online</li>
        `;
        packageCost.textContent = "Costo: $30";
        break;
    case 'Paquete completo':
        packageDetails.innerHTML = `
            <li>8 clases por mes</li>
            <li>Duración de un mes</li>
            <li>Acceso a contenido exclusivo online</li>
            <li>Soporte personalizado</li>
        `;
        packageCost.textContent = "Costo: $50";
        break;
    case 'Paquete premium':
        packageDetails.innerHTML = `
            <li>12 clases por mes</li>
            <li>Duración de un mes</li>
            <li>Acceso a contenido exclusivo online</li>
            <li>Soporte personalizado</li>
            <li>Sesiones adicionales de coaching</li>
        `;
        packageCost.textContent = "Costo: $70";
        break;
    default:
        packageDetails.innerHTML = '';
        packageCost.textContent = '';
}
}