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

function isDevtoolsEnv() {
  try {
    const info = wx.getSystemInfoSync();
    return info && info.platform === 'devtools';
  } catch (e) {
    return false;
  }
}

Page({
  data: {
    locationName: "",
    image: "",
    description: "",
    buildingKey: "",
    floor: null,
    roomNo: "",
    floorPlanImage: "",
    floorPlanHint: "",
    distance: null,
    walkMinutes: null,
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
        buildingKey: dest.buildingKey || "",
        floor: dest.floor || null,
        roomNo: dest.roomNo || "",
        floorPlanImage: dest.floorPlanImage || "",
        floorPlanHint: dest.floorPlanHint || "",
        endLat: dest.latitude,
        endLng: dest.longitude,
      });
    }
    this.tryUpdateDistanceSilent();
  },

  updateDistanceAndTime() {
    const { startLat, startLng, endLat, endLng } = this.data;
    if (startLat == null || startLng == null || endLat == null || endLng == null) return;
    const d = haversineMeters(startLat, startLng, endLat, endLng);
    this.setData({ distance: d, walkMinutes: Math.round(d / 80) });
  },

  tryUpdateDistanceSilent() {
    wx.getLocation({
      type: 'gcj02',
      success: ({ latitude, longitude }) => {
        this.setData({ startLat: latitude, startLng: longitude });
        this.updateDistanceAndTime();
      },
      fail: () => {},
    });
  },

  showRoute() {
    if (this.data.endLat == null || this.data.endLng == null) {
      wx.showToast({ title: '缺少目的地坐标', icon: 'none' });
      return;
    }

    if (!isDevtoolsEnv()) {
      wx.openLocation({
        latitude: this.data.endLat,
        longitude: this.data.endLng,
        name: this.data.locationName || '目的地',
        scale: 16
      });
      return;
    }

    const coordText = `${this.data.endLat},${this.data.endLng}`;
    wx.setClipboardData({ data: coordText });
    wx.showModal({
      title: '开发者工具不支持外部地图',
      content: `当前在 devtools 环境，无法直接拉起地图。\n已复制目的地坐标：${coordText}`,
      showCancel: false,
      confirmText: '知道了'
    });
  }
});