const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let kills = 0

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  speed: 5,
  gunLength: 30,
  gunWidth: 10
};

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = "blue";
  ctx.fill();
  ctx.closePath();

  // Calculate player angle based on mouse position
  const dx = mouse.x - player.x;
  const dy = mouse.y - player.y;
  player.angle = Math.atan2(dy, dx);

  // Draw the gun pointing towards the mouse
  ctx.save(); // Save the canvas context before transformation
  ctx.translate(player.x, player.y); // Translate to the player's position
  ctx.rotate(player.angle);
  ctx.fillStyle = "blue";
  ctx.fillRect(0, -player.gunWidth / 2, player.gunLength, player.gunWidth);
  ctx.restore(); // Restore the canvas context
}

function updatePlayerPosition() {
  if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
  if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;
  if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
  if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;

  // Calculate player angle based on mouse position
  const dx = mouse.x - player.x;
  const dy = mouse.y - player.y;
  player.angle = Math.atan2(dy, dx);
  // console.log(keys)
}

const bullets = [];

function drawBullets() {
  bullets.forEach((bullet) => {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  });
}

function updateBullets() {
  bullets.forEach((bullet) => {
    bullet.x += Math.cos(bullet.angle) * bullet.speed;
    bullet.y += Math.sin(bullet.angle) * bullet.speed;
  });

  // Remove bullets that are out of the canvas
  bullets.forEach((bullet, index) => {
    if (
      bullet.x < 0 ||
      bullet.x > canvas.width ||
      bullet.y < 0 ||
      bullet.y > canvas.height
    ) {
      bullets.splice(index, 1);
    }
  });
}

function spawnBullet() {
    bullets.push({
      x: player.x,
      y: player.y,
      speed: 8,
      angle: player.angle,
    }); 
}

// enemy stuff
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 15;
    this.speed = 2;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "orange";
    ctx.fill();
    ctx.closePath();
  }

  update() {
    // Calculate angle to the player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const angleToPlayer = Math.atan2(dy, dx);

    // Move towards the player
    this.x += Math.cos(angleToPlayer) * this.speed;
    this.y += Math.sin(angleToPlayer) * this.speed;
  }
}

const enemies = [];

function spawnEnemy() {
  // Randomly choose a spawn point on the canvas
  const spawnSide = Math.floor(Math.random() * 4);

  let spawnX, spawnY;

  switch (spawnSide) {
    case 0: // Top
      spawnX = Math.random() * canvas.width;
      spawnY = 0;
      break;
    case 1: // Right
      spawnX = canvas.width;
      spawnY = Math.random() * canvas.height;
      break;
    case 2: // Bottom
      spawnX = Math.random() * canvas.width;
      spawnY = canvas.height;
      break;
    case 3: // Left
      spawnX = 0;
      spawnY = Math.random() * canvas.height;
      break;
  }

  enemies.push(new Enemy(spawnX, spawnY));
}

function drawEnemies() {
  enemies.forEach((enemy) => {
    enemy.draw();
  });
}

function updateEnemies() {
  enemies.forEach((enemy) => {
    enemy.update();
  });
}

const explosions = [];
const maxExplosionRadius = 50;
const explosionSpeed = 3;

function checkCollision() {
  bullets.forEach((bullet, bulletIndex) => {
    enemies.forEach((enemy, enemyIndex) => {
      const dx = bullet.x - enemy.x;
      const dy = bullet.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < enemy.radius) {
        // Remove the bullet and the enemy if a collision occurred
        explosions.push({
          x: enemy.x,
          y: enemy.y,
          radius: 1,
          speed: explosionSpeed,
        });

        kills++
        bullets.splice(bulletIndex, 1);
        enemies.splice(enemyIndex, 1);
      }
    });
  });
}

let isScreenShaking = false;
let shakeIntensity = 5;
let shakeDuration = 300; // milliseconds

function shakeScreen() {
  if (!isScreenShaking) {
    isScreenShaking = true;

    const startTime = Date.now();

    const shakeInterval = setInterval(() => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;

      if (elapsedTime < shakeDuration) {
        const offsetX = (Math.random() - 0.5) * shakeIntensity;
        const offsetY = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(offsetX, offsetY);
      } else {
        isScreenShaking = false;
        clearInterval(shakeInterval);
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the canvas' transformation
      }
    }, 20); // Adjust the interval value for smoother or more intense shake
  }
}

function drawExplosion(x, y, radius, alpha) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255, 165, 0, ${alpha})`;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
}

function checkPlayerCollision() {
  enemies.forEach((enemy, enemyIndex) => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.radius + enemy.radius) {
      // Collision occurred, handle it here (e.g., game over logic)
      console.log("Player collided with an enemy!");
      shakeScreen()
      // For example, you could end the game or reduce player health here
      // You can also remove the enemy from the array to avoid further collisions
      enemies.splice(enemyIndex, 1);
    }
  });
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

let keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

let mouse = { x: 0, y: 0 };
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("mousedown", () => {
  spawnBullet();
});

function gameLoop() {
  clearCanvas();
  updatePlayerPosition();
  drawPlayer();
  updateBullets();
  drawBullets();
  updateEnemies();
  drawEnemies();
  checkCollision()
  checkPlayerCollision()

  explosions.forEach((explosion, index) => {
    const alpha = 1 - explosion.radius / maxExplosionRadius;
    drawExplosion(explosion.x, explosion.y, explosion.radius, alpha);
    explosion.radius += explosion.speed;
    if (explosion.radius >= maxExplosionRadius) {
      explosions.splice(index, 1);
    }
  });

  requestAnimationFrame(gameLoop);
}

// setInterval(spawnBullet, 250);
setInterval(spawnEnemy, 2000); // Spawn an enemy every 5 seconds

gameLoop();