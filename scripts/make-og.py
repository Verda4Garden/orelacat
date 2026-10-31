from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (6, 6, 6)
INK = (242, 239, 233)
DIM = (168, 162, 154)
LINE = (35, 34, 32)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# faint grid, matching the site
for x in range(0, W, 72):
    d.line([(x, 0), (x, H)], fill=(14, 14, 13))
for y in range(0, H, 72):
    d.line([(0, y), (W, y)], fill=(14, 14, 13))

def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

serif = font("C:/Windows/Fonts/georgia.ttf", 96)
serif_i = font("C:/Windows/Fonts/georgiai.ttf", 96)
sans = font("C:/Windows/Fonts/segoeui.ttf", 26)
mono = font("C:/Windows/Fonts/consola.ttf", 20)

# logo, circular
logo = Image.open("D:/vsongs/orelacat-web/public/logo.jpeg").convert("RGB")
side = 96
logo = logo.resize((side, side), Image.LANCZOS)
mask = Image.new("L", (side, side), 0)
ImageDraw.Draw(mask).ellipse((0, 0, side, side), fill=255)
img.paste(logo, (72, 64), mask)

d.text((188, 96), "orelacat", font=font("C:/Windows/Fonts/georgia.ttf", 44), fill=INK)

d.text((72, 214), "Musik tanpa", font=serif, fill=INK)
d.text((72, 320), "kebisingan.", font=serif_i, fill=DIM)

d.text((72, 452), "Pemutar musik gratis, tanpa iklan.", font=sans, fill=INK)
d.text((72, 490), "Dynamic island yang mengikuti lagu.", font=sans, fill=DIM)

d.line([(72, 566), (W - 72, 566)], fill=LINE)
d.text((72, 584), "ANDROID  ·  TABLET  ·  WINDOWS", font=mono, fill=DIM)
d.text((W - 250, 584), "orelacat.my.id", font=mono, fill=DIM)

img.save("D:/vsongs/orelacat-web/public/og-image.png", optimize=True)
print("og-image.png", img.size)
