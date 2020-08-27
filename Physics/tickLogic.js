
let stage

export function init(mainLoopStage) {
    stage = mainLoopStage
}

export function tick() {
    stage.update();
}