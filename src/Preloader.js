
BasicGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

BasicGame.Preloader.prototype = {

	preload: function () {

		this.game.load.onFileComplete.add(this.fileComplete, this);

		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar
		// this.background = this.add.sprite(0, 0, 'preloaderBackground');
		this.preloadBar = this.add.sprite(0, 0, 'preloaderBar');
		this.preloadBar.anchor.x = 0.0;
		this.preloadBar.anchor.y = 0.5;
		this.preloadBar.x = this.game.canvas.width/2 - this.preloadBar.width/2;
		this.preloadBar.y = this.game.canvas.height/2;
		this.preloadBar.alpha = 0;

		this.preloadContinue = this.add.sprite(0,0,'preloaderContinue');
		this.preloadContinue.anchor.x = 0.5;
		this.preloadContinue.anchor.y = 0.5;
		this.preloadContinue.x = this.game.canvas.width/2;
		this.preloadContinue.y = 7*this.game.canvas.height/8;
		this.preloadContinue.visible = false;

		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		this.load.setPreloadSprite(this.preloadBar);


		// SOUNDS

		// this.load.audio('gunshot',['assets/sounds/gunshot.mp3','assets/sounds/gunshot.ogg']);
		// this.load.audio('city',['assets/sounds/city.mp3','assets/sounds/city.ogg']);


		// IMAGES

		this.load.image('black','assets/images/black.png');


		SCENES = [];

		REMAINING_SCENES = JSON.parse(localStorage.getItem('REMAINING_SCENES'));

		if (REMAINING_SCENES == undefined || REMAINING_SCENES == null) {
			REMAINING_SCENES = [];
			for (var i = 0; i < NUM_SCENES_AVAILABLE; i++) {
				REMAINING_SCENES.push(i);
			}
			REMAINING_SCENES = shuffle(REMAINING_SCENES);
			console.log("Generated remaining scenes:");
			console.log(REMAINING_SCENES);
		}

		if (REMAINING_SCENES.length == 0) {
			console.log("All scenes viewed, so game is over.");
			return;
		}

		console.log("Selecting scenes for this round...");
		for (var i = 0; i < NUM_SCENES; i++) {
			SCENES.push(REMAINING_SCENES.shift());
		}

		console.log("Scenes for this round:");
		console.log(SCENES);

		console.log("Remaining scenes:");
		console.log(REMAINING_SCENES);

		localStorage.setItem('REMAINING_SCENES',JSON.stringify(REMAINING_SCENES));

		for (var i = 0; i < SCENES.length; i++) {
			this.load.image('' + SCENES[i] + '_bg','assets/images/' + SCENES[i] + '_bg.png');
			var flash_number = Math.floor(Math.random() * 2);
			this.load.image('' + SCENES[i] + '_flash','assets/images/' + SCENES[i] + '_flash_' + flash_number + '.png');
		}


		// AUDIO

		GUNS = [];

		NUM_GUNS = 5;

		for (var i = 0; i < NUM_SCENES; i++) {
			var gunIndex = Math.floor(Math.random() * NUM_GUNS);

			while (GUNS.indexOf(gunIndex) != -1) {
				gunIndex = Math.floor(Math.random() * NUM_GUNS);
			}
			GUNS.push(gunIndex);
		}

		for (var i = 0; i < GUNS.length; i++) {
			this.load.audio('gunshot_' + GUNS[i],['assets/sounds/gunshot_' + GUNS[i] + '.mp3','assets/sounds/gunshot_' + GUNS[i] + '.ogg']);
		}


	},


	fileComplete: function (progress, cacheKey, success, totalLoaded, totalFiles) {

		this.preloadBar.alpha = progress/100;

	},


	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;

	},


	update: function () {

		// console.log(this.game.load.progress);

		if (SCENES.length == 0 || this.cache.isSoundDecoded('gunshot_' + GUNS[GUNS.length-1])) {
			// this.preloadBar.alpha = 1;
			this.preloadContinue.visible = true;
			this.ready = true;
			this.game.input.keyboard.onDownCallback = function () { this.state.start('Game'); }.bind(this);
		}

	},

};

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}
