// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			};
})();

/*EXTEND OBJECTS*/
var extend = function(out) {
	out = out || {};

	for (var i = 1; i < arguments.length; i++) {
		if (!arguments[i])
			continue;

		for (var key in arguments[i]) {
			if (arguments[i].hasOwnProperty(key))
			out[key] = arguments[i][key];
		}
	}

	return out;
};


/*
	DIRECTIONS
	0 = UP,
	1 = RIGHT,
	2 = DOWN,
	3 = LEFT

	KEYS
	39 = RIGHT
	40 = DOWN
	37 = LEFT
	38 = UP
*/

/****************************************************/
/****************CREATE BASE OBJ*********************/
/***ALSO THIS IS BULLETS CAUSE BULLETS ARE SO DUMB***/
/****************************************************/
var Lasers = function( game, args ) {
	if ( !args ) args = {};

	this.position  = args.position  || [0, 0];
	this.velocity  = args.velocity  || [0, 0];
	this.direction = args.direction || 0;
	this.lifetime  = args.lifetime  || 0;
	this.radius    = args.radius    || 0;

	this.game = game;
};

Lasers.prototype.rotate = function(rad) {
	this.direction += rad.mod( 2*Math.PI );
};

Lasers.prototype.move = function( ctx ) {
	this.position = [ this.position[0]+this.velocity[0], this.position[1]+this.velocity[1] ]
	
	/******************/
	/**EDGE DETECTION**/
	/******************/
	if ( this.position[0] > this.game.ctx.canvas.width )
		this.position[0] = 0;
	if ( this.position[0] < 0 )
		this.position[0] = this.game.ctx.canvas.width;
	if ( this.position[1] > this.game.ctx.canvas.height )
		this.position[1] = 0;
	if ( this.position[1] < 0 )
		this.position[1] = this.game.ctx.canvas.height;
};

Lasers.prototype.draw = function() {
	this.game.ctx.fillStyle="#dddddd";
	this.game.ctx.beginPath();
	this.game.ctx.arc( this.position[0], this.position[1], this.radius, 0, Math.PI*2, true ); 
	this.game.ctx.closePath();
	this.game.ctx.fill();
};


/**********************/
/****CREATE PLAYER*****/
/**********************/
var Player = function( game ) {
	this.lastShot = 0;
	this.isPlayer = 1;
	this.isAlive  = 1;

	this.game = game;
	/*this.engine = new Engine( this.ctx, {
		position:  this.position,
		direction: this.direction
	});*/
};
Player.prototype = new Lasers();

Player.prototype.shoot = function() {
	if ( new Date().getTime() - this.lastShot > 250 ) {	

		var position = this.position;
		var velocity = [
			this.velocity[0] +(Math.sin( this.direction )*3),
			this.velocity[1] -(Math.cos( this.direction )*3)
		];
		var lifetime = 80;
		
		this.game.addObject(new Bullet(this.game, {
			position: position,
			velocity: velocity,
			lifetime: lifetime,
			radius: 1.5
		}));


		this.lastShot = new Date().getTime();
	}
};

Player.prototype.spawn = function() {
	this.position[0] = (this.game.ctx.canvas.width/2);
	this.position[1] = (this.game.ctx.canvas.height/2);

	this.velocity[0] = 0;
	this.velocity[1] = 0;

	this.direction = 0;

	this.isAlive = 1;
}

Player.prototype.draw = function( ctx ) {
	var posX = this.position[0],
		posY = this.position[1];

	var p0x=0, p0y=-15,
		p1x=8, p1y=5,
		p2x=-8, p2y=5;

	var Dsin = Math.sin( this.direction );
	var Dcos = Math.cos( this.direction );

	this.game.ctx.fillStyle="#dddddd";
	this.game.ctx.beginPath();
	this.game.ctx.moveTo( p0x*Dcos - p0y*Dsin + posX, p0y*Dcos + p0x*Dsin + posY );
	this.game.ctx.lineTo( p1x*Dcos - p1y*Dsin + posX, p1y*Dcos + p1x*Dsin + posY );
	this.game.ctx.lineTo( p2x*Dcos - p1y*Dsin + posX, p2y*Dcos + p2x*Dsin + posY );
	this.game.ctx.fill();
};

