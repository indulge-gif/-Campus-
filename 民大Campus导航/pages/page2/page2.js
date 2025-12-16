const CLOUD_PREFIX = "cloud://cloud1-4gh72aev1c85874d.636c-cloud1-4gh72aev1c85874d-1360566409";

Page({
  data: {
    locations: [
      { id: 1, name: "超市", latitude: 39.8101,longitude: 116.1080, image: `${CLOUD_PREFIX}/img/1.jpg`, marker: {callout: {content: "超市",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}},
      { id: 2, name: "田径场", latitude: 39.8084, longitude: 116.1078, image: `${CLOUD_PREFIX}/img/2.jpg`,marker: {callout: {content: "田径场",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 3, name: "排球场1", latitude: 39.8083, longitude: 116.1088, image: `${CLOUD_PREFIX}/img/3.jpg`,marker: {callout: {content: "排球场1",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 4, name: "篮球场", latitude: 39.8079, longitude: 116.1092, image: `${CLOUD_PREFIX}/img/4.jpg`,marker: {callout: {content: "篮球场",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 5, name: "排球场2",latitude: 39.8070, longitude: 116.1092, image: `${CLOUD_PREFIX}/img/5.jpg`,marker: {callout: {content: "排球场2",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 6, name: "气膜馆", latitude: 39.8073, longitude: 116.1104, image: `${CLOUD_PREFIX}/img/6.jpg`,marker: {callout: {content: "气膜馆",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 7, name: "大学生活动中心", latitude: 39.8090, longitude: 116.1109, image: `${CLOUD_PREFIX}/img/7.jpg`,marker: {callout: {content: "大学生活动中心",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 8, name: "网球场", latitude: 39.8079, longitude: 116.1111, image: `${CLOUD_PREFIX}/img/8.jpg`,marker: {callout: {content: "网球场",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 9, name: "小足球场", latitude: 39.8073, longitude: 116.1111, image: `${CLOUD_PREFIX}/img/9.jpg`,marker: {callout: {content: "小足球场",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 10, name: "南门", latitude: 39.8070, longitude: 116.1131, image: `${CLOUD_PREFIX}/img/10.jpg`,marker: {callout: {content: "南门",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 11, name: "综合楼", latitude: 39.8084, longitude: 116.1132, image: `${CLOUD_PREFIX}/img/11.jpg`,marker: {callout: {content: "综合楼",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 12, name: "日新c", latitude: 39.8090, longitude: 116.1125, image: `${CLOUD_PREFIX}/img/12.jpg`,marker: {callout: {content: "日新楼C座",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 13, name: "日新b", latitude: 39.8094, longitude: 116.1125, image: `${CLOUD_PREFIX}/img/13.jpg`,marker: {callout: {content: "日新楼B座",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 14, name: "日新a", latitude:39.8098, longitude: 116.1126, image: `${CLOUD_PREFIX}/img/14.jpg`,marker: {callout: {content: "日新楼A座",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 15, name: "崇理楼", latitude: 39.8093, longitude: 116.1135, image: `${CLOUD_PREFIX}/img/15.jpg`,marker: {callout: {content: "崇理楼",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 16, name: "明德楼", latitude: 39.8099, longitude: 116.1135, image: `${CLOUD_PREFIX}/img/16.jpg`,marker: {callout: {content: "明德楼",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 17, name: "共美厅", latitude: 39.8104, longitude: 116.1140, image: `${CLOUD_PREFIX}/img/17.jpg`,marker: {callout: {content: "共美厅",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 18, name: "教学楼1", latitude: 39.8093, longitude: 116.1148, image: `${CLOUD_PREFIX}/img/18.jpg`,marker: {callout: {content: "教学楼1",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 19, name: "教学楼2", latitude: 39.8098, longitude: 116.1148, image: `${CLOUD_PREFIX}/img/19.jpg`,marker: {callout: {content: "教学楼2",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 20, name: "博文楼", latitude: 39.8111, longitude: 116.1150, image: `${CLOUD_PREFIX}/img/20.jpg`,marker: {callout: {content: "博文楼",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 21, name: "致远楼",latitude: 39.8119, longitude: 116.1150, image: `${CLOUD_PREFIX}/img/21.jpg`,marker: {callout: {content: "致远楼",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 22, name: "北门", latitude: 39.8134, longitude: 116.1131, image: `${CLOUD_PREFIX}/img/22.jpg`,marker: {callout: {content: "北门",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 23, name: "博雅楼", latitude: 39.8111, longitude: 116.1142, image: `${CLOUD_PREFIX}/img/23.jpg`,marker: {callout: {content: "博雅楼",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 24, name: "图书馆", latitude: 39.8117, longitude: 116.1130, image: `${CLOUD_PREFIX}/img/24.jpg`,marker: {callout: {content: "图书馆",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 25, name: "智慧中心", latitude: 39.8114, longitude: 116.1120, image: `${CLOUD_PREFIX}/img/25.jpg`,marker: {callout: {content: "智慧中心",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 26, name: "校医院", latitude: 39.8066, longitude: 116.1068, image: `${CLOUD_PREFIX}/img/26.jpg`,marker: {callout: {content: "校医院",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 27, name: "驿站53-61，近邻宝", latitude: 39.8102, longitude: 116.1055, image: `${CLOUD_PREFIX}/img/27.jpg`,marker: {callout: {content: "驿站53-61，近邻宝",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 28, name: "驿站501-516", latitude: 39.8100, longitude: 116.1055, image: `${CLOUD_PREFIX}/img/28.jpg`,marker: {callout: {content: "驿站501-516",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 29, name: "驿站1-19", latitude: 39.8107, longitude: 116.1055, image: `${CLOUD_PREFIX}/img/29.jpg`,marker: {callout: {content: "驿站1-19",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 30, name: "1号楼", latitude:39.8106, longitude: 116.1060, image: `${CLOUD_PREFIX}/img/30.jpg`,marker: {callout: {content: "静园1号楼",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 31, name: "2号楼", latitude: 39.8104, longitude: 116.1070, image: `${CLOUD_PREFIX}/img/31.jpg`,marker: {callout: {content: "静园2号楼",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 32, name: "3号楼", latitude: 39.8101, longitude: 116.1058, image: `${CLOUD_PREFIX}/img/32.jpg`,marker: {callout: {content: "静园3号楼",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 33, name: "4号楼", latitude: 39.8096, longitude: 116.1070, image: `${CLOUD_PREFIX}/img/33.jpg`,marker: {callout: {content: "静园4号楼",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 34, name: "5号楼", latitude: 39.8096, longitude: 116.1057, image: `${CLOUD_PREFIX}/img/34.jpg`,marker: {callout: {content: "静园5号楼",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 35, name: "6号楼", latitude: 39.8087, longitude: 116.1069, image: `${CLOUD_PREFIX}/img/35.jpg`,marker: {callout: {content: "静园6号楼",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 36, name: "7号楼", latitude: 39.8088, longitude: 116.1057, image: `${CLOUD_PREFIX}/img/36.jpg`,marker: {callout: {content: "静园7号楼",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 37, name: "8号楼",latitude: 39.8083, longitude: 116.1069, image: `${CLOUD_PREFIX}/img/37.jpg`,marker: {callout: {content: "静园8号楼",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 38, name: "9号楼", latitude: 39.8082, longitude: 116.1059, image: `${CLOUD_PREFIX}/img/38.jpg`,marker: {callout: {content: "静园9号楼",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 39, name: "10号楼", latitude: 39.8077, longitude: 116.1055, image: `${CLOUD_PREFIX}/img/39.jpg`,marker: {callout: {content: "静园10号楼",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 40, name: "家属院", latitude:39.8110 , longitude: 116.1079, image: `${CLOUD_PREFIX}/img/40.jpg`,marker: {callout: {content: "家属院",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 41, name: "聚雅餐厅", latitude: 39.8102, longitude: 116.1082, image: `${CLOUD_PREFIX}/img/41.jpg`,marker: {callout: {content: "聚雅餐厅",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
      { id: 42, name: "荟贤餐厅", latitude: 39.8094, longitude: 116.1082, image: `${CLOUD_PREFIX}/img/42.jpg`,marker: {callout: {content: "荟贤餐厅",color: "#ffffff",fontSize: 14,bgColor: "#dc143c",padding: 8,borderRadius: 4,display: "ALWAYS"}}  },
    ]
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
  },

  // 保留原有的点击事件处理逻辑
  onMarkerTap(e) {
    const markerId = e.markerId;
    this.toPage6({ currentTarget: { dataset: { id: markerId } } });
  },

  toPage6(e) {
    const locationId = e.currentTarget.dataset.id;
    const location = this.data.locations.find(loc => loc.id === locationId);
    wx.navigateTo({
      url: `/pages/page6/page6?location=${encodeURIComponent(JSON.stringify(location))}`
    });
  }
});
