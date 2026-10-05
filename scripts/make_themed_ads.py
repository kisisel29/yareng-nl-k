from __future__ import annotations

import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ADS = ROOT / "public" / "ads"

# Site teması: cream + ink + burgundy
CREAM = (247, 245, 240)
CREAM_DARK = (226, 221, 211)
INK = (17, 17, 16)
INK_MID = (74, 74, 70)
BURGUNDY = (22, 58, 95)
BORDER = (207, 200, 186)

GUYAD_LOGO = "https://guyad.org.tr/wp-content/uploads/2024/08/GuyadLogo-1.png"
GUYAD_BG = "https://guyad.org.tr/resimler/bolge/artabel_tabiat_parki2.jpg"
KRAL_LOGO = "https://kralpestil.com/images/kral-logo.png"
KRAL_PRODUCT = "https://kralpestil.com/images/product-rulo-pestil.jpg"


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    names = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf",
    ]
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def download(url: str, path: Path) -> None:
    urllib.request.urlretrieve(url, path)


def themed_banner(
    *,
    logo_path: Path,
    photo_path: Path | None,
    title: str,
    subtitle: str,
    cta: str,
    out_path: Path,
    logo_width: int = 100,
) -> None:
    width, height = 1024, 200
    banner = Image.new("RGBA", (width, height), (*CREAM, 255))
    draw = ImageDraw.Draw(banner)

    # İnce çerçeve
    draw.rectangle([0, 0, width - 1, height - 1], outline=BORDER, width=2)

    # Sol metin alanı
    text_x = 24

    logo = Image.open(logo_path).convert("RGBA")
    lw = logo_width
    lh = int(logo.height * (lw / logo.width))
    logo = logo.resize((lw, lh), Image.Resampling.LANCZOS)
    pad = 8
    plate = Image.new("RGBA", (lw + pad * 2, lh + pad * 2), (*CREAM, 255))
    draw_plate = ImageDraw.Draw(plate)
    draw_plate.rectangle([0, 0, lw + pad * 2 - 1, lh + pad * 2 - 1], outline=BORDER, width=1)
    plate.paste(logo, (pad, pad), logo)
    banner.paste(plate, (text_x, (height - plate.height) // 2), plate)

    text_x = text_x + plate.width + 18
    title_f = font(30, bold=True)
    sub_f = font(17, bold=False)
    cta_f = font(15, bold=True)

    draw.text((text_x, 48), title, font=title_f, fill=(*INK, 255))
    draw.text((text_x, 92), subtitle, font=sub_f, fill=(*INK_MID, 255))

    bbox = draw.textbbox((0, 0), cta, font=cta_f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    cx, cy = width - tw - 48, height - th - 38
    draw.rounded_rectangle([cx - 14, cy - 8, cx + tw + 14, cy + th + 8], radius=3, fill=(*BURGUNDY, 255))
    draw.text((cx, cy), cta, font=cta_f, fill=(255, 255, 255, 255))

    # Sağ fotoğraf (soluk, tema ile uyumlu)
    if photo_path and photo_path.exists():
        photo = Image.open(photo_path).convert("RGB")
        pw = int(width * 0.38)
        ph = height - 8
        pr = width - pw - 4
        pt = 4
        target_ratio = pw / ph
        sw, sh = photo.size
        if sw / sh > target_ratio:
            nw = int(sh * target_ratio)
            left = (sw - nw) // 2
            photo = photo.crop((left, 0, left + nw, sh))
        else:
            nh = int(sw / target_ratio)
            top = max(0, (sh - nh) // 3)
            photo = photo.crop((0, top, sw, top + nh))
        photo = photo.resize((pw, ph), Image.Resampling.LANCZOS)
        photo = ImageEnhance.Brightness(photo).enhance(1.05)
        photo = ImageEnhance.Contrast(photo).enhance(0.95)
        photo_rgba = photo.convert("RGBA")

        # Sol tarafa cream fade
        fade = Image.new("L", (pw, ph), 255)
        fd = ImageDraw.Draw(fade)
        for x in range(int(pw * 0.35)):
            alpha = int(255 * (1 - x / (pw * 0.35)))
            fd.line([(x, 0), (x, ph)], fill=alpha)
        banner.paste(photo_rgba, (pr, pt), fade)

        draw.line([(pr, 4), (pr, height - 4)], fill=(*BORDER, 255), width=1)

    banner.convert("RGB").save(out_path, "JPEG", quality=90, optimize=True)
    print(f"saved {out_path}")


def main() -> None:
    ADS.mkdir(parents=True, exist_ok=True)
    tmp = ADS / "_tmp"
    tmp.mkdir(exist_ok=True)

    guyad_logo = tmp / "guyad_logo.png"
    guyad_bg = tmp / "guyad_bg.jpg"
    kral_logo = tmp / "kral_logo.png"
    kral_product = tmp / "kral_product.jpg"

    download(GUYAD_LOGO, guyad_logo)
    download(GUYAD_BG, guyad_bg)
    download(KRAL_LOGO, kral_logo)
    download(KRAL_PRODUCT, kral_product)

    themed_banner(
        logo_path=guyad_logo,
        photo_path=guyad_bg,
        title="G\u00dcYAD",
        subtitle="G\u00fcm\u00fc\u015fhaneliler Derne\u011fi \u00b7 guyad.org.tr",
        cta="Ziyaret Et",
        out_path=ADS / "guyad.jpg",
        logo_width=96,
    )

    themed_banner(
        logo_path=kral_logo,
        photo_path=kral_product,
        title="Kral Pestil",
        subtitle="1974'ten beri G\u00fcm\u00fcshane'nin geleneksel lezzetleri",
        cta="kralpestil.com",
        out_path=ADS / "kral-pestil.jpg",
        logo_width=110,
    )

    for f in tmp.iterdir():
        f.unlink()
    tmp.rmdir()


if __name__ == "__main__":
    main()
