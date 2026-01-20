const { locations: LOCATION_SOURCE } = require('../../utils/locations.js');

Page({
  data: {
    searchQuery: "",
    locations: LOCATION_SOURCE,
    schoolLocation: {
      longitude:116.111,
      latitude:39.810
    },
    markers: [{
      id: 1,
      latitude: 39.810,
      longitude: 116.111,
      title: "中央民族大学",
      width: 30,
      height: 30
    }]
  },
  onLoad() {
    this.mapCtx = wx.createMapContext('map');
  },
  toLocations() {
    wx.navigateTo({ url: '/pages/locations/locations' });
  },
  toAbout() {
    wx.navigateTo({ url: '/pages/about/about' });
  },
  onSearchTap() {
    const query = this.data.searchQuery.trim();
    if (!query) {
      wx.showToast({ title: "请输入地点名称", icon: "none" });
      return;
    }
    const lower = query.toLowerCase();
    const target = this.data.locations.find(loc => (loc.name || "").toLowerCase().includes(lower));
    if (target) {
      wx.navigateTo({
        url: `/pages/detail/detail?location=${encodeURIComponent(JSON.stringify(target))}`
      });
    } else {
      wx.showToast({ title: "未找到该地点", icon: "none" });
    }
  },
  onSearchInput(e) {
    this.setData({
      searchQuery: e.detail.value
    });
  },
  onMarkerTap(e) {
    const markerId = e.markerId;
    if (markerId === 1) {
      this.navigateToSchool();
    }
  },
  navigateToSchool() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = this.data.schoolLocation;
        wx.navigateTo({
          url: `/pages/detail/detail?startLat=${res.latitude}&startLng=${res.longitude}&endLat=${latitude}&endLng=${longitude}&name=中央民族大学`
        });
      },
      fail: () => {
        wx.showToast({ title: '请授权位置权限', icon: 'none' });
      }
    });
  }
});