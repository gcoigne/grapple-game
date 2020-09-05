import { startTick } from "./script.js"

let stage, loader, player, grapple, boxes, buttons, doors, key
let canvas_height, canvas_width
let scale = 2
let offsetx, offsety
let buttonAnimation, doorAnimation
let mapContainerwall = new createjs.Container()
let mapContainerfloor = new createjs.Container()
let mapContainerorigin = new createjs.Container()

export function init(mainLoopStage) {
    let canvas = document.getElementById("game-canvas")
    canvas.getContext('2d').imageSmoothingEnabled = false
    canvas_height = canvas.height
    canvas_width = canvas.width
    offsetx = canvas_width / 2 - 16 * scale
    offsety = canvas_height / 2 - 16 * scale
    stage = mainLoopStage
    let manifest = [
        { src: "floor_tile.png", id: "0" },
        { src: "topdown_wall_parts/top.png", id: "1" },
        { src: "topdown_wall_parts/bottom.png", id: "2" },
        { src: "topdown_wall_parts/left.png", id: "3" },
        { src: "topdown_wall_parts/right.png", id: "4" },
        { src: "topdown_wall_parts/top_left.png", id: "5" },
        { src: "topdown_wall_parts/top_right.png", id: "6" },
        { src: "topdown_wall_parts/bottom_left.png", id: "7" },
        { src: "topdown_wall_parts/bottom_right.png", id: "8" },
        { src: "topdown_door.png", id: "9" },
        { src: "box.png", id: "10" },
        { src: "topdown_poressure_button.png", id: "11" },
        { src: "key.png", id: "12" },
        { src: "player.png", id: "13" },
    ]

    loader = new createjs.LoadQueue(false)
    loader.addEventListener("complete", handleComplete)
    loader.loadManifest(manifest, true, "../Sprites/")

}
function handleComplete() {
    player = new createjs.Shape()
    player.graphics.beginBitmapFill(loader.getResult("13")).drawRect(0, 0, 32, 32)
    console.log(canvas_width / 2 / scale, canvas_height / 2 / scale)
    player.regX = 16
    player.regY = 16
    player.scale = scale
    player.cache(0, 0, 32, 32)
    buttonAnimation = new createjs.SpriteSheet({
        images: [loader.getResult("11")],
        frames: { width: 32, height: 32 },
        animations: {
            press: 1,
            release: 0,
        }
    })
    doorAnimation = new createjs.SpriteSheet({
        images: [loader.getResult("9")],
        frames: { width: 32, height: 32 },
        animations: {
            idle: 0,
            open: {
                frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
            },
            close: {
                frames: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
            }
        }
    })

    //By default swapping between Stage for StageGL will not allow for vector drawing operation such as BitmapFill, useless you cache your shape.
    generatelevel1()
    grapple = new createjs.Shape()
    grapple.scale = scale
    mapContainerorigin.scale = scale
    stage.addChild(mapContainerfloor, mapContainerwall, player, grapple)
    startTick()
}

export function generatelevel1() {
    overlayGround(960, 928, 960, 160)
    overlayGround(1760, 160, 160, 160)
    overlayGround(160, 160, 160, 160)
    overlayWall(960, 32, 960, 32, "1")
    overlayWall(960, 1056, 960, 32, "2")

    overlayWall(1888, 544, 32, 480, "4")
    overlayWall(1888, 32, 32, 32, "6")
    overlayWall(1888, 1056, 32, 32, "8")

    overlayWall(32, 544, 32, 480, "3")
    overlayWall(32, 32, 32, 32, "5")
    overlayWall(32, 1056, 32, 32, "7")

    //no time left to make the extra sprites
    overlayWall(480, 352, 416 + 64, 32, "2")
    overlayWall(480, 416, 416 + 64, 32, "1")
    overlayWall(32, 352, 32, 32, "7")
    overlayWall(32, 416, 32, 32, "5")
    overlayKey(240, 192, 32, 32)
}

export function generatelevel2() {
    mapContainerwall.removeAllChildren()
    mapContainerfloor.removeAllChildren()
    boxes = []
    buttons = []
    doors = []

    overlayGround(480, 512, 480, 512)
    overlayGround(1440, 256, 480, 256)
    overlayGround(1440, 864, 480, 160)

    overlayWall(960, 32, 960, 32, "1")

    overlayWall(960, 1056, 960, 32, "2")

    overlayWall(1888, 544, 32, 480, "4")
    overlayWall(1888, 32, 32, 32, "6")
    overlayWall(1888, 1056, 32, 32, "8")

    overlayWall(32, 544, 32, 480, "3")
    overlayWall(32, 32, 32, 32, "5")
    overlayWall(32, 1056, 32, 32, "7")

    overlayWall(960 - 32, 584, 32, 448, "4")
    overlayWall(960 + 32, 584, 32, 448, "3")

    overlayWall(1472 - 32, 320, 32, 192, "4")
    overlayWall(1472 + 32, 320, 32, 192, "3")

    overlayWall(1728, 448 - 32, 256, 32, "2")
    overlayWall(1888, 448 - 32, 32, 32, "8")
    overlayWall(1520, 448 - 32, 32, 32, "7")
    overlayWall(1728, 448 + 32, 256, 32, "1")
    overlayWall(1888, 448 + 32, 32, 32, "6")

    overlayDoor(928 + 64, 96, 32, 32, 90)
    overlayDoor(1440 + 64, 96, 32, 32, 90)
    overlayButton(480, 256, 32, 32)
    overlayButton(1184, 256, 32, 32)
    overlayBox(480, 768, 32, 32)
    overlayBox(1440, 768, 32, 32)
    overlayKey(1736, 192, 32, 32)
}

