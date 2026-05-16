const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');

// Configuración de resolución nativa en Alta Definición (16:9)
const WIDTH = 1920;
const HEIGHT = 1080;

// Colores
const WHITE = "#FFFFFF";
const PINK = "rgba(255, 182, 193, 1)";
const BLACK = "#000000";
const RED = "#D53930";

// Textos principales
const texto = "Perdón por desaparecer todo el día...";
const texto2 = "No quería ignorarte :( ";
const texto3 = "Hannah es la mejor de todo el mundo, ¡Miau!";
const texto4 = "Maquina de Turing - 2026";

// Lista de preguntas insistentes si presiona "No"
let preguntas_no_index = 0;
const preguntas_no = [
    "¿De verdad me perdonas?",
    "¿Estás segura?",
    "¿Segura, segura de verdad?",
    "Piénsalo bien... ¡por favooor!",
    "¿Ni por el gatito que va a salir?",
    "¡Porfi di que sí!",
    "No acepto un no por respuesta..."
];

// Estados lógicos
let perdonado = false;
let mostrar_confirmacion = false;
let mostrar_boton = false;
let interaccion_iniciada = false; 
let musica_silenciada = false; // NUEVO: Estado de la música

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

// Posiciones lógicas de los botones escaladas a 1920x1080
const button_rect = { x: 710, y: 730, w: 500, h: 180 }; 

// Coordenadas para los botones Pixel Art
const si_rect = { x: 670, y: 560, w: 240, h: 240 }; 
const no_rect = { x: 1010, y: 560, w: 240, h: 240 };

// NUEVO: Coordenadas del botón de silencio en la esquina superior derecha (X: 1800, Y: 40, Tamaño: 80x80)
const mute_rect = { x: 1800, y: 40, w: 80, h: 80 };

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

// Cargar Imágenes Pixel Art para los botones Sí y No
const img_si_pixel = new Image(); img_si_pixel.src = 'assets/pixel_si.png';
const img_no_pixel = new Image(); img_no_pixel.src = 'assets/pixel_no.png';

// NUEVO: Cargar Imágenes para el botón de Mute/Unmute
const img_mute_off = new Image(); img_mute_off.src = 'assets/mute_off.png';
const img_mute_on = new Image(); img_mute_on.src = 'assets/mute_on.png';

for (let i = 1; i <= 24; i++) {
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

// Manejo de eventos de Click
canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    
    const mouseX = (event.clientX - rect.left) * (WIDTH / rect.width);
    const mouseY = (event.clientY - rect.top) * (HEIGHT / rect.height);

    // NUEVO: Detectar clic en el botón de Silencio (Funciona en cualquier pantalla/estado)
    if (colisionObjeto(mouseX, mouseY, mute_rect)) {
        musica_silenciada = !musica_silenciada;
        musica.muted = musica_silenciada;
        return; // Salimos de la función para que no interfiera con otros clics que coincidan en coordenadas
    }

    // Botón principal "¿Me perdonas?"
    if (mostrar_boton && colisionObjeto(mouseX, mouseY, button_rect)) {
        mostrar_confirmacion = true;
        interaccion_iniciada = true; 
        texto_visible = "";
        texto2_visible = "";
    }

    // Botón SI (Pixel Art)
    if (mostrar_confirmacion && colisionObjeto(mouseX, mouseY, si_rect)) {
        perdonado = true;
        mostrar_confirmacion = false;
        texto_visible = "";
        texto2_visible = "";
        preguntas_no_index = 0;
    }

    // Botón NO (Pixel Art - Bucle infinito)
    if (mostrar_confirmacion && colisionObjeto(mouseX, mouseY, no_rect)) {
        preguntas_no_index++;
        
        if (preguntas_no_index >= preguntas_no.length) {
            preguntas_no_index = 1; 
        }
    }
});

function colisionObjeto(mx, my, rect) {
    return mx >= rect.x && mx <= rect.x + rect.w && my >= rect.y && my <= rect.y + rect.h;
}

function gameLoop() {
    const ahora = performance.now();

    ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);

    // Lógica de máquina de escribir
    let typingFinished = false; 
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
        typingFinished = true;
    }

    // Lógica para mostrar/ocultar el botón principal e hilos de texto
    if (typingFinished) {
        if (!perdonado && !mostrar_confirmacion && !interaccion_iniciada) {
            mostrar_boton = true;
        } else {
            mostrar_boton = false; 
            texto_visible = "";
            texto2_visible = "";
        }

        // Lógica de textos finales tras perdonar
        if (perdonado) {
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

    // Dibujar textos principales
    ctx.fillStyle = WHITE;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "80px 'CustomFont', sans-serif";
    ctx.fillText(texto_visible, WIDTH / 2, 240);
    ctx.fillText(texto3_visible, WIDTH / 2, 240);

    ctx.font = "55px 'CustomFont', sans-serif";
    ctx.fillText(texto2_visible, WIDTH / 2, 370);
    ctx.fillText(texto4_visible, WIDTH / 2, 370);

    // Botón Principal
    if (mostrar_boton) {
        ctx.drawImage(button_image, button_rect.x, button_rect.y, button_rect.w, button_rect.h);
        ctx.fillStyle = WHITE;
        ctx.font = "55px 'CustomFont', sans-serif";
        ctx.fillText("¿Me perdonas?", button_rect.x + button_rect.w / 2, button_rect.y + button_rect.h / 2);
    }

    // Pop-up de confirmación
    if (mostrar_confirmacion) {
        ctx.fillStyle = "rgba(255, 182, 193, 0.47)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.fillStyle = WHITE;
        ctx.font = "80px 'CustomFont', sans-serif";
        ctx.textAlign = "center";
        
        // Pregunta insistentente
        ctx.fillText(preguntas_no[preguntas_no_index], WIDTH / 2, 430);

        // Dibujar Botones Pixel Art
        ctx.drawImage(img_si_pixel, si_rect.x, si_rect.y, si_rect.w, si_rect.h);
        ctx.drawImage(img_no_pixel, no_rect.x, no_rect.y, no_rect.w, no_rect.h);
    }

    // Estado perdonado
    if (perdonado) {
        if (gracias_alpha < 1) gracias_alpha = Math.min(1, gracias_alpha + 4 / 255);
        if (gracias_scale < 1) gracias_scale = Math.min(1, gracias_scale + 0.01);

        ctx.save();
        ctx.globalAlpha = gracias_alpha;
        ctx.translate(WIDTH / 2, 560);
        ctx.scale(gracias_scale, gracias_scale);

        ctx.fillStyle = WHITE;
        ctx.font = "80px 'CustomFont', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Gracias", 0, 0);

        const anchoTexto = ctx.measureText("Gracias").width;
        ctx.drawImage(heart, (anchoTexto / 2) + 20, -45, 90, 90);
        ctx.restore();

        // Gato animado
        cat_frame_index += cat_animation_speed;
        if (cat_frame_index >= catFrames.length) {
            cat_frame_index = 0;
        }
        const current_cat = catFrames[Math.floor(cat_frame_index)];
        
        if (current_cat && current_cat.complete && current_cat.naturalWidth !== 0) {
            ctx.drawImage(current_cat, 780, 640, 360, 360);
        }
    }

    // NUEVO: Dibujar el botón de Silencio en la parte superior derecha (siempre visible sobre todo)
    const icono_actual = musica_silenciada ? img_mute_on : img_mute_off;
    ctx.drawImage(icono_actual, mute_rect.x, mute_rect.y, mute_rect.w, mute_rect.h);

    requestAnimationFrame(gameLoop);
}
