"""Mirror the approved ChatGPT Sites portfolio to GitHub Pages.
The editor remains on the source site and its edits are mirrored every 15 minutes.
"""
import concurrent.futures
import json
import re
import subprocess
from pathlib import Path

ORIGIN = "https://lorenzo-meroni-portfolio.lorenzocaricaa.chatgpt.site"
OUT = Path("_site")
ASSETS = """base/mouth.css base/robots.txt base/art-layout.mjs base/portfolio.js base/assets/informa-main.webp base/assets/spazio-libero-03.jpg base/assets/accessories-iconic-cover.webp base/assets/04_spazio_libero_apertura.jpg base/assets/synkara-main.webp base/assets/mouth-portrait.webp base/assets/spazio-libero-10.jpg base/assets/informa-forge.webp base/assets/informa-context-definitiva.png base/assets/spazio-libero-08.jpg base/assets/accessories-iconic-spread.webp base/assets/ordita-worn.webp base/assets/spazio-libero-02.jpg base/assets/entry-portrait-desktop-v2.webp base/assets/spazio-main-thumb.webp base/assets/accessories-main.webp base/assets/informa-casting.webp base/assets/synkara-food.webp base/assets/asterisco-logo.png base/assets/ordita-main-thumb.webp base/assets/02_in_forma_legno.jpeg base/assets/accessories-worn.webp base/assets/informa-naba-publication-03.webp base/assets/helmi-banner.webp base/assets/accessories-main-thumb.webp base/assets/informa-wormholes.webp base/assets/accessories-editorial.webp base/assets/spazio-libero-frontale.jpg base/assets/informa-wood-metal.webp base/assets/synkara-boat.webp base/assets/informa-main-thumb.webp base/assets/spazio-libero-07.jpg base/assets/informa-detail.webp base/assets/accessories-process.webp base/assets/mouth-interior.webp base/assets/entry-mouth-mobile.webp base/assets/informa-naba-publication-01.webp base/assets/spazio-exhibition.webp base/assets/01_in_forma_sedia.jpg base/assets/synkara-process.webp base/assets/entry-portrait-approved.png base/assets/ordita-main.webp base/assets/informa-naba-publication-02.webp base/assets/helmi-main-thumb.webp base/assets/informa-context.webp base/assets/entry-portrait-desktop.webp base/assets/03_in_forma_dettaglio.jpg base/assets/informa-recovered.webp base/assets/spazio-libero-01.jpg base/assets/helmi-main.webp base/assets/informa-chair.webp base/assets/spazio-poster.webp base/assets/spazio-main.webp base/assets/favicon.svg base/assets/entry-mouth-desktop.webp base/assets/synkara-main-thumb.webp base/assets/entry-portrait-wide-v2.webp base/assets/helmi-stage.webp base/assets/ordita-research.webp base/assets/entry-portrait-mobile.webp base/style.css base/photo-dimensions.js base/favicon.svg base/mouth.js""".split()


def fetch(path):
    return subprocess.check_output(
        ["curl", "-fLsS", "--retry", "4", "--max-time", "120", ORIGIN + path],
        timeout=140,
    )


def write_asset(path):
    relative_path = path.removeprefix("base/")
    data = fetch("/" + relative_path)
    target = OUT / relative_path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)


def copy_photo(path):
    data = fetch(path)
    if data.startswith(b"\xff\xd8\xff"):
        ext = ".jpg"
    elif data.startswith(b"\x89PNG"):
        ext = ".png"
    elif data[8:12] == b"WEBP":
        ext = ".webp"
    elif data.startswith((b"GIF87a", b"GIF89a")):
        ext = ".gif"
    elif data[4:12] in (b"ftypavif", b"ftypavis"):
        ext = ".avif"
    else:
        raise ValueError("Unknown media format: " + path)
    target = OUT / (path.lstrip("/") + ext)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    return path, "/" + str(target.relative_to(OUT)).replace("\\", "/")


OUT.mkdir(exist_ok=True)
html = fetch("/").decode("utf-8")
data = re.search(r'<script[^>]*id="portfolio-data"[^>]*>(.*?)</script>', html, re.S)
if not data or not json.loads(data.group(1)):
    raise ValueError("The source website returned no portfolio data; keeping previous deployment.")

paths = sorted(set(re.findall(r"/media/[\w-]+", html)))
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    list(pool.map(write_asset, ASSETS))
    for before, after in pool.map(copy_photo, paths):
        html = html.replace(before, after)

html = html.replace('href="/admin"', f'href="{ORIGIN}/admin"')
(OUT / "index.html").write_text(html, encoding="utf-8")
print(f"Exported website: {len(ASSETS)} static files, {len(paths)} editor photos")


# Export the English edition into its own URL path.
EN_ORIGIN = "https://lorenzo-meroni-portfolio-en.lorenzocaricaa.chatgpt.site"
EN_PREFIX = "/portfolio-en"
EN_OUT = OUT / "portfolio-en"


def fetch_english(path):
    return subprocess.check_output(
        ["curl", "-fLsS", "--retry", "4", "--max-time", "120", EN_ORIGIN + path],
        timeout=140,
    )


def copy_english(path):
    content = fetch_english(path)
    target_path = path
    if path.startswith("/media/"):
        if content.startswith(b"\xff\xd8\xff"):
            target_path += ".jpg"
        elif content.startswith(b"\x89PNG"):
            target_path += ".png"
        elif content[8:12] == b"WEBP":
            target_path += ".webp"
        elif content[4:12] in (b"ftypavif", b"ftypavis"):
            target_path += ".avif"
        else:
            raise ValueError("Unknown English media format: " + path)
    if path.endswith((".js", ".mjs", ".css")):
        content = content.decode("utf-8").replace("/assets/", EN_PREFIX + "/assets/").encode("utf-8")
    target = EN_OUT / target_path.lstrip("/")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(content)
    return path, EN_PREFIX + target_path


english_html = fetch_english("/").decode("utf-8")
english_data = re.search(r'<script[^>]*id="portfolio-data"[^>]*>(.*?)</script>', english_html, re.S)
if not english_data or not json.loads(english_data.group(1)).get("content"):
    raise ValueError("English portfolio content is missing")
english_paths = {"/" + path.removeprefix("base/") for path in ASSETS}
english_paths.update(re.findall(r"/assets/[a-zA-Z0-9_.-]+", english_html))
english_paths.update(re.findall(r"/media/[a-zA-Z0-9-]+", english_html))
EN_OUT.mkdir(parents=True, exist_ok=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    replacements = dict(pool.map(copy_english, sorted(english_paths)))
# Replace complete paths once, avoiding double prefixes.
pattern = re.compile("|".join(re.escape(path) for path in sorted(replacements, key=len, reverse=True)))
english_html = pattern.sub(lambda match: replacements[match.group(0)], english_html)
english_html = english_html.replace('href="/admin"', f'href="{EN_ORIGIN}/admin"')
(EN_OUT / "index.html").write_text(english_html, encoding="utf-8")
print(f"Exported English portfolio to {EN_PREFIX}/ with {len(english_paths)} assets")
