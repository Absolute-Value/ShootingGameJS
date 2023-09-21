var canvas = document.getElementById("canvas");
canvas.width = 640;
canvas.height = 480;
var ctx = canvas.getContext("2d");
var title_image = new Image();
title_image.src = "img/Title.png";

class Entity {
	constructor(max_hp=3, x=0, y=0, radius=20, speed=1, img="img/Player.png", crop={width: 40, height: 40}) {
		this.max_hp = max_hp;
		this.hp = 0;
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.speed = speed;
		this.img = new Image();
		this.img.src = img;
		this.crop = crop;
	}

	move() {
		this.x += this.speed;
	}

	draw() {
		var crop_x = this.crop.width * (this.speed >= 0 ? 1 : 0)
		ctx.drawImage(this.img, crop_x, 0, this.crop.width, this.crop.height, this.x-this.radius, this.y-this.radius, this.radius*2, this.radius*2);
	}
}

class BackGround extends Entity {
	constructor(speed=0.25, img="img/BackGround.png") {
		super(1, 0, 0, 0, speed, img);
		this.width = 1920;
		this.height = 480;
	}

	move() {
		super.move();
		if (this.x > this.width - canvas.width) {
			this.x = 0;
		}
	}

	draw() {
		ctx.drawImage(this.img, this.x, this.y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
	}
}
background = new BackGround();

class Player extends Entity {
	constructor() {
		super();
		this.revive();
	}

	move() {
		if (keys["ArrowUp"] && this.y > this.radius) { // 上矢印キー
			this.y -= Math.abs(this.speed);
		}
		if (keys["ArrowDown"] && this.y < canvas.height - this.radius) { // 下矢印キー
			this.y += Math.abs(this.speed);
		}
		if (keys["ArrowLeft"] && this.x > this.radius) { // 左矢印キー
			this.speed = Math.abs(this.speed) * -1;
			super.move();
		}
		if (keys["ArrowRight"] && this.x < canvas.width - this.radius) { // 右矢印キー
			this.speed = Math.abs(this.speed);
			super.move();
		}
	}

	revive() {
		this.hp = this.max_hp;
		this.x = canvas.width / 4;
		this.y = canvas.height / 2;
	}
}
player = new Player();

class Bullet extends Entity {
	constructor() {
		super(1, 0, 0, 10, 2);
	}

	move() {
		super.move();
		if (this.x > canvas.width + this.radius || this.x < -this.radius) {
			this.hp = 0;
		}
	}

	draw() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.strokeStyle = "white";
		ctx.lineWidth = 1 ;
		ctx.stroke() ;
	}

	revive() {
		this.hp = this.max_hp;
		this.x = player.x + player.radius / 2;
		this.y = player.y;
		this.speed = player.speed >= 0 ? 2 : -2;
	}
}
bullets = [];
for (var i = 0; i < BULLET_NUM; i++) {
	bullets.push(new Bullet());
}

class Enemy extends Entity {
	constructor(max_hp=1, radius=20, speed=-0.5, img="img/GoldFish.png", appear_score=0, point=100, crop={width:64, height:30}) {
		super(max_hp, 0, 0, radius, speed, img, crop);
		this.appear_score = appear_score;
		this.point = point;
	}

	move() {
		super.move();
		if (this.x < -5) {
			this.x = canvas.width + 25;
			this.y = Math.random() * (canvas.height-40) + 20;
		}
	}

	revive() {
		if (this.hp == 0 && Math.random() < 0.1) {
			this.hp = this.max_hp;
			this.x = canvas.width + this.radius;
			this.y = Math.random() * (canvas.height-this.radius*2) + this.radius;
		}
	}
}
var enemys = []; // 敵のオブジェクトを格納する配列
for (var i = 0; i < GOLDFISH_NUM; i++) { // GoldFish
	enemys.push(new Enemy());
}
for (var i = 0; i < TURTLE_NUM; i++) { // Turtle
	enemys.push(new Enemy(2, 25, -0.3, "img/Turtle.png", 1000, 300));
}

// キーボード入力の処理
var keys = {};
document.addEventListener("keydown", function(event) {
	keys[event.code] = true;
	event.preventDefault();
	switch (event.code) {
		case "Space":
			switch (mode) {
				case 0:
					mode = 1
					break
				case 1:
					for (var i = 0; i < bullets.length; i++) {
						if (bullets[i].hp <= 0) {
							bullets[i].revive();
							break;
						}
					}
					break
			}
			break
		case "Enter":
			if (mode = 2) {
				mode = 0
			}
	}
});
document.addEventListener("keyup", function(event) {
	delete keys[event.code];
});

