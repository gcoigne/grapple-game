import * as overlay from "./tickLogic.js"

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

let categorys = {
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

    if (bodyDataA instanceof Ground) {
      if (bodyDataB instanceof Player) {
	bodyDataB.isGrounded = true;
      }
      else if (bodyDataB instanceof Box) {
	bodyDataB.isGrounded = true;
      }
    }

    if (bodyDataA instanceof Wall) {
      if (bodyDataB instanceof Player) {
        if (bodyDataB.isGrappling) {
          bodyDataB.endGrapple();
        }
      }
      else if (bodyDataB instanceof Grapple) {
        bodyDataB.hitObject = bodyDataA;
      }
    }

    else if (bodyDataA instanceof Door) {
      if (bodyDataB instanceof Player) {
        if (!bodyDataA.isOpen && "key" in player.inventory && player.inventory["key"] > 0) {
          bodyDataB.inventory["key"]--;
          bodyDataA.isOpen = true;
        }
        if (bodyDataB.isGrappling) {
          bodyDataB.endGrapple();
        }
      }
    }

    else if (bodyDataA instanceof Hazard) {
      if (bodyDataB instanceof Player) {
        player.isDead = true;
      }
      else if (bodyDataB instanceof Grapple) {
	grapple.isDone = true;
      }
    }
    
    else if (bodyDataA instanceof Box) {
      if (bodyDataB instanceof Ground) {
	bodyDataA.isGrounded = true;
      }
      else if (bodyDataB instanceof Player) {
        if (bodyDataB.isGrappling) {
          bodyDataB.endGrapple();
        }
      }
      else if (bodyDataB instanceof Grapple) {
          bodyDataB.hitObject = bodyDataA;
      }
    }

    else if (bodyDataA instanceof Player) {
      if (bodyDataB instanceof Ground) {
	    bodyDataA.isGrounded = true;
      }
      if (bodyDataB instanceof Wall) {
        if (bodyDataA.isGrappling) {
          bodyDataA.endGrapple();
        }
      }
      else if (bodyDataB instanceof Door) {
        if (!bodyDataB.isOpen && "key" in player.inventory && player.inventory["key"] > 0) {
          bodyDataA.inventory["key"]--;
          bodyDataB.isOpen = true;
        }
        if (bodyDataA.isGrappling) {
          bodyDataA.endGrapple();
        }
      }
      else if (bodyDataB instanceof Hazard) {
	    bodyDataA.isDead = true;
      }
      else if (bodyDataB instanceof Box) {
        if (bodyDataA.isGrappling) {
          bodyDataA.endGrapple();
        }
      }
    }

    else if (bodyDataA instanceof Grapple) {
      if (bodyDataB instanceof Wall) {
        bodyDataA.hitObject = bodyDataB;
      }
      else if (bodyDataB instanceof Hazard) {
	    bodyDataA.isDone = true;
      }
      else if (bodyDataB instanceof Box) {
        bodyDataA.hitObject = bodyDataB;
      }
    }

    else if (bodyDataA instanceof Collectable) {
      if (bodyDataB instanceof Player) {
        if (!bodyDataA.isCollected) {
          bodyDataB.isCollected = true;
          type = bodyDataA.collectableType;
          if (type in player.inventory) {
            player.inventory[type]++;
          }
          else {
            player.inventory[type] = 1;
          }
        }
      }
    }
  }

  EndContact(contact) {
    let fixA = contact.GetFixtureA();
    let bodyA = fixA.GetBody();
    let bodyDataA = bodyA.GetUserData();
    let fixB = contact.GetFixtureB();
    let bodyB = fixB.GetBody();
    let bodyDataB = bodyB.GetUserData();

    if (bodyDataA instanceof Ground) {
      if (bodyDataB instanceof Player) {
	bodyDataB.isGrounded = false;
      }
      else if (bodyDataB instanceof Box) {
	bodyDataB.isGrounded = false;
      }
    }
    else if (bodyDataA instanceof Box) {
      if (bodyDataB instanceof Ground) {
	bodyDataA.isGrounded = false;
      }
    }    
    else if (bodyDataA instanceof Player) {
      if (bodyDataB instanceof Ground) {
        bodyDataA.isGrounded = false;
      }
    }
  }
}
//MyContactListener.prototype = new Box2D.Dynamics.b2ContactListener();
//MyContactListener.prototype.constructor = MyContactListener;


class Ground {
  constructor(x, y, w, h) {
    let bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_staticBody;
    bodyDef.position.x = x;
    bodyDef.position.y = y;
    let fixDef = new box2d.b2FixtureDef();
    fixDef.isSensor = true;
    fixDef.shape = new box2d.b2PolygonShape();
    fixDef.shape.SetAsBox(w, h);
    fixDef.filter.categoryBits = categorys.STATIC;
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.body.SetUserData(this);
  }
}

