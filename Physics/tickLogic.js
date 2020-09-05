import { startTick } from "./script.js"

let stage, loader, player, grapple
let canvas_height, canvas_width
let map = [...Array(100)].map(() => [...Array(100)])
let mapSize = map.length
let locx = 50       //refering to the map
let locy = 50       //refering to the map
let lastlocx = 0    //in pixels
let lastlocy = 0    //in pixels
let chunkSize = 5   // needs to be a prime number
let tile
let scale = 2
let offsetx, offsety
let mapContainerfront = new createjs.Container()
let mapContainerback = new createjs.Container()
let mapContainerfloor = new createjs.Container()
let mapContainerorigin = new createjs.Container()
let lfHeld, rtHeld, fwHeld, bkHeld
let movementScale = 6
let eleCounter = 0
let tickCounter = 0

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
        { src: "topdown_wall_pats/top.png", id: "1" },
        { src: "topdown_wall_pats/bottom.png", id: "2" },
        { src: "topdown_wall_pats/left.png", id: "3" },
        { src: "topdown_wall_pats/right.png", id: "4" },
        { src: "topdown_wall_pats/top_left.png", id: "5" },
        { src: "topdown_wall_pats/top_right.png", id: "6" },
        { src: "topdown_wall_pats/bottom_left.png", id: "7" },
        { src: "topdown_wall_pats/bottom_right.png", id: "8" },
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
    stage.addChild(mapContainerfloor, mapContainerback, player, grapple, mapContainerfront)
    startTick()
}

function generatelevel1() {
    overlayGround(960, 512, 32, 32)
    overlayGround(960, 960, 960, 160)
    overlayGround(1736, 192, 160, 160)
    overlayGround(180, 192, 160, 160)
}

export function overlayGround(x, y, l, w) {
    let newTile = new createjs.Shape()
    newTile.graphics.beginBitmapFill(loader.getResult("0"), "repeat").drawRect(0, 0, l, w)
    newTile.scale = scale
    newTile.cache(0, 0, l, w)
    newTile.x = Math.floor(x / 32) * 32 - l
    newTile.y = Math.floor(y / 32) * 32 - w
    mapContainerfloor.addChild(newTile)
}

export function overlayBack(x, y, l, w, type) {
    let newBackWall = new createjs.Shape()
    newBackWall.graphics.beginBitmapFill(loader.getResult("0"), "repeat").drawRect(0, 0, l, w)
    newBackWall.scale = scale
    newBackWall.cache(0, 0, 32, 32)
    newBackWall.x = (x * 32) * scale + offsetx
    newBackWall.y = (y * 32) * scale + offsety
    mapContainerfloor.addChild(newBackWall)
}

export function overlayFront(x, y) {

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

export function tick(box2DPlayer) {
    stage.update()
    let vec = box2DPlayer.body.GetPosition()
    player.x = vec.x * 30 - canvas_width / 2
    player.y = vec.y * 30 - canvas_height / 2
    if (box2DPlayer.isGrappling && box2DPlayer.grapple) {
        drawGrapple(box2DPlayer.grapple)
    }
}