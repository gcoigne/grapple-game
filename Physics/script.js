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

class Player {
  constructor(id, x, y) {
    this.id = id;
    var bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_dynamicBody;
    bodyDef.position.x = x;
    bodyDef.position.y = y;
    var fixDef = new box2d.b2FixtureDef();
    fixDef.density = 1;
    fixDef.friciton = 0.5;
    fixDef.restitution = 0.5;
    fixDef.shape = new box2d.b2CircleShape(1);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    this.body = bodyDef;
  }
}

var SCALE = 30;
var stage, world, player;

function init() {
  stage = new createjs.Stage(document.getElementById("game-canvas"));

  //let circle = new createjs.Shape();
  //circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
  //circle.x = 100;
  //circle.y = 100;
  //stage.addChild(circle);
  //stage.update();

  setupPhysics();
  stage.update();
  createjs.Ticker.on("tick", tick);
  createjs.Ticker.setFPS(60);
  createjs.Ticker.useRAF = true;
  player = new Player(0, 0, 0);
  stage.update();
}

function setupPhysics() {
  world = new box2d.b2World(new box2d.b2Vec2(0, 50), true);
  var fixDef = new box2d.b2FixtureDef();
  fixDef.density = 1;
  fixDef.friciton = 0.5;
  var bodyDef = new box2d.b2BodyDef();
  bodyDef.type = box2d.b2Body.b2_staticBody;
  bodyDef.position.x = 400 / SCALE;
  bodyDef.position.y = 600 / SCALE;
  fixDef.shape = new box2d.b2PolygonShape();
  fixDef.shape.SetAsBox(400 / SCALE, 20 / SCALE);
  world.CreateBody(bodyDef).CreateFixture(fixDef);

  var debugDraw = new box2d.b2DebugDraw();
  debugDraw.SetSprite(stage.canvas.getContext("2d"));
  debugDraw.SetDrawScale(SCALE);
  debugDraw.SetFlags(box2d.b2DebugDraw.e_shapeBit | box2d.b2DebugDraw.e_jointBit);
  world.SetDebugDraw(debugDraw);
  //console.log(world.m_debugDraw);
}

function tick() {
  stage.update();
  world.DrawDebugData();
  world.Step(1/60, 10, 10);
  world.ClearForces();
  console.log(player.body.position.x)
}

init();