class Wall {
  constructor(x, y, w, h) {
    let bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_staticBody;
    bodyDef.position.x = x;
    bodyDef.position.y = y;
    let fixDef = new box2d.b2FixtureDef();
    fixDef.friction = 0.5;
    fixDef.restitution = 0;
    fixDef.shape = new box2d.b2PolygonShape();
    fixDef.shape.SetAsBox(w, h);
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.body.SetUserData(this);
  }
}

class Door {
  constructor(x, y, w, h) {
    let bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_staticBody;
    bodyDef.position.x = x;
    bodyDef.position.y = y;
    let fixDef = new box2d.b2FixtureDef();
    fixDef.friction = 0.5;
    fixDef.restitution = 0;
    fixDef.shape = new box2d.b2PolygonShape();
    fixDef.shape.SetAsBox(w, h);
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.body.SetUserData(this);
    this.isOpen = false;
  }

  tick() {
    if (this.isOpen) {
      this.body.SetActive(false);
    }
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
    fixDef.shape.SetAsBox(w, h);
    fixDef.filter.categoryBits = categorys.STATIC;
    fixDef.filter.maskBits = categorys.PLAYER || categorys.CREATURE;
    fixDef.shape.SetAsBox(w, h);
    fixDef.filter.categoryBits = categorys.STATIC;
    fixDef.filter.maskBits = categorys.PLAYER | categorys.CREATURE;
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.body.SetUserData(this);
  }
}

class Box {
  constructor(x, y, w, h) {
    let bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_dynamicBody;
    bodyDef.position.x = x;
    bodyDef.position.y = y;
    bodyDef.fixedRotation = true;
    bodyDef.linearDamping = 5;
    let fixDef = new box2d.b2FixtureDef();
    fixDef.density = 0.5;
    fixDef.friction = 0.5;
    fixDef.restitution = 0;
    fixDef.shape = new box2d.b2PolygonShape();
    fixDef.shape.SetAsBox(w, h);
    fixDef.filter.categoryBits = categorys.INTERACT;
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.body.SetUserData(this);
    this.isGrounded = true;
    this.isDead = false;
  }
  tick() {
    if (!this.isGrounded && (!player.grapple || player.grapple.hitObject != this)) {
      this.isDead = true;
    }
    if (this.isDead) {
      this.body.SetActive(false);
    }
  }
}

class Player {
  constructor(x, y) {
    let bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_dynamicBody;
    bodyDef.position.x = x;
    bodyDef.position.y = y;
    bodyDef.linearDamping = 5;
    let fixDef = new box2d.b2FixtureDef();
    fixDef.density = 1;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.25;
    fixDef.shape = new box2d.b2CircleShape(20 / SCALE);
    fixDef.filter.categoryBits = categorys.PLAYER;
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.body.SetUserData(this);
    this.moveImpulse = 2;
    this.maxSpeed = 20;
    this.isGrappling = false;
    this.canGrapple = true;
    this.isDead = false;
    this.isGrounded = true;
    this.grapple = null;
    this.inventory = {};
  }

  useGrapple() {
    let center = this.body.GetWorldCenter();
    let grappleAngle = Math.atan2(input.my - center.y, input.mx - center.x);
    let grappleVel = new box2d.b2Vec2(Math.cos(grappleAngle), Math.sin(grappleAngle));
    grappleVel.Multiply(this.maxSpeed * 2);
    this.grapple = new Grapple(center.x, center.y, grappleVel);
    this.isGrappling = true;
    this.canGrapple = false;
  }

  endGrapple() {
    overlay.clearOverlayGrapple()
    this.grapple.isDone = true;
    this.grapple.hitObject = null;
    this.isGrappling = false;
  }

