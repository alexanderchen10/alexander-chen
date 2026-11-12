export const PLAYGROUND_SCENE_WIDTH = 1672;
export const PLAYGROUND_SCENE_HEIGHT = 941;
export const PLAYGROUND_COLLIDER = { rx: 14, ry: 7 };

const taipeiGround = [
  // Keep Pixel Alex on the rainbow crossing in the foreground. The slight
  // slope follows the painted band instead of using a rectangular screen box.
  [0, 806], [420, 807], [836, 808], [1250, 809], [1672, 812],
  [1672, 910], [1250, 908], [836, 907], [420, 905], [0, 904],
];

const torontoPlaza = [
  [0, 750], [520, 750], [600, 758], [1170, 758], [1230, 735], [1450, 710], [1672, 690], [1672, 941], [0, 941],
];
// The ramp is intentionally inset from both concrete walls. Its extra points
// follow the visible curve closely enough that the feet never enter the wall
// artwork while still leaving a generous, playable route up the centre.
const torontoRamp = [
  [655, 774], [814, 739], [982, 691], [1102, 646], [1170, 590],
  [1325, 590], [1302, 648], [1250, 732], [1182, 795],
];
const torontoRightWalk = [[1210, 760], [1362, 650], [1672, 690], [1672, 941], [1228, 941]];

const rect = (id, x, y, width, height) => ({ id, type: "rect", x, y, width, height });
const circle = (id, x, y, radius) => ({ id, type: "circle", x, y, radius });
const foreground = (id, depth, points) => ({ id, depth, points });

export const playgroundScenes = [
  {
    id: "taipei",
    label: "Taiwan",
    chapter: "chapter 01 · origin",
    title: "Taipei, Taiwan",
    image: "/projects/playground/taipei-101-pixel-background.png",
    spawn: { x: 836, y: 858 },
    walkable: [taipeiGround],
    obstacles: [
      rect("left-flower-bed", 0, 666, 153, 132),
      rect("right-flower-bed", 1450, 680, 222, 125),
      circle("cone-one", 135, 762, 20), circle("cone-two", 205, 756, 18),
      circle("cone-three", 257, 752, 17), circle("cone-four", 402, 744, 14),
      rect("planter-one", 455, 708, 82, 68), rect("planter-two", 648, 703, 84, 72),
      rect("planter-three", 988, 702, 80, 73), rect("planter-four", 1217, 703, 86, 72),
      circle("lamp-left", 162, 760, 14), circle("lamp-mid-left", 374, 723, 10),
      circle("lamp-mid-right", 1037, 706, 10), circle("lamp-right", 1390, 724, 12),
      circle("bollard-one", 603, 711, 7), circle("bollard-two", 783, 715, 7),
      circle("bollard-three", 865, 715, 7), circle("bollard-four", 1131, 715, 7),
    ],
    foregrounds: [
      foreground("left-bed", 798, [[0, 635], [155, 635], [155, 798], [0, 798]]),
      foreground("right-bed", 805, [[1445, 650], [1672, 650], [1672, 805], [1445, 805]]),
      foreground("planter-one", 776, [[448, 690], [544, 690], [544, 780], [448, 780]]),
      foreground("planter-two", 775, [[640, 685], [738, 685], [738, 780], [640, 780]]),
      foreground("planter-three", 775, [[980, 684], [1075, 684], [1075, 780], [980, 780]]),
      foreground("planter-four", 775, [[1207, 684], [1310, 684], [1310, 780], [1207, 780]]),
      foreground("lamp-left", 780, [[92, 190], [190, 190], [190, 784], [135, 784]]),
      foreground("lamp-mid-left", 731, [[346, 535], [402, 535], [402, 734], [350, 734]]),
      foreground("lamp-mid-right", 718, [[1008, 496], [1066, 496], [1066, 720], [1014, 720]]),
      foreground("lamp-right", 735, [[1352, 470], [1419, 470], [1419, 738], [1368, 738]]),
    ],
    perspective: { backY: 690, frontY: 930, backScale: 0.72, frontScale: 1 },
  },
  {
    id: "toronto",
    label: "Toronto",
    chapter: "chapter 02 · next stop",
    title: "Toronto, Canada",
    image: "/projects/playground/toronto-city-hall-pixel-background.png",
    spawn: { x: 836, y: 872 },
    walkable: [torontoPlaza, torontoRamp, torontoRightWalk],
    obstacles: [
      rect("pool", 0, 650, 522, 103),
      circle("bollard-left", 579, 805, 18), circle("bollard-middle", 773, 813, 18), circle("bollard-right", 1018, 821, 19),
    ],
    foregrounds: [
      foreground("pool-edge", 752, [[0, 645], [525, 645], [525, 754], [0, 754]]),
      foreground("ramp-left-wall", 806, [[520, 704], [1118, 578], [1168, 577], [1192, 608], [1168, 638], [1000, 704], [805, 759], [520, 786]]),
      foreground("ramp-right-wall", 816, [[1327, 548], [1372, 578], [1372, 680], [1180, 823], [1178, 724], [1308, 590]]),
      foreground("bollard-left", 826, [[558, 710], [600, 710], [600, 830], [558, 830]]),
      foreground("bollard-middle", 834, [[752, 718], [794, 718], [794, 838], [752, 838]]),
      foreground("bollard-right", 842, [[995, 720], [1040, 720], [1040, 846], [995, 846]]),
    ],
    perspective: { backY: 570, frontY: 935, backScale: 0.66, frontScale: 1 },
  },
];

