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
let mapContainerwall = new createjs.Container()
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
        { src: "topdown_wall_parts/top.png", id: "1" },
        { src: "topdown_wall_parts/bottom.png", id: "2" },
        { src: "topdown_wall_parts/left.png", id: "3" },
        { src: "topdown_wall_parts/right.png", id: "4" },
        { src: "topdown_wall_parts/top_left.png", id: "5" },
        { src: "topdown_wall_parts/top_right.png", id: "6" },
        { src: "topdown_wall_parts/bottom_left.png", id: "7" },
        { src: "topdown_wall_parts/bottom_right.png", id: "8" },
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

function generatelevel1() {
    overlayGround(960, 960, 960, 160)
    overlayGround(1760, 160, 160, 160)
    overlayGround(160, 160, 160, 160)
    overlayWall(960, 32, 960, 32, "1")
    overlayWall(960, 1024, 960, 32, "2")

    overlayWall(1888, 544, 32, 480, "4")
    overlayWall(1888, 32, 32, 32, "6")
    overlayWall(1888, 1024, 32, 32, "8")

    overlayWall(32, 544, 32, 480, "3")
    overlayWall(32, 32, 32, 32, "5")
    overlayWall(32, 1024, 32, 32, "7")

    overlayWall(32, 352, 32, 32, "7")
    overlayWall(32, 416, 32, 32, "5")
    //no time left to make the extra sprites
    overlayWall(480, 352, 416+64, 32, "2")
    overlayWall(480, 416, 416+64, 32, "1")
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