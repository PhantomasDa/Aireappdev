
function togglePasswordVisibility(inputId, toggleId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById(toggleId);
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

flatpickr("#fecha_nacimiento", {
        dateFormat: "Y-m-d",
        allowInput: false
    });

    function selectGender(genero) {
        document.getElementById('genero').value = genero;

        const options = document.querySelectorAll('.option');
        options.forEach(option => option.classList.remove('selected'));

        const selectedOption = document.getElementById(`option-${genero}`);
        selectedOption.classList.add('selected');
    }

function toggleLesiones() {
    const pregunta2 = document.getElementById('pregunta2').value;
    const lesionesSection = document.getElementById('lesionesSection');
    
    if (pregunta2 === 'si') {
        lesionesSection.style.display = 'block';
    } else {
        lesionesSection.style.display = 'none';
    }
}


function scrollToTop() {
window.scrollTo({
    top: 0,
    behavior: 'smooth'
});
}

function updateProgressBar(step) {
const totalSteps = 6; // Actualiza este número si tienes más o menos pasos
const percentage = (step / totalSteps) * 100;
const progressBar = document.getElementById('progress-bar');
progressBar.style.width = percentage + '%';
progressBar.textContent = Math.round(percentage) + '%';
}

function toggleBillingForm() {
    const billingForm = document.getElementById('billingForm');
    if (document.getElementById('showBilling').checked) {
        billingForm.style.display = 'block';
    } else {
        billingForm.style.display = 'none';
    }
}



