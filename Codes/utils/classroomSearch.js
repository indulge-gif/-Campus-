const CLASSROOM_BUILDINGS = [
  {
    key: '博文楼',
    aliases: ['博文楼', '博文'],
    locationNames: ['博文楼'],
    floorPlanSlug: 'bowen',
    floorPlanFileMap: {
      1: 1,
      2: 2,
      3: 3,
      4: 4,
    },
    maxFloor: 4,
  },
  {
    key: '崇理楼',
    aliases: ['崇理楼', '崇理'],
    locationNames: ['崇理楼'],
    floorPlanSlug: 'chongli',
    floorPlanFileMap: {
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
    },
    maxFloor: 5,
  },
  {
    key: '明德楼',
    aliases: ['明德楼', '明德'],
    locationNames: ['明德楼'],
    floorPlanSlug: 'mingde',
    floorPlanFileMap: {
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
    },
    maxFloor: 5,
  },
  {
    key: '致远楼',
    aliases: ['致远楼', '致远'],
    locationNames: ['致远楼'],
    floorPlanSlug: 'zhiyuan',
    floorPlanFileMap: {
      1: 1,
      2: 2,
      3: 3,
      4: 4,
    },
    maxFloor: 4,
  },
  {
    key: '日新楼',
    aliases: ['日新楼', '日新'],
    locationNames: ['日新楼A座', '日新楼B座', '日新楼C座'],
    floorPlanSlug: 'rixin',
    floorPlanFileMap: {
      1: 2,
      2: 1,
      3: 5,
      4: 3,
      5: 4,
    },
    maxFloor: 5,
  },
];

const CLOUD_FLOORPLAN_BASE = 'cloud://cloud1-4gh72aev1c85874d.636c-cloud1-4gh72aev1c85874d-1360566409/img/floorplans';

function getFloorPlanFileNo(building, floor) {
  const map = building && building.floorPlanFileMap;
  if (map && map[floor]) return map[floor];
  return floor;
}

function parseClassroomQuery(queryRaw) {
  const text = String(queryRaw || '').replace(/\s+/g, '');
  if (!text) return null;

  const matched = text.match(/(\d{3,4})/);
  if (!matched) return null;

  const roomCode = matched[1];
  const floorPart = roomCode.slice(0, -2);
  const roomPart = roomCode.slice(-2);
  const floor = Number(floorPart);
  if (!floor || floor < 1) return null;

  return {
    roomCode,
    floor,
    roomPart,
  };
}

function getMatchedBuilding(queryRaw) {
  const text = String(queryRaw || '');
  return CLASSROOM_BUILDINGS.find((item) => item.aliases.some((a) => text.includes(a))) || null;
}

function getTeachingBuildingConfigByName(nameRaw) {
  const text = String(nameRaw || '');
  if (!text) return null;
  return CLASSROOM_BUILDINGS.find((item) =>
    item.key === text || item.aliases.some((a) => text.includes(a) || a.includes(text))
  ) || null;
}

function buildFloorPlanImageByConfig(buildingConfig, floor) {
  if (!buildingConfig) return '';
  const floorNo = Number(floor);
  if (!floorNo || floorNo < 1 || floorNo > Number(buildingConfig.maxFloor || 0)) return '';
  const floorFileNo = getFloorPlanFileNo(buildingConfig, floorNo);
  return `${CLOUD_FLOORPLAN_BASE}/${buildingConfig.floorPlanSlug}/f${floorFileNo}.jpg`;
}

function pickAnchorLocation(buildingConfig, locations) {
  if (!buildingConfig) return null;
  for (const name of buildingConfig.locationNames) {
    const found = (locations || []).find((x) => x.name === name);
    if (found) return found;
  }
  return null;
}

function buildClassroomSuggestions(queryRaw, locations) {
  const classroom = parseClassroomQuery(queryRaw);
  if (!classroom) return [];

  const matchedBuilding = getMatchedBuilding(queryRaw);
  const targets = matchedBuilding ? [matchedBuilding] : CLASSROOM_BUILDINGS;
  const result = [];

  for (const building of targets) {
    const anchor = pickAnchorLocation(building, locations);
    if (!anchor) continue;

    const floorText = `${classroom.floor}层${classroom.roomPart}`;
    const hasFloorPlan = classroom.floor <= building.maxFloor;
    const floorFileNo = getFloorPlanFileNo(building, classroom.floor);
    const floorPlanImage = hasFloorPlan
      ? `${CLOUD_FLOORPLAN_BASE}/${building.floorPlanSlug}/f${floorFileNo}.jpg`
      : '';
    const floorPlanHint = hasFloorPlan
      ? `已匹配到${building.key}${classroom.floor}层平面图，路线按该楼栋标定坐标绘制。`
      : `${building.key}当前仅收录1-${building.maxFloor}层平面图。`;

    result.push({
      ...anchor,
      id: `classroom-${anchor.id}-${classroom.roomCode}`,
      name: `${building.key}${classroom.roomCode}教室`,
      sub: `教室号识别：${classroom.roomCode} -> ${floorText}`,
      description: `${building.key}${classroom.roomCode}教室（${floorText}号）。已根据输入自动识别楼层，将先导航至${anchor.name}。`,
      floor: classroom.floor,
      roomNo: classroom.roomPart,
      roomCode: classroom.roomCode,
      buildingKey: building.key,
      floorPlanSlug: building.floorPlanSlug,
      floorPlanImage,
      floorPlanHint,
    });
  }

  return result;
}

function mergeSuggestions(classroomSuggestions, normalSuggestions, limit) {
  const merged = [];
  const usedIds = new Set();
  [...(classroomSuggestions || []), ...(normalSuggestions || [])].forEach((item) => {
    if (!item) return;
    const key = String(item.id);
    if (usedIds.has(key)) return;
    usedIds.add(key);
    merged.push(item);
  });
  return typeof limit === 'number' ? merged.slice(0, limit) : merged;
}

module.exports = {
  buildClassroomSuggestions,
  mergeSuggestions,
  getTeachingBuildingConfigByName,
  buildFloorPlanImageByConfig,
};
