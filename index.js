const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const score = document.getElementById("score");
const startGame = document.getElementById("btn");
const model = document.querySelector(".pop-up");
const finalScore = document.getElementById("finalScore");
const gameMusic = document.getElementById("gameMusic");
const lose = document.getElementById("lost");
const shot = document.getElementById("shot");
const live = document.getElementById("live");

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  init();
});
let scoreSum = 0;

////player class ////
class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.lives = 3;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
////projectile classs//////
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
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}
/////////enenmies class/////////
class Enemies {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
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
//////particles class////////
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
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
  update() {
    this.draw();
    this.alpha -= 0.01;
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}
let player;
let projectiles;
let enemies;
let particles;
////////////initilization function///////////
function init() {
  player = new Player(canvas.width / 2, canvas.height / 2, 10, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  scoreSum = 0;
  score.innerHTML = scoreSum;
  finalScore.innerHTML = scoreSum;
  gameMusic.play();
  gameMusic.currentTime = 7;
  live.innerHTML = player.lives;
}
//////function to make enemies////////
function spawnEnemies() {
  let radius = Math.random() * 22 + 8;
  let x;
  let y;
  if (Math.random() > 0.5) {
    x = Math.random() > 0.5 ? 0 - radius : canvas.width + radius;
    y = Math.random() * canvas.height;
  } else {
    x = Math.random() * canvas.width;
    y = Math.random() > 0.5 ? 0 - radius : canvas.height + radius;
  }
  const color = `hsl(${Math.random() * 360},50%,50%)`;
  const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
  enemies.push(new Enemies(x, y, radius, color, velocity));
}
let animationId;
let frame = 0;
//////animating the game//////////
function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (player.lives !== 0) {
    player.draw();
  }

  ///animating explosions////
  particles.forEach((particle, index) => {
    particle.update();
    if (particle.alpha <= 0.01) {
      setTimeout(() => {
        particles.splice(index, 1);
      }, 0);
    }
  });
  /////animating projectiles////
  projectiles.forEach((projectile, index) => {
    projectile.update();
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });
  ////animating enemies///////
  enemies.forEach((enemy, index) => {
    enemy.update();
    const dist =
      (enemy.y - player.y) * (enemy.y - player.y) +
      (enemy.x - player.x) * (enemy.x - player.x);
    if (
      dist <
      (enemy.radius + player.radius) * (enemy.radius + player.radius)
    ) {
      //////showing red particle if enemy hit player////////////////////
      for (let i = 0; i < player.radius * 2; i++) {
        particles.push(
          new Particle(enemy.x, enemy.y, Math.random() * 2, "red", {
            x: (Math.random() - 0.5) * (Math.random() * 7),
            y: (Math.random() - 0.5) * (Math.random() * 7),
          })
        );
      }
      setTimeout(() => {
        enemies.splice(index, 1);
        player.lives -= 1;
        live.innerHTML = player.lives;
      });
      if (player.lives === 3) {
        player.color = "orange";
      } else if (player.lives === 2) {
        player.color = "red";
      }
      //////game over ///////
      if (player.lives === 1) {
        for (let i = 0; i < player.radius * 2; i++) {
          particles.push(
            new Particle(enemy.x, enemy.y, Math.random() * 2, "red", {
              x: (Math.random() - 0.5) * (Math.random() * 7),
              y: (Math.random() - 0.5) * (Math.random() * 7),
            })
          );
        }
        setTimeout(() => {
          cancelAnimationFrame(animationId);
          model.style.display = "flex";
          finalScore.innerHTML = scoreSum;
          gameMusic.pause();
          lose.play();
        }, 850);
        isGameOn = false;
      }
    }
    /////calculation of projectile and enemies distance/////////////
    projectiles.forEach((projectile, Pindex) => {
      const dist =
        (enemy.y - projectile.y) * (enemy.y - projectile.y) +
        (enemy.x - projectile.x) * (enemy.x - projectile.x);
      if (
        dist <
        (enemy.radius + projectile.radius) * (enemy.radius + projectile.radius)
      ) {
        ////creating particles on contact/////////
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 7),
                y: (Math.random() - 0.5) * (Math.random() * 7),
              }
            )
          );
        }
        ///reducing size of enemy on hit/////////
        if (enemy.radius - 10 > 10) {
          enemy.radius -= 10;
          scoreSum += 50;
          score.innerHTML = scoreSum;
          setTimeout(() => {
            projectiles.splice(Pindex, 1);
          }, 0);
        } else {
          scoreSum += 100;
          score.innerHTML = scoreSum;
          setTimeout(() => {
            enemies.splice(index, 1);
            projectiles.splice(Pindex, 1);
          }, 0);
        }
      }
    });
  });
  frame++;
  if (frame % 60 === 0) {
    spawnEnemies();
    frame = 0;
  }
}
//animate();
///////////shottting projectiles when clicked////////////
window.addEventListener("click", (e) => {
  const angle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );
  const velocity = {
    x: Math.cos(angle) * 7,
    y: Math.sin(angle) * 7,
  };
  if (isGameOn) {
    projectiles.push(
      new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity)
    );
    shot.play();
    shot.currentTime = 0;
  }
});
let isGameOn = false;
////starting game ////////////
startGame.addEventListener("click", () => {
  isGameOn = true;
  init();
  animate();
  model.style.display = "none";
});
///////looping gameMusic///////
if (typeof gameMusic.loop == "boolean") {
  gameMusic.loop = true;
} else {
  gameMusic.addEventListener(
    "ended",
    function () {
      this.currentTime = 0;
      this.play();
    },
    false
  );
}
