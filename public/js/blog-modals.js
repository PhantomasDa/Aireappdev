document.addEventListener('DOMContentLoaded', (event) => {
    const modal = document.getElementById("blog-modal");
    const modalContent = document.getElementById("modal-body");
    const span = document.getElementsByClassName("close")[0];

    const blogContents = {
        1: `
            <h2>5 consejos para empezar a hacer pilates</h2>
            <p style="color:black;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ut ipsum tincidunt, ultricies erat in, laoreet est. Nulla facilisi. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <img src="https://via.placeholder.com/300x200" alt="Imagen de ejemplo">
            <p style="color:black;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.</p>
            <button class="secondary-button">Más Información</button>
        `,
        2: `
            <h2>Cuáles son los beneficios del método pilates</h2>
            <p style="color:black;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ut ipsum tincidunt, ultricies erat in, laoreet est. Nulla facilisi. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <img src="https://via.placeholder.com/300x200" alt="Imagen de ejemplo">
            <p style="color:black;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.</p>
            <button class="secondary-button">Más Información</button>
        `,
        3: `
            <h2>La importancia de la respiración</h2>
            <p style="color:black;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ut ipsum tincidunt, ultricies erat in, laoreet est. Nulla facilisi. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <img src="https://via.placeholder.com/300x200" alt="Imagen de ejemplo">
            <p style="color:black;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.</p>
            <button class="secondary-button">Más Información</button>
        `
    };

    document.querySelectorAll('.read-more').forEach(button => {
        button.addEventListener('click', (event) => {
            const postId = event.target.getAttribute('data-post-id');
            console.log(`Opening modal for post ID: ${postId}`); // Debug
            modalContent.innerHTML = blogContents[postId];
            modal.style.display = "block";
            document.body.classList.add('modal-open'); // Prevent body scroll
            requestAnimationFrame(() => {
                modal.classList.add('show');
            });
        });
    });

    span.onclick = function() {
        console.log('Closing modal'); // Debug
        modal.classList.remove('show');
        document.body.classList.remove('modal-open'); // Allow body scroll
    }

    modal.addEventListener('transitionend', (event) => {
        if (!modal.classList.contains('show') && event.propertyName === 'opacity') {
            modal.style.display = "none";
            console.log('Modal hidden'); // Debug
        }
    });

    window.onclick = function(event) {
        if (event.target == modal) {
            console.log('Click outside modal'); // Debug
            modal.classList.remove('show');
            document.body.classList.remove('modal-open'); // Allow body scroll
        }
    }
});
