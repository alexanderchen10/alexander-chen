import { useEffect, useMemo, useRef, useState } from "react";

const WIDTH = 480;
const HEIGHT = 270;
const BASE_URL = import.meta.env.BASE_URL;

const sceneCopy = {
  title: { chapter: "PLAYGROUND GAME", title: "ALEX'S LIFE", body: "A tiny journey from Vancouver to Taiwan." },
  hospital: { chapter: "CHAPTER 01 / 2000", title: "HELLO, VANCOUVER", body: "Alex's story begins on a rainy morning in a Vancouver hospital." },
  airport: { chapter: "CHAPTER 02 / AGE 5", title: "A BIG FIRST JOURNEY", body: "Walk Alex to Gate 5. Click the floor or use the arrow keys." },
  flight: { chapter: "IN FLIGHT / YVR TO TPE", title: "MEMORIES IN THE CLOUDS", body: "Guide the plane and collect three memory stars." },
  taiwanIntro: { chapter: "CHAPTER 03 / AGE 5", title: "TAIWAN", body: "A new skyline, a new language, and a new chapter." },
  taiwan: { chapter: "TAIPEI / FIRST DAY", title: "FOLLOW THE CITY LIGHTS", body: "Walk through the street and find the glowing memory marker." },
  complete: { chapter: "CHAPTER COMPLETE", title: "THE JOURNEY CONTINUES", body: "Vancouver was the beginning. Taiwan opened a much bigger world." },
};

