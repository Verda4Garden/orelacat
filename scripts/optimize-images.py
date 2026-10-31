"""Re-encode the screenshots for the web.

The folder thumbnails render at ~272x184 CSS pixels, so shipping 2560x1600 PNGs
was sending megabytes for a postage stamp. Each shot is written twice:

  <name>.webp        the lightbox version — long edge 1600 px, quality 82
  <name>-thumb.webp  the folder version — 544 px wide (2x the 272 px slot)

WebP at these sizes is typically 10-30x smaller than the source PNG with no
visible difference on a screen.
"""

from pathlib import Path
from PIL import Image

PUBLIC = Path(__file__).resolve().parent.parent / "public"

# Only the files the site actually references.
SHOTS = [
    "shot-phone-home.png",
    "shot-phone-library.png",
    "shot-phone-player.png",
    "shot-phone-lyrics.png",
    "shot-tablet-home.png",
    "shot-tablet-library.png",
    "shot-tablet-player.png",
    "shot-desktop-1.png",
    "shot-desktop-2.png",
    "shot-desktop-3.png",
    "shot-desktop-4.png",
]

FULL_EDGE = 1600
THUMB_WIDTH = 544


def fit(im, long_edge):
    """Scale down so the long edge is at most `long_edge`. Never upscale."""
    w, h = im.size
    scale = min(1.0, long_edge / max(w, h))
    if scale == 1.0:
        return im
    return im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)


def main():
    total_before = total_after = 0
    for name in SHOTS:
        src = PUBLIC / name
        if not src.exists():
            print(f"  missing: {name}")
            continue
        before = src.stat().st_size
        total_before += before

        im = Image.open(src).convert("RGB")
        stem = src.stem

        full = fit(im, FULL_EDGE)
        full_path = PUBLIC / f"{stem}.webp"
        full.save(full_path, "WEBP", quality=82, method=6)

        thumb = im.resize(
            (THUMB_WIDTH, round(im.height * THUMB_WIDTH / im.width)), Image.LANCZOS
        )
        thumb_path = PUBLIC / f"{stem}-thumb.webp"
        thumb.save(thumb_path, "WEBP", quality=80, method=6)

        after = full_path.stat().st_size + thumb_path.stat().st_size
        total_after += after
        print(
            f"  {name:26s} {before/1024:7.0f} KB -> "
            f"{full_path.stat().st_size/1024:6.0f} KB + {thumb_path.stat().st_size/1024:5.0f} KB thumb"
        )

    # The logo is shown at 557 px in the hero and 26 px in the nav.
    logo = Image.open(PUBLIC / "logo.jpeg").convert("RGB")
    before = (PUBLIC / "logo.jpeg").stat().st_size
    fit(logo, 1024).save(PUBLIC / "logo.webp", "WEBP", quality=84, method=6)
    logo.resize((128, 128), Image.LANCZOS).save(
        PUBLIC / "logo-128.webp", "WEBP", quality=86, method=6
    )
    after = (PUBLIC / "logo.webp").stat().st_size + (PUBLIC / "logo-128.webp").stat().st_size
    print(f"  {'logo.jpeg':26s} {before/1024:7.0f} KB -> {after/1024:6.0f} KB (webp + 128px)")

    print(
        f"\n  total screenshots: {total_before/1024/1024:.1f} MB -> {total_after/1024/1024:.1f} MB"
    )


if __name__ == "__main__":
    main()