export const pointInPolygon = ({ x, y }, polygon) => {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [x1, y1] = polygon[index];
    const [x2, y2] = polygon[previous];
    const crosses = (y1 > y) !== (y2 > y) && x < ((x2 - x1) * (y - y1)) / (y2 - y1 || Number.EPSILON) + x1;
    if (crosses) inside = !inside;
  }
  return inside;
};

const squaredDistanceToSegment = (point, start, end) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (!dx && !dy) return (point.x - start.x) ** 2 + (point.y - start.y) ** 2;
  const amount = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)));
  const x = start.x + dx * amount;
  const y = start.y + dy * amount;
  return (point.x - x) ** 2 + (point.y - y) ** 2;
};

const ellipseIntersectsPolygon = (position, collider, polygon) => {
  const scaled = polygon.map(([x, y]) => ({ x: (x - position.x) / collider.rx, y: (y - position.y) / collider.ry }));
  if (pointInPolygon({ x: 0, y: 0 }, scaled.map(point => [point.x, point.y]))) return true;
  for (let index = 0; index < scaled.length; index += 1) {
    const next = (index + 1) % scaled.length;
    if (squaredDistanceToSegment({ x: 0, y: 0 }, scaled[index], scaled[next]) <= 1) return true;
  }
  return false;
};

const colliderHitsObstacle = (position, collider, obstacle) => {
  if (obstacle.type === "rect") {
    return position.x + collider.rx > obstacle.x && position.x - collider.rx < obstacle.x + obstacle.width &&
      position.y + collider.ry > obstacle.y && position.y - collider.ry < obstacle.y + obstacle.height;
  }
  if (obstacle.type === "circle") {
    const dx = (position.x - obstacle.x) / (obstacle.radius + collider.rx);
    const dy = (position.y - obstacle.y) / (obstacle.radius + collider.ry);
    return dx * dx + dy * dy < 1;
  }
  return obstacle.type === "polygon" && ellipseIntersectsPolygon(position, collider, obstacle.points);
};

export const isPlaygroundPositionValid = (scene, position, collider = PLAYGROUND_COLLIDER) => {
  const samples = [
    [0, 0], [-collider.rx, 0], [collider.rx, 0], [0, -collider.ry], [0, collider.ry],
    [-collider.rx * 0.72, -collider.ry * 0.72], [collider.rx * 0.72, -collider.ry * 0.72],
    [-collider.rx * 0.72, collider.ry * 0.72], [collider.rx * 0.72, collider.ry * 0.72],
  ];
  const insideGround = samples.every(([offsetX, offsetY]) =>
    scene.walkable.some(polygon => pointInPolygon({ x: position.x + offsetX, y: position.y + offsetY }, polygon)),
  );
  return insideGround && !scene.obstacles.some(obstacle => colliderHitsObstacle(position, collider, obstacle));
};

export const movePlaygroundPosition = (scene, position, delta, collider = PLAYGROUND_COLLIDER) => {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(delta.x), Math.abs(delta.y)) / 5));
  const stepX = delta.x / steps;
  const stepY = delta.y / steps;
  const next = { ...position };
  for (let index = 0; index < steps; index += 1) {
    if (stepX && isPlaygroundPositionValid(scene, { x: next.x + stepX, y: next.y }, collider)) next.x += stepX;
    if (stepY && isPlaygroundPositionValid(scene, { x: next.x, y: next.y + stepY }, collider)) next.y += stepY;
  }
  return next;
};

const NAV_CELL = 24;
const NAV_COLUMNS = Math.ceil(PLAYGROUND_SCENE_WIDTH / NAV_CELL);
const NAV_ROWS = Math.ceil(PLAYGROUND_SCENE_HEIGHT / NAV_CELL);
const navigationCellCache = new Map();
const cellKey = (column, row) => row * NAV_COLUMNS + column;
const pointForCell = (column, row) => ({ x: Math.min(PLAYGROUND_SCENE_WIDTH - 1, column * NAV_CELL + NAV_CELL / 2), y: Math.min(PLAYGROUND_SCENE_HEIGHT - 1, row * NAV_CELL + NAV_CELL / 2) });
const cellForPoint = (point) => ({ column: Math.max(0, Math.min(NAV_COLUMNS - 1, Math.floor(point.x / NAV_CELL))), row: Math.max(0, Math.min(NAV_ROWS - 1, Math.floor(point.y / NAV_CELL))) });

const validNavigationCells = scene => {
  if (navigationCellCache.has(scene.id)) return navigationCellCache.get(scene.id);
  const cells = [];
  for (let row = 0; row < NAV_ROWS; row += 1) {
    for (let column = 0; column < NAV_COLUMNS; column += 1) {
      const point = pointForCell(column, row);
      if (isPlaygroundPositionValid(scene, point)) cells.push({ column, row, point });
    }
  }
  navigationCellCache.set(scene.id, cells);
  return cells;
};

