const { locations: LOCATION_SOURCE } = require('../../utils/locations.js');
const { buildClassroomSuggestions, mergeSuggestions } = require('../../utils/classroomSearch.js');

const DEFAULT_MARKER_SIZE = 28;
const DEFAULT_MARKER_ICON = 'cloud://cloud1-4gh72aev1c85874d.636c-cloud1-4gh72aev1c85874d-1360566409/img/marker.png';

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

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[，。！？、,.!?;；:：()（）\-_/\\]/g, "");
}

// query 是否为 text 的“子序列”（字符顺序一致即可，中英文都适用）
function isSubsequence(query, text) {
  if (!query) return false;
  let qi = 0;
  for (let ti = 0; ti < text.length && qi < query.length; ti++) {
    if (text[ti] === query[qi]) qi++;
  }
  return qi === query.length;
}

function computeMatchScore(queryRaw, location) {
  const query = normalizeText(queryRaw);
  if (!query) return null;

  const name = normalizeText(location && location.name);
  if (!name) return null;

  // 分数越大越相关
  let score = 0;
  if (name === query) score += 1000;
  if (name.startsWith(query)) score += 600;
  if (name.includes(query)) score += 300;
  if (isSubsequence(query, name)) score += 120;

  if (score <= 0) return null;
  // 轻微偏好短名称（更像是目标点）
  score += Math.max(0, 20 - name.length);
  return score;
}

function buildSuggestions(query, locations, limit = 8) {
  const scored = [];
  for (const loc of locations) {
    const s = computeMatchScore(query, loc);
    if (s != null) scored.push({ loc, score: s });
  }
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ loc }) => {
    const rawDesc = String(loc.description || "").trim();
    const sub = rawDesc ? (rawDesc.length > 34 ? rawDesc.slice(0, 34) + "…" : rawDesc) : "";
    return { ...loc, sub };
  });
}

function normalizeMarker(source) {
  const markerPart = source.marker || {};
  const width = source.width || markerPart.width || DEFAULT_MARKER_SIZE;
  const height = source.height || markerPart.height || DEFAULT_MARKER_SIZE;
  const iconPath = source.iconPath || markerPart.iconPath || DEFAULT_MARKER_ICON;
  return {
    ...source,
    id: Number(source.id),
    iconPath,
    width,
    height,
    callout: markerPart.callout || source.callout,
  };
}

function buildMarkers(locations, schoolLocation) {
  const campusMarker = normalizeMarker({
    id: 0,
    latitude: schoolLocation.latitude,
    longitude: schoolLocation.longitude,
    title: '中央民族大学',
  });

  const locMarkers = (locations || [])
    .filter((loc) => loc && loc.latitude != null && loc.longitude != null)
    .map((loc) => normalizeMarker({
      id: loc.id,
      latitude: loc.latitude,
      longitude: loc.longitude,
      title: loc.name,
      iconPath: loc.iconPath,
      width: loc.width,
      height: loc.height,
      marker: loc.marker,
    }));

  return [campusMarker, ...locMarkers];
}

