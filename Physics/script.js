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
        bodyDataB.numGroundTouching++;
      }
      else if (bodyDataB instanceof Box) {
        bodyDataB.numGroundTouching++;
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
      else if (bodyDataB instanceof Grapple) {
        bodyDataB.isDone = true;
      }
    }

    else if (bodyDataA instanceof Hazard) {
      if (bodyDataB instanceof Player) {
        bodyDataB.isDead = true;
      }
      else if (bodyDataB instanceof Grapple) {
        bodyDataB.isDone = true;
      }
    }

    else if (bodyDataA instanceof Button) {
      bodyDataA.numPressingObjects++;
      if (bodyDataA.numPressingObjects == 1) {
        bodyDataA.linkedObject.buttonStart();
      }
    }

    else if (bodyDataA instanceof Transition) {
      bodyDataA.isTouched = true;
    }

    else if (bodyDataA instanceof Collectable) {
      if (bodyDataB instanceof Player) {
        if (!bodyDataA.isCollected) {
          bodyDataA.isCollected = true;
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

    else if (bodyDataA instanceof Box) {
      if (bodyDataB instanceof Ground) {
        bodyDataA.numGroundTouching++;
      }
      else if (bodyDataB instanceof Player) {
        if (bodyDataB.isGrappling) {
          bodyDataB.endGrapple();
        }
      }
      else if (bodyDataB instanceof Button) {
        bodyDataB.numPressingObjects++;
        if (bodyDataB.numPressingObjects == 1) {
          bodyDataB.linkedObject.buttonStart();
        }
      }
      else if (bodyDataB instanceof Grapple) {
        bodyDataB.hitObject = bodyDataA;
      }
    }

    else if (bodyDataA instanceof Player) {
      if (bodyDataB instanceof Ground) {
        bodyDataA.numGroundTouching++;
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
      else if (bodyDataB instanceof Button) {
        bodyDataB.numPressingObjects++;
        if (bodyDataB.numPressingObjects == 1) {
          bodyDataB.linkedObject.buttonStart();
        }
      }
      else if (bodyDataB instanceof Transition) {
        bodyDataB.isTouched = true;
      }
      else if (bodyDataB instanceof Collectable) {
        if (!bodyDataB.isCollected) {
          bodyDataB.isCollected = true;
          let type = bodyDataB.collectableType;
          if (type in player.inventory) {
            player.inventory[type]++;
          }
          else {
            player.inventory[type] = 1;
          }
        }
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
      else if (bodyDataB instanceof Door) {
        bodyDataA.isDone = true;
      }
      else if (bodyDataB instanceof Hazard) {
        bodyDataA.isDone = true;
      }
      else if (bodyDataB instanceof Box) {
        bodyDataA.hitObject = bodyDataB;
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
        bodyDataB.numGroundTouching--;
      }
      else if (bodyDataB instanceof Box) {
        bodyDataB.numGroundTouching--;
      }
    }
    else if (bodyDataA instanceof Box) {
      if (bodyDataB instanceof Ground) {
        bodyDataA.numGroundTouching--;
      }
      else if (bodyDataB instanceof Button) {
        bodyDataB.numPressingObjects--;
        if (bodyDataB.numPressingObjects == 0) {
          bodyDataB.linkedObject.buttonEnd();
        }
      }
    }
    else if (bodyDataA instanceof Player) {
      if (bodyDataB instanceof Ground) {
        bodyDataA.numGroundTouching--;
      }
      else if (bodyDataB instanceof Button) {
        bodyDataB.numPressingObjects--;
        if (bodyDataB.numPressingObjects == 0) {
          bodyDataB.linkedObject.buttonEnd();
        }
      }
    }
    else if (bodyDataA instanceof Button) {
      bodyDataA.numPressingObjects--;
      if (bodyDataA.numPressingObjects == 0) {
        bodyDataA.linkedObject.buttonEnd();
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
    bodys.push(this.body);
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
    bodys.push(this.body);
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
    bodys.push(this.body);
  }

  buttonStart() {
    this.isOpen = true;
  }

  buttonEnd() {
    this.isOpen = false;
  }

  tick() {
    if (this.isOpen) {
      this.body.SetActive(false);
    }
    else {
      this.body.SetActive(true);
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
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.body.SetUserData(this);
    bodys.push(this.body);
  }
}

class Button {
  constructor(x, y, w, h, l) {
    let bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_staticBody;
    bodyDef.position.x = x;
    bodyDef.position.y = y;
    let fixDef = new box2d.b2FixtureDef();
    fixDef.isSensor = true;
    fixDef.shape = new box2d.b2PolygonShape();
    fixDef.shape.SetAsBox(w, h);
    fixDef.filter.categoryBits = categorys.STATIC;
    fixDef.filter.maskBits = categorys.INTERACT | categorys.PLAYER | categorys.CREATURE;
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.linkedObject = l;
    this.numPressingObjects = 0;
    this.body.SetUserData(this);
    bodys.push(this.body);
  }
}

class Transition {
  constructor(x, y, w, h, l) {
    let bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_staticBody;
    bodyDef.position.x = x;
    bodyDef.position.y = y;
    let fixDef = new box2d.b2FixtureDef();
    fixDef.isSensor = true;
    fixDef.shape = new box2d.b2PolygonShape();
    fixDef.shape.SetAsBox(w, h);
    fixDef.filter.categoryBits = categorys.STATIC;
    fixDef.filter.maskBits = categorys.PLAYER;
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.levelIndex = l;
    this.isTouched = false;
    this.body.SetUserData(this);
    bodys.push(this.body);
  }

  activate() {
    loadLevel(this.levelIndex);
  }

  tick() {
    if (this.isTouched) {
      this.activate();
    }
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
    fixDef.density = 1;
    fixDef.friction = 0.5;
    fixDef.restitution = 0;
    fixDef.shape = new box2d.b2PolygonShape();
    fixDef.shape.SetAsBox(w, h);
    fixDef.filter.categoryBits = categorys.INTERACT;
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.body.SetUserData(this);
    this.numGroundTouching = 1;
    this.isDead = false;
    bodys.push(this.body);
  }
  tick() {
    if (this.numGroundTouching == 0 && (!player.grapple || player.grapple.hitObject != this)) {
      this.isDead = true;
    }
    if (this.isDead) {
      this.body.SetActive(false);
    }
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
    bodys.push(this.body);
  }

  tick() {
    if (this.isCollected) {
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
    fixDef.shape = new box2d.b2CircleShape(30 / SCALE);
    fixDef.filter.categoryBits = categorys.PLAYER;
    this.body = world.CreateBody(bodyDef);
    this.fix = this.body.CreateFixture(fixDef);
    this.body.SetUserData(this);
    this.moveImpulse = 8;
    this.maxSpeed = 32;
    this.isGrappling = false;
    this.canGrapple = true;
    this.isDead = false;
    this.numGroundTouching = 1;
    this.grapple = null;
    this.inventory = {};
    bodys.push(this.body);
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
    if (!this.isDead && this.numGroundTouching == 0 && !(this.isGrappling && this.grapple.hitObject)) {
      this.isDead = true;
    }
    if (this.isDead) {
      loadLevel(levelIndex);
      //if (this.grapple) {
        //world.DestroyBody(this.grapple.body);
        //this.grapple = null;
      //}
      //this.body.SetActive(false);
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

    if (this.isGrappling && this.grapple && this.grapple.hitObject && !this.grapple.hitObject.body.IsActive()) {
      this.endGrapple();
    }

    if (this.grapple && this.grapple.isDone) {
      this.isGrappling = false;
      world.DestroyBody(this.grapple.body);
      this.grapple = null;
    }

    if (!this.isGrappling || !this.grapple || !this.grapple.hitObject) {
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
    bodys.push(this.body);
  }
}

let stage, world, contactListener;
let bodys, player, doors, transitions, collectables, boxes, buttons;
let SCALE = 30;
let levelIndex = 0;

function init() {
  bodys = [];
  stage = new createjs.Stage(document.getElementById("game-canvas"));
  setupPhysics();
  setupInput();
  loadLevel(0);
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

  for (let transition of transitions) {
    transition.tick();
  }

  for (let collectable of collectables) {
    collectable.tick();
  }

  for (let box of boxes) {
    box.tick();
  }
  if (createjs.Ticker.getMeasuredFPS() < 50) {
    //console.log(createjs.Ticker.getMeasuredFPS())
  }
  overlay.tick(player, boxes, doors, buttons);
}

function setupInput() {
  document.onkeydown = function (evt) {
    switch (evt.key) {
      case 'a':
        input.left = true;
        overlay.rotatePlayer(-90)
        break;
      case 'd':
        input.right = true;
        overlay.rotatePlayer(90)
        break;
      case 's':
        input.down = true;
        overlay.rotatePlayer(180)
        break;
      case 'w':
        input.up = true;
        overlay.rotatePlayer(0)
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

function loadLevel(l) {
  for (let body of bodys) {
    if (body) {
      world.DestroyBody(body);
    }
  }
  switch(l) {
    case 0:
      player = new Player(256 / SCALE, 960 / SCALE);
      new Ground(960 / SCALE, 928 / SCALE, 960 / SCALE, 160 / SCALE);
      new Ground(1760 / SCALE, 160 / SCALE, 160 / SCALE, 160 / SCALE);
      new Ground(160 / SCALE, 160 / SCALE, 160 / SCALE, 160 / SCALE);
      new Wall(960 / SCALE, 32 / SCALE, 960 / SCALE, 32 / SCALE);
      new Wall(960 / SCALE, 1056 / SCALE, 960 / SCALE, 32 / SCALE);
      new Wall(32 / SCALE, 544 / SCALE, 32 / SCALE, 544 / SCALE);
      new Wall(1888 / SCALE, 544 / SCALE, 32 / SCALE, 544 / SCALE);
      new Wall(480 / SCALE, 384 / SCALE, 480 / SCALE, 64 / SCALE);
      doors = [];
      boxes = [];
      collectables = [];
      transitions = [new Transition(240 / SCALE, 192 / SCALE, 32 / SCALE, 32 / SCALE, 1)];
      break;
    case 1:
      player = new Player(256 / SCALE, 960 / SCALE);
      new Ground(480 / SCALE, 512 / SCALE, 480 / SCALE, 512 / SCALE);
      new Ground(1440 / SCALE, 256 / SCALE, 480 / SCALE, 256 / SCALE);
      new Ground(1440 / SCALE, 864 / SCALE, 480 / SCALE, 160 / SCALE);
      new Wall(960 / SCALE, 32 / SCALE, 960 / SCALE, 32 / SCALE);
      new Wall(960 / SCALE, 1056 / SCALE, 960 / SCALE, 32 / SCALE);
      new Wall(32 / SCALE, 512 / SCALE, 32 / SCALE, 512 / SCALE);
      new Wall(1888 / SCALE, 512 / SCALE, 32 / SCALE, 512 / SCALE);
      new Wall(960 / SCALE, 576 / SCALE, 64 / SCALE, 448 / SCALE);
      new Wall(1728 / SCALE, 448 / SCALE, 256 / SCALE, 64 / SCALE);
      new Wall(1472 / SCALE, 320 / SCALE, 64 / SCALE, 192 / SCALE);
      doors = [new Door(928 / SCALE, 96 / SCALE, 32 / SCALE, 32 / SCALE), new Door(1440 / SCALE, 96 / SCALE, 32 / SCALE, 32 / SCALE)];
      boxes = [new Box(480 / SCALE, 768 / SCALE, 32 / SCALE, 32 / SCALE), new Box(1440 / SCALE, 768 / SCALE, 32 / SCALE, 32 / SCALE)];
      buttons = [new Button(480 / SCALE, 256 / SCALE, 32 / SCALE, 32 / SCALE, doors[0]), new Button(1184 / SCALE, 256 / SCALE, 32 / SCALE, 32 / SCALE, doors[1])];
      collectables = [];
      transitions = [new Transition(1736 / SCALE, 192 / SCALE, 32 / SCALE, 32 / SCALE, 0)];
      overlay.generatelevel2()
  }
  levelIndex = l;
}

init();