Player.prototype.accelerate = function( force ) {

	var velocity = [
		this.velocity[0] + Math.sin(this.direction)*force,
		this.velocity[1] -(Math.cos(this.direction)*force)
	];

	var vecLengthSquared = (velocity[0]) * (velocity[0]) + (velocity[1]) * (velocity[1]);

	//console.log(vecLength);
	if ( vecLengthSquared > 1.2 * 1.2 && vecLengthSquared > 0 ) {
		var ratio = 1.2 / Math.sqrt(vecLengthSquared);

		velocity[0] = velocity[0] * ratio;
		velocity[1] = velocity[1] * ratio;
	}
	this.velocity = velocity;
};

Player.prototype.move = function( ) {
	this.position = [ this.position[0]+this.velocity[0], this.position[1]+this.velocity[1] ]
	
	/******************/
	/**EDGE DETECTION**/
	/******************/
	if ( this.position[0] > this.game.ctx.canvas.width )
		this.position[0] = 0;
	if ( this.position[0] < 0 )
		this.position[0] = this.game.ctx.canvas.width;
	if ( this.position[1] > this.game.ctx.canvas.height )
		this.position[1] = 0;
	if ( this.position[1] < 0 )
		this.position[1] = this.game.ctx.canvas.height;

	//this.engine.move( this.position[0], this.position[1] );
};

Player.prototype.rotate = function(rad) {
	this.direction += rad.mod( 2*Math.PI );
	//this.engine.rotate( this.direction );
};

Player.prototype.explode = function() {
	this.isAlive = 0;
}

/**********************/
/***CREATE ASTEROID****/
/**********************/
var Asteroid = function( game, args ) {
	if ( !args ) args = {};

	this.game = game;
	this.isAsteroid = 1;
	
	this.position      = args.position      || [ Math.random()*game.ctx.canvas.width, Math.random()*game.ctx.canvas.height ];
	this.velocity      = args.velocity      || [ Math.random()*1, Math.random()*1 ];
	this.direction     = args.direction     || 0;
	this.lifetime      = args.lifetime      || 0;
	this.radius        = args.radius        || Math.random()*30+20;
	this.generation    = args.generation    || 0;

};

Asteroid.prototype = new Lasers();

Asteroid.prototype.explode = function() {
	
	this.game.score += 100*this.generation+50;

	if ( this.generation < 3 ) {
		for ( var i = 0; i < 2; i++ ) {
			var newa = new Asteroid(this.game, {
				position:   this.position,
				velocity:   [ (Math.random()*2-1)*2, (Math.random()*2-1) ],
				radius:     this.radius*0.7,
				generation: this.generation+1
			});
			
			this.game.addObject(newa);
		}
	}

	this.game.addEffect( new Explosion(this.game, { position: this.position }) );

	this.game.removeObject(this);
};

Asteroid.prototype.draw = function() {
	this.game.ctx.fillStyle="#666666";
	this.game.ctx.beginPath();
	this.game.ctx.arc( this.position[0], this.position[1], this.radius, 0, Math.PI*2, true ); 
	this.game.ctx.closePath();
	this.game.ctx.fill();
};



/**********************/
/****CREATE BULLET*****/
/**********************/
var Bullet = function( game, args ) {
	if ( !args ) args = {};

	this.position  = args.position  || [0, 0];
	this.velocity  = args.velocity  || [0, 0];
	this.direction = args.direction || 0;
	this.lifetime  = args.lifetime  || 0;
	this.radius    = args.radius    || 0;
	this.isBullet = 1;

	this.game = game;

};

Bullet.prototype = new Lasers();

Bullet.prototype.draw = function() {
	/*this.game.ctx.fillStyle="#dddddd";
	this.game.ctx.beginPath();
	this.game.ctx.arc( this.position[0], this.position[1], this.radius, 0, Math.PI*2, true ); 
	this.game.ctx.closePath();
	this.game.ctx.fill();
	*/
	this.game.ctx.save();
	var radius = Math.random()*4+31;

	var x = this.position[0],
		y = this.position[1];

	var bx = x;
	var by = y;

	var radgrad = this.game.ctx.createRadialGradient( bx, by, 1.2+Math.random()*1.5, bx, by, 3+Math.random()*2 );
	radgrad.addColorStop(0,   'rgba(200,220,255,1)');
	//radgrad.addColorStop(0.4, 'rgba(266,150,255,.9)');
	radgrad.addColorStop(1,   'rgba(255,255,255,0)');

	// draw shape
	this.game.ctx.fillStyle = radgrad;
	this.game.ctx.fillRect(bx, by, 5, 5);

	this.game.ctx.restore();
};


