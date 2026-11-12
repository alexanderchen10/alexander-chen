import { trackPlayground } from "./analytics";
import { useEffect, useMemo, useRef, useState } from "react";

const WIDTH = 960;
const HEIGHT = 540;
const BASE_URL = import.meta.env.BASE_URL;

const scenes = [
  { id: "title", age: "PROLOGUE", location: "Vancouver", title: "Alex's Life", body: "A playable journey through the places that shaped me." },
  { id: "hospital", age: "AGE 0", location: "Vancouver General Hospital", title: "Hello, world", body: "Alex is born in Vancouver on a rainy Pacific morning." },
  { id: "airport", age: "AGE 5", location: "Vancouver International Airport", title: "The first big journey", body: "Walk through the terminal and meet the family at Gate 5." },
  { id: "flight", age: "AGE 5", location: "YVR to TPE", title: "Across the Pacific", body: "Guide the plane through the clouds and collect three memories." },
  { id: "taiwanIntro", age: "AGE 5", location: "Taipei, Taiwan", title: "A new chapter", body: "The city feels bright, busy, unfamiliar, and full of possibility." },
  { id: "taiwan", age: "AGE 5", location: "Taipei, Taiwan", title: "First steps in Taiwan", body: "Walk with the city and follow the glowing memory marker." },
  { id: "complete", age: "TO BE CONTINUED", location: "Alex's journey", title: "More life ahead", body: "The next chapter is waiting to be built." },
];

const palette = ["#f49fbc", "#ffd166", "#6cd4ff", "#9d8cff", "#68d391", "#ff8c69", "#f5f1e8"];

