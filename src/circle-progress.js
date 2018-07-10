/**
 * 参考 jquery-circle-progress 插件
 * URL: http://kottenator.github.io/jquery-circle-progress/
 */
class CircleProgress {
  constructor(config = {}) {
    // piblic options
    this.el = config.el // Container element
    this.value = config.value || 0.0
    this.lastFrameValue = config.lastFrameValue || 0 // 最后一帧的值
    this.size = config.size || 100.0
    this.startAngle = config.startAngle || -Math.PI / 2
    this.thickness = config.thickness || 'auto'
    this.fill = config.fill || {
      gradientAngle: 2 * Math.PI,
      gradientDirection: null,
      gradient: ['red', 'pink'],
      color: 'red',
      image: ''
    }
    this.emptyFill = config.emptyFill || 'rgba(0, 0, 0, .1)'
    this.animation = config.animation // {duration: 1200, progress:()=>{}, end:()=>{}}
    this.reverse = config.reverse || false
    this.lineCap = config.lineCap || 'butt'

    // protected options Automatically generated or calculated
    this.canvas = null // Canvas element
    this.ctx = null // 2D-context
    this.radius = 0.0
    this.arcFill = null
    this.t = -1

    this.init()
  }

  /**
   * 初始化
   */
  init() {
    this.radius = this.size / 2
    this.initWidget()
    this.initFill()
    this.draw()
  }

  /**
   * 初始化canvas控件
   */
  initWidget() {
    if (!this.el) throw Error('The el is not specified!')
    if (!this.canvas) {
      let canvas = document.createElement('canvas')
      this.el.appendChild(canvas)
      this.canvas = canvas
    }
    let canvas = this.canvas
    canvas.width = this.size
    canvas.height = this.size
    this.ctx = canvas.getContext('2d')
  }

  /**
   * 填充颜色
   */
  initFill() {
    let fill = this.fill
    let ctx = this.ctx
    let size = this.size

    if (!fill) throw Error('The fill is not specified!')

    if (fill.color) this.arcFill = fill.color

    if (fill.gradient) {
      let gr = fill.gradient

      if (gr.length === 1) {
        this.arcFill = gr[0]
      } else if (gr.length > 1) {
        let ga = fill.gradientAngle || 0 // gradient direction angle; 0 by default
        let gd = fill.gradientDirection || [
          (size / 2) * (1 - Math.cos(ga)), // x0
          (size / 2) * (1 + Math.sin(ga)), // y0
          (size / 2) * (1 + Math.cos(ga)), // x1
          (size / 2) * (1 - Math.sin(ga)) // y1
        ]

        var lg = ctx.createLinearGradient.apply(ctx, gd)

        for (let i = 0; i < gr.length; i++) {
          let color = gr[i]
          let pos = i / (gr.length - 1)
          lg.addColorStop(pos, color)
        }
      }

      this.arcFill = lg
    }

    // 填充图片
    let img
    let self = this
    if (fill.image) {
      if (fill.image instanceof Image) {
        img = fill.image
      } else {
        img = new Image()
        img.src = fill.image
      }

      if (img.complete) setImageFill()
      else img.onload = setImageFill
    }

    function setImageFill() {
      let bg = document.createElement('canvas')
      bg.width = self.size
      bg.height = self.size
      bg.getContext('2d').drawImage(img, 0, 0, size, size)
      self.arcFill = self.ctx.createPattern(bg, 'no-repeat')
      self.drawFrame(self.value)
    }
  }

  /**
   * 绘图
   */
  draw() {
    if (this.animation) this.drawAnimated(this.value)
    else this.drawFrame(this.value)
  }

  /**
   * 画帧图
   * @param {Number} v 进度条值 0.0 - 1.0 之间的数值
   */
  drawFrame(v) {
    this.ctx.clearRect(0, 0, this.size, this.size)
    this.drawEmptyArc(v)
    this.drawArc(v)
  }

  /**
   * 画进度条
   * context.arc(x,y,r,sAngle,eAngle,counterclockwise);
   * @param {Number} v 进度条值 0.0 - 1.0 之间的数值
   */
  drawArc(v) {
    let ctx = this.ctx
    let r = this.radius
    let t = this.getThickness()
    let a = this.startAngle

    ctx.save()
    ctx.beginPath()

    // 圆形路径画实心线，所以路径的绘制位置为 r - t / 2
    if (!this.reverse) {
      // 正向 = 起始角度 -> 起始角度 + v所对应的弧长
      ctx.arc(r, r, r - t / 2, a, a + Math.PI * 2 * v)
    } else {
      // 正向 = 起始角度 - v所对应的弧长 -> 起始角度
      ctx.arc(r, r, r - t / 2, a - Math.PI * 2 * v, a)
    }

    ctx.lineWidth = t
    ctx.lineCap = this.lineCap
    ctx.strokeStyle = this.arcFill
    ctx.stroke()
    ctx.restore()
  }

  /**
   * 进度条背景弧
   * @param {Number} v 进度条值 0.0 - 1.0 之间的数值
   */
  drawEmptyArc(v) {
    let ctx = this.ctx
    let r = this.radius
    let t = this.getThickness()
    let a = this.startAngle

    if (v < 1) {
      ctx.save()
      ctx.beginPath()

      if (v <= 0) {
        ctx.arc(r, r, r - t / 2, 0, Math.PI * 2)
      } else {
        if (!this.reverse) {
          // 正向 = 起始角度 + v所对应的弧长 ->起始角度 (进度条背景圆弧与进度条圆弧首尾相接)
          ctx.arc(r, r, r - t / 2, a + Math.PI * 2 * v, a)
        } else {
          ctx.arc(r, r, r - t / 2, a, a - Math.PI * 2 * v)
        }
      }
      ctx.lineWidth = t
      ctx.strokeStyle = this.emptyFill
      ctx.stroke()
      ctx.restore()
    }
  }

  /**
   * 动画帧
   */
  drawAnimated() {
    this.lastFrameValue += 0.01
    this.drawFrame(this.lastFrameValue)

    this.t = setTimeout(() => {
      this.drawAnimated()
      let percent = (this.lastFrameValue * 100).toFixed(0)
      typeof this.animation.progress === 'function' && this.animation.progress(percent)
    }, this.animation.duration / (100 * this.value))

    if (this.lastFrameValue >= this.value) {
      clearTimeout(this.t)
    }
  }

  /**
   * 获取圆弧的厚度
   */
  getThickness() {
    return this.isRealNum(this.thickness) ? Number.parseFloat(this.thickness) : this.size / 14
  }

  /**
   * 判断是否是数值
   * @param {Object} v 任意数据
   */
  isRealNum(v) {
    if (v === '' || v === null) return false
    if (!isNaN(v)) {
      return true
    } else {
      return false
    }
  }
}

export default CircleProgress
