import { useEffect, useState } from "react";
import GlassFolder from "./ui/glass-folder-cards.tsx";
import Lightbox from "./Lightbox.jsx";
import { live, subscribeLive } from "../content.js";

/* ============================================================
   The three-device preview.

   Each device is a GlassFolder (component adopted from 21st.dev)
   whose files are the real, full-app screenshots of that build —
   not mockups, not just the island: the library, the player, the
   lyrics, the home screen. Open a folder to see them.

   The version line under each folder is read from the same update
   feed the app uses, so it updates itself when a new build ships.
   ============================================================ */

const FOLDER_FILES = {
  phone: [
    {
      name: "Listen Now",
      meta: "PNG · feed + mini player",
      image: "/shot-phone-home.png",
    },
    {
      name: "Library",
      meta: "PNG · recap, downloads, local",
      image: "/shot-phone-library.png",
    },
    {
      name: "Now playing",
      meta: "PNG · artwork + controls",
      image: "/shot-phone-player.png",
    },
    {
      name: "Lyrics",
      meta: "PNG · word-timed",
      image: "/shot-phone-lyrics.png",
    },
  ],
  tablet: [
    {
      name: "Listen Now",
      meta: "PNG · landscape feed",
      image: "/shot-tablet-home.png",
    },
    {
      name: "Library",
      meta: "PNG · recap + playlists",
      image: "/shot-tablet-library.png",
    },
    {
      name: "Now playing",
      meta: "PNG · wide, with lyrics",
      image: "/shot-tablet-player.png",
    },
  ],
  desktop: [
    {
      name: "Home",
      meta: "PNG · feed, lyrics, player",
      image: "/shot-desktop-3.png",
    },
    {
      name: "History",
      meta: "PNG · what you played",
      image: "/shot-desktop-1.png",
    },
    {
      name: "Fullscreen",
      meta: "PNG · lyrics view",
      image: "/shot-desktop-2.png",
    },
    {
      name: "About",
      meta: "PNG · v6.2.6 desktop",
      image: "/shot-desktop-4.png",
    },
  ],
};

const FOLDER_META = {
  phone: { label: "Phone", tone: "dark", art: "ember", meta: "Android APK" },
  tablet: { label: "Tablet", tone: "dark", art: "dusk", meta: "Android APK" },
  desktop: { label: "Desktop", tone: "dark", art: "aurora", meta: "Windows" },
};

const PHONE_SPECS = [
  "Dynamic island — music, lyrics, downloads, navigation, calls",
  "Word-synced lyrics under the island",
  "Notification listener — shows, never stores",
  "Equalizer, crossfade, gapless, replay",
  "Subtitles / lyrics sync to the music",
  "Listen Together, History, Sources, Spotify & Wear OS sync",
];

const TABLET_SPECS = [
  "Two-column library + landscape player",
  "Same island, scaled to a wider cutout",
  "Large-artwork now playing, full lyrics",
];

const DESKTOP_SPECS = [
  "Floating island pill that shrinks over any other app",
  "Library, queue, lyrics panel, artwork canvas player",
  "Media keys, volume, output routing",
];

export default function DeviceShowcase() {
  const [device, setDevice] = useState("phone");
  const [viewing, setViewing] = useState(null);
  const [, setTick] = useState(0);
  useEffect(() => subscribeLive(() => setTick((n) => n + 1)), []);

  const version = live[device === "desktop" ? "desktop" : "android"];
  const meta = FOLDER_META[device];
  const files = FOLDER_FILES[device];
  const specs = device === "phone" ? PHONE_SPECS : device === "tablet" ? TABLET_SPECS : DESKTOP_SPECS;

  return (
    <section className="section" id="devices">
      <div className="shell">
        <div className="devices-head">
          <div>
            <div className="eyebrow">Real screenshots, not mockups</div>
            <h2 className="display devices-title">
              One app,
              <br />
              <em>every screen.</em>
            </h2>
          </div>
          <p className="lede devices-lede">
            Pick a device. Open its folder — the pictures inside were captured from the real
            build running on that screen, and the version line is read live from the update
            feed.
          </p>
        </div>

        <div className="devices-switch" role="tablist" aria-label="Device">
          {["phone", "tablet", "desktop"].map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={device === key}
              className={`devices-tab ${device === key ? "on" : ""}`}
              onClick={() => setDevice(key)}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="devices-stage devices-stage--shots">
          <div className="devices-glasses">
            <GlassFolder
              key={device}
              label={meta.label}
              meta={version?.versionName ? `v${version.versionName}` : meta.meta}
              tone="dark"
              art={meta.art}
              seed={device === "phone" ? 7 : device === "tablet" ? 13 : 21}
              width={380}
              action="none"
              files={files}
              labelPlacement="top-left"
              open
              onOpenChange={() => {}}
              onFileSelect={(file, i) => setViewing(i)}
            />
          </div>

          <div className="devices-side">
            <div className="devices-side-label">{device}</div>
            <p className="lede devices-side-blurb">
              {device === "phone" &&
                "The full player in your pocket: home feed, library, now playing with word-synced lyrics, and the island that sits on the front camera."}
              {device === "tablet" &&
                "The same library in two columns and a player that takes the whole screen. The island scales with the cutout."}
              {device === "desktop" &&
                "Windows build: library on the left, lyrics panel on the right, playback along the bottom, and the island floating above whatever else you open."}
            </p>

            <ul className="devices-specs">
              {specs.map((s) => (
                <li key={s}>
                  <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
                    <path
                      d="M4 12.5 9.5 18 20 6.5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                  {s}
                </li>
              ))}
            </ul>

            <div className="devices-version">
              <span className="devices-version-label">Current build</span>
              <span className="devices-version-value">
                {version?.versionName ? `v${version.versionName}` : "—"}
                {version?.sizeBytes ? (
                  <span className="devices-version-size">
                    {" "}
                    · {(version.sizeBytes / 1_000_000).toFixed(0)} MB
                  </span>
                ) : null}
              </span>
              <span className="devices-version-note">
                Read from the update feed — it changes by itself when a new build ships.
              </span>
            </div>
          </div>
        </div>
      </div>

      <Lightbox
        shot={viewing == null ? null : files[viewing]}
        index={viewing ?? 0}
        total={files.length}
        onClose={() => setViewing(null)}
        onPrev={() => setViewing((v) => (v == null ? v : (v + files.length - 1) % files.length))}
        onNext={() => setViewing((v) => (v == null ? v : (v + 1) % files.length))}
      />
    </section>
  );
}