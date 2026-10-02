from __future__ import annotations

import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ADS = ROOT / "public" / "ads"
OUT = ADS / "guyad.jpg"
TMP_LOGO = ADS / "_guyad_logo.png"
TMP_BG = ADS / "_guyad_bg.jpg"

LOGO_URL = "https://guyad.org.tr/wp-content/uploads/2024/08/GuyadLogo-1.png"
BG_URL = "https://guyad.org.tr/resimler/bolge/artabel_tabiat_parki2.jpg"


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    names = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main() -> None:
    urllib.request.urlretrieve(LOGO_URL, TMP_LOGO)
    urllib.request.urlretrieve(BG_URL, TMP_BG)

    width, height = 1024, 200
    photo = Image.open(TMP_BG).convert("RGB")
    target_ratio = width / height
    pw, ph = photo.size
    if pw / ph > target_ratio:
        nw = int(ph * target_ratio)
        left = (pw - nw) // 2
        photo = photo.crop((left, 0, left + nw, ph))
    else:
        nh = int(pw / target_ratio)
        top = max(0, (ph - nh) // 3)
        photo = photo.crop((0, top, pw, top + nh))
    photo = photo.resize((width, height), Image.Resampling.LANCZOS)
    photo = ImageEnhance.Brightness(photo).enhance(0.62)
    photo = ImageEnhance.Contrast(photo).enhance(1.08)

    banner = photo.convert("RGBA")
    draw = ImageDraw.Draw(banner, "RGBA")
    for x in range(0, 560):
        alpha = int(175 * (1 - x / 560))
        draw.line([(x, 0), (x, height)], fill=(12, 28, 48, alpha))

    logo = Image.open(TMP_LOGO).convert("RGBA")
    lw = 120
    lh = int(logo.height * (lw / logo.width))
    logo = logo.resize((lw, lh), Image.Resampling.LANCZOS)
    pad = 10
    plate = Image.new("RGBA", (lw + pad * 2, lh + pad * 2), (255, 255, 255, 240))
    plate.paste(logo, (pad, pad), logo)
    banner.paste(plate, (22, (height - plate.height) // 2), plate)

    title_f = font(32, bold=True)
    sub_f = font(18, bold=False)
    cta_f = font(16, bold=True)
    text_x = 22 + plate.width + 20
    draw.text((text_x, 52), "G\u00dcYAD", font=title_f, fill=(255, 255, 255, 255))
    draw.text(
        (text_x, 96),
        "G\u00fcm\u00fc\u015fhaneliler Derne\u011fi \u00b7 guyad.org.tr",
        font=sub_f,
        fill=(230, 235, 240, 255),
    )

    cta = "Ziyaret Et"
    bbox = draw.textbbox((0, 0), cta, font=cta_f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    cx, cy = width - tw - 56, height - th - 36
    draw.rounded_rectangle(
        [cx - 16, cy - 10, cx + tw + 16, cy + th + 10],
        radius=4,
        fill=(200, 155, 55, 255),
    )
    draw.text((cx, cy), cta, font=cta_f, fill=(20, 20, 20, 255))

    banner.convert("RGB").save(OUT, "JPEG", quality=88, optimize=True)
    TMP_LOGO.unlink(missing_ok=True)
    TMP_BG.unlink(missing_ok=True)
    print(f"saved {OUT} {banner.size}")


if __name__ == "__main__":
    main()
