var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 480;

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

class Title extends Entity {
	constructor() {
		super(1, 0, 0, 0, 0, "img/Title.png");
	}

	draw() {
		ctx.drawImage(this.img, 0, 0, canvas.width, canvas.height);
	}
}
title = new Title();

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
		this.speed = 1;
		this.score = 0;
		this.mode = 0;
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
		if (this.x < -this.radius) {
			this.x = canvas.width + this.radius;
			this.y = Math.random() * (canvas.height-this.radius*2) + this.radius;
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
for (var i = 0; i < GOLDFISH_NUM; i++) enemys.push(new Enemy()); // GoldFish
for (var i = 0; i < TURTLE_NUM; i++) enemys.push(new Enemy(2, 25, -0.3, "img/Turtle.png", 1000, 300)); // Turtle

// キーボード入力の処理
var keys = {};
document.addEventListener("keydown", function(event) {
	keys[event.code] = true;
	event.preventDefault();
	switch (event.code) {
		case "Space":
			switch (player.mode) {
				case 0:
					player.mode = 1
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
			if (player.mode = 2) {
				player.revive();
			}
	}
});
document.addEventListener("keyup", function(event) {
	delete keys[event.code];
});

// 当たり判定
function collisionDetection() {
	// 弾と敵の生物の当たり判定
	for (var j = 0; j < enemys.length; j++) {
		if (enemys[j].hp <= 0) continue; // 敵の生物が死んでいたら次の敵の生物へ
		for (var i = 0; i < bullets.length; i++) {
			if (bullets[i].hp <= 0) continue; // 弾が死んでいたら次の弾へ
			var dx = bullets[i].x - enemys[j].x;
			var dy = bullets[i].y - enemys[j].y;
			var distance = Math.sqrt(dx * dx + dy * dy);
			if (distance < bullets[i].radius + enemys[j].radius) {
				// 当たった弾と敵の生物を削除する
				bullets[i].hp -= 1;
				enemys[j].hp -= 1;
				if (enemys[j].hp <= 0) {
					// スコアを加算する
					player.score += enemys[j].point;
				}
				break;
			}
		}
	}
	// 敵の生物とプレイヤーの当たり判定
	for (var i = 0; i < enemys.length; i++) {
		if (enemys[i].hp <= 0) continue; // 敵の生物が死んでいたら次の敵の生物へ
		var dx = player.x - enemys[i].x;
		var dy = player.y - enemys[i].y;
		var distance = Math.sqrt(dx * dx + dy * dy);
		if (distance < player.radius + enemys[i].radius) {
			enemys[i].hp -= 1;
			player.hp -= 1;
			if (player.hp <= 0) {
				player.mode = 2;
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

// 文字の描画
function drawLetter(str, x=5, y=5, color="white", size=30, aligin="start", baseline="top") {
	ctx.textAlign = aligin;
	ctx.textBaseline = baseline;
	ctx.fillStyle = color;
	ctx.font = size + "px " + DEFAULT_FONT;
	ctx.fillText(str, x, y);
}

// ゲームループ
var gameLoop = setInterval(function() {
	switch(player.mode) {
		case 0:
			title.draw(); // タイトルを描画する
			drawLetter(VERSION); // バージョンを描画する
			break
		case 1:
			background.move(); // 背景をスクロールさせる
			background.draw(); // 背景を描画する
			player.move(); // プレイヤーを移動させる
			player.draw(); // プレイヤーを描画する
			for (var i = 0; i < enemys.length; i++) {
				if (enemys[i].hp > 0) {
					enemys[i].move(); // 敵の生物を移動させる
					enemys[i].draw(); // 敵の生物を描画する
				} else if (player.score >= enemys[i].appear_score) { // スコアが一定値を超えたら
					if (Math.random() < 0.01) enemys[i].revive(); // 1%の確率で復活させる
				}
			}
			for (var i = 0; i < bullets.length; i++) {
				if (bullets[i].hp > 0) {
					bullets[i].move(); // 弾を移動させる
					bullets[i].draw(); // 弾を描画する
				}
			}
			collisionDetection(); // 当たり判定
			drawLetter("Score: " + player.score); // スコアを描画する
			drawLetter("HP: " + player.hp, canvas.width / 2 + 5, 5); // HPを描画する
			break
		case 2:
			ctx.fillStyle = "#000";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			drawLetter("Game Over", canvas.width/2, canvas.height/2, "red", 80, "center", "middle");
			drawLetter("Press Enter Key", canvas.width/2, canvas.height-40, "white", 40, "center", "bottom");
			drawLetter("Score: " + player.score); // スコアを描画する
	}
}, 5);