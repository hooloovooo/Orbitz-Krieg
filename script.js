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
var Lasers = function( args ) {
	if ( !args ) args = {};

	this.position  = args.position  || [0, 0];
	this.velocity  = args.velocity  || [0, 0];
	this.direction = args.direction || 0;
	this.lifetime  = args.lifetime  || 0;
	this.radius    = args.radius    || 0;
};

Lasers.prototype.remove = function() {
	objects.splice( objects.indexOf( this ), 1 );
};

Lasers.prototype.add = function() {
	objects.push( this );
};

Lasers.prototype.rotate = function(rad) {
	this.direction += rad.mod( 2*Math.PI );
};

Lasers.prototype.move = function( canvas ) {
	this.position = [ this.position[0]+this.velocity[0], this.position[1]+this.velocity[1] ]
	
	/******************/
	/**EDGE DETECTION**/
	/******************/
	if ( this.position[0] > canvas.width )
		this.position[0] = 0;
	if ( this.position[0] < 0 )
		this.position[0] = canvas.width;
	if ( this.position[1] > canvas.height )
		this.position[1] = 0;
	if ( this.position[1] < 0 )
		this.position[1] = canvas.height;
};

Lasers.prototype.draw = function( ctx ) {
	ctx.beginPath();
	ctx.arc( this.position[0], this.position[1], this.radius, 0, Math.PI*2, true ); 
	ctx.closePath();
	ctx.fill();
};


/**********************/
/****CREATE PLAYER*****/
/**********************/
var Player = function( ctx ) {
	this.lastShot = 0;
	this.isPlayer = 1;

	this.ctx = ctx;
	this.engine = new Engine( this.ctx, {
		position:  this.position,
		direction: this.direction
	});
};
Player.prototype = new Lasers();

Player.prototype.shoot = function() {
	if ( new Date().getTime() - this.lastShot > 110 ) {	

		var position = this.position;
		var velocity = [
			this.velocity[0] +(Math.sin( this.direction )*5),
			this.velocity[1] -(Math.cos( this.direction )*5)
		];
		var lifetime = 60;
		
		new Bullet({
			position: position,
			velocity: velocity,
			lifetime: lifetime,
			radius: 1.5
		}).add();


		this.lastShot = new Date().getTime();
	}
};

Player.prototype.draw = function( ctx ) {
	var posX = this.position[0],
		posY = this.position[1];

	var p0x=0, p0y=-15,
		p1x=8, p1y=5,
		p2x=-8, p2y=5;

	var Dsin = Math.sin( this.direction );
	var Dcos = Math.cos( this.direction );

	ctx.beginPath();
	ctx.moveTo( p0x*Dcos - p0y*Dsin + posX, p0y*Dcos + p0x*Dsin + posY );
	ctx.lineTo( p1x*Dcos - p1y*Dsin + posX, p1y*Dcos + p1x*Dsin + posY );
	ctx.lineTo( p2x*Dcos - p1y*Dsin + posX, p2y*Dcos + p2x*Dsin + posY );
	ctx.fill();
};

Player.prototype.accelerate = function( force ) {
	this.velocity = [
		this.velocity[0] + Math.sin(this.direction)*force,
		this.velocity[1] -(Math.cos(this.direction)*force)
	];
};

Player.prototype.move = function( canvas ) {
	this.position = [ this.position[0]+this.velocity[0], this.position[1]+this.velocity[1] ]
	
	/******************/
	/**EDGE DETECTION**/
	/******************/
	if ( this.position[0] > canvas.width )
		this.position[0] = 0;
	if ( this.position[0] < 0 )
		this.position[0] = canvas.width;
	if ( this.position[1] > canvas.height )
		this.position[1] = 0;
	if ( this.position[1] < 0 )
		this.position[1] = canvas.height;

	this.engine.move( this.position[0], this.position[1] );
};

Lasers.prototype.rotate = function(rad) {
	this.direction += rad.mod( 2*Math.PI );
	this.engine.rotate( this.direction );
};