function overlayGround(x, y, l, w) {
    let newTile = new createjs.Shape()
    newTile.graphics.beginBitmapFill(loader.getResult("0"), "repeat").drawRect(0, 0, l, w)
    newTile.scale = scale
    newTile.cache(0, 0, l, w)
    newTile.x = Math.floor(x / 32) * 32 - l
    newTile.y = Math.floor(y / 32) * 32 - w
    mapContainerfloor.addChild(newTile)
}

function overlayWall(x, y, l, w, type) {
    let newBackWall = new createjs.Shape()
    newBackWall.graphics.beginBitmapFill(loader.getResult(type), "repeat").drawRect(0, 0, l, w)
    newBackWall.scale = scale
    newBackWall.cache(0, 0, l, w)
    newBackWall.x = Math.floor(x / 32) * 32 - l
    newBackWall.y = Math.floor(y / 32) * 32 - w
    mapContainerwall.addChild(newBackWall)
}

function overlayDoor(x, y, l, w, direction) {
    let newDoor = new createjs.Sprite(doorAnimation, "idle")
    newDoor.rotation = direction
    newDoor.framerate = 30
    newDoor.addEventListener("tick", (event) => {
        if (newDoor.lastAnimation === "open" && newDoor.currentFrame == 9) {
            newDoor.gotoAndStop(9)
        }
        if (newDoor.lastAnimation === "close" && newDoor.currentFrame == 0) {
            newDoor.gotoAndStop(0)
        }
    })
    newDoor.scale = scale
    newDoor.x = Math.floor(x / 32) * 32 - l
    newDoor.y = Math.floor(y / 32) * 32 - w
    doors.push(newDoor)
    mapContainerwall.addChild(newDoor)
}

function overlayBox(x, y, l, w) {
    let newBox = new createjs.Shape()
    newBox.graphics.beginBitmapFill(loader.getResult("10"), "repeat").drawRect(0, 0, l, w)
    newBox.scale = scale
    newBox.cache(0, 0, l, w)
    newBox.x = Math.floor(x / 32) * 32 - l
    newBox.y = Math.floor(y / 32) * 32 - w
    boxes.push(newBox)
    mapContainerfloor.addChild(newBox)
}

function overlayButton(x, y, l, w) {
    let newButton = new createjs.Sprite(buttonAnimation, "idle")
    newButton.scale = scale
    newButton.x = Math.floor(x / 32) * 32 - l
    newButton.y = Math.floor(y / 32) * 32 - w
    buttons.push(newButton)
    mapContainerfloor.addChild(newButton)
}


function overlayKey(x, y, l, w) {
    let newKey = new createjs.Bitmap(loader.getResult("12"))
    key = newKey
    newKey.scale = 3
    //newKey.cache(0, 0, l, w)
    newKey.x = Math.floor(x / 32) * 32 - l
    newKey.regX = 16
    newKey.y = Math.floor(y / 32) * 32 - w
    newKey.regY = 16
    mapContainerfloor.addChild(newKey)
}

export function clearOverlayGrapple() {
    grapple.graphics.clear()
}

export function rotatePlayer(num) {
    player.rotation = num
}

function drawGrapple(box2DGrapple) {
    let vec = box2DGrapple.body.GetPosition()
    let playerPositionX = (player.x / scale)
    let playerPositionY = (player.y / scale)
    grapple.graphics.clear()
    grapple.graphics.setStrokeStyle(2).beginStroke("#000")
    grapple.graphics.moveTo(playerPositionX, playerPositionY)
    grapple.graphics.lineTo(vec.x * 30 / scale, vec.y * 30 / scale)
    grapple.graphics.endStroke()
}

export function tick(box2DPlayer, box2DBoxes, box2DDoor, box2DButton) {
    stage.update()
    let vec = box2DPlayer.body.GetPosition()
    player.x = vec.x * 30
    player.y = vec.y * 30
    if (box2DBoxes !== undefined) {
        for (let i = 0; i < box2DBoxes.length; i++) {
            vec = box2DBoxes[i].body.GetPosition()
            boxes[i].x = vec.x * 30 - 32
            boxes[i].y = vec.y * 30 - 32
        }
    }
    if (box2DButton !== undefined) {
        for (let i = 0; i < box2DButton.length; i++) {
            if (box2DButton[i].numPressingObjects > 0 && buttons[i].currentAnimation !== "press") {
                buttons[i].gotoAndStop("press")
            }
            else if (box2DButton[i].numPressingObjects == 0 && buttons[i].currentAnimation !== "release") {
                buttons[i].gotoAndStop("release")
            }
        }
    }
    if (box2DDoor !== undefined) {
        for (let i = 0; i < box2DDoor.length; i++) {
            if (box2DDoor[i].isOpen && doors[i].lastAnimation !== "open") {
                console.log("open")
                doors[i].lastAnimation = "open"
                doors[i].gotoAndPlay("open")
            }
            if (!box2DDoor[i].isOpen && doors[i].lastAnimation !== "close") {
                console.log("close")
                doors[i].lastAnimation = "close"
                doors[i].gotoAndPlay("close")
            }
        }
    }
    key.rotation += 2
    if (box2DPlayer.isGrappling && box2DPlayer.grapple) {
        drawGrapple(box2DPlayer.grapple)
    }
}