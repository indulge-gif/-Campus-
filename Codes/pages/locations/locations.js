const { locations: LOCATION_SOURCE } = require('../../utils/locations.js');

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
    locations: LOCATION_SOURCE
  },
  onLoad() {
    // 将 locations 转换为地图组件需要的 markers 格式
    const markers = this.data.locations.map(item => ({
      id: item.id,
      latitude: item.latitude,
      longitude: item.longitude,
      ...item.marker // 展开 marker 配置（包含 iconPath 和 callout）
    }));
    
    // 更新数据，触发页面渲染
    this.setData({
      markers: markers
    });

    // 原有地图上下文初始化（保留不变）
    this.mapCtx = wx.createMapContext('map');

    // 获取定位并计算每个地点的距离
    this.updateUserLocationAndDistances();
  },

  updateUserLocationAndDistances() {
    wx.getSetting({
      success: (res) => {
        const authorized = res.authSetting && res.authSetting['scope.userLocation'];
        const getLoc = () => {
          wx.getLocation({
            type: 'gcj02',
            success: ({ latitude, longitude }) => {
              const updated = this.data.locations.map(loc => ({
                ...loc,
                distance: haversineMeters(latitude, longitude, loc.latitude, loc.longitude)
              }));
              this.setData({ locations: updated, userLatitude: latitude, userLongitude: longitude });
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
                  if (res2.confirm) {
                    wx.openSetting();
                  }
                }
              });
            }
          });
        }
      }
    });
  },

  // 保留原有的点击事件处理逻辑
  onMarkerTap(e) {
    const markerId = e.markerId;
    this.toPage6({ currentTarget: { dataset: { id: markerId } } });
  },

  toDetail(e) {
    const locationId = e.currentTarget.dataset.id;
    const location = this.data.locations.find(loc => loc.id === locationId);
    wx.navigateTo({
      url: `/pages/detail/detail?location=${encodeURIComponent(JSON.stringify(location))}`
    });
  },

  toAdvancedSearch() {
    wx.navigateTo({ url: '/pages/advancedSearch/advancedSearch' });
  }
});
