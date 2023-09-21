var canvas = document.getElementById("canvas");
canvas.width = 640;
canvas.height = 480;
var ctx = canvas.getContext("2d");
var title_image = new Image();
title_image.src = "img/Title.png";

var background = {
	x: 0,
	y: 0,
	width: 1920,
	height: 480,
	speed: 0.25,
	img: new Image()
}
background.img.src = "img/BackGround.png";

// プレイヤーの初期位置とサイズ
var player = {
	hp: 3,
	x: canvas.width / 4,
	y: canvas.height / 2,
	radius: 20,
	speed: 1,
	img: new Image()
};
player.img.src = "img/Player.png";

class Enemy {
	constructor(max_hp=1, radius=20, speed=0.5, img="img/GoldFish.png", appear_score=0, point=100) {
		this.max_hp = max_hp;
		this.hp = 0;
		this.x = 0;
		this.y = 0;
		this.radius = radius;
		this.speed = speed;
		this.img = new Image();
		this.img.src = img;
		this.appear_score = appear_score;
		this.point = point;
	}

	move() {
		this.x -= this.speed;
		if (this.x < -5) {
			this.x = canvas.width + 25;
			this.y = Math.random() * (canvas.height-40) + 20;
		}
	}

	draw() {
		ctx.drawImage(this.img, 0, 0, 64, 30, this.x-this.radius, this.y-this.radius, this.radius*2, this.radius*2);
	}

	revive() {
		if (this.hp == 0 && Math.random() < 0.1) {
			this.hp = this.max_hp;
			this.x = canvas.width + this.radius;
			this.y = Math.random() * (canvas.height-this.radius*2) + this.radius;
		}
	}
}

// 敵のオブジェクトを格納する配列
var enemys = [];

for (var i = 0; i < GOLDFISH_NUM; i++) { // GoldFish
	enemys.push(new Enemy());
}
for (var i = 0; i < TURTLE_NUM; i++) { // Turtle
	enemys.push(new Enemy(2, 25, 0.3, "img/Turtle.png", 1000, 300));
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
					createBullet();
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

// プレイヤーの移動
function movePlayer() {
	if (keys["ArrowUp"] && player.y > player.radius) { // 上矢印キー
		player.y -= player.speed;
	}
	if (keys["ArrowDown"] && player.y < canvas.height - player.radius) { // 下矢印キー
		player.y += player.speed;
	}
	if (keys["ArrowLeft"] && player.x > player.radius) { // 左矢印キー
		player.x -= player.speed;
	}
	if (keys["ArrowRight"] && player.x < canvas.width - player.radius) { // 右矢印キー
		player.x += player.speed;
	}
}

// 敵のの復活
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

function moveBackGround() {
	background.x += background.speed;
	if (background.x > background.width - canvas.width) {
		background.x = 0;
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
					bullets.splice(i, 1);
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
					player.x = canvas.width / 4;
					player.y = canvas.height / 2;
					for (var i = 0; i < enemys.length; i++) {
						enemys[i].hp = 0;
					}
					bullets = [];
				}
			}
		}
	}
}

// 弾のオブジェクトを作成し、弾の初期位置とサイズを設定する
var bullets = [];

function createBullet() {
	var bullet = {
		x: player.x + player.radius / 2,
		y: player.y,
		radius: 10,
		speed: 2
	};
	bullets.push(bullet);
}

// 弾を移動させる
function moveBullet() {
	for (var i = 0; i < bullets.length; i++) {
		bullets[i].x += bullets[i].speed;
		// 弾が画面外に出た場合は、弾のオブジェクトを削除する
		if (bullets[i].x > canvas.width) {
			bullets.splice(i, 1);
		}
	}
}

// ゲーム画面描画
function drawGame() {
	// 背景を描画
	ctx.drawImage(background.img, background.x, background.y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

	// 弾を描画する
    for (var i = 0; i < bullets.length; i++) {
		ctx.beginPath();
		ctx.arc(bullets[i].x, bullets[i].y, bullets[i].radius, 0, Math.PI * 2);
		ctx.strokeStyle = "white";
		ctx.lineWidth = 1 ;
		ctx.stroke() ;
    }

	// プレイヤーを描画
	ctx.drawImage(player.img, 40, 0, 40, 40, player.x-player.radius, player.y-player.radius, player.radius*2, player.radius*2);

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
var count = 0;
var score = 0;
var gameLoop = setInterval(function() {
	switch(mode) {
		case 0:
			ctx.drawImage(title_image, 0, 0, canvas.width, canvas.height);
			drawLetter(VERSION);
			break
		case 1:
			moveBackGround();
			movePlayer();
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