/*********************/
/******TEXTADDER******/
/*********************/

var Text = function( game, args ) {
	if ( !args ) args = {};
	
	this.position      = args.position      || [ game.ctx.canvas.width/2, game.ctx.canvas.height/2 ];
	this.lifetime      = args.lifetime      || 0;
	this.radius        = args.radius        || Math.random()*30+20;
	this.generation    = args.generation    || 0;
	this.font          = args.font          || 'bold 50px arial';
	this.textAlign     = args.textAlign     || 'center';
	this.text          = args.text;

	this.game = game;

};

Text.prototype = new Lasers();

Text.prototype.draw = function() {
	this.game.ctx.save();
	this.game.ctx.fillStyle    = '#aaaaaa';
	this.game.ctx.font         = this.font;
	this.game.ctx.textBaseline = 'middle';
	this.game.ctx.textAlign    = this.textAlign;
	this.game.ctx.fillText(this.text, this.position[0], this.position[1]);
	this.game.ctx.restore();
}


/**********|||||**********/
/**********|||||**********/
/********PARTICLES********/
/**********|||||**********/
/**********|||||**********/

var Particle = function( ctx, args ) {
	if ( !args ) args = {};

	this.position  = args.position  || [0, 0];
	this.velocity  = args.velocity  || [0, 0];
	this.direction = args.direction || 0;
	this.lifetime  = args.lifetime  || 0;
	this.radius    = args.radius    || 0;

	this.ctx = ctx;
	
};

Particle.prototype.remove = function() {
	effects.splice( objects.indexOf( this ), 1 );
};

Particle.prototype.add = function() {
	effects.push( this );
};

/********************/
/*****EXPLOSIONS*****/
/********************/

var Explosion = function( game, args ) {
	if ( !args ) args = {};

	this.position  = args.position  || [0, 0];
	this.velocity  = args.velocity  || [0, 0];
	this.direction = args.direction || 0;
	this.lifetime  = args.lifetime  || 0;
	this.radius    = args.radius    || 0;
	
	this.game = game;
	
	this.particles = [];

	for (var i = 0; i < 8; i++) {
		this.spawn_flare({
				"x": this.position[0] -20 + Math.random() * 60,
				"y": this.position[1] -20 + Math.random() * 60,
				"size": 20 + Math.random() * 20,
				"color": "#f40",//"#68f",
				"life": 30 + (Math.random() * 10)
			});
	}

	/*this.spawn_flare({
			"x": this.position[0],
			"y": this.position[1],
			"size": 160,
			"color": "#654",
			"alpha": 0.01,
			"life": 5
		});*/
};

Explosion.prototype = new Particle();

Explosion.prototype.spawn_flare = function(_opts) {
	var opts = {
		"x": 0,
		"y": 0,
		"size": 20,
		"life": 20,
		"color": "#f00",
		"alpha": 0.1,

		"time": 0
	};

	extend(opts, _opts);

	this.particles.push(opts);
};

Explosion.prototype.draw = function() {
	this.game.ctx.save();
	
	if ( this.particles.length <= 0 ) this.remove();
	
	for (var i = 0, l = this.particles.length; i < l; i++) {
		var f = this.particles[i];
	
		this.game.ctx.globalCompositeOperation = "lighter";

		this.game.ctx.fillStyle = f.color;

		var s = f.size * ((f.life - f.time) / f.life);

		if (s < 10) {
			this.game.ctx.globalAlpha = f.alpha;

			for (var n = 1; n < s; n++) {
				this.game.ctx.beginPath();
				this.game.ctx.arc(f.x, f.y, n, 0, Math.PI*2);
				this.game.ctx.fill();
			}
		}
		else if (s < 40) {
			var nl = s - 8;
			if (nl < 1) nl = 1;

			this.game.ctx.globalAlpha = f.alpha * 2;

			for (var n = nl; n < s; n += 2) {
				this.game.ctx.beginPath();
				this.game.ctx.arc(f.x, f.y, n, 0, Math.PI*2);
				this.game.ctx.fill();
			}
		}
		else {
			var nl = s - 4;
			if (nl < 1) nl = 1;

			this.game.ctx.globalAlpha = f.alpha * 4;

			for (var n = nl; n < s; n += 4) {
				this.game.ctx.beginPath();
				this.game.ctx.arc(f.x, f.y, n, 0, Math.PI*2);
				this.game.ctx.fill();
			}
		}

		// Flare dead?
		if (f.time++ >= f.life) {
			this.particles.splice(i--, 1);
			l--;
		}
	}

	this.game.ctx.globalCompositeOperation = "source-over";
	this.game.ctx.globalAlpha = 1.0;
	this.game.ctx.restore();
};

