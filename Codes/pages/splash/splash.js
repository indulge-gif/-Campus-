Page({
  data: {
    countdownText: '5秒后自动进入',
    timer: null
  },

  onLoad() {
    this.startCountdown()
  },

  startCountdown() {
    let seconds = 5
    this.setData({ countdownText: `${seconds}秒后自动进入` })
    
    this.data.timer = setInterval(() => {
      seconds--
      this.setData({ countdownText: `${seconds}秒后自动进入` })
      
      if (seconds <= 0) {
        clearInterval(this.data.timer)
        this.navigateToHome()
      }
    }, 1000)
  },

  navigateToHome() {
    clearInterval(this.data.timer)
    wx.redirectTo({
      url: '/pages/home/home'
    })
  }
})