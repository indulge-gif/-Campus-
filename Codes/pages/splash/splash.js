Page({
  data: {
    countdownText: '4秒后自动进入',
    timer: null,
    seconds: 4
  },

  onLoad() {
    this.startCountdown()
  },

  onUnload() {
    this.clearTimer()
  },

  onHide() {
    this.clearTimer()
  },

  startCountdown() {
    this.clearTimer()
    let count = this.data.seconds
    this.setData({ seconds: count, countdownText: `${count}秒后自动进入` })

    this.data.timer = setInterval(() => {
      count -= 1
      this.setData({ seconds: count, countdownText: `${count}秒后自动进入` })

      if (count <= 0) {
        this.clearTimer()
        wx.nextTick(() => {
          this.navigateToHome()
        })
      }
    }, 1000)
  },

  navigateToHome() {
    this.clearTimer()
    wx.reLaunch({
      url: '/pages/home/home'
    })
  },

  clearTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
      this.setData({ timer: null })
    }
  }
})