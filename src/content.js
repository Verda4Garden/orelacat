/* Every claim here traces to a shipped feature in OrelaCat 6.0.57.
   Nothing is invented; where a feature is not yet proven on a real
   device the site says so instead of hiding it. */

export const links = {
  linktree: "https://linktr.ee/FahrillAS",
  whatsapp: "https://whatsapp.com/channel/0029Vb9Hy5C7dmeiBQXvLc1S",
  instagram: "https://www.instagram.com/fahril29124",
  tiktok: "https://www.tiktok.com/@fahril29124",
  trakteer: "https://trakteer.id/fahril14",
  download:
    "https://github.com/Tesbotnjay/orelacat-jam/releases/download/v6.0.57/app-prod-universal-release.apk",
  /* The Windows installer. Kept here as a fallback: the page prefers the
     URL in the live feed, so a new desktop build updates this link without
     an edit. */
  downloadDesktop:
    "https://github.com/Tesbotnjay/orelacat-jam/releases/download/desktop-v6.2.6/orelacat-6.2.6-win-x64.exe",
};

/* Live version data, read from the same worker feed the app updates
   itself from. Kept in a plain mutable object so a fetch can fill it in
   after first paint: the page renders "—" rather than blocking on the
   network, and upgrades itself when the answer arrives. */
export const live = { android: null, desktop: null };

/* A tiny subscription so components can re-render when the feed answers.
   A React context would need a provider above every consumer; this is one
   value that changes at most twice per page load. */
const liveListeners = new Set();
export function subscribeLive(fn) {
  liveListeners.add(fn);
  return () => liveListeners.delete(fn);
}
function notifyLive() {
  for (const fn of liveListeners) fn({ ...live });
}

export const FEED = {
  android: "https://orelacat-jam.orelacat.workers.dev/api/app/latest",
  desktop: "https://orelacat-jam.orelacat.workers.dev/api/app/latest/desktop",
};

export async function loadLiveVersions() {
  const read = async (url) => {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) return null;
      const j = await r.json();
      return j?.available === false ? null : j;
    } catch {
      return null;
    }
  };
  const [android, desktop] = await Promise.all([read(FEED.android), read(FEED.desktop)]);
  live.android = android;
  live.desktop = desktop;
  notifyLive();
  return live;
}

export const stats = [
  { value: 12, suffix: "", label: "activities the island can show" },
  { value: 3, suffix: "", label: "devices, one account" },
  { value: 0, suffix: "", label: "ads, ever" },
  { value: 155, suffix: " MB", label: "the whole player, one APK" },
];

export const features = [
  {
    key: "island",
    title: "A dynamic island that knows the song",
    body:
      "A pill around the camera shows what is playing, with the title, artist, artwork and a working scrub bar. It reads Orelacat's own player, so it knows the track the moment it starts.",
    tag: "Signature",
  },
  {
    key: "lyrics",
    title: "Lyrics that move with the voice",
    body:
      "When a track has word-timed lyrics, the line under the title becomes the lyric and each word lights up as it is sung. The same timings the player screen uses — one source, two places.",
    tag: "Word-synced",
  },
  {
    key: "dual",
    title: "Two things at once",
    body:
      "A download running under a song, or directions next to the player. The island stacks a second card instead of choosing one, so you never lose the music to see the progress.",
    tag: "Stacked cards",
  },
  {
    key: "nav",
    title: "Directions, not percentages",
    body:
      "Navigation gets its own card: the turn instruction, distance and time, a blue turn arrow. No progress bar, because a route does not have one.",
    tag: "Maps & Waze",
  },
  {
    key: "privacy",
    title: "Notifications that stay on the phone",
    body:
      "The listener holds a notification in memory only while it is on screen. No disk, no logs, no network call — and a test that fails the build if anyone adds one.",
    tag: "No telemetry",
  },
  {
    key: "sound",
    title: "Sound that is not compressed twice",
    body:
      "Original audio from the source, with a cache so a replayed track does not re-download. Crossfade, gapless, and a queue that survives a restart.",
    tag: "Quality",
  },
];

export const activities = [
  "Music",
  "Lyrics",
  "Notifications",
  "Downloads",
  "Navigation",
  "Calls",
  "Screen recording",
  "Charging",
  "Earbuds",
  "Flashlight",
  "Ringer mode",
  "Payment",
];

export const devices = {
  phone: {
    label: "Phone",
    blurb:
      "The island docks on the front camera, measured from the display cutout rather than a fixed offset — so it lands on the lens on a notch or a bezel camera too.",
    specs: ["Dynamic island", "Word-synced lyrics", "Stacked cards"],
  },
  tablet: {
    label: "Tablet",
    blurb:
      "The same island, scaled for a wider cutout. Cards widen instead of stretching, and the transport stays centred at any width.",
    specs: ["Scaled island", "Two-column library", "Landscape mode"],
  },
  desktop: {
    label: "Desktop",
    blurb:
      "Windows, with the island as a floating pill that shrinks to 74×22 over any other app. Click to open, hide without stopping the music.",
    specs: ["Floating island", "Shrinks on blur", "Media keys"],
  },
};

export const faq = [
  {
    q: "Is it really free?",
    a: "Yes. No ads, no paywall on features, no account required to listen. There is a membership tier for the community badge and public stats, and it is optional.",
  },
  {
    q: "Why does it ask to read my notifications?",
    a: "So the island can show them, and so its transport buttons work when another app is playing. The listener never writes to disk, never logs content, and contains no network code at all.",
  },
  {
    q: "Do the lyrics work on every song?",
    a: "No, and that is honest: word-level timing only exists for some tracks. English catalogue songs usually have it; many Indonesian songs only have plain text, and for those the island shows the artist name instead of a lyric pinned to the wrong second.",
  },
  {
    q: "Where do I get it?",
    a: "The APK is on GitHub Releases, and the desktop build is a Windows installer. Both are linked from this page and from the Linktree.",
  },
];
