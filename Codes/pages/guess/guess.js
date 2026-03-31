const { locations: LOCATION_SOURCE } = require('../../utils/locations.js');

const RECOMMEND_NAMES = [
  '图书馆',
  '聚雅餐厅',
  '荟贤餐厅',
  '大学生活动中心',
  '田径场',
  '校医院',
  '智慧中心'
];

function buildRecommendations(locations) {
  const list = Array.isArray(locations) ? locations : [];
  const byName = RECOMMEND_NAMES
    .map((name) => list.find((item) => item && item.name === name))
    .filter(Boolean);

  if (byName.length >= 5) return byName;

  const fallback = list
    .filter((item) => item && item.latitude != null && item.longitude != null)
    .slice(0, 6);

  return byName.length > 0 ? byName : fallback;
}

Page({
  data: {
    recommendations: []
  },

  onLoad() {
    const recommendations = buildRecommendations(LOCATION_SOURCE);
    this.setData({ recommendations });
  },

  toDetail(e) {
    const id = Number(e.currentTarget.dataset.id);
    const location = (this.data.recommendations || []).find((item) => Number(item.id) === id);
    if (!location) {
      wx.showToast({ title: '地点不存在', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: `/pages/detail/detail?location=${encodeURIComponent(JSON.stringify(location))}`
    });
  }
});
