Page({
  data: {
    locationName: "",
    image: "",
    description: "",
    distance: 0
  },
  onLoad(options) {
    if (options.location) {
      const location = JSON.parse(decodeURIComponent(options.location));
      this.setData({
        locationName: location.name,
        image: location.image,
        description: location.description,
        distance: location.distance
      });
    }
  },
  showRoute() {
    const plugin = requirePlugin('tencentMapPlugin');
    plugin.routePlan({
      startLat: this.data.startLat,
      startLng: this.data.startLng,
      endLat: this.data.endLat,
      endLng: this.data.endLng,
      mode: 'walking',
      success: (res) => {
        wx.showToast({ title: '路线规划成功', icon: 'success' });
      },
      fail: (err) => {
        wx.showToast({ title: '路线规划失败', icon: 'none' });
      }
    });
  }
});