function pixelRect(context, x, y, width, height, color) {
  context.fillStyle = color;
  context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function drawCloud(context, x, y, scale = 1, color = "#f5fbff") {
  pixelRect(context, x + 6 * scale, y, 18 * scale, 7 * scale, color);
  pixelRect(context, x, y + 6 * scale, 34 * scale, 9 * scale, color);
  pixelRect(context, x + 11 * scale, y - 5 * scale, 11 * scale, 7 * scale, color);
}

function drawStar(context, x, y, color = "#ffd95a") {
  pixelRect(context, x - 2, y - 8, 5, 17, color);
  pixelRect(context, x - 8, y - 2, 17, 5, color);
  pixelRect(context, x - 5, y - 5, 11, 11, color);
  pixelRect(context, x - 1, y - 1, 3, 3, "#fff7c5");
}

function drawAlex(context, x, ground, direction = 1, suitcase = false, walking = false) {
  const bob = walking ? Math.round(Math.sin(performance.now() / 90) * 1) : 0;
  const left = Math.round(x - 7);
  const top = Math.round(ground - 33 + bob);
  pixelRect(context, left + 4, top, 8, 8, "#241b33");
  pixelRect(context, left + 3, top + 4, 10, 8, "#e8b493");
  pixelRect(context, direction > 0 ? left + 10 : left + 4, top + 7, 2, 2, "#251e2f");
  pixelRect(context, left + 2, top + 12, 12, 13, "#6c5ce7");
  pixelRect(context, left + 4, top + 25, 4, 8, "#222442");
  pixelRect(context, left + 10, top + 25, 4, 8, "#222442");
  pixelRect(context, left + 1, top + 15, 3, 10, "#e8b493");
  pixelRect(context, left + 14, top + 15, 3, 10, "#e8b493");
  pixelRect(context, left + 2, top + 32, 6, 2, "#f6f1e8");
  pixelRect(context, left + 10, top + 32, 6, 2, "#f6f1e8");
  if (suitcase) {
    const bagX = direction > 0 ? left - 10 : left + 18;
    pixelRect(context, bagX, top + 20, 8, 11, "#ee6c4d");
    pixelRect(context, bagX + 2, top + 17, 4, 4, "#382a4f");
    pixelRect(context, bagX + 1, top + 31, 2, 2, "#382a4f");
    pixelRect(context, bagX + 5, top + 31, 2, 2, "#382a4f");
  }
}

function drawPlane(context, x, y) {
  pixelRect(context, x - 17, y - 4, 35, 8, "#f7fbff");
  pixelRect(context, x - 4, y - 10, 13, 5, "#f7fbff");
  pixelRect(context, x - 4, y + 4, 13, 5, "#d9e4f1");
  pixelRect(context, x + 15, y - 7, 5, 7, "#f7fbff");
  pixelRect(context, x - 15, y - 2, 3, 3, "#6c5ce7");
  pixelRect(context, x - 9, y - 2, 3, 3, "#6c5ce7");
  pixelRect(context, x - 3, y - 2, 3, 3, "#6c5ce7");
  pixelRect(context, x + 3, y - 2, 3, 3, "#6c5ce7");
}

function drawHospital(context, time) {
  pixelRect(context, 0, 0, WIDTH, HEIGHT, "#171735");
  pixelRect(context, 0, 176, WIDTH, 94, "#30294f");
  pixelRect(context, 22, 33, 178, 106, "#9dd7e8");
  pixelRect(context, 27, 38, 168, 96, "#789ab7");
  pixelRect(context, 27, 97, 168, 37, "#3f5875");
  for (let index = 0; index < 8; index += 1) {
    const x = 34 + index * 20;
    const height = 12 + (index % 3) * 9;
    pixelRect(context, x, 97 - height, 15, height, "#344561");
    pixelRect(context, x + 3, 101 - height, 2, 3, "#f4d35e");
  }
  pixelRect(context, 108, 60, 18, 37, "#4d607c");
  pixelRect(context, 115, 51, 4, 11, "#4d607c");
  pixelRect(context, 25, 36, 172, 4, "#e8eff4");
  pixelRect(context, 25, 134, 172, 5, "#d9e4ec");
  for (let index = 0; index < 10; index += 1) {
    const rainX = 36 + index * 16;
    const offset = (time / 22 + index * 9) % 70;
    pixelRect(context, rainX, 43 + offset, 1, 6, "#d8f1fa");
  }
  pixelRect(context, 236, 99, 194, 93, "#f1efe9");
  pixelRect(context, 226, 192, 216, 8, "#9ba7b5");
  pixelRect(context, 266, 151, 128, 10, "#cfd7df");
  pixelRect(context, 273, 127, 114, 28, "#e3edf2");
  pixelRect(context, 286, 119, 88, 13, "#f8faf8");
  pixelRect(context, 316, 122, 28, 10, "#efc3a5");
  pixelRect(context, 310, 132, 40, 14, "#8ecae6");
  pixelRect(context, 252, 161, 8, 42, "#8795a7");
  pixelRect(context, 410, 161, 8, 42, "#8795a7");
  pixelRect(context, 448, 69, 7, 121, "#c9d3dc");
  pixelRect(context, 424, 67, 54, 8, "#dbe4ea");
  pixelRect(context, 441, 83, 21, 28, "#dee8ef");
  pixelRect(context, 0, 205, WIDTH, 3, "#554970");
  pixelRect(context, 0, 234, WIDTH, 2, "#4a4065");
  context.fillStyle = "rgba(120,95,220,.12)";
  context.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawAirport(context, playerX, moving, time) {
  pixelRect(context, 0, 0, WIDTH, HEIGHT, "#e9f3f8");
  pixelRect(context, 0, 24, WIDTH, 114, "#9ed5ef");
  drawCloud(context, 40, 52, 1.1);
  drawCloud(context, 280, 39, .9);
  pixelRect(context, 0, 134, WIDTH, 8, "#71869c");
  pixelRect(context, 0, 142, WIDTH, 70, "#dce3e6");
  pixelRect(context, 0, 212, WIDTH, 58, "#8b90a5");
  for (let x = 0; x < WIDTH; x += 32) pixelRect(context, x, 234, 17, 2, "#c9cbd7");
  pixelRect(context, 315, 82, 112, 15, "#f8fbfd");
  pixelRect(context, 340, 70, 45, 13, "#f8fbfd");
  pixelRect(context, 421, 76, 9, 19, "#f8fbfd");
  pixelRect(context, 301, 88, 20, 5, "#f8fbfd");
  pixelRect(context, 345, 86, 7, 4, "#6c5ce7");
  pixelRect(context, 357, 86, 7, 4, "#6c5ce7");
  pixelRect(context, 369, 86, 7, 4, "#6c5ce7");
  pixelRect(context, 390, 87, 34, 5, "#ea6153");
  pixelRect(context, 18, 146, 166, 51, "#f8faf8");
  pixelRect(context, 24, 151, 154, 41, "#2c3e66");
  pixelRect(context, 30, 157, 142, 29, "#d8edf7");
  pixelRect(context, 199, 136, 10, 77, "#7f8ca0");
  pixelRect(context, 409, 125, 50, 76, "#403b61");
  pixelRect(context, 414, 130, 40, 36, "#171735");
  context.fillStyle = "#ffffff";
  context.font = "bold 18px monospace";
  context.fillText("GATE 5", 417, 153);
  pixelRect(context, 424, 183, 20, 4, "#ffd95a");
  pixelRect(context, 430, 187, 8, 14, "#ffd95a");
  drawAlex(context, playerX, 216, 1, true, moving);
  if (playerX > 370) {
    const pulse = 4 + Math.round(Math.sin(time / 180) * 2);
    context.strokeStyle = "#ffd95a";
    context.lineWidth = 2;
    context.strokeRect(405 - pulse, 121 - pulse, 58 + pulse * 2, 84 + pulse * 2);
  }
}

function drawFlight(context, planeY, stars, score, time) {
  pixelRect(context, 0, 0, WIDTH, HEIGHT, "#65b9ef");
  pixelRect(context, 0, 190, WIDTH, 80, "#2c78b9");
  for (let index = 0; index < 5; index += 1) {
    const x = ((index * 130 - time * .018) % 650 + 650) % 650 - 70;
    drawCloud(context, x, 45 + (index % 3) * 42, .8 + (index % 2) * .35, index % 2 ? "#e9f7ff" : "#ffffff");
  }
  stars.forEach((star) => {
    if (!star.collected) drawStar(context, star.x, star.y);
  });
  drawPlane(context, 110, planeY);
  pixelRect(context, 20, 214, 162, 35, "rgba(17,30,70,.78)");
  context.fillStyle = "#f7fbff";
  context.font = "bold 10px monospace";
  context.fillText(`MEMORIES  ${score} / 3`, 31, 235);
  for (let index = 0; index < 3; index += 1) drawStar(context, 116 + index * 18, 231, index < score ? "#ffd95a" : "#64759a");
}

function drawTaiwan(context, image, playerX, moving, time, intro = false) {
  if (image?.complete) {
    const zoom = intro ? 1.04 + Math.min(time / 8000, .04) : 1.08;
    const drawWidth = WIDTH * zoom;
    const drawHeight = HEIGHT * zoom;
    const travel = intro ? Math.min(time / 28, 26) : playerX * .08;
    context.drawImage(image, -((drawWidth - WIDTH) / 2) - travel, -(drawHeight - HEIGHT) / 2, drawWidth, drawHeight);
  } else {
    pixelRect(context, 0, 0, WIDTH, HEIGHT, "#65c4ee");
  }
  if (intro) {
    context.fillStyle = "rgba(14,17,44,.36)";
    context.fillRect(0, 0, WIDTH, HEIGHT);
    pixelRect(context, 28, 37, 186, 62, "rgba(22,20,51,.86)");
    context.fillStyle = "#ffd95a";
    context.font = "bold 10px monospace";
    context.fillText("AGE 5 / ARRIVAL", 43, 58);
    context.fillStyle = "#ffffff";
    context.font = "bold 29px monospace";
    context.fillText("TAIWAN", 42, 88);
    pixelRect(context, 42, 102, 92, 3, "#ee6c4d");
    return;
  }
  context.fillStyle = "rgba(22,20,51,.14)";
  context.fillRect(0, 0, WIDTH, HEIGHT);
  pixelRect(context, 0, 228, WIDTH, 42, "rgba(18,18,39,.76)");
  pixelRect(context, 0, 228, WIDTH, 3, "#ffe49b");
  for (let x = 18; x < WIDTH; x += 52) pixelRect(context, x, 252, 30, 3, "#f3f0da");
  drawAlex(context, playerX, 228, 1, true, moving);
  const markerX = 418;
  const markerY = 197 + Math.round(Math.sin(time / 170) * 3);
  drawStar(context, markerX, markerY, "#ffd95a");
  context.strokeStyle = "rgba(255,217,90,.72)";
  context.lineWidth = 2;
  context.strokeRect(markerX - 13, markerY - 13, 26, 26);
}

function drawFrame(context, scene, refs, image, time, progress) {
  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, WIDTH, HEIGHT);
  if (scene === "hospital") drawHospital(context, time);
  else if (scene === "airport") drawAirport(context, refs.playerX.current, refs.moving.current, time);
  else if (scene === "flight") drawFlight(context, refs.planeY.current, refs.stars.current, progress, time);
  else if (scene === "taiwanIntro") drawTaiwan(context, image, refs.playerX.current, false, time, true);
  else if (scene === "taiwan") drawTaiwan(context, image, refs.playerX.current, refs.moving.current, time, false);
  else if (scene === "complete") {
    drawTaiwan(context, image, 390, false, time, false);
    context.fillStyle = "rgba(16,17,40,.72)";
    context.fillRect(0, 0, WIDTH, HEIGHT);
    pixelRect(context, 58, 55, 364, 154, "rgba(24,22,55,.92)");
    context.strokeStyle = "#ffd95a";
    context.lineWidth = 2;
    context.strokeRect(58, 55, 364, 154);
    drawStar(context, 240, 87);
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.font = "bold 21px monospace";
    context.fillText("CHAPTER COMPLETE", 240, 127);
    context.fillStyle = "#c7caea";
    context.font = "10px monospace";
    context.fillText("VANCOUVER  >  TAIWAN", 240, 152);
    context.fillStyle = "#ffd95a";
    context.fillText("MORE MEMORIES COMING SOON", 240, 178);
    context.textAlign = "start";
  } else {
    pixelRect(context, 0, 0, WIDTH, HEIGHT, "#13142f");
    for (let row = 0; row < 7; row += 1) {
      for (let column = 0; column < 13; column += 1) {
        const color = (row + column) % 4 === 0 ? "#201f4a" : "#19193c";
        pixelRect(context, column * 40 + (row % 2) * 8, 118 + row * 22, 32, 14, color);
      }
    }
    pixelRect(context, 0, 213, WIDTH, 57, "#23244d");
    drawAlex(context, 244, 213, 1, true, false);
    drawStar(context, 240, 55);
    context.textAlign = "center";
    context.fillStyle = "#ffd95a";
    context.font = "bold 11px monospace";
    context.fillText("AN INTERACTIVE MEMORY", 240, 83);
    context.fillStyle = "#ffffff";
    context.font = "bold 34px monospace";
    context.fillText("ALEX'S LIFE", 240, 119);
    context.fillStyle = "#aeb3d8";
    context.font = "10px monospace";
    context.fillText("VANCOUVER  >  TAIWAN", 240, 140);
    context.textAlign = "start";
  }
}

function actionLabel(scene, atHotspot) {
  if (scene === "title") return "Start journey";
  if (scene === "hospital") return "Continue to age five";
  if (scene === "airport") return atHotspot ? "Board the flight" : "Walk to Gate 5";
  if (scene === "flight") return "Collect three stars";
  if (scene === "taiwanIntro") return "Explore Taiwan";
  if (scene === "taiwan") return atHotspot ? "Save this memory" : "Find the memory star";
  return "Play again";
}

export default function AlexLifeGame({ clock, navigate }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const playerX = useRef(72);
  const targetX = useRef(72);
  const planeY = useRef(128);
  const planeTargetY = useRef(128);
  const moving = useRef(false);
  const keys = useRef({ left: false, right: false, up: false, down: false });
  const stars = useRef([]);
  const score = useRef(0);
  const [scene, setScene] = useState("title");
  const [progress, setProgress] = useState(0);
  const [atHotspot, setAtHotspot] = useState(false);
  const [paused, setPaused] = useState(false);
  const copy = sceneCopy[scene];
  const refs = useMemo(() => ({ playerX, planeY, moving, stars }), []);

  const resetScene = (nextScene) => {
    setAtHotspot(false);
    setProgress(0);
    score.current = 0;
    if (nextScene === "airport") {
      playerX.current = 62;
      targetX.current = 62;
    }
    if (nextScene === "flight") {
      planeY.current = 128;
      planeTargetY.current = 128;
      stars.current = [
        { x: 330, y: 82, collected: false },
        { x: 495, y: 143, collected: false },
        { x: 660, y: 102, collected: false },
      ];
    }
    if (nextScene === "taiwan") {
      playerX.current = 62;
      targetX.current = 62;
    }
    setScene(nextScene);
  };

  const advance = () => {
    if (scene === "title") resetScene("hospital");
    else if (scene === "hospital") resetScene("airport");
    else if (scene === "airport" && atHotspot) resetScene("flight");
    else if (scene === "taiwanIntro") resetScene("taiwan");
    else if (scene === "taiwan" && atHotspot) resetScene("complete");
    else if (scene === "complete") resetScene("title");
  };

  useEffect(() => {
    const image = new Image();
    image.src = `${BASE_URL}projects/playground/alexs-life/taiwan-arrival.png`;
    imageRef.current = image;
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s", " ", "enter"].includes(key)) event.preventDefault();
      if (key === "arrowleft" || key === "a") keys.current.left = true;
      if (key === "arrowright" || key === "d") keys.current.right = true;
      if (key === "arrowup" || key === "w") keys.current.up = true;
      if (key === "arrowdown" || key === "s") keys.current.down = true;
      if ((key === " " || key === "enter") && !event.repeat) advance();
      if (key === "escape") setPaused((current) => !current);
    };
    const onKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") keys.current.left = false;
      if (key === "arrowright" || key === "d") keys.current.right = false;
      if (key === "arrowup" || key === "w") keys.current.up = false;
      if (key === "arrowdown" || key === "s") keys.current.down = false;
    };
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
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
      const delta = Math.min(32, now - previous);
      previous = now;
      if (!paused) {
        elapsed += delta;
        if (scene === "airport" || scene === "taiwan") {
          if (keys.current.left) targetX.current -= 1.7 * delta / 16;
          if (keys.current.right) targetX.current += 1.7 * delta / 16;
          targetX.current = Math.max(36, Math.min(438, targetX.current));
          const distance = targetX.current - playerX.current;
          moving.current = Math.abs(distance) > .6;
          playerX.current += Math.sign(distance) * Math.min(Math.abs(distance), 1.8 * delta / 16);
          const reached = scene === "airport" ? playerX.current > 385 : playerX.current > 392;
          if (reached !== atHotspot) setAtHotspot(reached);
        }
        if (scene === "flight") {
          if (keys.current.up) planeTargetY.current -= 2.1 * delta / 16;
          if (keys.current.down) planeTargetY.current += 2.1 * delta / 16;
          planeTargetY.current = Math.max(42, Math.min(179, planeTargetY.current));
          planeY.current += (planeTargetY.current - planeY.current) * .11;
          stars.current.forEach((star) => {
            if (star.collected) return;
            star.x -= 1.35 * delta / 16;
            if (Math.abs(star.x - 110) < 14 && Math.abs(star.y - planeY.current) < 17) {
              star.collected = true;
              score.current += 1;
              setProgress(score.current);
              if (score.current >= 3) window.setTimeout(() => resetScene("taiwanIntro"), 420);
            } else if (star.x < -20) {
              star.x = 510 + Math.random() * 120;
              star.y = 58 + Math.random() * 105;
            }
          });
        }
      }
      drawFrame(context, scene, refs, imageRef.current, elapsed, progress);
      if (paused) {
        context.fillStyle = "rgba(12,13,31,.76)";
        context.fillRect(0, 0, WIDTH, HEIGHT);
        context.textAlign = "center";
        context.fillStyle = "#ffffff";
        context.font = "bold 22px monospace";
        context.fillText("PAUSED", WIDTH / 2, HEIGHT / 2);
        context.textAlign = "start";
      }
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, [atHotspot, paused, progress, refs, scene]);

  const handlePointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) * WIDTH / rect.width;
    const y = (event.clientY - rect.top) * HEIGHT / rect.height;
    if (scene === "airport" || scene === "taiwan") targetX.current = x;
    if (scene === "flight") planeTargetY.current = y;
  };

  const pressControl = (control, active) => {
    keys.current[control] = active;
  };

  const showAction = !["flight"].includes(scene);
  const actionDisabled = (scene === "airport" || scene === "taiwan") && !atHotspot;

  return (
    <main className="alex-life-page">
      <header className="alex-life-header">
        <a href={`${BASE_URL}#playground`} onClick={(event) => navigate(event, "/playground")}><span aria-hidden="true">←</span> Playground</a>
        <div className="alex-life-version-nav">
          <strong>Alex's Life</strong>
          <nav aria-label="Game versions"><a className="active" href={`${BASE_URL}#playground/alexs-life`}>V1</a><a href={`${BASE_URL}#playground/alexs-life-hifi`}>V2</a></nav>
        </div>
        <div><span>{clock}</span><button type="button" onClick={() => setPaused((current) => !current)}>{paused ? "Resume" : "Pause"}</button></div>
      </header>

      <section className="alex-life-shell" aria-labelledby="alex-life-heading">
        <div className="alex-life-story">
          <p>{copy.chapter}</p>
          <h1 id="alex-life-heading">{copy.title}</h1>
          <p>{copy.body}</p>
          <div className="alex-life-progress" aria-label={`Scene ${Object.keys(sceneCopy).indexOf(scene) + 1} of ${Object.keys(sceneCopy).length}`}>
            {Object.keys(sceneCopy).map((key) => <i className={key === scene ? "active" : ""} key={key} />)}
          </div>
        </div>

        <div className="alex-life-console">
          <div className="alex-life-screen">
            <canvas
              ref={canvasRef}
              width={WIDTH}
              height={HEIGHT}
              aria-label={`${copy.title}. ${copy.body}`}
              onPointerDown={handlePointer}
              role="img"
              tabIndex="0"
            />
            <div className="alex-life-screen-label"><span>ALX-01</span><span>480 × 270</span></div>
          </div>

          <div className="alex-life-controls">
            <div className="alex-life-dpad" aria-label="Movement controls">
              <button type="button" aria-label={scene === "flight" ? "Fly up" : "Move left"} onPointerDown={() => pressControl(scene === "flight" ? "up" : "left", true)} onPointerUp={() => pressControl(scene === "flight" ? "up" : "left", false)} onPointerCancel={() => pressControl(scene === "flight" ? "up" : "left", false)}>{scene === "flight" ? "↑" : "←"}</button>
              <button type="button" aria-label={scene === "flight" ? "Fly down" : "Move right"} onPointerDown={() => pressControl(scene === "flight" ? "down" : "right", true)} onPointerUp={() => pressControl(scene === "flight" ? "down" : "right", false)} onPointerCancel={() => pressControl(scene === "flight" ? "down" : "right", false)}>{scene === "flight" ? "↓" : "→"}</button>
            </div>
            <p>{scene === "flight" ? "Tap the sky or use ↑ ↓" : "Click to walk or use ← →"}<br />Space or Enter to interact</p>
            {showAction && <button className="alex-life-action" type="button" disabled={actionDisabled} onClick={advance}>{actionLabel(scene, atHotspot)} <span aria-hidden="true">→</span></button>}
          </div>
        </div>
        <p className="alex-life-status" aria-live="polite">{scene === "flight" ? `${progress} of 3 memory stars collected.` : atHotspot ? "Memory point reached. You can continue." : copy.body}</p>
      </section>
    </main>
  );
}
