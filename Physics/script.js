let box2d = {
  b2Vec2: Box2D.Common.Math.b2Vec2,
  b2BodyDef: Box2D.Dynamics.b2BodyDef,
  b2Body: Box2D.Dynamics.b2Body,
  b2FixtureDef: Box2D.Dynamics.b2FixtureDef,
  b2Fixture: Box2D.Dynamics.b2Fixture,
  b2World: Box2D.Dynamics.b2World,
  b2MassData: Box2D.Collision.Shapes.b2MassData,
  b2PolygonShape: Box2D.Collision.Shapes.b2PolygonShape,
  b2CircleShape: Box2D.Collision.Shapes.b2CircleShape,
  b2DebugDraw: Box2D.Dynamics.b2DebugDraw
};

let input = {
  left: false,
  right: false,
  down: false,
  up: false,
  m1: false,
  m2: false,
  mx: 0,
  my: 0
};

let types = {
  STATIC: 0x0001,
  INTERACT: 0x0002,
  PLAYER: 0x0004,
  CREATURE: 0x0008,
  PROJECTILE: 0x0010
};

class Player {
  constructor(x, y) {
    let bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_dynamicBody;
    bodyDef.position.x = x;
    bodyDef.position.y = y;
    let fixDef = new box2d.b2FixtureDef();
    fixDef.density = 1;
    fixDef.friciton = 0.5;
    fixDef.restitution = 0.5;
    fixDef.linearDamping = 0.5; //Doesn't seem to do anything.
    fixDef.shape = new box2d.b2CircleShape(20 / SCALE);
    fixDef.filter.categoryBits = types.PLAYER;
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.moveImpulse = 30 / SCALE;
    this.maxSpeed = 300 / SCALE;
    this.grapple = null;
    this.isGrappling = false;
  }
    
  useGrapple() {
    let center = this.body.GetWorldCenter();
    let grappleAngle = Math.atan2(input.my - center.y, input.mx - center.x);
    let grappleVel = new box2d.b2Vec2(Math.cos(grappleAngle), Math.sin(grappleAngle));
    grappleVel.Multiply(this.maxSpeed * 2);
    this.grapple = new Grapple(center.x, center.y, grappleVel)
  }
}

class Grapple {
  constructor(x, y, v) {
    let bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_dynamicBody;
    bodyDef.position.x = x;
    bodyDef.position.y = y;
    let fixDef = new box2d.b2FixtureDef();
    fixDef.density = 1;
    fixDef.friction = 1;
    fixDef.shape = new box2d.b2CircleShape(5 / SCALE);
    fixDef.filter.categoryBits = types.PROJECTILE;
    fixDef.filter.maskBits = 0x0001;
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.body.SetLinearVelocity(v)
  }
}


let SCALE = 30;
let stage, world, player;

function init() {
    stage = new createjs.Stage(document.getElementById("game-canvas"));
    setupPhysics();
    setupInput();
    player = new Player(100 / SCALE, 50 / SCALE);

    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.framerate = 60;
    createjs.Ticker.on("tick", tick);
    stage.update();
}

function setupPhysics() {
    world = new box2d.b2World(new box2d.b2Vec2(0, 0), false);
    let fixDef = new box2d.b2FixtureDef();
    fixDef.density = 1;
    fixDef.friciton = 0.5;
    let bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_staticBody;
    bodyDef.position.x = 400 / SCALE;
    bodyDef.position.y = 100 / SCALE;
    fixDef.shape = new box2d.b2PolygonShape();
    fixDef.shape.SetAsBox(400 / SCALE, 20 / SCALE);
    world.CreateBody(bodyDef).CreateFixture(fixDef);

    let debugDraw = new box2d.b2DebugDraw();
    debugDraw.SetSprite(stage.canvas.getContext("2d"));
    debugDraw.SetDrawScale(SCALE);
    debugDraw.SetFlags(box2d.b2DebugDraw.e_shapeBit | box2d.b2DebugDraw.e_jointBit);
    world.SetDebugDraw(debugDraw);
}

function tick() {
  stage.update();
  world.DrawDebugData();
  world.Step(1/60, 10, 10);
  world.ClearForces();
  let xInput = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let yInput = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  let playerImp = new box2d.b2Vec2(xInput * player.moveImpulse, yInput * player.moveImpulse);
  if (xInput != 0 && yInput != 0) {
    playerImp.Multiply(0.707);
  }

  if (input.m1) {
    if (player.isGrappling) {
    }
    else {
      player.useGrapple();
      player.isGrappling = true;
    }
  }
  else {
    if (player.isGrappling) {
      player.isGrappling = false;
    }
      else {
        player.body.ApplyImpulse(playerImp, player.body.GetWorldCenter());
        if (player.body.m_linearVelocity.Length() > player.maxSpeed) {
          player.SetLinearVelocity(player.body.m_linearVelocity.Multiply(player.maxSpeed / player.body.m_linearVelocity.Length()));
        }
      }
    }
}

function setupInput() {
  document.onkeydown = function(evt) {
    switch (evt.key) {
      case 'a':
        input.left = true;
        break;
      case 'd':
        input.right = true;
        break;
      case 's':
        input.down = true;
        break;
      case 'w':
        input.up = true;
        break;
    }
  }

  document.onkeyup = function(evt) {
    switch (evt.key) {
      case 'a':
        input.left = false;
        break;
      case 'd':
        input.right = false;
        break;
      case 's':
        input.down = false;
        break;
      case 'w':
        input.up = false;
        break;
    }
  }

  document.oncontextmenu = function(evt) { evt.preventDefault(); };

  stage.on("stagemousedown", function(evt) { input.m1 = true; } );

  stage.on("stagemouseup", function(evt) { input.m1 = false; } );

  stage.on("stagemousemove", function(evt) {
    input.mx = evt.stageX / SCALE;
    input.my = evt.stageY / SCALE;
  });
}

init();