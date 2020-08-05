class Material {
    constructor(gl, vs, fs) {
        this.gl = gl;
        this.vs = vs;
        this.fs = fs;

        let vsShader = this.getShader(vs, this.gl.VERTEX_SHADER)
        let fsShader = this.getShader(fs, this.gl.FRAGMENT_SHADER)

        if(vsShader && fsShader) {
            this.program = this.gl.createProgram()
            this.gl.attachShader(this.program, vsShader)
            this.gl.attachShader(this.program, fsShader)
            this.gl.linkProgram(this.program)

            if(!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
                console.error("Cannot load error: " + this.gl.getProgramInfoLog(this.program))
                return null
            }

            this.gl.detachShader(this.program, vsShader)
            this.gl.detachShader(this.program, fsShader)
            this.gl.deleteShader(vsShader)
            this.gl.deleteShader(fsShader)

            this.gl.useProgram(null)
        }
    }

    getShader(script, type) {
        let output = this.gl.createShader(type)
        this.gl.shaderSource(output, script)
        this.gl.compileShader(output)

        if(!this.gl.getShaderParameter(output, this.gl.COMPILE_STATUS)) {
            console.error("Shader error: " + this.gl.getShaderInfoLog(output))
            return null
        }

        return output
    }
}

class Sprite {
    constructor(gl, img_url, vs, fs) {
        this.gl = gl
        this.isLoaded = false
        this.material = new Material(this.gl, vs, fs)

        this.image = new Image()
        this.image.src = img_url
        this.image.Sprite = this
        this.image.onload = () => {
            this.gl.useProgram(this.material.program)
            this.gl_texture = this.gl.createTexture()

            this.gl.bindTexture(gl.TEXTURE_2D, this.gl_texture)
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.MIRRORED_REPEAT)
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.MIRRORED_REPEAT)
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEARIST)
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEARIST)
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image)
            this.gl.bindTexture(this.gl.TEXTURE_2D, null)

            this.tex_buff = this.gl.createBuffer()
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tex_buff)
            this.gl.bufferData(this.gl.ARRAY_BUFFER, Sprite.createRectArray(), this.gl.STATIC_DRAW)

            this.geo_buff = this.gl.createBuffer()
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geo_buff)
            this.gl.bufferData(this.gl.ARRAY_BUFFER, Sprite.createRectArray(), this.gl.STATIC_DRAW)

            this.aPositionLoc = this.gl.getAttribLocation(this.material.program, "a_position")
            this.aTexCoordLoc = this.gl.getAttribLocation(this.material.program, "a_textCoord")
            this.uImageLoc = this.gl.getUniformLocation(this.material.program, "u_image")
            this.gl.useProgram(null)
            this.isLoaded = true
        }
    }

    static createRectArray(x=0, y=0, w=1, h=1) {

        return new Float32Array([
            x, y,
            x + w, y,
            x, y + h,
            x, y + h,
            x + w, y,
            x + w, y + h,
        ])
    }

    render() {
        if(this.isLoaded) {
            this.gl.useProgram(this.material.program)

            this.gl.activeTexture(this.gl.TEXTURE0)
            this.gl.bindTexture(gl.TEXTURE_2D, this.gl_texture)
            this.gl.uniformli(this.uImageLoc, 0)

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tex_buff)
            this.gl.enableVertexAttribArray(this.aTexCoordLoc)
            this.gl.vertexAttribPointer(this.aTexCoordLoc, 2, this.gl.FLOAT, false, 0, 0)

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geo_buff)
            this.gl.enableVertexAttribArray(this.aPositionLoc)
            this.gl.vertexAttribPointer(this.aPositionLoc, 2, this.gl.FLOAT, false, 0, 0)


            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 6)

            this.gl.useProgram(null)
        }
    }
}