/********************/
/*******ENGINE*******/
/********************/

var Engine = function( ctx, args ) {
	if ( !args ) args = {};

	this.position  = args.position || [0, 0];
	this.direction = args.direction || 0;
	this.time      = 0;
	
	this.ctx = ctx;

	this.add();
};

Engine.prototype = new Particle();

Engine.prototype.move = function( posX, posY ) {
	this.position = [ posX, posY ];
};

Engine.prototype.rotate = function( rad ) {
	this.direction = rad;
};

Engine.prototype.draw = function() {
	this.ctx.save();
	var radius = Math.random()*4+31;

	var x = this.position[0]*0.97,
		y = this.position[1]*1.05;

	var bx = x + 10 * Math.cos(this.direction);
	var by = y + 10 * Math.sin(this.direction);

	var radgrad = this.ctx.createRadialGradient( bx, by, 0, bx, by, 30+Math.random()*3 );
	radgrad.addColorStop(0,   'rgba(0,130,200,1)');
	//radgrad.addColorStop(0.4, 'rgba(266,150,255,.9)');
	radgrad.addColorStop(1,   'rgba(255,255,255,0)');

	// draw shape
	this.ctx.fillStyle = radgrad;
	this.ctx.fillRect(bx-30, by-30, 100, 100);
	
	
	this.ctx.globalCompositeOperation = "lighter";
	white = this.ctx.createRadialGradient(bx, by, 0, bx*0.95, by*0.95, 35);
	white.addColorStop(0,   'rgba(255,255,255,0.7)');
	white.addColorStop(1,   'rgba(255,255,255,0)');

	// draw shape
	this.ctx.fillStyle = white;
	this.ctx.fillRect(bx-30, by-30, 150, 150);

	this.ctx.restore();
};



/******************__*****************/
/********SOOOOUUUNNNNNNDDDDSSS********/
/******************__*****************/
/******************__*****************/

/*************/
/***AWESOME***/
/*************/
Number.prototype.mod = function( x ) { return ((this % x) + x) % x; }

/****************************/
/****THE ACTUAL GAME??!?!!***/
/****************************/

var Game = function( ctx ) {
	this.ctx = ctx;

	this.score = 0;
	this.level = 0;

	this.player = 0;
	this.levels = [ 0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17 ];

	this.objects = [];
	this.effects = [];

	this.asteroidsAlive = 0;

	this.init();
}

