const CLOUD_FLOORPLAN_BASE = 'cloud://cloud1-4gh72aev1c85874d.636c-cloud1-4gh72aev1c85874d-1360566409/img/floorplans';

const TEACHING_BUILDINGS = {
  '日新楼': { slug: 'rixin', realWidthM: 62, maxFloor: 2 },
  '明德楼': { slug: 'mingde', realWidthM: 58, maxFloor: 2 },
  '崇理楼': { slug: 'chongli', realWidthM: 60, maxFloor: 2 },
  '博文楼': { slug: 'bowen', realWidthM: 56, maxFloor: 2 },
  '致远楼': { slug: 'zhiyuan', realWidthM: 54, maxFloor: 2 },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function round2(v) {
  return Math.round(Number(v || 0) * 100) / 100;
}

Page({
  data: {
    buildingOptions: ['日新楼', '明德楼', '崇理楼', '博文楼', '致远楼'],
    buildingIndex: 0,
    floorOptions: ['1层', '2层'],
    floorIndex: 0,
    buildingKey: '日新楼',
    buildingLabel: '日新楼',
    floor: 1,
    floorLabel: '1层',
    floorPlanUrl: '',
    canvasHeight: 260,
    pixelX: '-',
    pixelY: '-',
    realX: '-',
    realY: '-',
    scaleX: '-',
    wifiList: [],
    collectedCount: 0,
  },

  onLoad(options) {
    const defaultBuilding = '日新楼';
    const buildingOptions = this.data.buildingOptions || [defaultBuilding];
    const incomingBuilding = String(options && options.buildingKey ? options.buildingKey : defaultBuilding);
    const buildingKey = TEACHING_BUILDINGS[incomingBuilding] ? incomingBuilding : defaultBuilding;
    const cfg = TEACHING_BUILDINGS[buildingKey] || TEACHING_BUILDINGS[defaultBuilding];
    const buildingIndex = Math.max(0, buildingOptions.indexOf(buildingKey));
    const floorRaw = Number(options && options.floor ? options.floor : 1);
    const floor = Math.min(Math.max(1, floorRaw || 1), cfg.maxFloor);
    const floorIndex = floor - 1;

    this._buildingCfg = cfg;
    this._currentPoint = null;
    this._markers = [];
    this._imageNaturalWidth = 0;
    this._imageNaturalHeight = 0;

    this.setData({
      buildingIndex,
      floorIndex,
      buildingKey,
      buildingLabel: buildingKey,
      floor,
      floorLabel: `${floor}层`,
    }, () => this.applySelection());

    this.initWifiModule();
  },

  buildFloorPlanUrl(buildingKey, floor) {
    const cfg = TEACHING_BUILDINGS[buildingKey] || TEACHING_BUILDINGS['日新楼'];
    return `${CLOUD_FLOORPLAN_BASE}/${cfg.slug}/f${floor}.jpg`;
  },

  applySelection() {
    const buildingKey = this.data.buildingOptions[this.data.buildingIndex] || '日新楼';
    const cfg = TEACHING_BUILDINGS[buildingKey] || TEACHING_BUILDINGS['日新楼'];
    const floor = Math.min((this.data.floorIndex || 0) + 1, cfg.maxFloor);
    const floorPlanUrl = this.buildFloorPlanUrl(buildingKey, floor);

    this._buildingCfg = cfg;
    this._markers = [];
    this._currentPoint = null;
    this._currentWifiList = [];

    this.setData({
      buildingKey,
      buildingLabel: buildingKey,
      floor,
      floorLabel: `${floor}层`,
      floorPlanUrl,
      pixelX: '-',
      pixelY: '-',
      realX: '-',
      realY: '-',
      scaleX: '-',
      wifiList: [],
    }, () => {
      wx.setNavigationBarTitle({ title: `WiFi指纹采集 - ${buildingKey}` });
      this.drawMarkers();
    });
  },

  onBuildingChange(e) {
    const index = Number(e && e.detail && e.detail.value);
    const safeIndex = Number.isNaN(index) ? 0 : index;
    this.setData({ buildingIndex: safeIndex }, () => this.applySelection());
  },

  onFloorChange(e) {
    const index = Number(e && e.detail && e.detail.value);
    const safeIndex = Number.isNaN(index) ? 0 : index;
    this.setData({ floorIndex: safeIndex }, () => this.applySelection());
  },

  onUnload() {
    if (wx.offGetWifiList && this._wifiListener) {
      wx.offGetWifiList(this._wifiListener);
    }
    if (wx.stopWifi) {
      wx.stopWifi();
    }
  },

  initWifiModule() {
    if (!wx.onGetWifiList) return;

    this._wifiListener = (res) => {
      this._lastWifiListRaw = (res && res.wifiList) || [];
      if (this._pendingWifiResolve) {
        const resolve = this._pendingWifiResolve;
        this._pendingWifiResolve = null;
        resolve(this._lastWifiListRaw);
      }
    };

    wx.onGetWifiList(this._wifiListener);
  },

  onImageLoad(e) {
    const naturalW = Number(e && e.detail && e.detail.width) || 0;
    const naturalH = Number(e && e.detail && e.detail.height) || 0;
    this._imageNaturalWidth = naturalW;
    this._imageNaturalHeight = naturalH;

    const query = wx.createSelectorQuery().in(this);
    query.select('.image-stage').boundingClientRect();
    query.exec((res) => {
      const rect = res && res[0] ? res[0] : null;
      if (!rect || !rect.width || !naturalW || !naturalH) return;
      const canvasHeight = Math.round((rect.width * naturalH) / naturalW);
      this.setData({ canvasHeight }, () => this.drawMarkers());
    });
  },

  onImageError() {
    wx.showToast({ title: '平面图加载失败', icon: 'none' });
  },

  async onImageTap(e) {
    const tapX = Number(e && e.detail && e.detail.x);
    const tapY = Number(e && e.detail && e.detail.y);
    if (Number.isNaN(tapX) || Number.isNaN(tapY)) return;

    const query = wx.createSelectorQuery().in(this);
    query.select('.image-stage').boundingClientRect();
    query.exec(async (res) => {
      const rect = res && res[0] ? res[0] : null;
      if (!rect || !rect.width || !rect.height || !this._imageNaturalWidth) {
        wx.showToast({ title: '图像尺寸未就绪', icon: 'none' });
        return;
      }

      const px = (tapX / rect.width) * this._imageNaturalWidth;
      const py = this._imageNaturalHeight ? (tapY / rect.height) * this._imageNaturalHeight : tapY;
      const scaleX = this._buildingCfg.realWidthM / this._imageNaturalWidth;
      const realX = px * scaleX;
      const realY = py * scaleX;

      this._currentPoint = {
        pixelX: round2(px),
        pixelY: round2(py),
        realX: round2(realX),
        realY: round2(realY),
        tapX: round2(tapX),
        tapY: round2(tapY),
      };
      this._markers.push({ x: tapX, y: tapY, text: `${round2(realX)},${round2(realY)}` });

      console.log('[collector] 点击像素坐标:', this._currentPoint.pixelX, this._currentPoint.pixelY);
      console.log('[collector] 转换米级坐标:', this._currentPoint.realX, this._currentPoint.realY);

      this.setData({
        pixelX: this._currentPoint.pixelX,
        pixelY: this._currentPoint.pixelY,
        realX: this._currentPoint.realX,
        realY: this._currentPoint.realY,
        scaleX: round2(scaleX),
      }, () => this.drawMarkers());

      await this.scanWifiAtCurrentPoint();
    });
  },

  drawMarkers() {
    const ctx = wx.createCanvasContext('markerCanvas', this);
    const query = wx.createSelectorQuery().in(this);
    query.select('.image-stage').boundingClientRect();
    query.exec((res) => {
      const rect = res && res[0] ? res[0] : null;
      if (!rect || !rect.width || !rect.height) return;

      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.setFillStyle('#e11d48');
      ctx.setStrokeStyle('#e11d48');
      ctx.setFontSize(12);

      this._markers.forEach((m) => {
        ctx.beginPath();
        ctx.arc(m.x, m.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(`${m.text}`, m.x + 10, m.y - 10);
      });

      ctx.draw();
    });
  },

  async ensureLocationPermission() {
    return new Promise((resolve) => {
      wx.getSetting({
        success: (res) => {
          const auth = res && res.authSetting;
          if (auth && auth['scope.userLocation']) {
            resolve(true);
            return;
          }

          wx.authorize({
            scope: 'scope.userLocation',
            success: () => resolve(true),
            fail: () => resolve(false),
          });
        },
        fail: () => resolve(false),
      });
    });
  },

  async requestWifiListOnce() {
    const hasPermission = await this.ensureLocationPermission();
    if (!hasPermission) throw new Error('未授权定位权限，无法扫描WiFi');

    await new Promise((resolve, reject) => {
      wx.startWifi({
        success: () => resolve(),
        fail: (err) => reject(new Error((err && err.errMsg) || 'startWifi 失败')),
      });
    });

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this._pendingWifiResolve = null;
        reject(new Error('获取WiFi列表超时'));
      }, 4500);

      this._pendingWifiResolve = (wifiList) => {
        clearTimeout(timer);
        resolve(wifiList || []);
      };

      wx.getWifiList({
        fail: (err) => {
          clearTimeout(timer);
          this._pendingWifiResolve = null;
          reject(new Error((err && err.errMsg) || 'getWifiList 失败'));
        },
      });
    });
  },

  normalizeWifiList(list) {
    return (list || [])
      .map((w) => ({ bssid: String(w.BSSID || '').trim(), rssi: Number(w.RSSI) }))
      .filter((w) => w.bssid && !Number.isNaN(w.rssi) && w.rssi > -90)
      .sort((a, b) => b.rssi - a.rssi);
  },

  async scanWifiAtCurrentPoint() {
    try {
      wx.showLoading({ title: '扫描中...', mask: true });
      const listRaw = await this.requestWifiListOnce();
      const wifiList = this.normalizeWifiList(listRaw);
      this._currentWifiList = wifiList;
      this.setData({ wifiList });
      wx.hideLoading();
      wx.showToast({ title: `扫描到${wifiList.length}个`, icon: 'none' });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '扫描失败', icon: 'none' });
    }
  },

  async collectBatchFive() {
    if (!this._currentPoint) {
      wx.showToast({ title: '请先点击平面图选点', icon: 'none' });
      return;
    }

    try {
      wx.showLoading({ title: '批量采集中...', mask: true });
      const scans = [];
      for (let i = 0; i < 5; i++) {
        const one = await this.requestWifiListOnce();
        scans.push(this.normalizeWifiList(one));
        if (i < 4) await sleep(600);
      }

      const agg = {};
      scans.forEach((list) => {
        list.forEach((item) => {
          if (!agg[item.bssid]) {
            agg[item.bssid] = { bssid: item.bssid, sum: 0, count: 0 };
          }
          agg[item.bssid].sum += item.rssi;
          agg[item.bssid].count += 1;
        });
      });

      const averaged = Object.keys(agg)
        .map((bssid) => ({
          bssid,
          rssi: Math.round(agg[bssid].sum / agg[bssid].count),
        }))
        .filter((x) => x.rssi > -90)
        .sort((a, b) => b.rssi - a.rssi);

      this._currentWifiList = averaged;
      this.setData({ wifiList: averaged });
      wx.hideLoading();
      wx.showToast({ title: '5次采集完成', icon: 'none' });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '批量采集失败', icon: 'none' });
    }
  },

  async saveCurrentFingerprint() {
    if (!this._currentPoint) {
      wx.showToast({ title: '请先点击平面图选点', icon: 'none' });
      return;
    }

    const fingerprints = this._currentWifiList || [];
    if (!fingerprints.length) {
      wx.showToast({ title: '请先扫描WiFi', icon: 'none' });
      return;
    }

    try {
      wx.showLoading({ title: '保存中...', mask: true });
      const db = wx.cloud.database();
      await db.collection('fingerprints').add({
        data: {
          buildingKey: this.data.buildingKey,
          floor: this.data.floor,
          floorPlanUrl: this.data.floorPlanUrl,
          position: { x: this._currentPoint.realX, y: this._currentPoint.realY },
          pixelPosition: { x: this._currentPoint.pixelX, y: this._currentPoint.pixelY },
          fingerprints,
          createdAt: db.serverDate(),
        },
      });

      this.setData({ collectedCount: (this.data.collectedCount || 0) + 1 });
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: (err && err.message) || '保存失败', icon: 'none' });
    }
  },

  clearMarkers() {
    this._markers = [];
    this._currentPoint = null;
    this._currentWifiList = [];
    this.setData({
      pixelX: '-',
      pixelY: '-',
      realX: '-',
      realY: '-',
      scaleX: '-',
      wifiList: [],
      collectedCount: 0,
    }, () => this.drawMarkers());
  },
});
