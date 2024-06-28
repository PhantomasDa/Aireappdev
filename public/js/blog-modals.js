document.addEventListener('DOMContentLoaded', (event) => {
    const modal = document.getElementById("blog-modal");
    const modalContent = document.getElementById("modal-body");
    const span = document.getElementsByClassName("close")[0];

    const blogContents = {
        1: `  <div style="padding: 50px; font-family: Arial, sans-serif; color: #333;">
        <h1 style="font-size: 30px; max-width: 100%; text-align: center; line-height: 35px;">5 Consejos para Empezar a Hacer Pilates</h1>
    
        <div style="text-align: center; margin: 10px 0;">
            <span style="font-size: 24px; color: gold;">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
        </div>
        
        <h2>1. Asegúrate de Tener Instructores Calificados</h2>
        <p style="color: black;">Asegúrate de que los instructores estén calificados. Indaga sobre el tipo de pilates que imparten y si se adapta a tus necesidades.</p>
    
        <h2>2. Busca un Espacio Cómodo</h2>
        <p style="color: black;">Busca un espacio donde te sientas cómod@ y resuene con tu esencia. Esto influirá directamente en la conexión que creas con el movimiento, para que sea un momento de disfrute y no de obligación o deber.</p>
    
        <h2>3. Conecta con tu Cuerpo</h2>
        <p style="color: black;">Conecta con tu cuerpo siguiendo las indicaciones del instructor o instructora. Escucha a tu cuerpo y cómo se siente el movimiento con la respiración.</p>
    
        <h2>4. Comprende los Principios del Pilates</h2>
        <p style="color: black;">Comprende la importancia de seguir los principios del pilates, como la respiración coordinada con los movimientos. Esto es fundamental para sacar el mayor provecho a este método.</p>
    
        <h2>5. Constancia y Disciplina</h2>
        <p style="color: black;">Una vez que empieces con tus clases, trata de ser consecuente con ellas. Así podrás ver de verdad los beneficios de este método.</p>
    
        <img src="https://airepilates.com/content/carrusel4.png" alt="Imagen de ejemplo" style="width: 100%; height: auto; max-width: 600px; display: block; margin: 0 auto;"/>
    
        <div style="text-align: center; margin: 20px 0;">
            <button class="secondary-button" style="background-color: #007BFF; color: #FFF; padding: 10px 20px; text-decoration: none; border-radius: 5px; border: none; cursor: pointer;">Más Información</button>
        </div>
    
        <div style="margin-top: 40px;">
            <h2>Comentarios</h2>
            <div style="margin-bottom: 20px;">
                <p><strong>Juan Pérez</strong></p>
                <p style="color: black;">Muy buenos consejos, me han sido de gran ayuda. ¡Gracias!</p>
            </div>
            <div style="margin-bottom: 20px;">
                <p><strong>María Gómez</strong></p>
                <p style="color: black;">Me encanta cómo explican los principios del pilates. Muy claro y conciso.</p>
            </div>
            <div style="margin-bottom: 20px;">
                <p><strong>Pedro Martínez</strong></p>
                <p style="color: black;">He seguido estos consejos y mi experiencia con pilates ha mejorado mucho.</p>
            </div>
            <div style="margin-bottom: 20px;">
                <input type="text" placeholder="Escribe tu comentario aquí" style="width: 100%; padding: 10px; margin-bottom: 10px;"/>
                <button style="background-color: #007BFF; color: #FFF; padding: 10px 20px; text-decoration: none; border-radius: 5px; border: none; cursor: pointer;">Enviar Comentario</button>
            </div>
        </div>
    </div>
    
    
        `,
        2: `<div style="padding: 50px; font-family: Arial, sans-serif; color: #333;">
        <h1 style="font-size: 30px; max-width: 100%; text-align: center; line-height: 35px;">Pastel de Banana Fitness</h1>
    
        <div style="text-align: center; margin: 10px 0;">
            <span style="font-size: 24px; color: gold;">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
        </div>
        
        <h2>Ingredientes</h2>
        <ul style="color: black;">
            <li>1/4 de taza de azúcar de coco</li>
            <li>30 gramos de ghee</li>
            <li>2 huevos</li>
            <li>3 bananas</li>
            <li>1/2 taza de harina de avena</li>
            <li>1/2 taza de hojuelas de quinua tostada</li>
            <li>Chocolate amargo sin azúcar en cuadritos al gusto</li>
        </ul>
    
        <h2>Preparación</h2>
        <p style="color: black;">La preparación es similar a la de un pastel. Primero, mezcla el azúcar de coco con el ghee hasta obtener una mezcla cremosa. Luego, agrega los huevos y bate bien. Añade las bananas trituradas y mezcla hasta que todo esté bien incorporado. Agrega la harina de avena y las hojuelas de quinua tostada, mezclando bien. Finalmente, pica el chocolate amargo en cuadritos y agrégalo a la mezcla.</p>
        <p style="color: black;">Vierte la mezcla en un molde y cocina en un horno pequeño precalentado a 180 grados Celsius (350 grados Fahrenheit) durante aproximadamente 30-35 minutos, o hasta que al insertar un palillo en el centro, este salga limpio.</p>
    
        <img src="https://airepilates.com/content/postre.jpg" alt="Pastel de Banana Fitness" style="width: 100%; height: auto; max-width: 600px; display: block; margin: 0 auto;"/>
    
        <div style="text-align: center; margin: 20px 0;">
            <button class="secondary-button" style="background-color: #007BFF; color: #FFF; padding: 10px 20px; text-decoration: none; border-radius: 5px; border: none; cursor: pointer;">Más Recetas Fitness</button>
        </div>
    
        <div style="margin-top: 40px;">
            <h2>Comentarios</h2>
            <div style="margin-bottom: 20px;">
                <p><strong>Juan Pérez</strong></p>
                <p style="color: black;">Delicioso pastel, perfecto para mis desayunos. ¡Gracias por la receta!</p>
            </div>
            <div style="margin-bottom: 20px;">
                <p><strong>María Gómez</strong></p>
                <p style="color: black;">Me encantó esta receta, es fácil de hacer y muy saludable.</p>
            </div>
            <div style="margin-bottom: 20px;">
                <p><strong>Pedro Martínez</strong></p>
                <p style="color: black;">Ideal para un snack rápido y nutritivo. ¡Muy recomendable!</p>
            </div>
            <div style="margin-bottom: 20px;">
                <input type="text" placeholder="Escribe tu comentario aquí" style="width: 100%; padding: 10px; margin-bottom: 10px;"/>
                <button style="background-color: #007BFF; color: #FFF; padding: 10px 20px; text-decoration: none; border-radius: 5px; border: none; cursor: pointer;">Enviar Comentario</button>
            </div>
        </div>
    </div>
    
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
