const Discord = require('discord.js');
const {
	registerFont,
	createCanvas
} = require('canvas');
const bot = new Discord.Client();
registerFont('clear.ttf', {
	family: 'Clear'
});
bot.login(process.env.BOT_TOKEN);

bot.on('ready', () => {
	console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
	if (!msg.author.bot) {
		if (msg.content === ';2048') {
			var c = createCanvas(500, 550);
			var ctx = c.getContext("2d");
			var score;
			ctx.roundRect = function (x, y, w, h, r) {
				if (w < 2 * r) r = w / 2;
				if (h < 2 * r) r = h / 2;
				this.beginPath();
				this.moveTo(x + r, y);
				this.arcTo(x + w, y, x + w, y + h, r);
				this.arcTo(x + w, y + h, x, y + h, r);
				this.arcTo(x, y + h, x, y, r);
				this.arcTo(x, y, x + w, y, r);
				this.closePath();
				return this.fill();
			} // draws tiles
			function arraysEqual(a, b) {
				if (a instanceof Array && b instanceof Array) {
					if (a.length != b.length)
						return false;
					for (var i = 0; i < a.length; i++)
						if (!arraysEqual(a[i], b[i]))
							return false;
					return true;
				} else {
					return a == b;
				} // code I copied from stack overflow
			}
			const color = ["eee4da", "ede0c8", "f2b179", "f59563", "f67c5f", "f65e3b", "edcf72", "edcc61", "edc850", "edc53f", "edc22e", "3c3a32"]; // tile colors
			function tile(x, y, num) { // renders tiles
				if (num == 0) {
					ctx.fillStyle = "#CDC1B4";
					ctx.roundRect(x, y, 97, 97, 4);
				} else {
					ctx.fillStyle = "#" + color[Math.log2(num) - 1];
					ctx.roundRect(x, y, 97, 97, 4);
					ctx.font = `40px Clear`;
					ctx.fillStyle = num < 8 ? "#776E65" : "#f9f6f2";
					ctx.textAlign = "center";
					ctx.fillText(num, x + 47, y + 60);
				}
			}

			function update() { // tick
				ctx.clearRect(0, 0, 500, 550);
				ctx.fillStyle = '#bbada0';
				ctx.roundRect(0, 0, 444, 444, 6);
				for (var i = 0.1; i < 4; i++) {
					for (var j = 0.1; j < 4; j++) {
						tile(i * 108, j * 108, board[i - 0.1][j - 0.1]);
					}
				}
				ctx.textAlign = "center";
				ctx.fillStyle = "#000000";
				ctx.font = `40px Clear`;

				ctx.fillText("Score: " + score.toString(), 220, 520);
			}
			var board = [
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0]
			]; // starting board state
			function addRandomTile() { // adds random tile
				var av = [];
				for (var i = 0; i < 4; i++) {
					for (var j = 0; j < 4; j++) {
						if (board[i][j] == 0) {
							av.push([i, j]);
						}
					}
				}
				var coord = av[Math.floor(Math.random() * av.length)];
				board[coord[0]][coord[1]] = Math.random() < 0.9 ? 2 : 4;
			}
			const vec = [ // vectors representing directions for moving tiles
				[-1, 0],
				[0, 1],
				[1, 0],
				[0, -1]
			];

			function moveTile(k, l, dir) { // moves tiles
				var travX = dir == 2 ? [3, 2, 1, 0] : [0, 1, 2, 3]; // makes the tiles merge in the right order
				var travY = dir == 1 ? [3, 2, 1, 0] : [0, 1, 2, 3];
				x = travX[k];
				y = travY[l];
				var dx = vec[dir][0]; // direction of tile movement
				var dy = vec[dir][1];
				if ((x + dx + 1) % 5 != 0 && (y + dy + 1) % 5 != 0) { // make sure tile is not going off the board
					while ((x + dx + 1) % 5 != 0 && (y + dy + 1) % 5 != 0) { // move until the tile is on the edge
						if (board[x + dx][y + dy] != 0) { // if it hits a tile stop
							return;
						}
						board[x + dx][y + dy] = board[x + dx - vec[dir][0]][y + dy - vec[dir][1]]; // replace the next tile witht the tile before it
						board[x + dx - vec[dir][0]][y + dy - vec[dir][1]] = 0; // cancels the previous tile 
						dx += vec[dir][0];
						dy += vec[dir][1];
					}
				}
			}

			function mergeTile(k, l, dir) {
				var travX = dir == 2 ? [3, 2, 1, 0] : [0, 1, 2, 3];
				var travY = dir == 1 ? [3, 2, 1, 0] : [0, 1, 2, 3];
				x = travX[k];
				y = travY[l];
				var dx = vec[dir][0];
				var dy = vec[dir][1];
				if ((x + dx + 1) % 5 != 0 && (y + dy + 1) % 5 != 0) {
					if (board[x + dx][y + dy] == board[x][y] && mergedTiles[x][y] == 0) { // if the two tiles are the same number and that tile has not been merged yet, MERGE
						board[x + dx][y + dy] += board[x + dx][y + dy]; // double the tile value
						score += board[x + dx][y + dy];
						board[x][y] = 0; // cancel the first tile
						mergedTiles[x + dx][y + dy] = 1; // add it to the list of merged tiles
					} else {
						moveTile(k, l, dir);
					} // if the tile did not merge then move it
				}
			}
			var mergedTiles;

			function move(dir) {
				var travX = dir == 2 ? [3, 2, 1, 0] : [0, 1, 2, 3];
				var travY = dir == 1 ? [3, 2, 1, 0] : [0, 1, 2, 3];
				var len = board.length,
					tmp = new Array(len); // duplicate the board state 
				for (var i = 0; i < len; ++i) {
					tmp[i] = board[i].slice(0);
				}
				mergedTiles = [
					[0, 0, 0, 0],
					[0, 0, 0, 0],
					[0, 0, 0, 0],
					[0, 0, 0, 0]
				]; // setup the list of merged tiles
				for (var m = 0; m < 2; m++) {
					for (var k = 0; k < 4; k++) { // loop through all tiles
						for (var l = 0; l < 4; l++) {
							mergeTile(k, l, dir); // moves/merges the tiles
						}
					}
				}
				if ((board[0].includes(0) || board[1].includes(0) || board[2].includes(0) || board[3].includes(0)) && !arraysEqual(board, tmp)) { // if there is space to move and the board state changed, then add a random tile
					addRandomTile();
					update();
				}
			}
			score = 0;
			addRandomTile(); // add the two initial tiles
			addRandomTile();
			update();
			const keys = ['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp', 'a', 's', 'd', 'w', 'h', 'j', 'k', 'l']; // list of keys
			const attachment = new Discord.MessageAttachment(c.toBuffer(), 'welcome-image.png');
			bot.channels.cache.get(process.env.IMAGE_CHANNEL).send(attachment).then(message2 => {
				const game = new Discord.MessageEmbed()
					.setColor('#edc22e')
					.setImage(message2.attachments.first().url);
				msg.channel.send(game).then(message => {
					message.react("➡");
					message.react("⬆");
					message.react("⬅");
					message.react("⬇");
					const filter = (reaction, user) => {
						return (!user.bot && ["➡", "⬆", "⬅", "⬇"].includes(reaction.emoji.name));
					};
					const collector = message.createReactionCollector(filter);
					collector.on('collect', (reaction, user) => {
						move(["⬅", "⬇", "➡", "⬆"].indexOf(reaction.emoji.name));
						const attachment2 = new Discord.MessageAttachment(c.toBuffer(), 'hello.png');
						bot.channels.cache.get(process.env.IMAGE_CHANNEL).send(attachment2).then(message2 => {
							const game2 = new Discord.MessageEmbed()
								.setColor('#edc22e')
								.setImage(message2.attachments.first().url);
							message.edit(game2);
						});
					});
				});
			});
		}
	}
});
