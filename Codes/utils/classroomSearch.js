const CLASSROOM_BUILDINGS = [
  {
    key: '博文楼',
    aliases: ['博文楼', '博文'],
    locationNames: ['博文楼'],
    floorPlanSlug: 'bowen',
    maxFloor: 4,
  },
  {
    key: '崇理楼',
    aliases: ['崇理楼', '崇理'],
    locationNames: ['崇理楼'],
    floorPlanSlug: 'chongli',
    maxFloor: 5,
  },
  {
    key: '明德楼',
    aliases: ['明德楼', '明德'],
    locationNames: ['明德楼'],
    floorPlanSlug: 'mingde',
    maxFloor: 5,
  },
  {
    key: '致远楼',
    aliases: ['致远楼', '致远'],
    locationNames: ['致远楼'],
    floorPlanSlug: 'zhiyuan',
    maxFloor: 4,
  },
  {
    key: '日新楼',
    aliases: ['日新楼', '日新'],
    locationNames: ['日新楼A座', '日新楼B座', '日新楼C座'],
    floorPlanSlug: 'rixin',
    maxFloor: 5,
  },
];

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
    const floorPlanImage = hasFloorPlan
      ? `/images/floorplans/${building.floorPlanSlug}/f${classroom.floor}.jpg`
      : '';
    const floorPlanHint = hasFloorPlan
      ? `已匹配到${building.key}${classroom.floor}层平面图。`
      : `${building.key}当前仅收录1-${building.maxFloor}层平面图。`;

    result.push({
      ...anchor,
      id: `classroom-${anchor.id}-${classroom.roomCode}`,
      name: `${building.key}${classroom.roomCode}教室`,
      sub: `教室号识别：${classroom.roomCode} -> ${floorText}`,
      description: `${building.key}${classroom.roomCode}教室（${floorText}号）。已根据输入自动识别楼层，将先导航至${anchor.name}。`,
      floor: classroom.floor,
      roomNo: classroom.roomPart,
      buildingKey: building.key,
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
};
