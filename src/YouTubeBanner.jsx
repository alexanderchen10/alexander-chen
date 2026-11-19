import { useEffect, useRef, useState } from "react";
import "./YouTubeBanner.css";

let iframeApiPromise;

function loadIframeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (iframeApiPromise) return iframeApiPromise;

  iframeApiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    let timeout;
    let settled = false;
    const finish = () => {
      if (settled || !window.YT?.Player) return;
      settled = true;
      clearTimeout(timeout);
      resolve(window.YT);
    };
    const fail = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(new Error("YouTube banner API unavailable"));
    };
    window.onYouTubeIframeAPIReady = (...args) => {
      try {
        if (typeof previousReady === "function") previousReady.apply(window, args);
      } finally {
        finish();
      }
    };
    let script = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!script) {
      script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("error", fail, { once: true });
    timeout = window.setTimeout(fail, 15000);
    finish();
  });
  return iframeApiPromise;
}

export default function YouTubeBanner({ videoId, poster, title = "Project film", start = 0, end, fit = "cover" }) {
  const host = useRef(null);
  const [revealedVideo, setRevealedVideo] = useState(null);
  const [playback, setPlayback] = useState({ videoId, state: "loading" });
  const startSeconds = Number.isFinite(Number(start)) ? Math.max(0, Number(start)) : 0;
  const endSeconds = Number.isFinite(Number(end)) && Number(end) > startSeconds ? Number(end) : undefined;

  useEffect(() => {
    const container = host.current;
    if (!container || !videoId) return undefined;
    let disposed = false;
    let player;
    let ready = false;
    let failed = false;
    let loopTimer;
    let observer;
    let inView = true;
    let dimensions = { width: 640, height: 360 };
    setRevealedVideo(null);
    setPlayback({ videoId, state: "loading" });
    const reportState = (state) => { if (!disposed) setPlayback({ videoId, state }); };

    const coverSize = () => {
      const { width, height } = container.getBoundingClientRect();
      const scale = Math.max(fit === "contain" ? Math.min(width / 16, height / 9) : Math.max(width / 16, height / 9), 200 / 9);
      dimensions = { width: Math.ceil(scale * 16), height: Math.ceil(scale * 9) };
      if (ready) player?.setSize(dimensions.width, dimensions.height);
    };
    const syncPlayback = () => {
      if (!ready || disposed || failed) return;
      if (document.hidden || !inView) player.pauseVideo();
      else {
        player.mute();
        player.playVideo();
      }
    };
    const restart = () => {
      if (!ready || disposed || failed || document.hidden || !inView) return;
      player.mute();
      player.seekTo(startSeconds, true);
      player.playVideo();
    };

    coverSize();
    const resize = new ResizeObserver(coverSize);
    resize.observe(container);
    observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.01 });
    observer.observe(container);
    document.addEventListener("visibilitychange", syncPlayback);

    loadIframeApi().then((YT) => {
      if (disposed) return;
      const iframe = document.createElement("iframe");
      const params = new URLSearchParams({
        enablejsapi: "1",
        origin: window.location.origin,
        autoplay: "0",
        playsinline: "1",
        controls: "0",
        disablekb: "1",
        fs: "0",
        rel: "0",
        start: String(Math.floor(startSeconds)),
        ...(endSeconds ? { end: String(Math.floor(endSeconds)) } : {}),
      });
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params}`;
      iframe.title = `${title} background preview`;
      iframe.tabIndex = -1;
      iframe.setAttribute("aria-hidden", "true");
      iframe.allow = "autoplay; encrypted-media";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.width = String(dimensions.width);
      iframe.height = String(dimensions.height);
      container.appendChild(iframe);

      player = new YT.Player(iframe, {
        events: {
          onReady: (event) => {
            if (disposed) return;
            ready = true;
            reportState("ready");
            // Start through the API only after muting, so narration cannot briefly play on load.
            event.target.mute();
            coverSize();
            syncPlayback();
            if (endSeconds) {
              // seekTo clears YouTube's endSeconds setting, so keep the approved range on every loop.
              loopTimer = window.setInterval(() => {
                if (!disposed && inView && !document.hidden && player.getCurrentTime() >= endSeconds) restart();
              }, 250);
            }
          },
          onStateChange: (event) => {
            if (disposed || failed) return;
            if (event.data === YT.PlayerState.PLAYING) {
              event.target.mute();
              reportState("playing");
              setRevealedVideo(videoId);
              if (!inView || document.hidden) event.target.pauseVideo();
            } else if (event.data === YT.PlayerState.ENDED) {
              reportState("ended");
              restart();
            } else if (event.data === YT.PlayerState.PAUSED) reportState("paused");
            else if (event.data === YT.PlayerState.BUFFERING) reportState("buffering");
          },
          onAutoplayBlocked: () => {
            failed = true;
            reportState("blocked");
            if (!disposed) setRevealedVideo(null);
          },
          onError: () => {
            failed = true;
            reportState("error");
            if (!disposed) setRevealedVideo(null);
          },
        },
      });
    }).catch(() => {
      failed = true;
      reportState("error");
      if (!disposed) setRevealedVideo(null);
    });

    return () => {
      disposed = true;
      ready = false;
      clearInterval(loopTimer);
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      try { player?.destroy(); } catch { /* The owned host is still cleared if the remote player was unavailable. */ }
      container.replaceChildren();
    };
  }, [videoId, startSeconds, endSeconds, title, fit]);

  const revealed = revealedVideo === videoId;
  return (
    <div className={`visual project-asset youtube-banner${revealed ? " youtube-banner-playing" : ""}`} aria-hidden="true" data-youtube-banner-state={revealed ? "revealed" : "poster"} data-video-state={playback.videoId === videoId ? playback.state : "loading"}>
      {poster && <img className="youtube-banner-poster" src={poster} alt="" loading="eager" />}
      <div className="youtube-banner-player" ref={host} />
    </div>
  );
}