// 敵の復活
function reviveAlien() {
	for (var i = 0; i < enemys.length; i++) {
		if (enemys[i].hp <= 0 && score >= enemys[i].appear_score) {
			if (Math.random() < 0.01) {
				enemys[i].revive();
			}
		}
	}
}

// 敵の生物の移動
function moveEnemys() {
	for (var i = 0; i < enemys.length; i++) {
		if (enemys[i].hp > 0) {
			enemys[i].move();
		}
	}
}

// 弾の移動
function moveBullet() {
	for (var i = 0; i < bullets.length; i++) {
		if (bullets[i].hp > 0) {
			bullets[i].move();
		}
	}
}

// 当たり判定
function collisionDetection() {
	// 弾と敵の生物の当たり判定
	for (var j = 0; j < enemys.length; j++) {
		if (enemys[j].hp > 0) {
			for (var i = 0; i < bullets.length; i++) {
				var dx = bullets[i].x - enemys[j].x;
				var dy = bullets[i].y - enemys[j].y;
				var distance = Math.sqrt(dx * dx + dy * dy);
				if (distance < bullets[i].radius + enemys[j].radius) {
					// 当たった弾と敵の生物を削除する
					bullets[i].hp -= 1;
					enemys[j].hp -= 1;
					if (enemys[j].hp <= 0) {
						// スコアを加算する
						score += enemys[j].point;
					}
					break;
				}
			}
		}
	}
	// 敵の生物とプレイヤーの当たり判定
	for (var i = 0; i < enemys.length; i++) {
		if (enemys[i].hp > 0) {
			var dx = player.x - enemys[i].x;
			var dy = player.y - enemys[i].y;
			var distance = Math.sqrt(dx * dx + dy * dy);
			if (distance < player.radius + enemys[i].radius) {
				enemys[i].hp -= 1;
				player.hp -= 1;
				if (player.hp <= 0) {
					mode = 2;
					score = 0;
					player.revive();
					for (var i = 0; i < enemys.length; i++) {
						enemys[i].hp = 0;
					}
					for (var i = 0; i < bullets.length; i++) {
						bullets[i].hp = 0;
					}
				}
			}
		}
	}
}

// ゲーム画面描画
function drawGame() {
	background.draw();
	// 弾を描画する
    for (var i = 0; i < bullets.length; i++) {
		if (bullets[i].hp > 0) {
			bullets[i].draw();
		}
    }
	player.draw();
	// 敵の生物を描画
	for (var i = 0; i < enemys.length; i++) {
		if (enemys[i].hp > 0) {
			enemys[i].draw();
		}
	}
}

// スコアやHPの描画
function drawLetter(str, x=5, y=5) {
	ctx.textAlign = "start";
	ctx.textBaseline = "top";
	ctx.fillStyle = "white";
	ctx.font = "30px " + DEFAULT_FONT;
	ctx.fillText(str, x, y);
}

function drawGameOver() {
	// 背景を描画
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	// タイトルを描画する
	ctx.font = "80px " + DEFAULT_FONT;
	ctx.textAlign = "center";
	ctx.fillStyle = "red";
	ctx.textBaseline = "middle";
	ctx.fillText("Game Over", canvas.width/2, canvas.height/2);
	ctx.font = "40px " + DEFAULT_FONT;
	ctx.fillStyle = "white";
	ctx.textBaseline = "bottom";
	ctx.fillText("Press Enter Key", canvas.width/2, canvas.height-40);
}

// ゲームループ
var mode = 0
var score = 0;
var gameLoop = setInterval(function() {
	switch(mode) {
		case 0:
			ctx.drawImage(title_image, 0, 0, canvas.width, canvas.height);
			drawLetter(VERSION);
			break
		case 1:
			background.move();
			player.move();
			moveEnemys();
			moveBullet();
			drawGame();
			collisionDetection(); // 当たり判定
			drawLetter("Score: " + score);
			drawLetter("HP: " + player.hp, canvas.width / 2 + 5, 5);
			reviveAlien();
			break
		case 2:
			drawGameOver();
			drawLetter("Score: " + score);
	}
}, 5);