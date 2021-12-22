// logic to find angle
// first we will find angle using angle = atan2(y,x)
// xvelocity = cos(angle) and yvelocity = sin(angle)

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const score_element = document.getElementById("scoreEl");
const startGameBtn = document.getElementById("startGameBtn");
const modalEl = document.getElementById("modalEl");
const finalScore = document.getElementById("finalScore");

canvas.width = innerWidth;
canvas.height = innerHeight;

const cwidth = canvas.width;
const cheight = canvas.height;

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

const friction = 0.99;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
  }
}

const x = cwidth / 2;
const y = cheight / 2;

let player = new Player(x, y, 10, "white");
let projectiles = [];
let enimies = [];
let particles = [];

function initialize() {
  player = new Player(x, y, 10, "white");
  projectiles = [];
  enimies = [];
  particles = [];
  score = 0;
  score_element.innerHTML = score;
  finalScore.innerHTML = score;
}

function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 7) + 7;
    let x;
    let y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : radius + cwidth;
      y = Math.random() * cheight;
    } else {
      x = Math.random() * cwidth;
      y = Math.random() < 0.5 ? 0 - radius : cheight + radius;
    }
    const color = `hsl(${Math.random() * 360},50%,50%)`;
    const angle = Math.atan2(cheight / 2 - y, cwidth / 2 - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    const enemy = new Enemy(x, y, radius, color, velocity);
    enimies.push(enemy);
  }, 1000);
}

let animationId;
let score = 0;
const audio = new Audio();
audio.src = "ball_collision.mp3";

function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, cwidth, cheight);
  player.draw();
  projectiles.forEach((projectile, i) => {
    projectile.update();
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > cwidth ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > cheight
    ) {
      setTimeout(() => {
        projectiles.splice(i, 1);
      }, 0);
    }
  });
  enimies.forEach((enemy, i) => {
    enemy.update();
    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (distance - player.radius - enemy.radius < 0) {
      cancelAnimationFrame(animationId);
      modalEl.style.display = "flex";
      finalScore.innerHTML = score;
      audio.play();
    }
    projectiles.forEach((projectile, j) => {
      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );
      if (distance - projectile.radius - enemy.radius < 1) {
        audio.play();
        for (let i = 0; i < enemy.radius * 2; i++) {
          const particle = new Particle(
            projectile.x,
            projectile.y,
            Math.random() * 2,
            enemy.color,
            {
              x: (Math.random() - 0.5) * (Math.random() * 7),
              y: (Math.random() - 0.5) * (Math.random() * 7),
            }
          );
          particles.push(particle);
        }
        if (enemy.radius - 10 > 7) {
          score += 100;
          score_element.innerHTML = score;
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            projectiles.splice(j, 1);
          }, 0);
        } else {
          score += 270;
          score_element.innerHTML = score;
          setTimeout(() => {
            enimies.splice(i, 1);
            projectiles.splice(j, 1);
          }, 0);
        }
      }
    });
  });
  particles.forEach((particle, i) => {
    if (particle.alpha <= 0) {
      particles.slice(i, 1);
    } else {
      particle.update();
    }
  });
}

addEventListener("click", (e) => {
  const x = cwidth / 2;
  const y = cheight / 2;
  const angle = Math.atan2(e.clientY - y, e.clientX - x);
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  const projectile = new Projectile(x, y, 5, "white", velocity);
  projectiles.push(projectile);
});

startGameBtn.addEventListener("click", () => {
  initialize();
  animate();
  spawnEnemies();
  modalEl.style.display = "none";
});

addEventListener("resize", () => {
  location.reload();
});
