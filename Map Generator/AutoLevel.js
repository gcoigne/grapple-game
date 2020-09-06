const KEYCODE_ENTER = 13		//useful keycode
const KEYCODE_SPACE = 32		//useful keycode
const KEYCODE_UP = 38		    //useful keycode
const KEYCODE_DOWN = 40		    //useful keycode
const KEYCODE_LEFT = 37		    //useful keycode
const KEYCODE_RIGHT = 39		//useful keycode
const KEYCODE_W = 87			//useful keycode
const KEYCODE_A = 65			//useful keycode
const KEYCODE_S = 83			//useful keycode
const KEYCODE_D = 68			//useful keycode

let stage, player
let canvas_height, canvas_width
let map = [...Array(100)].map(() => [...Array(100)])
let mapSize = map.length
let locx = 50       //refering to the map
let locy = 50       //refering to the map
let lastlocx = 0    //in pixels
let lastlocy = 0    //in pixels
let chunkSize = 5   // needs to be a prime number
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

function init() {
    document.onkeydown = handleKeyDown
    document.onkeyup = handleKeyUp
    canvas = document.getElementById("game-canvas")
    canvas.getContext('2d').imageSmoothingEnabled = false
    canvas_height = canvas.height
    canvas_width = canvas.width
    offsetx = canvas_width / 2 - 16 * scale
    offsety = canvas_height / 2 - 16 * scale
    canvas.snapToPixel = true
    stage = new createjs.Stage(document.getElementById("game-canvas"))
    /*
    let data = {
        images: ["../Sprites/wall.png"],
        frames: {width:32, height:32}
    }
    let spriteSheet = new createjs.SpriteSheet(data)
    console.log(spriteSheet.getNumFrames())
    let animation = new createjs.Sprite(spriteSheet)
    */

    manifest = [
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
    createjs.Ticker.timingMode = createjs.Ticker.RAF
    createjs.Ticker.framerate = 60
    createjs.Ticker.on("tick", tick)
}

function generateSubChunk(xSubChunkPos, ySubChunkPos, x, y) {
    let posx = x + Math.round(Math.random())
    let posy = y + Math.round(Math.random())
    let initx = posx
    let inity = posy
    generateSpecific(posx, posy, 0)
    console.log(`chunk triggered ${xSubChunkPos} ${ySubChunkPos}`)
    while (posx % chunkSize != 0 && posy % chunkSize != 0) {
        posx += Math.round(Math.random())
        posy += Math.round(Math.random())
        generateSpecific(posx, posy, 0)
    }
    checkFloor(initx, inity, -1, -1)
}

function checkFloor(x, y, oriX, oriY){
    if(oriX + oriY == -2){
        oriX = x
        oriY = y
    }
    if(map[y + 1][x]){
        checkFloor(x, y, oriX, oriY)
    }
    if(map[y - 1][x]){
        checkFloor(x, y, oriX, oriY)
    }
    if(map[y][x]){
        checkFloor(x, y, oriX, oriY)
    }
    if(map[y][x - 1]){
        checkFloor(x, y, oriX, oriY)
    }
    if(map[y][x + 1]){
        checkFloor(x, y, oriX, oriY)
    }
}

function generate(x, y) {
    if (x == 0 && y == 0) {
        map[y][x] = 7
    }
    else if (x == 0 && y == mapSize - 1) {
        map[y][x] = 11
    }
    else if (x == mapSize - 1 && y == mapSize - 1) {
        map[y][x] = 9
    }
    else if (x == mapSize - 1 && y == 0) {
        map[y][x] = 5
    }
    else if (x == 0) {
        map[y][x] = 6
    }
    else if (y == 0) {
        map[y][x] = 10
    }
    else {
        let seed = undefined
        let rngelement = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        let spawn = false
        for (let i = y - 1; i <= y + 1; i++) {
            for (let j = x - 1; j <= x + 1; j++) {
                if (map[i][j] !== undefined) {
                    spawn = true
                    break
                }
            }
        }
        if (map[y][x] !== undefined) {
            spawn = false
        }
        if (spawn) {
            eleCounter++
            //I'm lazy and do not want to add complex logic to solve this problem.
            seed = tryElement(rngelement, x, y)
            if (seed !== undefined) {
                map[y][x] = seed
                if (seed != -1) {
                    tile = new createjs.Shape()
                    tile.graphics.beginBitmapFill(loader.getResult(seed)).drawRect(0, 0, 32, 32)
                    tile.scale = scale
                    //By default swapping between Stage for StageGL will not allow for vector drawing operation such as BitmapFill, useless you cache your shape.
                    tile.cache(0, 0, 32, 32)
                    tile.x = (x - 50) * 32 * scale + offsetx
                    tile.y = (y - 50) * 32 * scale + offsety
                    mapContainerback.addChild(tile)
                }
                text = new createjs.Text(`x${x} y${y}\n${eleCounter}\ntick ${tickCounter}\ntype ${seed}`, "15px Arial", "#ff7700")
                text.x = (x - 50) * 32 * scale + offsetx
                text.y = (y - 50) * 32 * scale + offsety + 16
                text.textBaseline = "alphabetic"
                mapContainerback.addChild(text)
            }
        }
    }
}

function generateSpecific(x, y, element) {
    map[y][x] = element
    if (element != -1) {
        tile = new createjs.Shape()
        tile.graphics.beginBitmapFill(loader.getResult(element)).drawRect(0, 0, 32, 32)
        tile.scale = scale
        //By default swapping between Stage for StageGL will not allow for vector drawing operation such as BitmapFill, useless you cache your shape.
        tile.cache(0, 0, 32, 32)
        tile.x = (x - 50) * 32 * scale + offsetx
        tile.y = (y - 50) * 32 * scale + offsety
        mapContainerback.addChild(tile)
    }
    text = new createjs.Text(`x${x} y${y}\n${eleCounter}\ntick ${tickCounter}\ntype ${element}`, "15px Arial", "#ff7700")
    text.x = (x - 50) * 32 * scale + offsetx
    text.y = (y - 50) * 32 * scale + offsety + 16
    text.textBaseline = "alphabetic"
    mapContainerback.addChild(text)
}

//This function was one of my worst decisions in life
//TODO wait for bugs
function tryElement(rngelement, x, y) {
    let seed = rngelement[Math.floor(Math.random() * rngelement.length)]
    switch (seed) {
        case -1:
            //north west check
            if (![-1, undefined].includes(map[y - 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(-1), 1)
                return tryElement(rngelement, x, y)
            }
            //north check
            if (![-1, undefined].includes(map[y - 1][x])) {
                rngelement.splice(rngelement.indexOf(-1), 1)
                return tryElement(rngelement, x, y)
            }
            //north east check
            if (![-1, undefined].includes(map[y - 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(-1), 1)
                return tryElement(rngelement, x, y)
            }
            //west check
            if (![-1, undefined].includes(map[y][x - 1])) {
                rngelement.splice(rngelement.indexOf(-1), 1)
                return tryElement(rngelement, x, y)
            }
            //east check
            if (![-1, undefined].includes(map[y][x + 1])) {
                rngelement.splice(rngelement.indexOf(-1), 1)
                return tryElement(rngelement, x, y)
            }
            //south west check
            if (![-1, undefined].includes(map[y + 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(-1), 1)
                return tryElement(rngelement, x, y)
            }
            //south check
            if (![-1, undefined].includes(map[y + 1][x])) {
                rngelement.splice(rngelement.indexOf(-1), 1)
                return tryElement(rngelement, x, y)
            }
            //south east check
            if (![-1, undefined].includes(map[y + 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(-1), 1)
                return tryElement(rngelement, x, y)
            }
            return seed
        case 0:
            //north west check
            if (![0, 2, 5, 7, 10, 11, 12, undefined].includes(map[y - 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(0), 1)
                return tryElement(rngelement, x, y)
            }
            //north check
            if (![0, 10, 11, 12, undefined].includes(map[y - 1][x])) {
                rngelement.splice(rngelement.indexOf(0), 1)
                return tryElement(rngelement, x, y)
            }
            //north east check
            if (![0, 1, 6, 8, 10, 11, 12, undefined].includes(map[y - 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(0), 1)
                return tryElement(rngelement, x, y)
            }
            //west check
            if (![0, 2, 5, 11, undefined].includes(map[y][x - 1])) {
                rngelement.splice(rngelement.indexOf(0), 1)
                return tryElement(rngelement, x, y)
            }
            //east check
            if (![0, 1, 6, 12, undefined].includes(map[y][x + 1])) {
                rngelement.splice(rngelement.indexOf(0), 1)
                return tryElement(rngelement, x, y)
            }
            //south west check
            if (![0, 1, 2, 3, 4, 5, 9, 11, undefined].includes(map[y + 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(0), 1)
                return tryElement(rngelement, x, y)
            }
            //south check
            if (![0, 1, 2, 9, undefined].includes(map[y + 1][x])) {
                rngelement.splice(rngelement.indexOf(0), 1)
                return tryElement(rngelement, x, y)
            }
            //south east check
            if (![0, 1, 2, 4, 6, 9, 12, undefined].includes(map[y + 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(0), 1)
                return tryElement(rngelement, x, y)
            }
            return seed
        case 1:
            //north west check
            if (![0, undefined].includes(map[y - 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(1), 1)
                return tryElement(rngelement, x, y)
            }
            //north check
            if (![0, undefined].includes(map[y - 1][x])) {
                rngelement.splice(rngelement.indexOf(1), 1)
                return tryElement(rngelement, x, y)
            }
            //north east check
            if (![0, 1, 6, undefined].includes(map[y - 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(1), 1)
                return tryElement(rngelement, x, y)
            }
            //west check
            if (![0, undefined].includes(map[y][x - 1])) {
                rngelement.splice(rngelement.indexOf(1), 1)
                return tryElement(rngelement, x, y)
            }
            //east check
            if (![4, 9, undefined].includes(map[y][x + 1])) {
                rngelement.splice(rngelement.indexOf(1), 1)
                return tryElement(rngelement, x, y)
            }
            //south west check
            if (![0, 1, 9, undefined].includes(map[y + 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(1), 1)
                return tryElement(rngelement, x, y)
            }
            //south check
            if (![4, 6, undefined].includes(map[y + 1][x])) {
                rngelement.splice(rngelement.indexOf(1), 1)
                return tryElement(rngelement, x, y)
            }
            //south east check
            if (![-1, undefined].includes(map[y + 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(1), 1)
                return tryElement(rngelement, x, y)
            }
            //exception checks
            if ([0].includes(map[y][x + 2])) {
                rngelement.splice(rngelement.indexOf(1), 1)
                return tryElement(rngelement, x, y)
            }

            if (map[y + 1][x + 1] != -1) {
                generateSpecific(x + 1, y + 1, -1)
            }
            if (map[y - 1][x - 1] != -1) {
                generateSpecific(x - 1, y - 1, 0)
            }
            return seed
        case 2:
            //north west check
            if (![0, 2, 5, undefined].includes(map[y - 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(2), 1)
                return tryElement(rngelement, x, y)
            }
            //north check
            if (![0, undefined].includes(map[y - 1][x])) {
                rngelement.splice(rngelement.indexOf(2), 1)
                return tryElement(rngelement, x, y)
            }
            //north easet check
            if (![0, undefined].includes(map[y - 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(2), 1)
                return tryElement(rngelement, x, y)
            }
            //west check
            if (![3, 9, undefined].includes(map[y][x - 1])) {
                rngelement.splice(rngelement.indexOf(2), 1)
                return tryElement(rngelement, x, y)
            }
            //east check
            if (![0, undefined].includes(map[y][x + 1])) {
                rngelement.splice(rngelement.indexOf(2), 1)
                return tryElement(rngelement, x, y)
            }
            //south west check
            if (![-1, 6, undefined].includes(map[y + 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(2), 1)
                return tryElement(rngelement, x, y)
            }
            //south check
            if (![3, 5, undefined].includes(map[y + 1][x])) {
                rngelement.splice(rngelement.indexOf(2), 1)
                return tryElement(rngelement, x, y)
            }
            //south east check
            if (![0, 2, 9, undefined].includes(map[y + 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(2), 1)
                return tryElement(rngelement, x, y)
            }
            //exception checks
            if ([0].includes(map[y][x - 2])) {
                rngelement.splice(rngelement.indexOf(2), 1)
                return tryElement(rngelement, x, y)
            }
            if ([11].includes(map[y - 1][x + 3])) {
                rngelement.splice(rngelement.indexOf(2), 1)
                return tryElement(rngelement, x, y)
            }

            if (map[y + 1][x - 1] != -1) {
                generateSpecific(x - 1, y + 1, -1)
            }
            return seed
        case 3:
            //north west check
            if (![-1, 3, 6, 8, 9, 12, undefined].includes(map[y - 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(3), 1)
                return tryElement(rngelement, x, y)
            }
            //north check
            if (![2, 5, undefined].includes(map[y - 1][x])) {
                rngelement.splice(rngelement.indexOf(3), 1)
                return tryElement(rngelement, x, y)
            }
            //north east check
            if (![0, undefined].includes(map[y - 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(3), 1)
                return tryElement(rngelement, x, y)
            }
            //west check
            if (![-1, undefined].includes(map[y][x - 1])) {
                rngelement.splice(rngelement.indexOf(3), 1)
                return tryElement(rngelement, x, y)
            }
            //east check
            if (![2, 9, undefined].includes(map[y][x + 1])) {
                rngelement.splice(rngelement.indexOf(3), 1)
                return tryElement(rngelement, x, y)
            }
            //south west check
            if (![-1, undefined].includes(map[y + 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(3), 1)
                return tryElement(rngelement, x, y)
            }
            //south check
            if (![-1, undefined].includes(map[y + 1][x])) {
                rngelement.splice(rngelement.indexOf(3), 1)
                return tryElement(rngelement, x, y)
            }
            //south east check
            if (![-1, 3, 5, undefined].includes(map[y + 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(3), 1)
                return tryElement(rngelement, x, y)
            }
            if (map[y][x - 1] != -1) {
                generateSpecific(x - 1, y, -1)
            }
            if (map[y + 1][x] != -1) {
                generateSpecific(x, y + 1, -1)
            }
            if (map[y + 1][x - 1] != -1) {
                generateSpecific(x - 1, y + 1, -1)
            }
            return seed
        case 4:
            //north west check
            if (![0, undefined].includes(map[y - 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(4), 1)
                return tryElement(rngelement, x, y)
            }
            //north check
            if (![1, 6, 8, undefined].includes(map[y - 1][x])) {
                rngelement.splice(rngelement.indexOf(4), 1)
                return tryElement(rngelement, x, y)
            }
            //north east check
            if (![-1, 4, 7, 9, undefined].includes(map[y - 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(4), 1)
                return tryElement(rngelement, x, y)
            }
            //west check
            if (![1, 9, undefined].includes(map[y][x - 1])) {
                rngelement.splice(rngelement.indexOf(4), 1)
                return tryElement(rngelement, x, y)
            }
            //east check
            if (![-1, undefined].includes(map[y][x + 1])) {
                rngelement.splice(rngelement.indexOf(4), 1)
                return tryElement(rngelement, x, y)
            }
            //south west check
            if (![-1, 4, 6, undefined].includes(map[y + 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(4), 1)
                return tryElement(rngelement, x, y)
            }
            //south check
            if (![-1, 7, undefined].includes(map[y + 1][x])) {
                rngelement.splice(rngelement.indexOf(4), 1)
                return tryElement(rngelement, x, y)
            }
            //south east check
            if (![-1, undefined].includes(map[y + 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(4), 1)
                return tryElement(rngelement, x, y)
            }
            //exception checks
            if ([0].includes(map[y + 1][x - 2])) {
                rngelement.splice(rngelement.indexOf(4), 1)
                return tryElement(rngelement, x, y)
            }
            if ([-1].includes(map[y][x - 2])) {
                rngelement.splice(rngelement.indexOf(4), 1)
                return tryElement(rngelement, x, y)
            }

            if (map[y][x + 1] != -1) {
                generateSpecific(x + 1, y, -1)
            }
            if (map[y + 1][x] != -1) {
                generateSpecific(x, y + 1, -1)
            }
            if (map[y + 1][x + 1] != -1) {
                generateSpecific(x + 1, y + 1, -1)
            }
            return seed
        case 5:
            //north west check
            if (![-1, 1, 3, 8, 9, undefined].includes(map[y - 1][x - 1])) {
                console.log(`type 5 failed at nw check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(5), 1)
                return tryElement(rngelement, x, y)
            }
            //north check
            if (![2, 5, 7, undefined].includes(map[y - 1][x])) {
                console.log(`type 5 failed at n check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(5), 1)
                return tryElement(rngelement, x, y)
            }
            //north east check
            if (![0, 10, 11, undefined].includes(map[y - 1][x + 1])) {
                console.log(`type 5 failed at ne check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(5), 1)
                return tryElement(rngelement, x, y)
            }
            //west check
            if (![-1, undefined].includes(map[y][x - 1])) {
                console.log(`type 5 failed at w check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(5), 1)
                return tryElement(rngelement, x, y)
            }
            //east check
            if (![0, undefined].includes(map[y][x + 1])) {
                console.log(`type 5 failed at e check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(5), 1)
                return tryElement(rngelement, x, y)
            }
            //south west check
            if (![-1, 4, 7, 10, undefined].includes(map[y + 1][x - 1])) {
                console.log(`type 5 failed at sw check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(5), 1)
                return tryElement(rngelement, x, y)
            }
            //south check
            if (![3, 5, 11, undefined].includes(map[y + 1][x])) {
                console.log(`type 5 failed at s check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(5), 1)
                return tryElement(rngelement, x, y)
            }
            //south east check
            if (![0, 2, 9, undefined].includes(map[y + 1][x + 1])) {
                console.log(`type 5 failed at se check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(5), 1)
                return tryElement(rngelement, x, y)
            }
            console.log(`type 5 success at ${x} ${y}`)
            if (map[y][x - 1] != -1) {
                generateSpecific(x - 1, y, -1)
            }
            return seed
        case 6:
            //north west check
            if (![0, 10, 12, undefined].includes(map[y - 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(6), 1)
                return tryElement(rngelement, x, y)
            }
            //north check
            if (![1, 6, 8, undefined].includes(map[y - 1][x])) {
                rngelement.splice(rngelement.indexOf(6), 1)
                return tryElement(rngelement, x, y)
            }
            //north east check
            if (![-1, 2, 4, 9, undefined].includes(map[y - 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(6), 1)
                return tryElement(rngelement, x, y)
            }
            //west check
            if (![0, undefined].includes(map[y][x - 1])) {
                rngelement.splice(rngelement.indexOf(6), 1)
                return tryElement(rngelement, x, y)
            }
            //east check
            if (![-1, undefined].includes(map[y][x + 1])) {
                rngelement.splice(rngelement.indexOf(6), 1)
                return tryElement(rngelement, x, y)
            }
            //south west check
            if (![0, 1, 9, undefined].includes(map[y + 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(6), 1)
                return tryElement(rngelement, x, y)
            }
            //south check
            if (![4, 6, 12, undefined].includes(map[y + 1][x])) {
                rngelement.splice(rngelement.indexOf(6), 1)
                return tryElement(rngelement, x, y)
            }
            //south east check
            if (![-1, 8, 10, undefined].includes(map[y + 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(6), 1)
                return tryElement(rngelement, x, y)
            }
            if (map[y][x + 1] != -1) {
                generateSpecific(x + 1, y, -1)
            }
            return seed
        case 7:
            //north west check
            if (![-1, 8, 9, undefined].includes(map[y - 1][x - 1])) {
                console.log(`type 7 failed at nw check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(7), 1)
                return tryElement(rngelement, x, y)
            }
            //north check
            if (![-1, undefined].includes(map[y - 1][x])) {
                console.log(`type 7 failed at n check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(7), 1)
                return tryElement(rngelement, x, y)
            }
            //north east check
            if (![-1, 5, 7, undefined].includes(map[y - 1][x + 1])) {
                console.log(`type 7 failed at ne check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(7), 1)
                return tryElement(rngelement, x, y)
            }
            //west check
            if (![-1, undefined].includes(map[y][x - 1])) {
                console.log(`type 7 failed at w check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(7), 1)
                return tryElement(rngelement, x, y)
            }
            //east check
            if (![10, 11, undefined].includes(map[y][x + 1])) {
                console.log(`type 7 failed at e check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(7), 1)
                return tryElement(rngelement, x, y)
            }
            //south west check
            if (![-1, 6, 7, 10, undefined].includes(map[y + 1][x - 1])) {
                console.log(`type 7 failed at sw check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(7), 1)
                return tryElement(rngelement, x, y)
            }
            //south check
            if (![5, 11, undefined].includes(map[y + 1][x])) {
                console.log(`type 7 failed at s check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(7), 1)
                return tryElement(rngelement, x, y)
            }
            //south east check
            if (![0, undefined].includes(map[y + 1][x + 1])) {
                console.log(`type 7 failed at se check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(7), 1)
                return tryElement(rngelement, x, y)
            }
            //exception checks
            if ([1].includes(map[y][x - 2])) {
                rngelement.splice(rngelement.indexOf(7), 1)
                return tryElement(rngelement, x, y)
            }
            if ([1].includes(map[y - 1][x - 2])) {
                rngelement.splice(rngelement.indexOf(7), 1)
                return tryElement(rngelement, x, y)
            }
            if ([4].includes(map[y][x - 2])) {
                rngelement.splice(rngelement.indexOf(7), 1)
                return tryElement(rngelement, x, y)
            }

            if (map[y - 1][x - 1] != -1) {
                generateSpecific(x - 1, y - 1, -1)
            }
            if (map[y - 1][x] != -1) {
                generateSpecific(x, y - 1, -1)
            }
            if (map[y][x - 1] != -1) {
                generateSpecific(x - 1, y, -1)
            }
            return seed
        case 8:
            //north west check
            if (![-1, 6, 8, undefined].includes(map[y - 1][x - 1])) {
                console.log(`type 8 failed at nw check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(8), 1)
                return tryElement(rngelement, x, y)
            }
            //north check
            if (![-1, undefined].includes(map[y - 1][x])) {
                console.log(`type 8 failed at n check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(8), 1)
                return tryElement(rngelement, x, y)
            }
            //north east check
            if (![-1, 9, undefined].includes(map[y - 1][x + 1])) {
                console.log(`type 8 failed at ne check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(8), 1)
                return tryElement(rngelement, x, y)
            }
            //west check
            if (![10, 12, undefined].includes(map[y][x - 1])) {
                console.log(`type 8 failed at w check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(8), 1)
                return tryElement(rngelement, x, y)
            }
            //east check
            if (![-1, undefined].includes(map[y][x + 1])) {
                console.log(`type 8 failed at e check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(8), 1)
                return tryElement(rngelement, x, y)
            }
            //south west check
            if (![0, undefined].includes(map[y + 1][x - 1])) {
                console.log(`type 8 failed at sw check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(8), 1)
                return tryElement(rngelement, x, y)
            }
            //south check
            if (![6, 12, undefined].includes(map[y + 1][x])) {
                console.log(`type 8 failed at s check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(8), 1)
                return tryElement(rngelement, x, y)
            }
            //south east check
            if (![-1, 8, 10, undefined].includes(map[y + 1][x + 1])) {
                console.log(`type 8 failed at se check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(8), 1)
                return tryElement(rngelement, x, y)
            }
            //exception checks
            if ([0].includes(map[y - 2][x + 1])) {
                rngelement.splice(rngelement.indexOf(8), 1)
                return tryElement(rngelement, x, y)
            }
            if ([11].includes(map[y + 2][x + 2])) {
                rngelement.splice(rngelement.indexOf(8), 1)
                return tryElement(rngelement, x, y)
            }

            if (map[y - 1][x] != -1) {
                generateSpecific(x, y - 1, -1)
            }
            if (map[y - 1][x + 1] != -1) {
                generateSpecific(x + 1, y - 1, -1)
            }
            if (map[y][x + 1] != -1) {
                generateSpecific(x + 1, y, -1)
            }
            return seed
        case 9:
            //north west check
            if (![0, 2, 5, undefined].includes(map[y - 1][x - 1])) {
                console.log(`type 9 failed at nw check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(9), 1, 1)
                return tryElement(rngelement, x, y)
            }
            //north check
            if (![0, undefined].includes(map[y - 1][x])) {
                console.log(`type 9 failed at n check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(9), 1, 1)
                return tryElement(rngelement, x, y)
            }
            //north east check
            if (![0, 1, 6, undefined].includes(map[y - 1][x + 1])) {
                console.log(`type 9 failed at ne check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(9), 1)
                return tryElement(rngelement, x, y)
            }
            //west check
            if (![1, 3, 9, undefined].includes(map[y][x - 1])) {
                console.log(`type 9 failed at w check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(9), 1)
                return tryElement(rngelement, x, y)
            }
            //east check
            if (![2, 4, 9, undefined].includes(map[y][x + 1])) {
                console.log(`type 9 failed at e check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(9), 1)
                return tryElement(rngelement, x, y)
            }
            //south west check
            if (![-1, 4, 6, 12, undefined].includes(map[y + 1][x - 1])) {
                console.log(`type 9 failed at sw check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(9), 1)
                return tryElement(rngelement, x, y)
            }
            //south check
            if (![-1, undefined].includes(map[y + 1][x])) {
                console.log(`type 9 failed at s check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(9), 1)
                return tryElement(rngelement, x, y)
            }
            //south east check
            if (![-1, 3, 5, 11, undefined].includes(map[y + 1][x + 1])) {
                console.log(`type 9 failed at se check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(9), 1)
                return tryElement(rngelement, x, y)
            }
            if (map[y + 1][x] != -1) {
                generateSpecific(x, y + 1, -1)
            }
            return seed
        case 10:
            //north west check
            if (![-1, 6, 8, undefined].includes(map[y - 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(10), 1)
                return tryElement(rngelement, x, y)
            }
            //north check
            if (![-1, undefined].includes(map[y - 1][x])) {
                rngelement.splice(rngelement.indexOf(10), 1)
                return tryElement(rngelement, x, y)
            }
            //north east check
            if (![-1, 3, 5, 7, undefined].includes(map[y - 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(10), 1)
                return tryElement(rngelement, x, y)
            }
            //west check
            if (![7, 10, 12, undefined].includes(map[y][x - 1])) {
                rngelement.splice(rngelement.indexOf(10), 1)
                return tryElement(rngelement, x, y)
            }
            //east check
            if (![8, 10, 11, undefined].includes(map[y][x + 1])) {
                rngelement.splice(rngelement.indexOf(10), 1)
                return tryElement(rngelement, x, y)
            }
            //south west check
            if (![0, 5, 11, undefined].includes(map[y + 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(10), 1)
                return tryElement(rngelement, x, y)
            }
            //south check
            if (![0, undefined].includes(map[y + 1][x])) {
                rngelement.splice(rngelement.indexOf(10), 1)
                return tryElement(rngelement, x, y)
            }
            //south east check
            if (![0, 6, 12, undefined].includes(map[y + 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(10), 1)
                return tryElement(rngelement, x, y)
            }
            if (map[y - 1][x] != -1) {
                generateSpecific(x, y - 1, -1)
            }
            return seed
        case 11:
            //north west check
            if (![-1, 6, 8, undefined].includes(map[y - 1][x - 1])) {
                console.log(`type 11 failed at nw check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(11), 1)
                return tryElement(rngelement, x, y)
            }
            //north check
            if (![5, 7, undefined].includes(map[y - 1][x])) {
                console.log(`type 11 failed at n check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(11), 1)
                return tryElement(rngelement, x, y)
            }
            //north east check
            if (![0, 10, 11, undefined].includes(map[y - 1][x + 1])) {
                console.log(`type 11 failed at ne check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(11), 1)
                return tryElement(rngelement, x, y)
            }
            //west check
            if (![7, 10, undefined].includes(map[y][x - 1])) {
                console.log(`type 11 failed at w check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(11), 1)
                return tryElement(rngelement, x, y)
            }
            //east check
            if (![0, undefined].includes(map[y][x + 1])) {
                console.log(`type 11 failed at e check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(11), 1)
                return tryElement(rngelement, x, y)
            }
            //south west check
            if (![0, 5, 11, undefined].includes(map[y + 1][x - 1])) {
                console.log(`type 11 failed at sw check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(11), 1)
                return tryElement(rngelement, x, y)
            }
            //south check
            if (![0, undefined].includes(map[y + 1][x])) {
                console.log(`type 11 failed at s check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(11), 1)
                return tryElement(rngelement, x, y)
            }
            //south east check
            if (![0, undefined].includes(map[y + 1][x + 1])) {
                console.log(`type 11 failed at se check ${x} ${y}`)
                rngelement.splice(rngelement.indexOf(11), 1)
                return tryElement(rngelement, x, y)
            }
            //exception checks
            if ([0].includes(map[y][x - 2])) {
                rngelement.splice(rngelement.indexOf(11), 1)
                return tryElement(rngelement, x, y)
            }

            console.log(`type 11 zsuccess at ${x} ${y}`)
            if (map[y - 1][x - 1] != -1) {
                generateSpecific(x - 1, y - 1, -1)
            }
            return seed
        case 12:
            //north west check
            if (![0, 10, 12, undefined].includes(map[y - 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(12), 1)
                return tryElement(rngelement, x, y)
            }
            //north check
            if (![6, 8, undefined].includes(map[y - 1][x])) {
                rngelement.splice(rngelement.indexOf(12), 1)
                return tryElement(rngelement, x, y)
            }
            //north east check
            if (![-1, 3, 7, 9, undefined].includes(map[y - 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(12), 1)
                return tryElement(rngelement, x, y)
            }
            //west check
            if (![0, undefined].includes(map[y][x - 1])) {
                rngelement.splice(rngelement.indexOf(12), 1)
                return tryElement(rngelement, x, y)
            }
            //east check
            if (![2, 8, 10, undefined].includes(map[y][x + 1])) {
                rngelement.splice(rngelement.indexOf(12), 1)
                return tryElement(rngelement, x, y)
            }
            //south west check
            if (![0, undefined].includes(map[y + 1][x - 1])) {
                rngelement.splice(rngelement.indexOf(12), 1)
                return tryElement(rngelement, x, y)
            }
            //south check
            if (![-1, 0, undefined].includes(map[y + 1][x])) {
                rngelement.splice(rngelement.indexOf(12), 1)
                return tryElement(rngelement, x, y)
            }
            //south east check
            if (![0, 6, 12, undefined].includes(map[y + 1][x + 1])) {
                rngelement.splice(rngelement.indexOf(12), 1)
                return tryElement(rngelement, x, y)
            }
            //exception checks
            if ([0].includes(map[y][x + 2])) {
                rngelement.splice(rngelement.indexOf(12), 1)
                return tryElement(rngelement, x, y)
            }
            if ([0].includes(map[y - 2][x])) {
                rngelement.splice(rngelement.indexOf(12), 1)
                return tryElement(rngelement, x, y)
            }
            if ([1].includes(map[y - 1][x - 2])) {
                rngelement.splice(rngelement.indexOf(12), 1)
                return tryElement(rngelement, x, y)
            }

            if (map[y - 1][x + 1] != -1) {
                generateSpecific(x + 1, y - 1, -1)
            }
            return seed
    }
}

async function tick() {
    let pt
    let xdif
    let ydif
    let moved = false
    if (fwHeld && lfHeld) {
        mapContainerfront.y += movementScale * 2 / 3
        mapContainerback.y += movementScale * 2 / 3
        mapContainerfloor.y += movementScale * 2 / 3
        mapContainerorigin.y += movementScale * 2 / 3
        mapContainerfront.x += movementScale * 2 / 3
        mapContainerback.x += movementScale * 2 / 3
        mapContainerfloor.x += movementScale * 2 / 3
        mapContainerorigin.x += movementScale * 2 / 3
        pt = player.localToLocal(0, 0, mapContainerback)
        moved = true

    }
    else if (fwHeld && rtHeld) {
        mapContainerfront.y += movementScale * 2 / 3
        mapContainerback.y += movementScale * 2 / 3
        mapContainerfloor.y += movementScale * 2 / 3
        mapContainerorigin.y += movementScale * 2 / 3
        mapContainerfront.x -= movementScale * 2 / 3
        mapContainerback.x -= movementScale * 2 / 3
        mapContainerfloor.x -= movementScale * 2 / 3
        mapContainerorigin.x -= movementScale * 2 / 3
        pt = player.localToLocal(0, 0, mapContainerback)
        moved = true

    }
    else if (bkHeld && lfHeld) {
        mapContainerfront.y -= movementScale * 2 / 3
        mapContainerback.y -= movementScale * 2 / 3
        mapContainerfloor.y -= movementScale * 2 / 3
        mapContainerorigin.y -= movementScale * 2 / 3
        mapContainerfront.x += movementScale * 2 / 3
        mapContainerback.x += movementScale * 2 / 3
        mapContainerfloor.x += movementScale * 2 / 3
        mapContainerorigin.x += movementScale * 2 / 3
        pt = player.localToLocal(0, 0, mapContainerback)
        moved = true

    }
    else if (bkHeld && rtHeld) {
        mapContainerfront.y -= movementScale * 2 / 3
        mapContainerback.y -= movementScale * 2 / 3
        mapContainerfloor.y -= movementScale * 2 / 3
        mapContainerorigin.y -= movementScale * 2 / 3
        mapContainerfront.x -= movementScale * 2 / 3
        mapContainerback.x -= movementScale * 2 / 3
        mapContainerfloor.x -= movementScale * 2 / 3
        mapContainerorigin.x -= movementScale * 2 / 3
        pt = player.localToLocal(0, 0, mapContainerback)
        moved = true

    }
    else if (fwHeld) {
        mapContainerfront.y += movementScale
        mapContainerback.y += movementScale
        mapContainerfloor.y += movementScale
        mapContainerorigin.y += movementScale
        pt = player.localToLocal(0, -32 * 2 * scale, mapContainerorigin)
        moved = true
    }
    else if (lfHeld) {
        mapContainerfront.x += movementScale
        mapContainerback.x += movementScale
        mapContainerfloor.x += movementScale
        mapContainerorigin.x += movementScale
        pt = player.localToLocal(-32 * 2 * scale, 0, mapContainerorigin)
        moved = true
    }
    else if (bkHeld) {
        mapContainerfront.y -= movementScale
        mapContainerback.y -= movementScale
        mapContainerfloor.y -= movementScale
        mapContainerorigin.y -= movementScale
        pt = player.localToLocal(0, 32 * 2 * scale, mapContainerorigin)
        moved = true
    }
    else if (rtHeld) {
        mapContainerfront.x -= movementScale
        mapContainerback.x -= movementScale
        mapContainerfloor.x -= movementScale
        mapContainerorigin.x -= movementScale
        pt = player.localToLocal(32 * 2 * scale, 0, mapContainerorigin)
        moved = true
    }
    if (pt) {
        xdif = (pt.x - lastlocx)
        ydif = (pt.y - lastlocy)
        if (xdif < 0) {
            if (Math.ceil(xdif / (32 * scale)) !== 0) {
                locx += Math.ceil(xdif / (32 * scale))
                lastlocx += Math.ceil(xdif / (32 * scale)) * 32
            }
        }
        else {
            if (Math.floor(xdif / (32 * scale)) !== 0) {
                locx += Math.floor(xdif / (32 * scale))
                lastlocx += Math.floor(xdif / (32 * scale)) * 32
            }
        }
        if (ydif < 0) {
            if (Math.ceil(ydif / (32 * scale)) !== 0) {
                locy += Math.ceil(ydif / (32 * scale))
                lastlocy += Math.ceil(ydif / (32 * scale)) * 32
            }
        }
        else {
            if (Math.floor(ydif / (32 * scale)) !== 0) {
                locy += Math.floor(ydif / (32 * scale))
                lastlocy += Math.floor(ydif / (32 * scale)) * 32
            }

        }
    }
    if (moved) {
        let loadDirection = 0
        xSubChunkPos = Math.floor(locx / chunkSize) * chunkSize
        ySubChunkPos = Math.floor(locy / chunkSize) * chunkSize
        generateSubChunk(ySubChunkPos, xSubChunkPos, locx, locy)
        // if (xSubChunkPos == 0 && ySubChunkPos == 0) {
        //     //generateSubChunk(ySubChunkPos - chunkSize, xSubChunkPos - chunkSize, dir)
        //     //generateSubChunk(ySubChunkPos - chunkSize, xSubChunkPos - chunkSize, dir)
        // }
        // else if (xSubChunkPos == 0 && y == mapSize - 1) {
        //     generateSubChunk()
        // }
        // else if (xSubChunkPos == mapSize - 1 && y == mapSize - 1) {
        // }
        // else if (xSubChunkPos == mapSize - 1 && y == 0) {
        // }
        // else if (xSubChunkPos == 0) {
        // }
        // else if (ySubChunkPos == 0) {
        // }
        // else {
        //     generateSubChunk(ySubChunkPos, xSubChunkPos, dir)
        // }
    }
    tickCounter++
    stage.update()
}

//allow for WASD and arrow control scheme
function handleKeyDown(e) {
    //cross browser issues exist
    if (!e) {
        var e = window.event
    }
    switch (e.keyCode) {
        case KEYCODE_A:
        case KEYCODE_LEFT:
            lfHeld = true
            break
        case KEYCODE_D:
        case KEYCODE_RIGHT:
            rtHeld = true
            break
        case KEYCODE_W:
        case KEYCODE_UP:
            fwHeld = true
            break
        case KEYCODE_S:
        case KEYCODE_DOWN:
            bkHeld = true
            break
    }
}

function handleKeyUp(e) {
    //cross browser issues exist
    if (!e) {
        var e = window.event
    }
    switch (e.keyCode) {
        case KEYCODE_A:
        case KEYCODE_LEFT:
            lfHeld = false
            break
        case KEYCODE_D:
        case KEYCODE_RIGHT:
            rtHeld = false
            break
        case KEYCODE_W:
        case KEYCODE_UP:
            fwHeld = false
            break
        case KEYCODE_S:
        case KEYCODE_DOWN:
            bkHeld = false
            break
    }
}

init()