import {startTick} from "./script.js"

let stage, loader, player
let canvas_height, canvas_width
let map = [...Array(100)].map(() => [...Array(100)])
let mapSize = map.length
let locx = 50       //refering to the map
let locy = 50       //refering to the map
let lastlocx = 0    //in pixels
let lastlocy = 0    //in pixels
let chunkSize = 5   // needs to be a prime number
let tile
let scale = 3
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
        { src: "wall_parts/test_wall/1.png", id: "1" },
        { src: "wall_parts/test_wall/2.png", id: "2" },
        { src: "wall_parts/test_wall/3.png", id: "3" },
        { src: "wall_parts/test_wall/4.png", id: "4" },
        { src: "wall_parts/test_wall/5.png", id: "5" },
        { src: "wall_parts/test_wall/6.png", id: "6" },
        { src: "wall_parts/test_wall/7.png", id: "7" },
        { src: "wall_parts/test_wall/8.png", id: "8" },
        { src: "wall_parts/test_wall/9.png", id: "9" },
        { src: "wall_parts/test_wall/10.png", id: "10" },
        { src: "wall_parts/test_wall/11.png", id: "11" },
        { src: "wall_parts/test_wall/12.png", id: "12" },
    ]

    loader = new createjs.LoadQueue(false)
    loader.addEventListener("complete", handleComplete)
    loader.loadManifest(manifest, true, "../Sprites/")

}

function handleComplete() {
    player = new createjs.Shape()
    player.graphics.beginFill("red").drawCircle(canvas_width / 2 / scale, canvas_height / 2 / scale, 8)
    player.scale = scale
    //By default swapping between Stage for StageGL will not allow for vector drawing operation such as BitmapFill, useless you cache your shape.
    player.cache(canvas_width / 2 / scale - 8, canvas_height / 2 / scale - 8, 8 * 2, 8 * 2, 4)
    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            map[locy + i][locx + j] = 0
            tile = new createjs.Shape()
            tile.graphics.beginBitmapFill(loader.getResult("0"), "repeat").drawRect(0, 0, 32, 32)
            tile.scale = scale
            //By default swapping between Stage for StageGL will not allow for vector drawing operation such as BitmapFill, useless you cache your shape.
            tile.cache(0, 0, 32, 32)
            tile.x = (i * 32) * scale + offsetx
            tile.y = (j * 32) * scale + offsety
            mapContainerback.addChild(tile)
        }
    }
    mapContainerorigin.scale = scale
    //By default swapping between Stage for StageGL will not allow for vector drawing operation such as BitmapFill, useless you cache your shape.
    stage.addChild(mapContainerback, player, mapContainerfront)
    startTick()
}

export function tick(body) {
    stage.update()
    let vec = body.GetPosition()
    player.x = vec.x * 30 - canvas_width / 2
    player.y = vec.y * 30 - canvas_height / 2
}