function rect(context, x, y, width, height, color) {
  context.fillStyle = color;
  context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function drawPixelPerson(context, npc, time, scale = 1) {
  const step = Math.sin(time * .012 + npc.seed) > 0 ? 1 : -1;
  const x = Math.round(npc.x);
  const y = Math.round(npc.y + (npc.moving ? Math.abs(Math.sin(time * .009 + npc.seed)) * -2 : 0));
  const skin = npc.skin || "#d7a17d";
  const hair = npc.hair || "#29213a";
  const color = npc.color || "#6c5ce7";
  rect(context, x - 5 * scale, y - 32 * scale, 10 * scale, 9 * scale, hair);
  rect(context, x - 6 * scale, y - 27 * scale, 12 * scale, 10 * scale, skin);
  rect(context, x - 7 * scale, y - 18 * scale, 14 * scale, 15 * scale, color);
  rect(context, x - 5 * scale, y - 3 * scale, 4 * scale, 10 * scale, "#26304d");
  rect(context, x + 2 * scale, y - 3 * scale, 4 * scale, 10 * scale, "#26304d");
  rect(context, x - 8 * scale, y - 16 * scale, 3 * scale, 12 * scale, skin);
  rect(context, x + 6 * scale, y - 16 * scale, 3 * scale, 12 * scale, skin);
  if (npc.moving) {
    rect(context, x - 5 * scale + step * 2, y + 7 * scale, 5 * scale, 3 * scale, "#f6f1e8");
    rect(context, x + 2 * scale - step * 2, y + 7 * scale, 5 * scale, 3 * scale, "#f6f1e8");
  } else {
    rect(context, x - 5 * scale, y + 7 * scale, 5 * scale, 3 * scale, "#f6f1e8");
    rect(context, x + 2 * scale, y + 7 * scale, 5 * scale, 3 * scale, "#f6f1e8");
  }
  if (npc.bag) {
    const bagX = npc.speed >= 0 ? x - 15 * scale : x + 9 * scale;
    rect(context, bagX, y - 10 * scale, 8 * scale, 11 * scale, npc.bagColor || "#ef6f5e");
    rect(context, bagX + 2 * scale, y - 13 * scale, 4 * scale, 4 * scale, "#2b2445");
  }
  if (npc.kind === "nurse") {
    rect(context, x - 7 * scale, y - 19 * scale, 14 * scale, 17 * scale, "#eaf5ff");
    rect(context, x - 2 * scale, y - 27 * scale, 5 * scale, 5 * scale, "#eaf5ff");
    rect(context, x - 1 * scale, y - 17 * scale, 3 * scale, 9 * scale, "#ef6f5e");
    rect(context, x - 4 * scale, y - 14 * scale, 9 * scale, 3 * scale, "#ef6f5e");
  }
}

function drawVehicle(context, vehicle, time) {
  const x = Math.round(vehicle.x);
  const y = Math.round(vehicle.y + Math.sin(time * .01 + vehicle.seed));
  if (vehicle.kind === "taxi") {
    rect(context, x - 34, y - 18, 68, 18, "#f6b82e");
    rect(context, x - 18, y - 30, 34, 13, "#f6b82e");
    rect(context, x - 14, y - 27, 12, 9, "#bde9f4");
    rect(context, x + 1, y - 27, 11, 9, "#bde9f4");
    rect(context, x - 23, y - 2, 12, 8, "#20243d");
    rect(context, x + 14, y - 2, 12, 8, "#20243d");
    return;
  }
  rect(context, x - 12, y - 14, 24, 8, vehicle.color);
  rect(context, x - 3, y - 24, 7, 12, vehicle.riderColor || "#f5f1e8");
  rect(context, x - 1, y - 32, 7, 8, "#d7a17d");
  rect(context, x - 5, y - 1, 8, 8, "#212438");
  rect(context, x + 8, y - 1, 8, 8, "#212438");
}

function drawCloud(context, x, y, scale = 1, color = "#f7fcff") {
  rect(context, x, y, 54 * scale, 14 * scale, color);
  rect(context, x + 11 * scale, y - 11 * scale, 19 * scale, 13 * scale, color);
  rect(context, x + 28 * scale, y - 7 * scale, 18 * scale, 10 * scale, color);
}

function drawStar(context, x, y, color = "#ffd166", size = 1) {
  rect(context, x - 3 * size, y - 12 * size, 7 * size, 25 * size, color);
  rect(context, x - 12 * size, y - 3 * size, 25 * size, 7 * size, color);
  rect(context, x - 7 * size, y - 7 * size, 15 * size, 15 * size, color);
  rect(context, x - 2 * size, y - 2 * size, 5 * size, 5 * size, "#fff5b5");
}

function drawPlane(context, x, y, scale = 1) {
  rect(context, x - 34 * scale, y - 7 * scale, 72 * scale, 14 * scale, "#f7fbff");
  rect(context, x - 8 * scale, y - 22 * scale, 25 * scale, 15 * scale, "#f7fbff");
  rect(context, x - 9 * scale, y + 7 * scale, 27 * scale, 11 * scale, "#d9e6f2");
  rect(context, x + 31 * scale, y - 18 * scale, 10 * scale, 17 * scale, "#f7fbff");
  rect(context, x - 27 * scale, y - 4 * scale, 5 * scale, 5 * scale, "#6c5ce7");
  rect(context, x - 16 * scale, y - 4 * scale, 5 * scale, 5 * scale, "#6c5ce7");
  rect(context, x - 5 * scale, y - 4 * scale, 5 * scale, 5 * scale, "#6c5ce7");
  rect(context, x + 6 * scale, y - 4 * scale, 5 * scale, 5 * scale, "#6c5ce7");
}

function createNpcs(sceneId) {
  const count = sceneId === "hospital" ? 4 : sceneId === "airport" ? 11 : sceneId === "taiwan" || sceneId === "taiwanIntro" || sceneId === "title" ? 13 : 0;
  return Array.from({ length: count }, (_, index) => ({
    x: 70 + index * (850 / Math.max(1, count - 1)),
    y: sceneId === "hospital" ? 430 + (index % 2) * 20 : sceneId === "airport" ? 437 + (index % 3) * 15 : 456 + (index % 2) * 16,
    speed: (index % 2 === 0 ? 1 : -1) * (.28 + (index % 4) * .08),
    seed: index * 1.73,
    color: palette[index % palette.length],
    skin: ["#7c4e3b", "#d7a17d", "#efc3a4", "#9b6750"][index % 4],
    hair: ["#17182a", "#3f2d2c", "#c39862", "#2c2340"][index % 4],
    moving: true,
    bag: sceneId === "airport" && index % 3 === 0,
    kind: sceneId === "hospital" && index % 2 === 0 ? "nurse" : "person",
  }));
}

function createVehicles() {
  return [
    { x: 80, y: 515, speed: .75, seed: 1, kind: "scooter", color: "#ef476f", riderColor: "#6c5ce7" },
    { x: 330, y: 504, speed: -.62, seed: 2, kind: "scooter", color: "#5dd6c7", riderColor: "#f5f1e8" },
    { x: 570, y: 514, speed: .48, seed: 3, kind: "taxi", color: "#f6b82e" },
    { x: 830, y: 506, speed: -.7, seed: 4, kind: "scooter", color: "#7a8cff", riderColor: "#ffd166" },
  ];
}

function drawHospital(context, npcs, time) {
  rect(context, 0, 0, WIDTH, HEIGHT, "#161832");
  rect(context, 0, 352, WIDTH, 188, "#29294d");
  rect(context, 56, 52, 360, 230, "#a8d7e9");
  rect(context, 66, 62, 340, 210, "#6f91ac");
  rect(context, 66, 187, 340, 85, "#344d68");
  for (let index = 0; index < 14; index += 1) {
    const buildingX = 73 + index * 23;
    const height = 28 + (index % 5) * 13;
    rect(context, buildingX, 187 - height, 18, height, index % 2 ? "#405a75" : "#2d435f");
    rect(context, buildingX + 4, 179 - height, 3, 5, "#ffd166");
  }
  rect(context, 220, 94, 24, 93, "#4f6680");
  rect(context, 230, 73, 5, 23, "#4f6680");
  for (let index = 0; index < 22; index += 1) {
    const rainX = 77 + index * 15;
    const rainY = 70 + ((time * .16 + index * 29) % 180);
    rect(context, rainX, rainY, 2, 12, "#d9f2fa");
  }
  rect(context, 504, 220, 337, 176, "#eef0ef");
  rect(context, 478, 396, 390, 14, "#9ba7b3");
  rect(context, 555, 320, 235, 17, "#cbd6de");
  rect(context, 574, 268, 198, 55, "#e5ebef");
  rect(context, 599, 250, 147, 24, "#f8faf8");
  rect(context, 648, 255, 49, 18, "#edbea0");
  rect(context, 637, 274, 71, 28, "#89c9e5");
  rect(context, 527, 337, 12, 81, "#7f8ea0");
  rect(context, 821, 337, 12, 81, "#7f8ea0");
  rect(context, 882, 132, 18, 251, "#cbd4dc");
  rect(context, 844, 127, 96, 18, "#e3e9ee");
  rect(context, 869, 157, 46, 57, "#dce8ef");
  rect(context, 0, 431, WIDTH, 4, "#4b4b73");
  rect(context, 0, 492, WIDTH, 3, "#404067");
  npcs.forEach((npc) => drawPixelPerson(context, npc, time, .9));
  context.fillStyle = "rgba(90,77,170,.1)";
  context.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawAirport(context, npcs, player, time) {
  rect(context, 0, 0, WIDTH, HEIGHT, "#dff2fb");
  rect(context, 0, 55, WIDTH, 210, "#9fd5ef");
  drawCloud(context, 70, 115, 1.4);
  drawCloud(context, 655, 90, 1.1);
  drawPlane(context, 705, 175, .9);
  rect(context, 0, 262, WIDTH, 15, "#6f8196");
  rect(context, 0, 277, WIDTH, 155, "#e1e7e9");
  rect(context, 0, 432, WIDTH, 108, "#858aa0");
  for (let x = 0; x < WIDTH; x += 70) rect(context, x, 485, 36, 4, "#cacddb");
  rect(context, 38, 292, 340, 102, "#f7fafb");
  rect(context, 53, 306, 310, 72, "#263c64");
  rect(context, 67, 318, 282, 47, "#d8edf7");
  rect(context, 413, 265, 18, 167, "#7d8a9f");
  rect(context, 809, 230, 110, 180, "#3e3a60");
  rect(context, 822, 244, 84, 86, "#171735");
  context.fillStyle = "#ffffff";
  context.font = "bold 37px monospace";
  context.fillText("GATE 5", 829, 300);
  rect(context, 839, 359, 50, 8, "#ffd166");
  rect(context, 858, 367, 15, 42, "#ffd166");
  npcs.forEach((npc) => drawPixelPerson(context, npc, time, .86));
  drawPixelPerson(context, { ...player, color: "#6c5ce7", skin: "#d7a17d", hair: "#201a2d", moving: true, speed: 1, bag: true, bagColor: "#ef6f5e", seed: 14 }, time, 1.1);
}

function drawFlight(context, flight, time) {
  const sky = context.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#58a8e8");
  sky.addColorStop(.62, "#8ad4f3");
  sky.addColorStop(1, "#e8f5f5");
  context.fillStyle = sky;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  for (let index = 0; index < 8; index += 1) {
    const x = ((index * 170 - time * .05) % 1250 + 1250) % 1250 - 140;
    drawCloud(context, x, 90 + (index % 4) * 82, .9 + (index % 3) * .27, index % 2 ? "#eefaff" : "#ffffff");
  }
  rect(context, 0, 455, WIDTH, 85, "#3182bd");
  flight.stars.forEach((star) => { if (!star.collected) drawStar(context, star.x, star.y, "#ffd166", 1.25); });
  drawPlane(context, 220, flight.y, 1.4);
}

function drawTaiwan(context, image, npcs, vehicles, player, time, intro) {
  if (image?.complete) {
    const scale = Math.max(WIDTH / image.width, HEIGHT / image.height) * (intro ? 1.02 : 1.1);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const pan = intro ? Math.min(42, time * .018) : player.x * .08;
    context.drawImage(image, -(drawWidth - WIDTH) / 2 - pan, -(drawHeight - HEIGHT) / 2, drawWidth, drawHeight);
  } else {
    rect(context, 0, 0, WIDTH, HEIGHT, "#64c5ef");
  }
  if (intro) {
    context.fillStyle = "rgba(17,18,45,.18)";
    context.fillRect(0, 0, WIDTH, HEIGHT);
  }
  npcs.forEach((npc) => drawPixelPerson(context, npc, time, .68));
  vehicles.forEach((vehicle) => drawVehicle(context, vehicle, time));
  if (!intro) {
    drawPixelPerson(context, { ...player, color: "#6c5ce7", skin: "#d7a17d", hair: "#211a2d", moving: true, speed: 1, bag: true, bagColor: "#ef6f5e", seed: 21 }, time, 1.1);
    const markerY = 413 + Math.sin(time * .006) * 7;
    drawStar(context, 882, markerY, "#ffd166", 1.15);
    context.strokeStyle = "rgba(255,209,102,.8)";
    context.lineWidth = 3;
    context.strokeRect(858, markerY - 24, 48, 48);
  }
}

function drawTitle(context, image, npcs, vehicles, time) {
  drawTaiwan(context, image, npcs, vehicles, { x: 0 }, time, true);
  context.fillStyle = "rgba(11,12,31,.64)";
  context.fillRect(0, 0, WIDTH, HEIGHT);
  rect(context, 52, 61, 504, 231, "rgba(18,19,48,.88)");
  context.strokeStyle = "rgba(255,209,102,.74)";
  context.lineWidth = 3;
  context.strokeRect(52, 61, 504, 231);
  drawStar(context, 100, 108, "#ffd166", 1.15);
  context.fillStyle = "#ffd166";
  context.font = "bold 17px monospace";
  context.fillText("AN INTERACTIVE MEMORY", 139, 116);
  context.fillStyle = "#ffffff";
  context.font = "bold 56px monospace";
  context.fillText("ALEX'S LIFE", 93, 185);
  context.fillStyle = "#bbc1e5";
  context.font = "16px monospace";
  context.fillText("VANCOUVER  >  TAIWAN", 96, 226);
  rect(context, 96, 251, 190, 5, "#ef6f5e");
}

function drawComplete(context, image, npcs, vehicles, time) {
  drawTaiwan(context, image, npcs, vehicles, { x: 800 }, time, true);
  context.fillStyle = "rgba(9,10,27,.72)";
  context.fillRect(0, 0, WIDTH, HEIGHT);
  rect(context, 190, 126, 580, 284, "rgba(20,21,52,.94)");
  context.strokeStyle = "#ffd166";
  context.lineWidth = 3;
  context.strokeRect(190, 126, 580, 284);
  drawStar(context, 480, 182, "#ffd166", 1.2);
  context.textAlign = "center";
  context.fillStyle = "#ffffff";
  context.font = "bold 35px monospace";
  context.fillText("CHAPTER COMPLETE", 480, 250);
  context.fillStyle = "#c4c8e8";
  context.font = "16px monospace";
  context.fillText("VANCOUVER  >  TAIWAN", 480, 290);
  context.fillStyle = "#ffd166";
  context.font = "bold 14px monospace";
  context.fillText("MORE MEMORIES COMING SOON", 480, 333);
  context.textAlign = "start";
}

function actionLabel(sceneId, ready) {
  if (sceneId === "title") return "Start the journey";
  if (sceneId === "hospital") return "Continue to age five";
  if (sceneId === "airport") return ready ? "Board the flight" : "Walk to Gate 5";
  if (sceneId === "flight") return "Collect three memories";
  if (sceneId === "taiwanIntro") return "Step into Taiwan";
  if (sceneId === "taiwan") return ready ? "Save this memory" : "Find the memory star";
  return "Play from the beginning";
}

export default function AlexLifeGameV2({ navigate }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const keys = useRef({ left: false, right: false, up: false, down: false });
  const stateRef = useRef({
    player: { x: 102, y: 458, targetX: 102 },
    flight: { y: 258, targetY: 258, score: 0, stars: [] },
    npcs: createNpcs("title"),
    vehicles: createVehicles(),
  });
  const [sceneIndex, setSceneIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [flightScore, setFlightScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const scene = scenes[sceneIndex];
  const progress = Math.round((sceneIndex / (scenes.length - 1)) * 100);
  const progressLabel = sceneIndex === 0 ? "Journey ready" : `${progress}% of chapter one`;
  const motionScene = ["airport", "flight", "taiwan"].includes(scene.id);
  const canContinue = !motionScene || ready;
  const sceneNumber = String(sceneIndex + 1).padStart(2, "0");
  const gameState = useMemo(() => stateRef.current, []);

  const enterScene = (nextIndex) => {
    const nextScene = scenes[nextIndex];
    setReady(false);
    setFlightScore(0);
    gameState.player = { x: 102, y: nextScene.id === "taiwan" ? 462 : 458, targetX: 102 };
    gameState.npcs = createNpcs(nextScene.id);
    gameState.vehicles = createVehicles();
    gameState.flight = {
      y: 258,
      targetY: 258,
      score: 0,
      stars: [
        { x: 660, y: 170, collected: false },
        { x: 910, y: 310, collected: false },
        { x: 1170, y: 220, collected: false },
      ],
    };
    trackPlayground("advance_scene", nextScene.id);
    setSceneIndex(nextIndex);
  };

  const advance = () => {
    if (!canContinue) return;
    if (sceneIndex >= scenes.length - 1) enterScene(0);
    else enterScene(sceneIndex + 1);
  };

  useEffect(() => {
    const image = new Image();
    image.src = `${BASE_URL}projects/playground/alexs-life/taiwan-arrival.png`;
    imageRef.current = image;
  }, []);

  useEffect(() => {
    const down = (event) => {
      const key = event.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s", " ", "enter"].includes(key)) event.preventDefault();
      if (key === "arrowleft" || key === "a") keys.current.left = true;
      if (key === "arrowright" || key === "d") keys.current.right = true;
      if (key === "arrowup" || key === "w") keys.current.up = true;
      if (key === "arrowdown" || key === "s") keys.current.down = true;
      if ((key === " " || key === "enter") && !event.repeat) advance();
      if (key === "escape") setPaused((current) => !current);
    };
    const up = (event) => {
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") keys.current.left = false;
      if (key === "arrowright" || key === "d") keys.current.right = false;
      if (key === "arrowup" || key === "w") keys.current.up = false;
      if (key === "arrowdown" || key === "s") keys.current.down = false;
    };
    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context) return undefined;
    let frame;
    let previous = performance.now();
    let elapsed = 0;

    const loop = (now) => {
      const delta = Math.min(34, now - previous);
      previous = now;
      if (!paused) {
        elapsed += delta;
        gameState.npcs.forEach((npc) => {
          npc.x += npc.speed * delta / 16;
          if (npc.speed > 0 && npc.x > WIDTH + 40) npc.x = -40;
          if (npc.speed < 0 && npc.x < -40) npc.x = WIDTH + 40;
        });
        gameState.vehicles.forEach((vehicle) => {
          vehicle.x += vehicle.speed * delta / 16;
          if (vehicle.speed > 0 && vehicle.x > WIDTH + 80) vehicle.x = -80;
          if (vehicle.speed < 0 && vehicle.x < -80) vehicle.x = WIDTH + 80;
        });

        if (scene.id === "airport" || scene.id === "taiwan") {
          if (keys.current.left) gameState.player.targetX -= 3.2 * delta / 16;
          if (keys.current.right) gameState.player.targetX += 3.2 * delta / 16;
          gameState.player.targetX = Math.max(45, Math.min(915, gameState.player.targetX));
          const distance = gameState.player.targetX - gameState.player.x;
          gameState.player.x += Math.sign(distance) * Math.min(Math.abs(distance), 3 * delta / 16);
          const reached = gameState.player.x > (scene.id === "airport" ? 825 : 850);
          if (reached !== ready) setReady(reached);
        }

        if (scene.id === "flight") {
          if (keys.current.up) gameState.flight.targetY -= 4 * delta / 16;
          if (keys.current.down) gameState.flight.targetY += 4 * delta / 16;
          gameState.flight.targetY = Math.max(85, Math.min(405, gameState.flight.targetY));
          gameState.flight.y += (gameState.flight.targetY - gameState.flight.y) * .12;
          gameState.flight.stars.forEach((star) => {
            if (star.collected) return;
            star.x -= 2.65 * delta / 16;
            if (Math.abs(star.x - 220) < 28 && Math.abs(star.y - gameState.flight.y) < 30) {
              star.collected = true;
              gameState.flight.score += 1;
              setFlightScore(gameState.flight.score);
              if (gameState.flight.score >= 3) setReady(true);
            } else if (star.x < -40) {
              star.x = 1040 + Math.random() * 220;
              star.y = 120 + Math.random() * 250;
            }
          });
        }
      }

      context.imageSmoothingEnabled = false;
      context.clearRect(0, 0, WIDTH, HEIGHT);
      if (scene.id === "title") drawTitle(context, imageRef.current, gameState.npcs, gameState.vehicles, elapsed);
      else if (scene.id === "hospital") drawHospital(context, gameState.npcs, elapsed);
      else if (scene.id === "airport") drawAirport(context, gameState.npcs, gameState.player, elapsed);
      else if (scene.id === "flight") drawFlight(context, gameState.flight, elapsed);
      else if (scene.id === "taiwanIntro") drawTaiwan(context, imageRef.current, gameState.npcs, gameState.vehicles, gameState.player, elapsed, true);
      else if (scene.id === "taiwan") drawTaiwan(context, imageRef.current, gameState.npcs, gameState.vehicles, gameState.player, elapsed, false);
      else drawComplete(context, imageRef.current, gameState.npcs, gameState.vehicles, elapsed);

      if (paused) {
        context.fillStyle = "rgba(8,9,26,.76)";
        context.fillRect(0, 0, WIDTH, HEIGHT);
        context.textAlign = "center";
        context.fillStyle = "#ffffff";
        context.font = "bold 38px monospace";
        context.fillText("PAUSED", WIDTH / 2, HEIGHT / 2);
        context.textAlign = "start";
      }
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, [gameState, paused, ready, scene.id]);

  const handlePointer = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * WIDTH / bounds.width;
    const y = (event.clientY - bounds.top) * HEIGHT / bounds.height;
    if (scene.id === "airport" || scene.id === "taiwan") gameState.player.targetX = x;
    if (scene.id === "flight") gameState.flight.targetY = y;
  };

  const pressControl = (key, active) => { keys.current[key] = active; };

  return (
    <main className="alex-life-hifi-page">
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} onPointerDown={handlePointer} aria-label={`${scene.title}. ${scene.body}`} role="img" tabIndex="0" />
      <div className="alex-life-hifi-shade" aria-hidden="true" />

      <header className="alex-life-hifi-hud">
        <div className="alex-life-hifi-brand">
          <a href={`${BASE_URL}#playground`} onClick={(event) => navigate(event, "/playground")}><span aria-hidden="true">←</span> Playground</a>
          <span>Alex's Life</span>
          <nav aria-label="Game versions">
            <a href={`${BASE_URL}#playground/alexs-life`}>V1 Classic</a>
            <a className="active" href={`${BASE_URL}#playground/alexs-life-hifi`}>V2 High fidelity</a>
          </nav>
        </div>
        <div className="alex-life-hifi-journey" aria-label={`Life journey progress, ${progressLabel}`}>
          <div><span>Life journey</span><strong>{progressLabel}</strong></div>
          <div className="alex-life-hifi-progress"><i style={{ width: `${Math.max(4, progress)}%` }} /></div>
          <ol>{scenes.map((item, index) => <li className={index <= sceneIndex ? "complete" : ""} key={item.id}><i />{item.age}</li>)}</ol>
        </div>
      </header>

      <section className="alex-life-hifi-story" aria-labelledby="alex-life-v2-title">
        <p><span>{sceneNumber}</span> {scene.age} / {scene.location}</p>
        <h1 id="alex-life-v2-title">{scene.title}</h1>
        <p>{scene.body}</p>
        {scene.id === "flight" && <p className="alex-life-hifi-score">Memory stars <strong>{flightScore} / 3</strong></p>}
      </section>

      <section className="alex-life-hifi-actions" aria-label="Game controls">
        {motionScene && (
          <div className="alex-life-hifi-move">
            <button type="button" aria-label={scene.id === "flight" ? "Move up" : "Move left"} onPointerDown={() => pressControl(scene.id === "flight" ? "up" : "left", true)} onPointerUp={() => pressControl(scene.id === "flight" ? "up" : "left", false)} onPointerCancel={() => pressControl(scene.id === "flight" ? "up" : "left", false)}>{scene.id === "flight" ? "↑" : "←"}</button>
            <button type="button" aria-label={scene.id === "flight" ? "Move down" : "Move right"} onPointerDown={() => pressControl(scene.id === "flight" ? "down" : "right", true)} onPointerUp={() => pressControl(scene.id === "flight" ? "down" : "right", false)} onPointerCancel={() => pressControl(scene.id === "flight" ? "down" : "right", false)}>{scene.id === "flight" ? "↓" : "→"}</button>
          </div>
        )}
        <button className="alex-life-hifi-primary" type="button" disabled={!canContinue} onClick={advance}>{actionLabel(scene.id, ready)} <span aria-hidden="true">→</span></button>
        <button className="alex-life-hifi-pause" type="button" onClick={() => setPaused((current) => !current)}>{paused ? "Resume" : "Pause"}</button>
      </section>

      <p className="alex-life-hifi-help">Click to move · Arrow keys or A D · Space to interact</p>
      <p className="alex-life-hifi-status" aria-live="polite">{ready ? "Memory point reached. Continue when ready." : scene.body}</p>
    </main>
  );
}

