Page({
  data: {
    searchQuery: "",
    locations: [
      {  name: "超市", latitude: 39.8101,longitude: 116.1080},
      {  name: "田径场", latitude: 39.8084, longitude: 116.1078},
      {  name: "排球场1", latitude: 39.8083, longitude: 116.1088},
      {  name: "篮球场", latitude: 39.8079, longitude: 116.1092},
      {  name: "排球场2",latitude: 39.8070, longitude: 116.1092},
      {  name: "气膜馆", latitude: 39.8073, longitude: 116.1104},
      {  name: "大学生活动中心", latitude: 39.8090, longitude: 116.1109},
      {  name: "网球场", latitude: 39.8079, longitude: 116.1111},
      {  name: "小足球场", latitude: 39.8073, longitude: 116.1111},
      {  name: "南门", latitude: 39.8070, longitude: 116.1131},
      {  name: "综合楼", latitude: 39.8084, longitude: 116.1132},
      {  name: "日新c", latitude: 39.8090, longitude: 116.1125},
      {  name: "日新b", latitude: 39.8094, longitude: 116.1125},
      {  name: "日新a", latitude:39.8098, longitude: 116.1126},
      {  name: "崇理楼", latitude: 39.8093, longitude: 116.1135},
      {  name: "明德楼", latitude: 39.8099, longitude: 116.1135},
      {  name: "共美厅", latitude: 39.8104, longitude: 116.1140},
      {  name: "教学楼1", latitude: 39.8093, longitude: 116.1148},
      {  name: "教学楼2", latitude: 39.8098, longitude: 116.1148},
      {  name: "博文楼", latitude: 39.8111, longitude: 116.1150},
      {  name: "致远楼",latitude: 39.8119, longitude: 116.1150},
      {  name: "北门", latitude: 39.8134, longitude: 116.1131},
      {  name: "博雅楼", latitude: 39.8111, longitude: 116.1142},
      {  name: "图书馆", latitude: 39.8117, longitude: 116.1130},
      {  name: "智慧中心", latitude: 39.8114, longitude: 116.1120},
      {  name: "校医院", latitude: 39.8066, longitude: 116.1068},
      {  name: "驿站53-61，近邻宝", latitude: 39.8102, longitude: 116.1055},
      {  name: "驿站501-516", latitude: 39.8100, longitude: 116.1055},
      {  name: "驿站1-19", latitude: 39.8107, longitude: 116.1055},
      {  name: "1号楼", latitude:39.8106, longitude: 116.1060},
      {  name: "2号楼", latitude: 39.8104, longitude: 116.1070},
      {  name: "3号楼", latitude: 39.8101, longitude: 116.1058},
      {  name: "4号楼", latitude: 39.8096, longitude: 116.1070},
      {  name: "5号楼", latitude: 39.8096, longitude: 116.1057},
      {  name: "6号楼", latitude: 39.8087, longitude: 116.1069},
      {  name: "7号楼", latitude: 39.8088, longitude: 116.1057},
      {  name: "8号楼",latitude: 39.8083, longitude: 116.1069},
      {  name: "9号楼", latitude: 39.8082, longitude: 116.1059},
      {  name: "10号楼", latitude: 39.8077, longitude: 116.1055},
      {  name: "家属院", latitude:39.8110 , longitude: 116.1079},
      {  name: "聚雅餐厅", latitude: 39.8102, longitude: 116.1082},
      {  name: "荟贤餐厅", latitude: 39.8094, longitude: 116.1082},
    ],
  },
  onLoad(options) {
    if (options.query) {
      this.setData({ searchQuery: options.query });
      this.onSearch();
    }
  },
  onSearch() {
    const keyword = this.data.searchQuery;
    const target = this.data.locations.find(loc => 
      loc.name.includes(keyword)
    );
    if (target) {
      wx.navigateTo({
        url: `/pages/detail/detail?endLat=${target.latitude}&endLng=${target.longitude}`
      });
    } else {
      wx.showToast({ title: '未找到相关地点', icon: 'none' });
    }
  }
});