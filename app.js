const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const actionPrompt = document.getElementById('actionPrompt');
const videoModal = document.getElementById('videoModal');
const demoVideo = document.getElementById('demoVideo');

// Creamos dinámicamente el segundo modal para la pantalla HTML
const htmlModal = document.createElement('div');
htmlModal.className = 'modal';
htmlModal.id = 'htmlModal';
htmlModal.innerHTML = `
    <div class="modal-content" style="width: 80%; height: 80%; max-width: none; display: flex; flex-direction: column;">
        <h3 style="margin-top: 0;">Web Interactiva de Hannah</h3>
        <iframe src="tu_pagina_hannah.html" style="flex-grow: 1; border: none; background: white; border-radius: 5px;"></iframe>
        <br>
        <button class="close-btn" onclick="closeHtmlModal()" style="align-self: center;">Cerrar [Esc]</button>
    </div>
`;
document.getElementById('gameContainer').appendChild(htmlModal);

// Variables de estado del juego
let inModal = false;
let activeModalElement = null;

// Configuración del jugador
const player = {
    x: 100,
    y: 460,
    width: 30,
    height: 70,
    speed: 5,
    dx: 0
};

// Portales alineados con tu mockup
const portals = [
    { id: 'video', x: 150, y: 150, width: 180, height: 260, label: 'Video Demostración' },
    { id: 'web_original', x: 470, y: 150, width: 180, height: 260, label: 'Pantalla HTML' }
];

const keys = { right: false, left: false };

document.addEventListener('keydown', (e) => {
    if (inModal) {
        if (e.key === 'Escape') {
            if (activeModalElement === 'video') closeModal();
            if (activeModalElement === 'html') closeHtmlModal();
        }
        return;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    
    if (e.key === 'e' || e.key === 'E') {
        checkInteractions();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
});

function getActivePortal() {
    for (let portal of portals) {
        let playerCenter = player.x + player.width / 2;
        if (playerCenter >= portal.x && playerCenter <= (portal.x + portal.width)) {
            return portal;
        }
    }
    return null;
}

function checkInteractions() {
    const activePortal = getActivePortal();
    if (activePortal) {
        if (activePortal.id === 'video') {
            openModal();
        } else if (activePortal.id === 'web_original') {
            openHtmlModal();
        }
    }
}

function openModal() {
    inModal = true;
    activeModalElement = 'video';
    videoModal.style.display = 'flex';
    keys.right = false; keys.left = false;
    demoVideo.play().catch(()=>{});
}

function closeModal() {
    inModal = false;
    activeModalElement = null;
    videoModal.style.display = 'none';
    demoVideo.pause();
}

function openHtmlModal() {
    inModal = true;
    activeModalElement = 'html';
    htmlModal.style.display = 'flex';
    keys.right = false; keys.left = false;
}

function closeHtmlModal() {
    inModal = false;
    activeModalElement = null;
    htmlModal.style.display = 'none';
}

function update() {
    if (!inModal) {
        if (keys.right) player.dx = player.speed;
        else if (keys.left) player.dx = -player.speed;
        else player.dx = 0;

        player.x += player.dx;

        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

        const activePortal = getActivePortal();
        if (activePortal) {
            actionPrompt.innerText = `Presiona "E" para abrir: ${activePortal.label}`;
            actionPrompt.style.display = 'block';
        } else {
            actionPrompt.style.display = 'none';
        }
    }

    render();
    requestAnimationFrame(update);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    portals.forEach(portal => {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 5;
        
        ctx.beginPath();
        ctx.roundRect(portal.x, portal.y, portal.width, portal.height, 30);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(portal.label, portal.x + portal.width / 2, portal.y + portal.height / 2);
    });

    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(0, 500, canvas.width, 100);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 500, canvas.width, 4);

    const cx = player.x + player.width / 2;
    const cy = player.y;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.fillStyle = '#ffffff';

    ctx.beginPath();
    ctx.arc(cx, cy + 12, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy + 24);
    ctx.lineTo(cx, cy + 50);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 15, cy + 35);
    ctx.lineTo(cx + 15, cy + 35);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy + 50);
    ctx.lineTo(cx - 12, cy + 70);
    ctx.moveTo(cx, cy + 50);
    ctx.lineTo(cx + 12, cy + 70);
    ctx.stroke();
}

update();