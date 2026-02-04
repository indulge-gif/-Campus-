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
  // 搜索与快捷标签
  onSearchTap() {
    const query = this.data.searchQuery.trim();
    if (!query) {
      wx.showToast({ title: "请输入地点名称", icon: "none" });
      return;
    }

    this.setData({ isSearching: true });
    wx.showLoading({ title: "搜索中", mask: true });

    const suggestions = buildSuggestions(query, this.data.locations, 20);
    wx.hideLoading();
    this.setData({ isSearching: false });

    if (suggestions.length === 0) {
      this.setData({ suggestions: [], suggestionsVisible: false });
      wx.showToast({ title: "未找到相关地点", icon: "none" });
      return;
    }

    if (suggestions.length === 1) {
      const only = suggestions[0];
      this.setData({ suggestions, suggestionsVisible: false, currentTargetLocation: only, poiCard: { visible: false, name: "", distance: "", anim: "" } });
      wx.navigateTo({
        url: `/pages/detail/detail?location=${encodeURIComponent(JSON.stringify(only))}`
      });
      return;
    }

    // 多结果：展开下拉（最多展示 8 条）
    this.setData({
      suggestions: suggestions.slice(0, 8),
      suggestionsVisible: true
    });
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
    const picked = (this.data.suggestions || []).find((x) => x.id === id);
    if (!picked) return;
    this.setData({ suggestionsVisible: false, currentTargetLocation: picked, poiCard: { visible: false, name: "", distance: "", anim: "" } });
    wx.navigateTo({
      url: `/pages/detail/detail?location=${encodeURIComponent(JSON.stringify(picked))}`
    });
  },
  onMarkerTap(e) {
    const markerId = e.markerId;
    if (markerId === 1) {
      // 点击校区中心点：引导去地点集合（比“导航到学校”更明确）
      this.toLocations();
    }
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
    wx.showToast({ title: '请先在地图选择地点', icon: 'none' });
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
      if (!userLoc) return;

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
          wx.getLocation({
            type: 'gcj02',
            success: ({ latitude, longitude }) => {
              const loc = { latitude, longitude };
              wx.hideLoading();
              if (typeof callback === 'function') callback(loc);
            },
            fail: () => {
              wx.hideLoading();
              wx.showToast({ title: '定位失败，请检查权限', icon: 'none' });
              if (typeof callback === 'function') callback(null);
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