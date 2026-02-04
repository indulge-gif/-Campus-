const { locations: LOCATION_SOURCE } = require('../../utils/locations.js');

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[，。！？、,.!?;；:：()（）\-_/\\]/g, "");
}

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
  const desc = normalizeText(location && location.description);
  const haystack = name + "|" + desc;
  if (!haystack) return null;

  let score = 0;
  if (name === query) score += 1000;
  if (name.startsWith(query)) score += 600;
  if (name.includes(query)) score += 300;
  if (desc && desc.includes(query)) score += 160;
  if (isSubsequence(query, name)) score += 120;
  if (desc && isSubsequence(query, desc)) score += 60;
  if (score <= 0) return null;
  score += Math.max(0, 20 - name.length);
  return score;
}

function buildSuggestions(query, locations, limit = 10) {
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
  data: {
    searchQuery: "",
    locations: LOCATION_SOURCE,
    suggestions: [],
    suggestionsVisible: false,
  },

  onLoad(options) {
    if (options.query) {
      const q = String(options.query || "");
      this.setData({
        searchQuery: q,
        suggestions: [],
        suggestionsVisible: false,
      });
    }
  },

  onSearchInput(e) {
    const value = e.detail.value;
    this.setData({
      searchQuery: value,
      suggestions: [],
      suggestionsVisible: false,
    });
  },

  onSearchTap() {
    const query = String(this.data.searchQuery || "").trim();
    if (!query) {
      wx.showToast({ title: '请输入地点名称', icon: 'none' });
      return;
    }
    const suggestions = buildSuggestions(query, this.data.locations, 10);
    if (suggestions.length === 0) {
      this.setData({ suggestions: [], suggestionsVisible: false });
      wx.showToast({ title: '未找到相关地点', icon: 'none' });
      return;
    }
    if (suggestions.length === 1) {
      this.setData({ suggestions, suggestionsVisible: false });
      wx.navigateTo({
        url: `/pages/detail/detail?location=${encodeURIComponent(JSON.stringify(suggestions[0]))}`
      });
      return;
    }
    this.setData({ suggestions, suggestionsVisible: true });
  },

  hideSuggestions() {
    this.setData({ suggestionsVisible: false });
  },

  onSuggestionTap(e) {
    const id = e.currentTarget.dataset.id;
    const picked = (this.data.suggestions || []).find((x) => x.id === id);
    if (!picked) return;
    this.setData({ suggestionsVisible: false });
    wx.navigateTo({
      url: `/pages/detail/detail?location=${encodeURIComponent(JSON.stringify(picked))}`
    });
  },

  onTagTap(e) {
    const q = e.currentTarget.dataset.query;
    this.setData({
      searchQuery: q,
    }, this.onSearchTap);
  }
});