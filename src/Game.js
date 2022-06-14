// var NUM_SCENES = 5;
var NUM_SCENES = 5;
var NUM_SCENES_AVAILABLE = 15;
var SCENES;
var SCENE_INDEX = 0;

var FADE_IN_TIME = 4;
var FADE_OUT_TIME = 4;
var POST_GUNSHOT_TIME = 2;
var POST_FADE_BLACK_TIME = 3;


var backgroundSFX;

var gibberInitialised = false;


BasicGame.Game = function (game) {
  //	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

  this.game;		//	a reference to the currently running game
  this.add;		//	used to add sprites, text, groups, etc
  this.camera;	//	a reference to the game camera
  this.cache;		//	the game cache
  this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
  this.load;		//	for preloading assets
  this.math;		//	lots of useful common math operations
  this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
  this.stage;		//	the game stage
  this.time;		//	the clock
  this.tweens;    //  the tween manager
  this.state;	    //	the state manager
  this.world;		//	the game world
  this.particles;	//	the particle manager
  this.physics;	//	the physics manager
  this.rnd;		//	the repeatable random number generator

  //	You can use any of these from any function within this State.
  //	But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};


BasicGame.Game.prototype = new Phaser.State();


BasicGame.Game.prototype.parent = Phaser.State;


BasicGame.Game.prototype = {

  create: function () {

    Phaser.State.prototype.create.call(this);


    this.game.backgroundColor = '#000000';
    // this.game.backgroundColor = 0x000000;

    if (SCENES.length == 0) {
      console.log("Showing game over...");
    // if (true) {
      // We have complete game over (they've seen every possible scene)
      // Display black screen but fade in 'game over' I think
      gameOverText = this.add.text(0,0,"GAME OVER.",{ font: '24px sans-serif', fill: '#AAAAAA' });
      gameOverText.anchor.x = 0.5;
      gameOverText.anchor.y = 0.5;
      gameOverText.x = this.game.width / 2;
      gameOverText.y = this.game.height / 2;
      gameOverText.alpha = 0;
      this.game.add.tween(gameOverText).to( { alpha: 1 }, Phaser.Timer.SECOND * FADE_IN_TIME * 2, Phaser.Easing.Linear.None, true);

      this.game.input.keyboard.onDownCallback = null;
      this.game.input.keyboard.onUpCallback = null;

      return;
    }

    if (SCENE_INDEX >= SCENES.length) {
      // We have a game over for this sequence of scenes
      return;
    }

    // Sprites

    this.bg = this.game.add.sprite(0, 0, SCENES[SCENE_INDEX] + '_bg');
    this.flash = this.game.add.sprite(0, 0, SCENES[SCENE_INDEX] + '_flash');
    this.flash.visible = false;
    this.black = this.game.add.sprite(0, 0, 'black');
    this.black.width = this.game.width;
    this.black.height = this.game.height;
    this.black.alpha = 1;

    // Audio

    this.shots = 1 + Math.floor(Math.random()*3);
    // this.shots = 1000;

    this.canShoot = false;
    this.shootCooledDown = true;
    this.downKey = null;

    touchIsDown = false;

    window.addEventListener("touchstart", this.shoot.bind(this), false);
    this.game.input.keyboard.onDownCallback = this.shoot.bind(this);
    this.game.input.keyboard.onUpCallback = this.unshoot.bind(this);


    this.gunshotSFX = this.game.add.audio('gunshot_' + GUNS[SCENE_INDEX],0.075);

    if (!gibberInitialised) {
      gibberInitialised = true;
      Gibber.init();
    }

    Master.amp = 0.5;
    Master.fadeIn(2,0.5);

    this.generateBackgroundSound();
    // this.generateRandomShots();

    this.doFadeIn();
  },





  shoot: function (e) {

    if (!this.canShoot || !this.shootCooledDown) return;

    this.downKey = e.keyCode;

    this.shots--;
    this.canShoot = false;
    this.shootCooledDown = false;

    this.flash.visible = true;
    this.gunshotSFX.play();
    // this.randomShot();

    this.game.time.events.add(Phaser.Timer.SECOND * 0.075, this.flashOff, this);
    this.game.time.events.add(Phaser.Timer.SECOND * 0.25, this.canShootReset, this);

  },





  flashOff: function () {

    this.flash.visible = false;

  },


  unshoot: function (e) {

    if (e.keyCode == this.downKey) {
      this.canShoot = true;
    }

  },


  canShootReset: function () {

    if (this.shots > 0) {
      this.shootCooledDown = true;
    }
    else {
      this.game.time.events.add(Phaser.Timer.SECOND * POST_GUNSHOT_TIME, this.doFadeOut, this);
    }

  },


  update: function () {

    Phaser.State.prototype.update.call(this);

  },


  doFadeIn: function () {

    this.fadeIn = this.game.add.tween(this.black).to( { alpha: 0 }, Phaser.Timer.SECOND * FADE_IN_TIME, Phaser.Easing.Quadratic.In, true);
    this.fadeIn.onComplete.add(this.fadedIn,this);

  },


  fadedIn: function () {

    this.canShoot = true;

  },


  doFadeOut: function () {

    Master.fadeOut(1,0);

    this.fadeOut = this.game.add.tween(this.black).to( { alpha: 1 }, Phaser.Timer.SECOND * FADE_OUT_TIME, Phaser.Easing.Linear.None, true);
    this.fadeOut.onComplete.add(this.fadedOut,this);

  },


  fadedOut: function () {

    Master.amp = 0;

    this.canShoot = false;
    this.game.time.events.add(Phaser.Timer.SECOND * POST_FADE_BLACK_TIME, this.changeState, this);

  },


  changeState: function () {

    SCENE_INDEX++;
    this.game.state.start('Game');

  },



  shutdown: function () {

    if (backgroundSFX) backgroundSFX.kill();

  },






  generateBackgroundSound: function () {
    // GENERATE BACKGROUND SOUND

    backgroundSFX = Synth({ maxVoices: 3, waveform: 'Noise', glide: 0, useADSR: true, sustain: ms(100000000) })

    backgroundSFX.fx.add(Crush({ bitDepth: 3, sampleRate: 10 }))
    backgroundSFX.fx.add(LPF( { cutoff: .2, resonance: 1 } ))

    if (Math.random() > 0.5) backgroundSFX.fx.add(Delay({ time: Math.random() * 1000, feedback: 0 }))
    if (Math.random() > 0.5) backgroundSFX.fx.add(HPF( { cutoff: .1, resonance: 5 } ))
    if (Math.random() > 0.5) backgroundSFX.fx.add(Reverb( { roomSize: 0.99 } ));

    backgroundSFX.note(10,0.0005);
  },


  // RANDOM SHOT GENERATION FOR TESTING

  generateRandomShots: function () {
    // GENERATE GUNSHOT SOUND

    // gs1note = 110 + Math.random() * 880;
    // gs1decay = 100 + Math.random() * 400;
    // gs1lpfcutoff = 500 + Math.random() * 500;
    // gs1lpfres = 100 + Math.random() * 800;
    // gs1reverbroomsize = Math.random() * 0.5;
    //
    //
    // this.guns = [];
    //
    // for (var i = 0; i < 4; i++) {
    //   var gun = Synth({ maxVoices:1, waveform:'Noise', glide: 0, attack:ms(5), decay:ms(gs1decay), amp:5 })
    //   gun.fx.add(LPF( { cutoff: gs1lpfcutoff, resonance: gs1lpfres } ))
    //   // gun.fx.add(Reverb( { roomSize: gs1reverbroomsize } ));
    //   this.guns.push(gun);
    // }
    // this.currentGun = 0;

  },


  randomShot: function () {
    // PLAYING IT

    // this.guns[this.currentGun].note(gs1note);
    // this.currentGun = (this.currentGun + 1) % this.guns.length;

  },

};




BasicGame.Game.prototype.constructor = BasicGame.Game;
