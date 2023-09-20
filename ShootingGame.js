var canvas = document.getElementById("canvas");
canvas.width = 640;
canvas.height = 480;
var ctx = canvas.getContext("2d");
var title_image = new Image();
title_image.src = "img/Title.png";

// プレイヤーの初期位置とサイズ
var player = {
	x: canvas.width / 4,
	y: canvas.height / 2,
	radius: 20,
	img: new Image()
};
player.img.src = "img/Player.png";

// エイリアンのオブジェクトを格納する配列
var aliens = [];

// エイリアンを生成する関数
function createAlien() {
	var alien = {
		x: canvas.width + 25,
		y: Math.random() * (canvas.height-4),
		radius: 20,
		speed: 0.5 + score / 100,
		img: new Image(),
	};
	alien.img.src = "img/GoldFish.png";
	aliens.push(alien);
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
	if (keys["ArrowUp"] && player.y > player.radius/2) { // 上矢印キー
		player.y -= 1;
	}
	if (keys["ArrowDown"] && player.y < canvas.height - player.radius/2) { // 下矢印キー
		player.y += 1;
	}
	if (keys["ArrowLeft"] && player.x > player.radius/2) { // 左矢印キー
		player.x -= 1;
	}
	if (keys["ArrowRight"] && player.x < canvas.width - player.radius/2) { // 右矢印キー
		player.x += 1;
	}
}

// エイリアンの移動
function moveAlien() {
	for (var i = 0; i < aliens.length; i++) {
		aliens[i].x -= aliens[i].speed;
		if (aliens[i].x < -5) {
			aliens[i].x = canvas.width + 8;
			aliens[i].y = Math.random() * canvas.height;
		}
	}
}

var sand_len = 1;
var sands = [];
function createBackGround() {
	var random_choise = parseInt(Math.random() * 3);
	if (random_choise==0 && sand_len > 1) {
		sand_len -= 1;
	} else if (random_choise==2 && sand_len < 10) {
		sand_len += 1;
	}
	var sand = {
		x: canvas.width + 8,
		y: canvas.height - sand_len,
		len: sand_len,
		speed: 0.5
	}
	sands.push(sand);
}

function moveBackGround() {
	for (var i = 0; i < sands.length; i++) {
		sands[i].x -= sands[i].speed;
		if (sands[i].x < -5) {
			sands.splice(i, 1);
		}
	}
}

// 当たり判定
function collisionDetection() {
	hitTest();
	for (var i = 0; i < aliens.length; i++) {
		var dx = player.x - aliens[i].x;
		var dy = player.y - aliens[i].y;
		var distance = Math.sqrt(dx * dx + dy * dy);
		if (distance < player.radius + aliens[i].radius) {
			mode = 2;
			count = 100;
			player.x = canvas.width / 4;
			player.y = canvas.height / 2;
			aliens = [];
			bullets = [];
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

// 弾がエイリアンに当たったかどうかを判定する
function hitTest() {
	for (var i = 0; i < bullets.length; i++) {
		for (var j = 0; j < aliens.length; j++) {
			var dx = bullets[i].x - aliens[j].x;
			var dy = bullets[i].y - aliens[j].y;
			var distance = Math.sqrt(dx * dx + dy * dy);
			if (distance < bullets[i].radius + aliens[j].radius) {
				// 当たった弾とエイリアンを削除する
				bullets.splice(i, 1);
				aliens.splice(j, 1);
				// スコアを加算する
				score++;
				break;
			}
		}
	}
}

// ゲーム画面描画
function drawGame() {
	// 背景を描画
	ctx.fillStyle = BACKGROUND_COLOR;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	for (var i = 0; i < sands.length; i++) {
		ctx.fillStyle = "#ff8";
		ctx.fillRect(sands[i].x, sands[i].y, 6, sands[i].len);
	}

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

	// エイリアンを描画
	for (var i = 0; i < aliens.length; i++) {
		ctx.drawImage(aliens[i].img, 0, 0, 64, 30, aliens[i].x-aliens[i].radius, aliens[i].y-aliens[i].radius, aliens[i].radius*2, aliens[i].radius*2);
	}

	// 当たり判定
	collisionDetection();
}

// スコアの描画
function drawScore() {
	ctx.textAlign = "start";
	ctx.textBaseline = "top";
	ctx.fillStyle = "white";
	ctx.font = "30px " + DEFAULT_FONT;
	ctx.fillText("Score: " + score, 5, 5);
}

// ゲーム開始画面描画
function drawStart() {
	ctx.drawImage(title_image, 0, 0, canvas.width, canvas.height);
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
			score = 0;
			if (count % 10 == 0) {
				createBackGround();
			}
			moveBackGround()
			drawStart();
			break
		case 1:
			if (count % 10 == 0) {
				createBackGround();
			}
			moveBackGround();
			movePlayer();
			moveAlien();
			moveBullet();
			drawGame();
			drawScore();
			if (count >= 100) {
				createAlien();
			}
			break
		case 2:
			drawGameOver();
			drawScore();
	}
	count += 1;
	if (count > 100) {
		count = 0;
	}
}, 5);