Game.prototype = {
	init: function() {
		this.player = new Player(this);

		this.progress();
	},
	reset: function() {
		this.score = 0;
		this.level = 0;

		this.player;

		this.objects = [];
		this.effects = [];

		this.asteroidsAlive = 0;

		this.init();

		console.log("derp");
	},
	end: function() {
		this.addObject(new Text(this, {
			text: "You died! Your score was " + this.score + ".",
			canvas: this.ctx.canvas,
			font: 'bold 30px arial'
		}));

		this.addObject(new Text(this, {
			text: "Press SPACE to restart.",
			canvas: this.ctx.canvas,
			position: [this.ctx.canvas.width/2, this.ctx.canvas.height/2+50]
		}));

		this.player = 0;
	},
	progress: function() {
		this.level = ++this.level;

		this.player.spawn();

		this.addObject(new Text(this, {
			text: "Level " + +(this.level),
			ctx: this.ctx,
			canvas: this.ctx.canvas,
			lifetime: 50
		}));
		

		this.spawnAsteroids();
		this.asteroidsAlive = 1;

	},
	spawnAsteroids: function() {
		for ( var i = 0; i < this.levels[this.level]; i++ ) {
			this.addObject(new Asteroid( this ));
		}
	},
	addObject: function( obj ) {
		this.objects.push(obj);
	},
	addEffect: function( eff ) {
		this.effects.push(eff);
	},
	removeObject: function( obj ) {
		this.objects.splice( this.objects.indexOf( obj ), 1 );
	},
	removeEffect: function( eff ) {
		this.effects.splice( this.effects.indexOf( eff ), 1 );
	},
	render: function() {
		this.ctx.fillStyle="#222";
		this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

		if ( this.player ) {
			for ( var k = 0, kl = keysDown.length; k<kl; k++ ) {
				var key = keysDown[k];

				if ( key == keyTranslate["LEFT"] )
					this.player.rotate( -0.07 );
				else if ( key == keyTranslate["RIGHT"] )
					this.player.rotate( 0.07 );

				if ( key == keyTranslate["UP"] )
					this.player.accelerate( 0.03 );

				if ( key == keyTranslate["SPACE"] )
					this.player.shoot();
			}
		} else {
			for ( var k = 0, kl = keysDown.length; k<kl; k++ ) {
				var key = keysDown[k];

				if ( key == keyTranslate["SPACE"] )
					this.reset();
			}
		}


		if ( this.player ) {
			this.player.draw();
			this.player.move();
		}

		this.asteroidsAlive = 0;
		//Do all the stuffs to all the objects.
		for ( var objLen = this.objects.length; 0 < objLen; objLen-- ) {
			var obj = this.objects[objLen-1];
			if ( !obj ) continue;

			if ( obj.isBullet ) {

				//We have to go through all the objects again and see if we hit one of them.
				for ( var ol = this.objects.length; 0 < ol; ol-- ) {
					var asteroid = this.objects[ol-1];
					if ( !asteroid ) continue;

					//Just the asteroids tho.
					if ( asteroid.isAsteroid ) {
						if ( this.findCollision(asteroid, obj) ) {
							asteroid.explode();
							this.removeObject(obj);
						}
					}
				}
			}

			if ( obj.isAsteroid ) {
				this.asteroidsAlive = 1;
			}


			obj.draw();
			obj.move();
			

			if ( obj.lifetime ) {
				if ( obj.lifetime == 1 ) {
					this.objects.splice(objLen-1, 1);
				}
				else
					obj.lifetime--;
			}
		}

		for ( var eff = 0, effLen = this.effects.length; eff < effLen; effLen-- ) {
			var effect = this.effects[effLen-1];

			effect.draw();
		}

		if ( this.player ) {

			for ( var ol = this.objects.length; 0 < ol; ol-- ) {
				var asteroid = this.objects[ol-1];
				if ( !asteroid ) continue;

				//Just the asteroids tho.
				if ( asteroid.isAsteroid ) {
					if ( this.findCollision(asteroid, this.player) ) {
						asteroid.explode();
						this.player.explode();
						this.end();

						break;
					}
				}
			}
		}


		var scoreText = new Text(this, {
			text: this.score,
			font: "14px arial",
			position: [10, 10],
			textAlign: "left"
		});

		scoreText.draw();

		if ( !this.asteroidsAlive ) this.progress();
	},

	findCollision: function( obj1, obj2 ) {
		var asd=(Math.max(obj1.position[0],obj2.position[0]) - Math.min(obj1.position[0],obj2.position[0]));
		var qwe=(Math.max(obj1.position[1],obj2.position[1]) - Math.min(obj1.position[1],obj2.position[1]));
		
		if ( (asd*asd+qwe*qwe) < (obj1.radius*obj1.radius) ) {
			return true;
		}

		return false;
	}
};




var keysDown = [];
var objects = [];
var effects = [];

var keyTranslate = {
	"RIGHT": 39,
	"DOWN":  40,
	"LEFT":  37,
	"UP":    38,
	"SPACE": 32
};


window.onload = function() {
	var canvas = document.getElementById("canvas");

	/*****************************/
	/*********!KEYBINDINGS!*******/
	/*****************************/
	document.addEventListener("keydown", function(ev) {
		for ( var i = 0, il = keysDown.length; i<il; i++ ) {
			var key = keysDown[i];
			if ( key == ev.keyCode ) {
				return;
			}
		}

		keysDown.push(ev.keyCode);
	});
	document.addEventListener("keyup", function(ev) {
		if( keysDown.length <= 1 )
			keysDown = [];
		
		for ( var i = 0, il = keysDown.length; i<il; i++ ) {
			var key = keysDown[i];
			if ( key == ev.keyCode ) {
				keysDown.splice( i, 1 );
			}
		}
	});


	if ( canvas.getContext("2d") ) {
		var ctx = canvas.getContext("2d");

		var game = new Game(ctx);
		

		(function animloop(){
			requestAnimFrame( animloop );
			game.render( ctx );
		})();
	}

	/************************/
	/*******START GAME*******/
	/************************/
}
