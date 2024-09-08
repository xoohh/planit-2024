export class TextAnimation {
  //
  doAnimation = false
  timer = -1
  delay1 = 0
  delay2 = 0
  notify = (self: TextAnimation) => {}

  constructor(public notify) {}

  start() {
    this.doAnimation = false
    this.notify(this)

    clearTimeout(this.timer)
    setTimeout(() => {
      this.doAnimation = true
      this.delay1 = Math.floor(Math.random() * 1000) + 1000
      this.delay2 = Math.floor(Math.random() * 1000) + 1600
      this.notify(this)

      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.doAnimation = false
        this.notify(this)
      }, 10000)
      this.notify(this)
    }, 150)
  }

  stop() {
    clearTimeout(this.timer)
    this.doAnimation = false
    this.notify(this)
  }
}