const aStar = (scene, start, goal) => {
  const startKey = cellKey(start.column, start.row);
  const goalKey = cellKey(goal.column, goal.row);
  if (startKey === goalKey) return [];
  const open = [{ ...start, key: startKey, score: 0 }];
  const costs = new Map([[startKey, 0]]);
  const previous = new Map();
  const closed = new Set();
  const valid = (column, row) => column >= 0 && row >= 0 && column < NAV_COLUMNS && row < NAV_ROWS && isPlaygroundPositionValid(scene, pointForCell(column, row));
  while (open.length) {
    let bestIndex = 0;
    for (let index = 1; index < open.length; index += 1) if (open[index].score < open[bestIndex].score) bestIndex = index;
    const current = open.splice(bestIndex, 1)[0];
    if (current.key === goalKey) {
      const path = [];
      let key = current.key;
      while (key !== startKey) {
        const column = key % NAV_COLUMNS;
        const row = Math.floor(key / NAV_COLUMNS);
        path.push(pointForCell(column, row));
        key = previous.get(key);
      }
      return path.reverse();
    }
    if (closed.has(current.key)) continue;
    closed.add(current.key);
    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
        if (!columnOffset && !rowOffset) continue;
        const column = current.column + columnOffset;
        const row = current.row + rowOffset;
        if (!valid(column, row)) continue;
        if (columnOffset && rowOffset && (!valid(current.column + columnOffset, current.row) || !valid(current.column, current.row + rowOffset))) continue;
        const key = cellKey(column, row);
        if (closed.has(key)) continue;
        const cost = costs.get(current.key) + (columnOffset && rowOffset ? Math.SQRT2 : 1);
        if (cost >= (costs.get(key) ?? Infinity)) continue;
        costs.set(key, cost);
        previous.set(key, current.key);
        const remainingX = Math.abs(column - goal.column);
        const remainingY = Math.abs(row - goal.row);
        const heuristic = Math.max(remainingX, remainingY) + 0.41 * Math.min(remainingX, remainingY);
        open.push({ column, row, key, score: cost + heuristic });
      }
    }
  }
  return null;
};

const hasLineOfSight = (scene, start, end) => {
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const steps = Math.max(1, Math.ceil(distance / 7));
  for (let index = 1; index <= steps; index += 1) {
    const amount = index / steps;
    if (!isPlaygroundPositionValid(scene, { x: start.x + (end.x - start.x) * amount, y: start.y + (end.y - start.y) * amount })) return false;
  }
  return true;
};

const simplifyRoute = (scene, start, route) => {
  const simplified = [];
  let anchor = start;
  let index = 0;
  while (index < route.length) {
    let furthest = index;
    for (let candidate = route.length - 1; candidate >= index; candidate -= 1) {
      if (hasLineOfSight(scene, anchor, route[candidate])) { furthest = candidate; break; }
    }
    simplified.push(route[furthest]);
    anchor = route[furthest];
    index = furthest + 1;
  }
  return simplified;
};

export const findPlaygroundRoute = (scene, start, requestedTarget) => {
  const cells = validNavigationCells(scene);
  const nearest = point => [...cells].sort((first, second) =>
    (first.point.x - point.x) ** 2 + (first.point.y - point.y) ** 2 - ((second.point.x - point.x) ** 2 + (second.point.y - point.y) ** 2),
  );
  const startCell = nearest(start)[0];
  if (!startCell) return null;
  const candidates = nearest(requestedTarget).slice(0, 120);
  const exactTargetIsValid = isPlaygroundPositionValid(scene, requestedTarget);
  let closestReachable = null;
  for (const goal of candidates) {
    const gridRoute = aStar(scene, startCell, goal);
    if (!gridRoute) continue;
    if (!closestReachable) closestReachable = { goal, gridRoute };
    if (exactTargetIsValid && !hasLineOfSight(scene, goal.point, requestedTarget)) continue;
    const destination = exactTargetIsValid ? requestedTarget : goal.point;
    const route = [...gridRoute, destination];
    return { destination, points: simplifyRoute(scene, start, route) };
  }
  if (closestReachable) {
    const route = [...closestReachable.gridRoute, closestReachable.goal.point];
    return { destination: closestReachable.goal.point, points: simplifyRoute(scene, start, route) };
  }
  return null;
};

export const clipPathForScenePolygon = polygon => `polygon(${polygon.map(([x, y]) => `${(x / PLAYGROUND_SCENE_WIDTH * 100).toFixed(3)}% ${(y / PLAYGROUND_SCENE_HEIGHT * 100).toFixed(3)}%`).join(",")})`;

export const perspectiveScaleForScene = (scene, y) => {
  const { backY, frontY, backScale, frontScale } = scene.perspective;
  const amount = Math.max(0, Math.min(1, (y - backY) / (frontY - backY)));
  return backScale + (frontScale - backScale) * amount;
};
