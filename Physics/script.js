var box2d = {
  b2Vec2 : Box2D.Common.Math.b2Vec2,
  b2BodyDef : Box2D.Dynamics.b2BodyDef,
  b2Body : Box2D.Dynamics.b2Body,
  b2FixtureDef : Box2D.Dynamics.b2FixtureDef,
  b2Fixture : Box2D.Dynamics.b2Fixture,
  b2World : Box2D.Dynamics.b2World,
  b2MassData : Box2D.Collision.Shapes.b2MassData,
  b2PolygonShape : Box2D.Collision.Shapes.b2PolygonShape,
  b2CircleShape : Box2D.Collision.Shapes.b2CircleShape,
  b2DebugDraw : Box2D.Dynamics.b2DebugDraw
};

var input = {
  left : false,
  right : false,
  down : false,
  up : false,
  m1 : false,
  m2 : false
};

class Player {
  constructor(x, y) {
    var bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_dynamicBody;
    bodyDef.position.x = x;
    bodyDef.position.y = y;
    var fixDef = new box2d.b2FixtureDef();
    fixDef.density = 1;
    fixDef.friciton = 0.5;
    fixDef.restitution = 0.5;
    fixDef.linearDamping = 0.5; //Doesn't seem to do anything.
    fixDef.shape = new box2d.b2CircleShape(15 / SCALE);
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.moveImpulse = 30 / SCALE;
    this.maxSpeed = 300 / SCALE;
  }
}

var SCALE = 30;
var stage, world, player;

function init() {
  stage = new createjs.Stage(document.getElementById("game-canvas"));

  setupPhysics();
  stage.update();
  createjs.Ticker.on("tick", tick);
  createjs.Ticker.useRAF = true;
  player = new Player(100 / SCALE, 50 / SCALE);
  stage.update();
}

function setupPhysics() {
  world = new box2d.b2World(new box2d.b2Vec2(0, 0), false);
  var fixDef = new box2d.b2FixtureDef();
  fixDef.density = 1;
  fixDef.friciton = 0.5;
  var bodyDef = new box2d.b2BodyDef();
  bodyDef.type = box2d.b2Body.b2_staticBody;
  bodyDef.position.x = 400 / SCALE;
  bodyDef.position.y = 100 / SCALE;
  fixDef.shape = new box2d.b2PolygonShape();
  fixDef.shape.SetAsBox(400 / SCALE, 20 / SCALE);
  world.CreateBody(bodyDef).CreateFixture(fixDef);

  var debugDraw = new box2d.b2DebugDraw();
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
  player.body.ApplyImpulse(playerImp, player.body.GetWorldCenter());
  if (player.body.m_linearVelocity.Length() > player.maxSpeed) {
    player.SetLinearVelocity(player.body.m_linearVelocity.Multiply(player.maxSpeed / player.body.m_linearVelocity.Length()));
  }
}

function keyDown(event) {
  switch(event.key) {
    case 'a':
      input.left = true;
      break;
    case 'd':
      input.right = true;
      break;
    case 'w':
      input.up = true;
      break;
    case 's':
      input.down = true;
      break;
  }
}

function keyUp(event) {
  switch(event.key) {
    case 'a':
      input.left = false;
      break;
    case 'd':
      input.right = false;
      break;
    case 'w':
      input.up = false;
      break;
    case 's':
      input.down = false;
      break;
  }
}

document.onkeydown = keyDown;
document.onkeyup = keyUp;

init();