/**********************/
/***CREATE ASTEROID****/
/**********************/
var Asteroid = function( canvas, args ) {
	if ( !args ) args = {};

	this.canvas = canvas;
	this.isAsteroid = 1;
	
	this.position      = args.position      || [ Math.random()*canvas.width, Math.random()*canvas.height ];
	this.velocity      = args.velocity      || [ Math.random()*1, Math.random()*1 ];
	this.direction     = args.direction     || 0;
	this.lifetime      = args.lifetime      || 0;
	this.radius        = args.radius        || Math.random()*30+20;
	this.generation    = args.generation    || 0;

};

Asteroid.prototype = new Lasers();

Asteroid.prototype.explode = function() {
	currentScore += 100*this.generation+50;
	if ( this.generation < 3 ) {
		for ( var i = 0; i < 2; i++ ) {
			var newa = new Asteroid(this.canvas, {
				position:   this.position,
				velocity:   [ (Math.random()*2-1)*2, (Math.random()*2-1) ],
				radius:     this.radius*0.7,
				generation: this.generation+1
			});
			newa.add();
		}
	}

	this.remove();
};


/**********************/
/****CREATE BULLET*****/
/**********************/
var Bullet = function( args ) {
	if ( !args ) args = {};

	this.position  = args.position  || [0, 0];
	this.velocity  = args.velocity  || [0, 0];
	this.direction = args.direction || 0;
	this.lifetime  = args.lifetime  || 0;
	this.radius    = args.radius    || 0;
	this.isBullet = 1;

};

Bullet.prototype = new Lasers();


/*********************/
/******TEXTADDER******/
/*********************/

var Text = function( args ) {
	if ( !args ) args = {};
	
	this.position      = args.position      || [ args.canvas.width, args.canvas.height ];
	this.lifetime      = args.lifetime      || 0;
	this.radius        = args.radius        || Math.random()*30+20;
	this.generation    = args.generation    || 0;
	this.canvas        = args.canvas        || undefined;
	this.ctx           = args.ctx           || undefined;
	this.text          = args.text      || "Dummy";

};

Text.prototype = new Lasers();

