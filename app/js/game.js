function loop() {
    window.game.update()
    requestAnimationFrame(loop)
}

class Game {
    constructor() {
        this.canvasElement = document.createElement("canvas")
        this.canvasElement.width = 800
        this.canvasElement.height = 600
        this.gl = this.canvasElement.getContext("webgl2")
        console.log(this.gl.getParameter(this.gl.VERSION))
        console.log(this.gl.getParameter(this.gl.SHADING_LANGUAGE_VERSION))
        console.log(this.gl.getParameter(this.gl.VENDOR))
        document.body.appendChild(this.canvasElement)

        let vs = document.getElementById("vs_01").innerHTML;
        let fs = document.getElementById("fs_01").innerHTML


        this.sprite = new Sprite(this.gl, "img/grass.png", vs, fs)
    }

    update() {
        this.gl.viewport(0,0, this.canvasElement.width, this.canvasElement.height)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)

        this.gl.enable(this.gl.BLEND)
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SCR_ALPHA)

        this.sprite.render()

        this.gl.flush()
    }
}