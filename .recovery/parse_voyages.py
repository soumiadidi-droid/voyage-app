import json
import re
from pathlib import Path
from bs4 import BeautifulSoup

SLUGS = [
    "amerique-du-nord-hiver", "cote-basque", "crete", "dubai", "italie",
    "japon", "lisbonne", "mykonos", "porto",
]

SRC_DIR = Path(__file__).parent / "voyages_content"
OUT_DIR = Path(__file__).parent.parent / "content" / "voyages"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def parse_bg_url(style):
    m = re.search(r"url\('([^']+)'\)", style or "")
    return m.group(1) if m else None


def parse_hero(main):
    hero_div = main.find("div", class_=re.compile(r"min-h-\[82vh\]"))
    if not hero_div:
        return None
    style = hero_div.get("style", "")
    image = parse_bg_url(style)
    inner = hero_div.find("div", class_="relative")
    country_p = inner.find("p", class_=re.compile(r"^mono mb-3"))
    country_text = country_p.get_text(" ", strip=True) if country_p else ""
    country, _, tags = country_text.partition(" — ")
    h1 = inner.find("h1")
    tagline_p = inner.find("p", class_=re.compile(r"^italic"))
    count_p = inner.find_all("p", class_=re.compile(r"^mono"))[-1] if inner.find_all("p", class_=re.compile(r"^mono")) else None
    return {
        "image": image,
        "country": country.strip(),
        "tags": [t.strip() for t in tags.split("·")] if tags else [],
        "title": h1.get_text(strip=True) if h1 else "",
        "tagline": tagline_p.get_text(strip=True) if tagline_p else "",
        "photoCount": count_p.get_text(strip=True) if count_p else "",
    }


def parse_intro(main):
    intro_div = main.find("div", class_=re.compile(r"max-w-xl mx-auto my-1[46]"))
    if not intro_div:
        return ""
    p = intro_div.find("p")
    return re.sub(r"\s+", " ", p.get_text()).strip() if p else ""


def parse_gallery(main):
    items = []
    for figure in main.find_all("figure"):
        a = figure.find("a")
        img = figure.find("img")
        if not img:
            continue
        wrapper = figure.parent
        caption_p = wrapper.find("p", class_=re.compile(r"^mono mt-3"))
        text_p = wrapper.find("p", class_=re.compile(r"^mt-2"))
        items.append({
            "hiresUrl": a.get("href") if a else img.get("src"),
            "webUrl": img.get("src"),
            "alt": img.get("alt", ""),
            "caption": caption_p.get_text(strip=True) if caption_p else img.get("alt", ""),
            "emotionalText": text_p.get_text(" ", strip=True) if text_p else "",
        })
    return items


def parse_cards(main, heading_keyword):
    for h2 in main.find_all("h2"):
        if heading_keyword in h2.get_text().lower():
            container = h2.find_parent("div")
            cards = []
            for card in container.select("div.flex.flex-col.gap-10 > div, div.grid > div"):
                h3 = card.find("h3")
                if not h3:
                    continue
                status_span = card.find("span", class_=re.compile(r"^mono"))
                location_p = card.find("p", class_=re.compile(r"^mono"))
                review_p = card.find("p", class_=re.compile(r"^(mb-4 leading-relaxed|leading-relaxed)$"))
                tags = [t.get_text(strip=True) for t in card.select("span.mono.px-2")]
                link = card.find("a")
                cards.append({
                    "name": h3.get_text(strip=True),
                    "status": status_span.get_text(strip=True) if status_span else "",
                    "location": location_p.get_text(strip=True) if location_p else "",
                    "review": review_p.get_text(" ", strip=True) if review_p else "",
                    "tags": tags,
                    "link": link.get("href") if link else None,
                    "linkLabel": link.get_text(strip=True) if link else None,
                })
            return cards
    return []


def parse_destination(slug):
    html = (SRC_DIR / f"{slug}.html").read_text(encoding="utf-8")
    soup = BeautifulSoup(html, "html.parser")
    outer_main = soup.find("main")
    inner_main = outer_main.find("main")

    data = {
        "slug": slug,
        "hero": parse_hero(outer_main),
        "intro": parse_intro(inner_main),
        "gallery": parse_gallery(inner_main),
        "stays": parse_cards(inner_main, "où dormir"),
        "eats": parse_cards(inner_main, "où manger"),
        "activities": parse_cards(inner_main, "activités"),
    }
    return data


for slug in SLUGS:
    data = parse_destination(slug)
    out_path = OUT_DIR / f"{slug}.json"
    out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(slug, "->", len(data["gallery"]), "photos,", len(data["stays"]), "hôtels,",
          len(data["eats"]), "restos,", len(data["activities"]), "activités")
