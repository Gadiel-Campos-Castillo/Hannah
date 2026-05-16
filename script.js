const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');

// Configuración de resolución virtual interna (Mantiene la lógica original)
const WIDTH = 1920;
const HEIGHT = 1080;

// Colores
const WHITE = "#FFFFFF";
const PINK = "rgba(255, 182, 193, 1)";
const BLACK = "#000000";
const RED = "#D53930";

// Textos
const texto = "Perdón por desaparecer todo el día...";
const texto2 = "No quería ignorarte :( ";
const texto3 = "Hannah es la mejor de todo el mundo, ¡Miau!";
const texto4 = "Maquina de Touring - 2026";

// Estados lógicos
let perdonado = false;
let mostrar_confirmacion = false;
let mostrar_boton = false;

// Animación del texto
let texto_visible = "";
let texto2_visible = "";
let texto3_visible = "";
let texto4_visible = "";

let texto_index = 0;
let texto2_index = 0;
let texto3_index = 0;
let texto4_index = 0;

let ultimo_update = performance.now();
const delay = 70; 

// Posiciones lógicas de los botones
const button_rect = { x: 390 - 110, y: 380 - 40, w: 220, h: 80 }; 
const si_rect = { x: 280, y: 260, w: 100, h: 50 };
const no_rect = { x: 420, y: 260, w: 100, h: 50 };

// Cosas para el gracias
let gracias_alpha = 0;
let gracias_scale = 0.5;

// Animación gatito
const catFrames = [];
let cat_frame_index = 0;
const cat_animation_speed = 0.15;

// Cargar Imágenes
const background = new Image(); background.src = 'assets/fondo.jpg';
const heart = new Image(); heart.src = 'assets/corazon.png';
const button_image = new Image(); button_image.src = 'assets/boton.png';

for (let i = 1; i <= 12; i++) {
    const frame = new Image();
    frame.src = `assets/cat/frame${i}.png`;
    catFrames.push(frame);
}

// Música
const musica = new Audio('assets/musica.mp3');
musica.loop = true;

startScreen.addEventListener('click', () => {
    startScreen.style.opacity = '0';
    setTimeout(() => {
        startScreen.style.display = 'none';
        canvas.style.display = 'block';
        
        musica.play().catch(err => console.log("Audio bloqueado:", err));
        
        ultimo_update = performance.now();
        requestAnimationFrame(gameLoop);
    }, 500);
});

// Manejo de eventos de Click con escalado de coordenadas para Fullscreen
canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    
    // IMPORTANTE: Escalamos la posición real del clic a nuestro espacio virtual de 800x500
    const mouseX = (event.clientX - rect.left) * (WIDTH / rect.width);
    const mouseY = (event.clientY - rect.top) * (HEIGHT / rect.height);

    // Botón principal
    if (mostrar_boton && colisionObjeto(mouseX, mouseY, button_rect)) {
        mostrar_confirmacion = true;
    }

    // Botón SI
    if (mostrar_confirmacion && colisionObjeto(mouseX, mouseY, si_rect)) {
        perdonado = true;
        mostrar_confirmacion = false;
        mostrar_boton = false;
        texto_visible = "";
        texto2_visible = "";
    }

    // Botón NO
    if (mostrar_confirmacion && colisionObjeto(mouseX, mouseY, no_rect)) {
        mostrar_confirmacion = false;
    }
});

function colisionObjeto(mx, my, rect) {
    return mx >= rect.x && mx <= rect.x + rect.w && my >= rect.y && my <= rect.y + rect.h;
}

