function haversineMeters(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

Page({
  data: {
    locationName: "",
    image: "",
    description: "",
    distance: 0,
    walkMinutes: 0,
    startLat: null,
    startLng: null,
    endLat: null,
    endLng: null,
  },
  onLoad(options) {
    let dest = null;
    if (options.location) {
      try {
        dest = JSON.parse(decodeURIComponent(options.location));
      } catch (e) {}
    }
    if (dest) {
      this.setData({
        locationName: dest.name || "",
        image: dest.image || "",
        description: dest.description || "",
        endLat: dest.latitude,
        endLng: dest.longitude,
      });
    }
    this.fetchUserLocationAndDistance();
  },

  fetchUserLocationAndDistance() {
    wx.getSetting({
      success: (res) => {
        const authorized = res.authSetting && res.authSetting['scope.userLocation'];
        const getLoc = () => {
          wx.getLocation({
            type: 'gcj02',
            success: ({ latitude, longitude }) => {
              this.setData({ startLat: latitude, startLng: longitude });
              if (this.data.endLat != null && this.data.endLng != null) {
                const d = haversineMeters(latitude, longitude, this.data.endLat, this.data.endLng);
                this.setData({ distance: d, walkMinutes: Math.round(d / 80) });
              }
            },
            fail: () => {
              wx.showToast({ title: '定位失败，请在设置中授权', icon: 'none' });
            }
          });
        };
        if (authorized) {
          getLoc();
        } else {
          wx.authorize({
            scope: 'scope.userLocation',
            success: getLoc,
            fail: () => {
              wx.showModal({
                title: '需要位置信息',
                content: '用于计算距离与导航，请前往设置开启定位权限。',
                confirmText: '去设置',
                success: (res2) => {
                  if (res2.confirm) wx.openSetting();
                }
              });
            }
          });
        }
      }
    });
  },

  showRoute() {
    if (this.data.endLat == null || this.data.endLng == null) {
      wx.showToast({ title: '缺少目的地坐标', icon: 'none' });
      return;
    }

    // 直接使用系统地图，避免依赖路线规划插件
    wx.openLocation({
      latitude: this.data.endLat,
      longitude: this.data.endLng,
      name: this.data.locationName || '目的地',
      scale: 16
    });
  }
});