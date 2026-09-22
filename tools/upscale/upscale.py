"""Real-ESRGAN x4plus upscale of every image in jobs.txt.

Downloads each source into orig/, runs the model in overlapping tiles (a
1024px image at full size needs more RAM than a runner has once the x4
feature maps are built), then Lanczos-resizes the x4 result to OUT_SIZE and
writes a JPEG to out/.
"""
import os
import sys
import urllib.request

import numpy as np
import torch
from PIL import Image
from spandrel import ModelLoader

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL = sys.argv[1] if len(sys.argv) > 1 else "RealESRGAN_x4plus.pth"
OUT_SIZE = 2048
TILE, PAD = 256, 16

torch.set_num_threads(os.cpu_count() or 4)
model = ModelLoader().load_from_file(MODEL).model.eval()
scale = 4


@torch.no_grad()
def upscale(img):
    x = torch.from_numpy(np.asarray(img, dtype=np.float32) / 255.0).permute(2, 0, 1)[None]
    _, _, h, w = x.shape
    out = torch.zeros(1, 3, h * scale, w * scale)
    for y0 in range(0, h, TILE):
        for x0 in range(0, w, TILE):
            y1, x1 = min(y0 + TILE, h), min(x0 + TILE, w)
            py0, px0 = max(y0 - PAD, 0), max(x0 - PAD, 0)
            py1, px1 = min(y1 + PAD, h), min(x1 + PAD, w)
            t = model(x[:, :, py0:py1, px0:px1])
            oy, ox = (y0 - py0) * scale, (x0 - px0) * scale
            out[:, :, y0 * scale:y1 * scale, x0 * scale:x1 * scale] = \
                t[:, :, oy:oy + (y1 - y0) * scale, ox:ox + (x1 - x0) * scale]
        print(f"  row {y0 // TILE + 1}/{(h + TILE - 1) // TILE}", flush=True)
    arr = (out[0].clamp(0, 1).permute(1, 2, 0).numpy() * 255.0).round().astype(np.uint8)
    return Image.fromarray(arr)


os.makedirs(os.path.join(HERE, "orig"), exist_ok=True)
os.makedirs(os.path.join(HERE, "out"), exist_ok=True)
for line in open(os.path.join(HERE, "jobs.txt")):
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    url, name = line.split()
    src = os.path.join(HERE, "orig", name + os.path.splitext(url.split("?")[0])[1])
    urllib.request.urlretrieve(url, src)
    img = Image.open(src).convert("RGB")
    print(f"{name}: {img.size[0]}x{img.size[1]} -> x{scale}", flush=True)
    big = upscale(img)
    final = big.resize((OUT_SIZE, round(OUT_SIZE * big.height / big.width)), Image.LANCZOS)
    final.save(os.path.join(HERE, "out", name + ".jpg"), quality=95, subsampling=0, optimize=True)
    print(f"  wrote out/{name}.jpg {final.size[0]}x{final.size[1]}", flush=True)
