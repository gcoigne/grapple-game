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
  b2DebugDraw: Box2D.Dynamics.b2DebugDraw,
  b2ContactListener: Box2D.Dynamics.b2ContactListener
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

class MyContactListener extends Box2D.Dynamics.b2ContactListener {
    BeginContact(contact) {
      let fixA = contact.GetFixtureA();
      let bodyA = fixA.GetBody();
      let bodyDataA = bodyA.GetUserData();
      let fixB = contact.GetFixtureB();
      let bodyB = fixB.GetBody();
      let bodyDataB = bodyB.GetUserData();

      if (bodyDataA instanceof Wall) {
        if (bodyDataB instanceof Player) {
          if (bodyDataB.isGrappling) {
            //bodyDataB.endGrapple();
          }
        }
        else if (bodyDataB instanceof Grapple) {
          if (bodyDataA.isSoft) {
            bodyDataB.isStuck = true;
          }
          else {
            bodyDataB.isDone = true;
          }
          //bodyB.SetActive(false);
        }
      }

      else if (bodyDataA instanceof Hazard) {
        if (bodyDataB instanceof Player) {
          player.isDead = true;
        }
      }

      else if (bodyDataA instanceof Player) {
        if (bodyDataB instanceof Wall) {
          if (bodyDataA.isGrappling) {
            //bodyDataA.endGrapple();
          }
        }
      }

      if (bodyDataA instanceof Grapple) {
        if (bodyDataB instanceof Wall) {
          if (bodyDataB.isSoft) {
            bodyDataA.isStuck = true;
          }
          else {
            bodyDataA.isDone = true;
          }
          bodyA.setActive(false);
        }
      }
    }
}
//MyContactListener.prototype = new Box2D.Dynamics.b2ContactListener();
//MyContactListener.prototype.constructor = MyContactListener;

class Wall {
  constructor(x, y, w, h, s) {
    let bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_staticBody;
    bodyDef.position.x = x;
    bodyDef.position.y = y;
    let fixDef = new box2d.b2FixtureDef();
    fixDef.friction = 0.5;
    fixDef.restitution = 0.5;
    fixDef.shape = new box2d.b2PolygonShape();
    fixDef.shape.SetAsBox(w / SCALE, h / SCALE);
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.body.SetUserData(this);
    this.isSoft = s;
  }
}

class Hazard {
  constructor(x, y, w, h) {
    let bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_staticBody;
    bodyDef.position.x = x;
    bodyDef.position.y = y;
    let fixDef = new box2d.b2FixtureDef();
    fixDef.friction = 0.5;
    fixDef.restitution = 0.5;
    fixDef.shape = new box2d.b2PolygonShape();
    fixDef.shape.SetAsBox(w / SCALE, h / SCALE);
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.body.SetUserData(this);
  }
}

class Player {
  constructor(x, y) {
    let bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_dynamicBody;
    bodyDef.position.x = x;
    bodyDef.position.y = y;
    bodyDef.linearDamping = 2;
    let fixDef = new box2d.b2FixtureDef();
    fixDef.density = 1;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.5;
    fixDef.shape = new box2d.b2CircleShape(20 / SCALE);
    fixDef.filter.categoryBits = types.PLAYER;
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.body.SetUserData(this);
    this.moveImpulse = 30 / SCALE;
    this.maxSpeed = 300 / SCALE;
    this.isGrappling = false;
    this.isDead = false;
    this.grapple = null;
    this.inventory = {};
  }
    
  useGrapple() {
    let center = this.body.GetWorldCenter();
    let grappleAngle = Math.atan2(input.my - center.y, input.mx - center.x);
    let grappleVel = new box2d.b2Vec2(Math.cos(grappleAngle), Math.sin(grappleAngle));
    grappleVel.Multiply(this.maxSpeed * 2);
    this.grapple = new Grapple(center.x, center.y, grappleVel)
    this.isGrappling = true;
  }

  endGrapple() {
    this.grapple.isDone = true;
    this.isGrappling = false;
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
    this.body.SetUserData(this);
    this.body.SetLinearVelocity(v)
    this.isDone = false;
  }
}


let SCALE = 30;
let stage, world, player, contactListener;

function init() {
    stage = new createjs.Stage(document.getElementById("game-canvas"));
    setupPhysics();
    setupInput();
    
    new Wall(0, 0, 10000 / SCALE, 200 / SCALE, true);
    new Hazard(50 / SCALE, 50 / SCALE, 200 / SCALE, 200 / SCALE);
    player = new Player(100 / SCALE, 50 / SCALE);

    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.framerate = 60;
    createjs.Ticker.on("tick", tick);
    stage.update();
}

function setupPhysics() {
    Box2D.Listen
    world = new box2d.b2World(new box2d.b2Vec2(0, 0), false);
    contactListener = new MyContactListener();
    world.SetContactListener(contactListener);

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
  if (player.isDead) {

  }
  else {
    
  let xInput = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let yInput = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  let playerImp;

  playerImp = new box2d.b2Vec2(xInput * player.moveImpulse, yInput * player.moveImpulse);
  if (xInput != 0 && yInput != 0) {
    playerImp.Multiply(0.707);
  }
  player.body.ApplyImpulse(playerImp, player.body.GetWorldCenter());

  if (input.m1) {
    if (player.isGrappling) {
      if (player.grapple.isStuck) {
        player.grapple.body.SetActive(false);
        let playerCenter = player.body.GetWorldCenter();
        let grappleCenter = player.grapple.body.GetWorldCenter();
        let grappleAngle = Math.atan2(grappleCenter.y - playerCenter.y, grappleCenter.x - playerCenter.x);
        let grappleImp = new box2d.b2Vec2(player.moveImpulse * 2 * Math.cos(grappleAngle), player.moveImpulse * 2 * Math.sin(grappleAngle));
        player.body.ApplyImpulse(grappleImp, player.body.GetWorldCenter());
      }
    }
    else {
      player.useGrapple();
    }
  }
  else {
    if (player.isGrappling) {
      player.endGrapple();
    }
    else {
      if (player.body.m_linearVelocity.Length() > player.maxSpeed) {
        player.body.m_linearVelocity.Multiply(player.maxSpeed / player.body.m_linearVelocity.Length());
      }
    }
  }
  }

  if (player && player.isDead) {
    if (player.grapple) {
      world.DestroyBody(player.grapple.body);
      player.grapple = null;
    }
    player.body.SetActive(false);
  }

  if (player.grapple && player.grapple.isDone) {
    world.DestroyBody(player.grapple.body);
    player.grapple = null;
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

  //document.oncontextmenu = function(evt) { evt.preventDefault(); };

  stage.on("stagemousedown", function(evt) { input.m1 = true; } );

  stage.on("stagemouseup", function(evt) { input.m1 = false; } );

  stage.on("stagemousemove", function(evt) {
    input.mx = evt.stageX / SCALE;
    input.my = evt.stageY / SCALE;
  });
}

init();