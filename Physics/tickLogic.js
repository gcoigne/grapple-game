import { startTick } from "./script.js"

let stage, loader, player, grapple, boxes, buttons
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
    ]

    loader = new createjs.LoadQueue(false)
    loader.addEventListener("complete", handleComplete)
    loader.loadManifest(manifest, true, "../Sprites/")

}

function handleComplete() {
    player = new createjs.Shape()
    player.graphics.beginFill("red").drawCircle(canvas_width / 2 / scale, canvas_height / 2 / scale, 15)
    player.scale = scale
    //By default swapping between Stage for StageGL will not allow for vector drawing operation such as BitmapFill, useless you cache your shape.
    player.cache(canvas_width / 2 / scale - 15, canvas_height / 2 / scale - 15, 15 * 2, 15 * 2, 4)
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
}

export function generatelevel2() {
    mapContainerwall.removeAllChildren()
    mapContainerfloor.removeAllChildren()
    boxes = []
    buttons = []
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

    overlayWall(1472 - 32, 352, 32, 160, "4")
    overlayWall(1472 + 32, 352, 32, 160, "3")

    overlayWall(1728, 448 - 32, 240, 32, "2")
    overlayWall(1888, 448 - 32, 32, 32, "8")
    overlayWall(1520, 448 - 32, 32, 32, "7")
    overlayWall(1728, 448 + 32, 240, 32, "1")
    overlayWall(1888, 448 + 32, 32, 32, "6")

    overlayDoor(928+64, 96, 32, 32, 90)
    overlayDoor(1440+64, 96, 32, 32, 90)
    overlayButton(480, 256, 32, 32)
    overlayButton(1184, 256, 32, 32)
    overlayBox(480, 768, 32, 32)
    overlayBox(1440, 768, 32, 32)
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
    let newBackWall = new createjs.Shape()
    newBackWall.graphics.beginBitmapFill(loader.getResult("9"), "repeat").drawRect(0, 0, l, w)
    newBackWall.scale = scale
    newBackWall.cache(0, 0, l, w)
    newBackWall.rotation = direction
    newBackWall.x = Math.floor(x / 32) * 32 - l
    newBackWall.y = Math.floor(y / 32) * 32 - w
    mapContainerwall.addChild(newBackWall)
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
    let newButton = new createjs.Shape()
    newButton.graphics.beginBitmapFill(loader.getResult("11"), "repeat").drawRect(0, 0, l, w)
    newButton.scale = scale
    newButton.cache(0, 0, l, w)
    newButton.x = Math.floor(x / 32) * 32 - l
    newButton.y = Math.floor(y / 32) * 32 - w
    buttons.push(newButton)
    mapContainerfloor.addChild(newButton)
}

export function clearOverlayGrapple() {
    grapple.graphics.clear()
}

function drawGrapple(box2DGrapple) {
    let vec = box2DGrapple.body.GetPosition()
    let playerPositionX = (player.x / scale) + canvas_width / 2 / scale
    let playerPositionY = (player.y / scale) + canvas_height / 2 / scale
    grapple.graphics.clear()
    grapple.graphics.setStrokeStyle(2).beginStroke("#000")
    grapple.graphics.moveTo(playerPositionX, playerPositionY)
    grapple.graphics.lineTo(vec.x * 30 / scale, vec.y * 30 / scale)
    grapple.graphics.endStroke()
}

export function tick(box2DPlayer, box2DBoxes) {
    //stage.update()
    let vec = box2DPlayer.body.GetPosition()
    player.x = vec.x * 30 - canvas_width / 2
    player.y = vec.y * 30 - canvas_height / 2
    if (box2DBoxes !== undefined) {
        for (let i = 0; i < box2DBoxes.length; i++) {
            vec = box2DBoxes[i].body.GetPosition()
            boxes[i].x = vec.x * 30 - 32
            boxes[i].y = vec.y * 30 - 32
        }
    }

    if (box2DPlayer.isGrappling && box2DPlayer.grapple) {
        drawGrapple(box2DPlayer.grapple)
    }
}