  tick() {
    if (!this.isDead && !this.isGrounded && !(this.isGrappling && this.grapple.hitObject)) {
      this.isDead = true;
    }
    if (this.isDead) {
      if (this.grapple) {
        world.DestroyBody(this.grapple.body);
        this.grapple = null;
      }
      this.body.SetActive(false);
    }
    else {
      let xInput = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      let yInput = (input.down ? 1 : 0) - (input.up ? 1 : 0);
      let playerImp;

      playerImp = new box2d.b2Vec2(xInput * this.moveImpulse, yInput * this.moveImpulse);
      if (xInput != 0 && yInput != 0) {
        playerImp.Multiply(0.707);
      }
      this.body.ApplyImpulse(playerImp, this.body.GetWorldCenter());

      if (input.m1) {
        if (this.isGrappling) {
          if (this.grapple.hitObject) {
	    let grappleBody = this.grapple.body;
	    let hitBody = this.grapple.hitObject.body;
            grappleBody.SetActive(false);
            let playerCenter = this.body.GetWorldCenter();
            let grappleCenter = grappleBody.GetWorldCenter();
	    let hitCenter = hitBody.GetWorldCenter();
	    if (hitBody.GetType() == box2d.b2Body.b2_dynamicBody) {
              let grappleAngle = Math.atan2(hitCenter.y - playerCenter.y, hitCenter.x - playerCenter.x);
              let grappleImp = new box2d.b2Vec2(this.moveImpulse * Math.cos(grappleAngle), this.moveImpulse * Math.sin(grappleAngle));
	      grappleImp.Multiply(2);
              this.body.ApplyImpulse(grappleImp, this.body.GetWorldCenter());
	      grappleImp.Multiply(-1);
	      hitBody.ApplyImpulse(grappleImp, hitBody.GetWorldCenter());
	      this.grapple.body.SetPosition(hitCenter);
	    }
	    else {
              let grappleAngle = Math.atan2(grappleCenter.y - playerCenter.y, grappleCenter.x - playerCenter.x);
              let grappleImp = new box2d.b2Vec2(this.moveImpulse * Math.cos(grappleAngle), this.moveImpulse * Math.sin(grappleAngle));
              this.body.ApplyImpulse(grappleImp, this.body.GetWorldCenter());
	    }
          }
        }
        else if (this.canGrapple) {
          this.useGrapple();
        }
      }
      else {
        if (this.isGrappling) {
          this.endGrapple();
        }
        this.canGrapple = true;
      }
    }
	
    if (this.isGrappling && this.grapple.hitObject && !this.grapple.hitObject.body.IsActive()) {
      this.endGrapple();
    }

    if (this.grapple && this.grapple.isDone) {
      world.DestroyBody(this.grapple.body);
      this.grapple = null;
    }

    if (!this.isGrappling || !this.grapple || ! this.grapple.hitObject) {
      if (this.body.m_linearVelocity.Length() > this.maxSpeed) {
        this.body.m_linearVelocity.Multiply(this.maxSpeed / this.body.m_linearVelocity.Length());
      }
    }
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
    fixDef.filter.categoryBits = categorys.PROJECTILE;
    fixDef.filter.maskBits = categorys.STATIC | categorys.INTERACT;
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.body.SetUserData(this);
    this.body.SetLinearVelocity(v);
    this.hitObject;
    this.isDone = false;
  }
}

class Collectable {
  constructor(x, y, r, t) {
    let bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_staticBody;
    bodyDef.position.x = x;
    bodyDef.position.y = y;
    let fixDef = new box2d.b2FixtureDef();
    fixDef.shape = new box2d.b2CircleShape(r);
    fixDef.filter.categoryBits = categorys.INTERACT;
    fixDef.filter.maskBits = categorys.PLAYER;
    fixDef.isSensor = true;
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.body.SetUserData(this);
    this.collectableType = t;
    this.isCollected = false;
  }

  tick() {
    if (this.isCollected) {
      this.body.SetActive(false);
    }
  }
}


let SCALE = 30;
let stage, world, contactListener, player, doors, boxes, collectables;

function init() {
  stage = new createjs.Stage(document.getElementById("game-canvas"));
  setupPhysics();
  setupInput();
  createLevel();
  overlay.init(stage);

  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.framerate = 60;
}

export function startTick() {
  createjs.Ticker.on("tick", tick);
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
  world.Step(1 / 60, 10, 10);
  world.DrawDebugData()
  world.ClearForces();

  if (player) {
    player.tick();
  }

  for (let door of doors) {
    door.tick();
  }

  for (let box of boxes) {
    box.tick();
  }

  for (let collectable of collectables) {
    collectable.tick();
  }
  if(createjs.Ticker.getMeasuredFPS() < 50){
    console.log(createjs.Ticker.getMeasuredFPS())
  }
  overlay.tick(player);
}

function setupInput() {
  document.onkeydown = function (evt) {
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

  document.onkeyup = function (evt) {
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

  stage.on("stagemousedown", function (evt) { input.m1 = true; });

  stage.on("stagemouseup", function (evt) { input.m1 = false; });

  stage.on("stagemousemove", function (evt) {
    input.mx = evt.stageX / SCALE;
    input.my = evt.stageY / SCALE;
  });
}

function createLevel() {
  new Wall(1920 / 2 / SCALE, 9 / SCALE, 300 / SCALE, 30 / SCALE, true);
  new Hazard(50 / SCALE, 50 / SCALE, 30 / SCALE, 30 / SCALE);
  player = new Player(1920 / 2 / SCALE, 1080 / 2 / SCALE);
  doors = [new Door(200 / SCALE, 50 / SCALE, 60 / SCALE, 30 / SCALE)];
  boxes = [new Box(1500 / SCALE, 1080 / 2 / SCALE, 30 / SCALE, 30 / SCALE)];
  collectables = [new Collectable(100 / SCALE, 100 / SCALE, 10 / SCALE, "key")];
  new Ground(1920 / 2 / SCALE, 1080 / 2 / SCALE, 120 / SCALE, 120 / SCALE);
  new Ground(1500 / SCALE, 1080 / 2 / SCALE, 120 / SCALE, 120 / SCALE);
}

init();