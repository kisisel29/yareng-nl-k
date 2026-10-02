from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "ads" / "santa-store.jpg"
OUT = ROOT / "public" / "ads" / "santa-store.gif"
PREVIEW = ROOT / "public" / "ads"


def load_font(size: int, bold: bool = False) -> ImageFont.ImageFont:
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
    base_full = Image.open(SRC).convert("RGBA")
    scale = 0.72
    width = int(base_full.width * scale)
    height = int(base_full.height * scale)
    base = base_full.resize((width, height), Image.Resampling.LANCZOS)

    title_f = load_font(max(22, width // 28), bold=True)
    price_f = load_font(max(28, width // 22), bold=True)
    sub_f = load_font(max(16, width // 40), bold=False)
    cta_f = load_font(max(18, width // 36), bold=True)

    cream = (247, 245, 240)
    navy = (28, 36, 48)
    gold = (212, 160, 50)
    white = (255, 255, 255)

    frames: list[Image.Image] = []
    durations: list[int] = []

    def hold(img: Image.Image, ms: int) -> None:
        frames.append(img.copy())
        durations.append(ms)

    # Scene A — full banner, readable
    hold(base, 850)

    # Scene B — price panel slides up from bottom
    for i in range(6):
        t = (i + 1) / 6
        frame = base.copy()
        panel_h = int(height * 0.58 * t)
        panel = Image.new("RGBA", (width, panel_h), (0, 0, 0, 0))
        pd = ImageDraw.Draw(panel)
        pd.rectangle([0, 0, width, panel_h], fill=(32, 55, 30, int(235 * min(1.0, t * 1.15))))
        pd.rectangle([0, 0, width, max(3, height // 55)], fill=(*gold, 255))
        frame.paste(panel, (0, height - panel_h), panel)

        if t > 0.35:
            alpha = int(255 * min(1.0, (t - 0.35) / 0.65))
            text_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
            td = ImageDraw.Draw(text_layer)
            y0 = height - panel_h + int(panel_h * 0.2)
            td.text(
                (width // 2, y0),
                "Santa Store",
                font=title_f,
                fill=(*cream, alpha),
                anchor="mt",
            )
            td.text(
                (width // 2, y0 + int(height * 0.17)),
                "650 TL\u2019den ba\u015flayan fiyatlarla",
                font=price_f,
                fill=(255, 230, 140, alpha),
                anchor="mt",
            )
            td.text(
                (width // 2, y0 + int(height * 0.36)),
                "Outdoor giyim \u00b7 G\u00fcm\u00fc\u015fhane temal\u0131",
                font=sub_f,
                fill=(*cream, int(alpha * 0.92)),
                anchor="mt",
            )
            frame = Image.alpha_composite(frame, text_layer)
        frames.append(frame)
        durations.append(60)

    callout = frames[-1].copy()
    hold(callout, 1400)

    # Scene C — CTA spotlight frames
    for i in range(5):
        t = i / 4
        pulse = 0.5 + 0.5 * math.sin(t * math.pi)
        frame = base.copy()
        overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.rectangle([0, 0, width, height], fill=(0, 0, 0, 55))
        bw, bh = int(width * 0.44), int(height * 0.3)
        bx, by = (width - bw) // 2, (height - bh) // 2
        pad = int(8 * pulse)
        od.rounded_rectangle(
            [bx - pad, by - pad, bx + bw + pad, by + bh + pad],
            radius=18,
            fill=(255, 200, 70, int(70 + 110 * pulse)),
        )
        od.rounded_rectangle([bx, by, bx + bw, by + bh], radius=14, fill=(*navy, 255))
        od.text(
            (width // 2, height // 2 - int(height * 0.04)),
            "\u015eimdi \u0130ncele",
            font=cta_f,
            fill=(*white, 255),
            anchor="mm",
        )
        od.text(
            (width // 2, height // 2 + int(height * 0.09)),
            "shopier.com/santastore29",
            font=sub_f,
            fill=(200, 210, 220, 255),
            anchor="mm",
        )
        frames.append(Image.alpha_composite(frame, overlay))
        durations.append(95)

    hold(frames[-1], 700)

    # Scene D — product spotlight left / right
    for side in ("left", "right"):
        for i in range(4):
            t = i / 3
            frame = base.copy()
            dim = Image.new("RGBA", (width, height), (0, 0, 0, 120))
            hole = Image.new("L", (width, height), 0)
            hd = ImageDraw.Draw(hole)
            strength = int(255 * (0.55 + 0.45 * t))
            if side == "left":
                hd.ellipse(
                    [int(-width * 0.06), int(height * 0.02), int(width * 0.5), int(height * 1.08)],
                    fill=strength,
                )
            else:
                hd.ellipse(
                    [int(width * 0.5), int(height * 0.02), int(width * 1.06), int(height * 1.08)],
                    fill=strength,
                )
            mask = Image.eval(hole, lambda p: 255 - p)
            frames.append(Image.composite(Image.alpha_composite(frame, dim), frame, mask))
            durations.append(75)

    hold(base, 950)

    palette = frames[0].convert("RGB").quantize(colors=64, method=Image.Quantize.MEDIANCUT)
    quantized = [
        frame.convert("RGB").quantize(colors=64, method=Image.Quantize.MEDIANCUT, palette=palette)
        for frame in frames
    ]
    quantized[0].save(
        OUT,
        save_all=True,
        append_images=quantized[1:],
        duration=durations,
        loop=0,
        optimize=True,
        disposal=2,
    )
    print(f"saved {OUT} frames={len(frames)} kb={OUT.stat().st_size / 1024:.1f} size={width}x{height}")

    frames[0].convert("RGB").save(PREVIEW / "_santa_preview_a.jpg", quality=85)
    callout.convert("RGB").save(PREVIEW / "_santa_preview_b.jpg", quality=85)
    frames[len(frames) // 2].convert("RGB").save(PREVIEW / "_santa_preview_c.jpg", quality=85)


if __name__ == "__main__":
    main()