Page({
  // 页面初始化
  data: {
    searchQuery: "",
    isSearching: false,
    locations: LOCATION_SOURCE,
    suggestions: [],
    suggestionsVisible: false,
    poiCard: { visible: false, name: "", distance: "", anim: "" },
    currentTargetLocation: null,
    schoolLocation: {
      longitude: 116.111,
      latitude: 39.810
    },
    markers: []
  },
  onLoad() {
    this.mapCtx = wx.createMapContext('map');
    const markers = buildMarkers(LOCATION_SOURCE, this.data.schoolLocation);
    this.setData({ markers });
  },

  onShow() {
    this.setData({ suggestionsVisible: false });
  },

  // 定位与权限处理
  onQuickTag(e) {
    const key = e.currentTarget.dataset.key || "";
    this.setData({ searchQuery: key }, () => {
      this.onSearchTap();
    });
  },

  toLocations() {
    wx.navigateTo({ url: '/pages/locations/locations' });
  },
  toAbout() {
    wx.navigateTo({ url: '/pages/about/about' });
  },
  toCollector() {
    wx.navigateTo({ url: '/pages/collector/collector' });
  },
  // 搜索与快捷标签
  onSearchTap() {
    const query = this.data.searchQuery.trim();
    if (!query) {
      wx.showToast({ title: "请输入地点名称", icon: "none" });
      return;
    }

    this.setData({ isSearching: true });
    wx.showLoading({ title: "搜索中", mask: true });

    const normalSuggestions = buildSuggestions(query, this.data.locations, 20);
    const classroomSuggestions = buildClassroomSuggestions(query, this.data.locations);
    const suggestions = mergeSuggestions(classroomSuggestions, normalSuggestions, 20);
    wx.hideLoading();
    this.setData({ isSearching: false });

    if (suggestions.length === 0) {
      this.setData({ suggestions: [], suggestionsVisible: false });
      wx.showToast({ title: "未找到相关地点", icon: "none" });
      return;
    }

    // 展开下拉（最多展示 8 条），即使只有 1 条也由用户手动点击进入
    this.setData({
      suggestions: suggestions.slice(0, 8),
      suggestionsVisible: true
    });
    if (suggestions.length === 1) {
      wx.showToast({ title: '找到1个结果，请点击进入', icon: 'none' });
    }
  },
  onSearchInput(e) {
    const value = e.detail.value;
    this.setData({
      searchQuery: value,
      suggestions: [],
      suggestionsVisible: false
    });
  },

  onSearchFocus() {
    // 仅在点击搜索后展示结果，焦点时不自动弹出
    this.setData({ suggestionsVisible: false });
  },

  hideSuggestions() {
    this.setData({ suggestionsVisible: false });
  },

  onSuggestionTap(e) {
    const id = e.currentTarget.dataset.id;
    const picked = (this.data.suggestions || []).find((x) => String(x.id) === String(id));
    if (!picked) return;
    this.setData({ suggestionsVisible: false, currentTargetLocation: picked, poiCard: { visible: false, name: "", distance: "", anim: "" } });
    wx.navigateTo({
      url: `/pages/detail/detail?location=${encodeURIComponent(JSON.stringify(picked))}`
    });
  },
  onMarkerTap(e) {
    const markerId = Number(e && e.markerId);
    if (Number.isNaN(markerId)) return;

    // 中心点 marker id 固定为 0，点击后进入地点集合页。
    if (markerId === 0) {
      this.toLocations();
      return;
    }

    const picked = (this.data.locations || []).find((loc) => Number(loc && loc.id) === markerId);
    if (!picked || picked.latitude == null || picked.longitude == null) {
      wx.showToast({ title: '该地点缺少坐标', icon: 'none' });
      return;
    }

    if (this.isSameTarget(picked.latitude, picked.longitude)) return;

    this.ensureUserLocation((userLoc) => {
      let distanceText = '距您未知';
      if (userLoc) {
        const meters = haversineMeters(userLoc.latitude, userLoc.longitude, picked.latitude, picked.longitude);
        distanceText = meters >= 1000 ? `${(meters / 1000).toFixed(1)}公里` : `${meters}米`;
      }

      this.setData({
        poiCard: { visible: true, name: picked.name || '所选地点', distance: distanceText, anim: 'slide-in' },
        currentTargetLocation: {
          id: picked.id,
          name: picked.name,
          latitude: picked.latitude,
          longitude: picked.longitude,
          image: picked.image,
          description: picked.description,
        }
      });
    });
  },

  // 地图事件（POI / regionchange）
  onPoiTap(e) {
    const detail = e.detail || {};
    const name = detail.name || "所选地点";
    const latitude = detail.latitude;
    const longitude = detail.longitude;

    if (this.isSameTarget(latitude, longitude)) return;

    if (latitude == null || longitude == null) {
      wx.showToast({ title: '未获取到坐标，请点击其他建筑', icon: 'none' });
      this.setData({
        poiCard: { visible: true, name, distance: "距您未知", anim: "slide-in" },
        currentTargetLocation: null
      });
      return;
    }

    this.ensureUserLocation((userLoc) => {
      let distanceText = "距您未知";
      if (userLoc) {
        const meters = haversineMeters(userLoc.latitude, userLoc.longitude, latitude, longitude);
        distanceText = meters >= 1000 ? `${(meters/1000).toFixed(1)}公里` : `${meters}米`;
      }
      this.setData({
        poiCard: { visible: true, name, distance: distanceText, anim: "slide-in" },
        currentTargetLocation: { name, latitude, longitude }
      });
    });
  },

  onLocateMe() {
    this.ensureUserLocation((loc) => {
      if (loc && this.mapCtx && this.mapCtx.moveToLocation) {
        this.mapCtx.moveToLocation({ latitude: loc.latitude, longitude: loc.longitude });
      }
    });
  },

  onStartNav() {
    const target = this.data.currentTargetLocation;
    if (target && target.latitude != null && target.longitude != null) {
      wx.navigateTo({
        url: `/pages/detail/detail?location=${encodeURIComponent(JSON.stringify(target))}`
      });
      return;
    }
    // 无已选目标时，自动按“最近地点”流程兜底，避免用户感知为按钮失效。
    this.goNearestLocation();
  },
  navigateToSchool() {
    // Home 的“最近地点”按钮复用这个处理函数，避免改 wxml 绑定
    this.goNearestLocation();
  },

  goNearestLocation() {
    const allLocations = Array.isArray(this.data.locations) ? this.data.locations : [];
    if (allLocations.length === 0) {
      wx.showToast({ title: '暂无地点数据', icon: 'none' });
      return;
    }

    this.ensureUserLocation((userLoc) => {
      if (!userLoc) {
        wx.showToast({ title: '定位不可用，请手动选地点', icon: 'none' });
        this.toLocations();
        return;
      }

      let nearest = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      for (const loc of allLocations) {
        if (loc == null || loc.latitude == null || loc.longitude == null) continue;
        const d = haversineMeters(userLoc.latitude, userLoc.longitude, loc.latitude, loc.longitude);
        if (d < nearestDistance) {
          nearest = loc;
          nearestDistance = d;
        }
      }

      if (!nearest) {
        wx.showToast({ title: '未找到可导航地点', icon: 'none' });
        return;
      }

      this.setData({ currentTargetLocation: nearest, poiCard: { visible: false, name: '', distance: '', anim: '' } });
      wx.navigateTo({
        url: `/pages/detail/detail?location=${encodeURIComponent(JSON.stringify(nearest))}`
      });
    });
  },

  ensureUserLocation(callback) {
    wx.showLoading({ title: '定位中', mask: true });
    wx.getSetting({
      success: (res) => {
        const authorized = res.authSetting && res.authSetting['scope.userLocation'];

        const getLoc = () => {
          // 部分机型/环境会出现：地图已显示当前位置，但 gcj02 获取偶发失败。
          // 这里增加 wgs84 回退，减少“已授权却提示定位失败”的误报。
          const finishSuccess = ({ latitude, longitude }) => {
            const loc = { latitude, longitude };
            wx.hideLoading();
            if (typeof callback === 'function') callback(loc);
          };

          const finishFail = (err) => {
            wx.hideLoading();
            const msg = String(err && err.errMsg || '');
            const text = /auth deny|permission|scope.userLocation/i.test(msg)
              ? '定位权限异常，请到设置页检查'
              : '定位失败，请稍后重试';
            wx.showToast({ title: text, icon: 'none' });
            if (typeof callback === 'function') callback(null);
          };

          wx.getLocation({
            type: 'gcj02',
            success: finishSuccess,
            fail: () => {
              wx.getLocation({
                type: 'wgs84',
                success: finishSuccess,
                fail: finishFail,
              });
            },
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
                content: '用于查找离你最近的地点，请前往设置开启定位权限。',
                confirmText: '去设置',
                success: (res2) => {
                  if (res2.confirm) wx.openSetting();
                  if (typeof callback === 'function') callback(null);
                }
              });
              wx.hideLoading();
            }
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '定位失败，请检查权限', icon: 'none' });
        if (typeof callback === 'function') callback(null);
      }
    });
  },

  // 导航与路线逻辑
  isSameTarget(lat, lon) {
    const cur = this.data.currentTargetLocation;
    return cur && cur.latitude === lat && cur.longitude === lon;
  }
});