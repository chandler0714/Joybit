"""Render Joybit's geometric app icon without external artwork."""
from PIL import Image, ImageDraw, ImageFilter

size = 1024
image = Image.new("RGB", (size, size))
pixels = image.load()
for y in range(size):
    for x in range(size):
        t = min(1, (x * 0.35 + y * 0.65) / size)
        pixels[x, y] = tuple(round(a * (1 - t) + b * t) for a, b in zip((37, 127, 132), (19, 58, 70)))

wash = Image.new("RGBA", (size, size), (0, 0, 0, 0))
wash_draw = ImageDraw.Draw(wash)
wash_draw.ellipse((-260, -330, 700, 630), fill=(255, 255, 255, 13))
wash_draw.ellipse((510, 650, 1220, 1360), fill=(255, 200, 98, 11))
image = Image.alpha_composite(image.convert("RGBA"), wash)

shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
sd = ImageDraw.Draw(shadow)
sd.line([(636, 240), (636, 602)], fill=(8, 34, 40, 80), width=136)
sd.arc((256, 412, 636, 792), 0, 180, fill=(8, 34, 40, 80), width=136)
shadow = shadow.filter(ImageFilter.GaussianBlur(24))
image = Image.alpha_composite(image, shadow)

draw = ImageDraw.Draw(image)
white = (249, 250, 245, 255)
width = 126
draw.line([(622, 232), (622, 602)], fill=white, width=width)
draw.arc((242, 412, 622, 792), 0, 180, fill=white, width=width)
draw.ellipse((559, 169, 685, 295), fill=white)
draw.ellipse((179, 539, 305, 665), fill=white)
draw.ellipse((709, 696, 832, 819), fill=(255, 192, 87, 255))

image.convert("RGB").save("assets/icon.png", optimize=True)
image.resize((64, 64), Image.Resampling.LANCZOS).convert("RGB").save("assets/favicon.png", optimize=True)
