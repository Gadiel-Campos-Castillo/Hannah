//        this.sprite.src = 'assets/character.png'; 


class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        
        // 1. TAMAÑO EN PANTALLA (Modifica estos valores para hacerlo tan grande como quieras)
        this.width = 128;   // Ancho final en el juego (escalado a casi el triple)
        this.height = 128;  // Alto final en el juego

        // 2. TAMAÑO NATIVO DEL SPRITE (Lo que mide en tu archivo .png)
        this.srcWidth = 32;  
        this.srcHeight = 32; 

        this.speed = 6;
        this.dx = 0;

        // --- Física de Salto ---
        this.dy = 0;
        this.gravity = 0.6;
        this.jumpForce = -12;
        this.isJumping = false;
        this.sueloY = y; 

        // --- Configuración del Sprite ---
        this.sprite = new Image();
        this.sprite.src = 'assets/character.png'; 

        this.frameX = 0;
        this.frameY = 0;      
        this.frameCount = 4;   
        this.gameFrame = 0;
        this.staggerFrames = 8; 

        this.facing = 'right'; 
    }

    update(keys, canvasWidth, sueloYActual) {
        this.sueloY = sueloYActual - this.height; // Se ajusta automáticamente al nuevo alto

        // [El resto de tu lógica de update se mantiene exactamente igual...]
        if (keys.right) { this.dx = this.speed; this.facing = 'right'; }
        else if (keys.left) { this.dx = -this.speed; this.facing = 'left'; }
        else { this.dx = 0; }

        if ((keys.up || keys.jump || keys.w) && !this.isJumping) { this.dy = this.jumpForce; this.isJumping = true; }

        this.x += this.dx;
        this.dy += this.gravity;
        this.y += this.dy;

        if (this.y >= this.sueloY) { this.y = this.sueloY; this.dy = 0; this.isJumping = false; }
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;

        if (this.isJumping) {
            // Si va subiendo (fuerza de salto activa)
            if (this.dy < 0) {
                if (this.frameY !== 4) { // Fila 4: Animación de Ascenso
                    this.frameY = 4;
                    this.frameX = 0;
                }
                this.frameCount = 6; // Tiene 6 cuadros de animación
            } 
            // Si ya empieza a caer
            else {
                if (this.frameY !== 5) { // Fila 5: Animación de Caída
                    this.frameY = 5;
                    this.frameX = 0;
                }
                this.frameCount = 6; // Tiene 6 cuadros de animación
            }
        } else if (this.dx !== 0) {
            if (this.frameY !== 1) { this.frameY = 1; this.frameX = 0; }
            this.frameCount = 8; 
        } else {
            if (this.frameY !== 0) { this.frameY = 0; this.frameX = 0; }
            this.frameCount = 6; 
        }

        this.gameFrame++;
        if (this.gameFrame % this.staggerFrames === 0) {
            if (this.frameX < this.frameCount - 1) this.frameX++;
            else { if (this.isJumping) this.frameX = this.frameCount - 1; else this.frameX = 0; }
        }
    }

    draw(ctx) {
        if (this.sprite.complete && this.sprite.naturalWidth > 0) {
            
            // TRUCO EXTRA: Para que el pixel art de 32x32 no se vea borroso al estirarse
            ctx.imageSmoothingEnabled = false;

            ctx.save();

            if (this.facing === 'left') {
                ctx.translate(this.x + this.width, this.y);
                ctx.scale(-1, 1);
                
                ctx.drawImage(
                    this.sprite,
                    this.frameX * this.srcWidth, this.frameY * this.srcHeight, // Recorte usando tamaño nativo (32)
                    this.srcWidth, this.srcHeight,                             // Tamaño del recorte (32x32)
                    0, 0,                                                      
                    this.width, this.height                                    // Renderizado usando tamaño grande (96x96)
                );
            } else {
                ctx.drawImage(
                    this.sprite,
                    this.frameX * this.srcWidth, this.frameY * this.srcHeight, // Recorte usando tamaño nativo (32)
                    this.srcWidth, this.srcHeight,                             // Tamaño del recorte (32x32)
                    this.x, this.y,                                            
                    this.width, this.height                                    // Renderizado usando tamaño grande (96x96)
                );
            }

            ctx.restore();
        } else {
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}