function gameLoop() {
    const ahora = performance.now();

    // Renderizamos siempre sobre el lienzo virtual de 800x500
    ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);

    // Lógica de máquina de escribir
    if (texto_index < texto.length) {
        if (ahora - ultimo_update > delay) {
            texto_visible += texto[texto_index];
            texto_index++;
            ultimo_update = ahora;
        }
    } else if (texto2_index < texto2.length) {
        if (ahora - ultimo_update > delay) {
            texto2_visible += texto2[texto2_index];
            texto2_index++;
            ultimo_update = ahora;
        }
    } else {
        if (!perdonado) {
            mostrar_boton = true;
        } else {
            if (texto3_index < texto3.length) {
                if (ahora - ultimo_update > delay) {
                    texto3_visible += texto3[texto3_index];
                    texto3_index++;
                    ultimo_update = ahora;
                }
            } else if (texto4_index < texto4.length) {
                if (ahora - ultimo_update > delay) {
                    texto4_visible += texto4[texto4_index];
                    texto4_index++;
                    ultimo_update = ahora;
                }
            }
        }
    }

    // Dibujar textos
    ctx.fillStyle = WHITE;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "36px 'CustomFont', sans-serif";
    ctx.fillText(texto_visible, WIDTH / 2, 110);
    ctx.fillText(texto3_visible, WIDTH / 2, 110);

    ctx.font = "26px 'CustomFont', sans-serif";
    ctx.fillText(texto2_visible, WIDTH / 2, 170);
    ctx.fillText(texto4_visible, WIDTH / 2, 170);

    // Botón Principal
    if (mostrar_boton) {
        ctx.drawImage(button_image, button_rect.x, button_rect.y, button_rect.w, button_rect.h);
        ctx.fillStyle = WHITE;
        ctx.font = "26px 'CustomFont', sans-serif";
        ctx.fillText("¿Me perdonas?", button_rect.x + button_rect.w / 2, button_rect.y + button_rect.h / 2);
    }

    // Pop-up de confirmación
    if (mostrar_confirmacion) {
        ctx.fillStyle = "rgba(255, 182, 193, 0.47)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.fillStyle = PINK;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(200, 150, 400, 200, 20);
        else ctx.rect(200, 150, 400, 200);
        ctx.fill();

        ctx.fillStyle = BLACK;
        ctx.font = "26px 'CustomFont', sans-serif";
        ctx.fillText("¿De verdad me perdonas?", 400, 190);

        // Sí
        ctx.fillStyle = "rgb(150, 255, 150)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(si_rect.x, si_rect.y, si_rect.w, si_rect.h, 10);
        else ctx.rect(si_rect.x, si_rect.y, si_rect.w, si_rect.h);
        ctx.fill();
        ctx.fillStyle = BLACK;
        ctx.fillText("Sí", si_rect.x + si_rect.w / 2, si_rect.y + si_rect.h / 2);

        // No
        ctx.fillStyle = RED;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(no_rect.x, no_rect.y, no_rect.w, no_rect.h, 10);
        else ctx.rect(no_rect.x, no_rect.y, no_rect.w, no_rect.h);
        ctx.fill();
        ctx.fillStyle = BLACK;
        ctx.fillText("No", no_rect.x + no_rect.w / 2, no_rect.y + no_rect.h / 2);
    }

    // Estado perdonado
    if (perdonado) {
        if (gracias_alpha < 1) gracias_alpha = Math.min(1, gracias_alpha + 4 / 255);
        if (gracias_scale < 1) gracias_scale = Math.min(1, gracias_scale + 0.01);

        ctx.save();
        ctx.globalAlpha = gracias_alpha;
        ctx.translate(WIDTH / 2, 260);
        ctx.scale(gracias_scale, gracias_scale);

        ctx.fillStyle = WHITE;
        ctx.font = "36px 'CustomFont', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Gracias", 0, 0);

        const anchoTexto = ctx.measureText("Gracias").width;
        ctx.drawImage(heart, (anchoTexto / 2) + 10, -20, 40, 40);
        ctx.restore();

        // Gato animado
        cat_frame_index += cat_animation_speed;
        if (cat_frame_index >= catFrames.length) {
            cat_frame_index = 0;
        }
        const current_cat = catFrames[Math.floor(cat_frame_index)];
        
        if (current_cat && current_cat.complete && current_cat.naturalWidth !== 0) {
            ctx.drawImage(current_cat, 320, 300, 150, 150);
        }
    }

    requestAnimationFrame(gameLoop);
}