Text.prototype.draw = function() {
	this.ctx.save();
	this.ctx.fillStyle    = '#444';
	this.ctx.font         = 'bold 50px arial';
	this.ctx.textBaseline = 'middle';
	this.ctx.textAlign    = "center"
	this.ctx.fillText(this.text, this.canvas.width/2, this.canvas.height/2);
	this.ctx.restore();
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

var Explosion = function( ctx, args ) {
	if ( !args ) args = {};

	this.position  = args.position  || [0, 0];
	this.velocity  = args.velocity  || [0, 0];
	this.direction = args.direction || 0;
	this.lifetime  = args.lifetime  || 0;
	this.radius    = args.radius    || 0;
	
	this.ctx = ctx;
	
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

	$.extend(opts, _opts);

	this.particles.push(opts);
};

Explosion.prototype.draw = function() {
	this.ctx.save();
	
	if ( this.particles.length <= 0 ) this.remove();
	
	for (var i = 0, l = this.particles.length; i < l; i++) {
		var f = this.particles[i];
	
		this.ctx.globalCompositeOperation = "lighter";

		this.ctx.fillStyle = f.color;

		var s = f.size * ((f.life - f.time) / f.life);

		if (s < 10) {
			this.ctx.globalAlpha = f.alpha;

			for (var n = 1; n < s; n++) {
				this.ctx.beginPath();
				this.ctx.arc(f.x, f.y, n, 0, Math.PI*2);
				this.ctx.fill();
			}
		}
		else if (s < 40) {
			var nl = s - 8;
			if (nl < 1) nl = 1;

			this.ctx.globalAlpha = f.alpha * 2;

			for (var n = nl; n < s; n += 2) {
				this.ctx.beginPath();
				this.ctx.arc(f.x, f.y, n, 0, Math.PI*2);
				this.ctx.fill();
			}
		}
		else {
			var nl = s - 4;
			if (nl < 1) nl = 1;

			this.ctx.globalAlpha = f.alpha * 4;

			for (var n = nl; n < s; n += 4) {
				this.ctx.beginPath();
				this.ctx.arc(f.x, f.y, n, 0, Math.PI*2);
				this.ctx.fill();
			}
		}

		// Flare dead?
		if (f.time++ >= f.life) {
			this.particles.splice(i--, 1);
			l--;
		}
	}

	this.ctx.globalCompositeOperation = "source-over";
	this.ctx.globalAlpha = 1.0;
	this.ctx.restore();
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


/************/
/***STUFFS***/
/************/

var render = function(ctx, canvas) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if ( objects.length == 1 ) {
		currentLevel++;
		var game = new Level(levels[currentLevel], ctx, canvas);
		game.addPlayer();
		game.addAsteroids();
	}

	for ( var i = 0, il = objects.length; i<il; il-- ) {
		var o = objects[il-1];
		
		if ( o.isPlayer || o.isBullet ) {
			for ( var k = 0, kl = objects.length; k < objects.length; k++ ) {
				var obj = objects[k];

				if ( obj.isAsteroid ) {
					var asd=(Math.max(obj.position[0],o.position[0]) - Math.min(obj.position[0],o.position[0]));
					var qwe=(Math.max(obj.position[1],o.position[1]) - Math.min(obj.position[1],o.position[1]));
					
					if ( (asd*asd+qwe*qwe) < (obj.radius*obj.radius) ) {
						var a = new Explosion(ctx, { position: obj.position });
						a.add();
						
						obj.explode();
						o.remove();
					}
				}
			}
		}

		
		if ( o.isPlayer ) {
			for ( var k = 0, kl = keysDown.length; k<kl; k++ ) {
				var key = keysDown[k];

				if ( key == keyTranslate["LEFT"] )
					o.rotate( -0.07 );
				else if ( key == keyTranslate["RIGHT"] )
					o.rotate( 0.07 );

				if ( key == keyTranslate["UP"] )
					o.accelerate( 0.008 );
				
				if ( key == keyTranslate["SPACE"] )
						o.shoot();
			}
		}


		//Update position
		o.move(canvas);

		//Draw this object
		o.draw(ctx);


		/******************/
		/***DRAW SCORE*****/
		/******************/
		ctx.save();
		ctx.fillStyle    = '#444';
		ctx.font         = '20px arial';
		ctx.textBaseline = 'top';
		ctx.textAlign    = "left"
		ctx.fillText(currentScore, 10, 10);
		ctx.restore();

		/****************************/
		/***REMOVE EXPIRED OBJECTS***/
		/****************************/

		if ( o.lifetime ) {
			if ( o.lifetime == 1 ) {
				objects.splice(il-1, 1);
			}
			else
				o.lifetime--;
		}
	}
	
	for ( var i = 0, il = effects.length; i<il; il-- ) {
		var e = effects[il-1];
		
		e.draw();
	}
}


/****************************/
/****GAME HELPER FUNCTIONS***/
/****************************/

var Level = function( level, ctx, canvas ) {
	objects = [];
	effects = [];

	this.ctx = ctx;
	this.canvas = canvas;
	this.level = level;

	var a = new Text({ text: "Level " + +(currentLevel+1), ctx: ctx, canvas: canvas, lifetime: 50 });
	a.add();
};

Level.prototype.addPlayer = function() {
	var ship = new Player(this.ctx);
	ship.position = [
		(this.canvas.width/2),
		(this.canvas.height/2)
	];
	ship.add();
};

Level.prototype.addAsteroids = function() {
	for ( var i = 0; i < this.level; i++ ) {
		var asteroid = new Asteroid( this.canvas );
		asteroid.add();
	}
};




var keysDown = [];
var objects = [];
var effects = [];
var currentLevel = 0;
var currentScore = 0;

var keyTranslate = {
	"RIGHT": 39,
	"DOWN":  40,
	"LEFT":  37,
	"UP":    38,
	"SPACE": 32
};

var levels = [ 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17 ];


$(function() {
	var canvas = document.getElementById("canvas");

	/*****************************/
	/*********!KEYBINDINGS!*******/
	/*****************************/
	$(document).bind("keydown", function(ev) {
		for ( var i = 0, il = keysDown.length; i<il; i++ ) {
			var key = keysDown[i];
			if ( key == ev.keyCode ) {
				return;
			}
		}

		keysDown.push(ev.keyCode);
	});
	$(document).bind("keyup", function(ev) {
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


		(function animloop(){
			requestAnimFrame( animloop );
			render( ctx, canvas );
		})();
	}

	/************************/
	/*******START GAME*******/
	/************************/
	var game = new Level(3, ctx, canvas);
	game.addPlayer();
	game.addAsteroids();

});
