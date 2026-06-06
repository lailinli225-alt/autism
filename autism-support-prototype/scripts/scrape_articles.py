#!/usr/bin/env python3
"""Build a recent autism article index without republishing article bodies."""

from __future__ import annotations

import argparse
import concurrent.futures
import datetime as dt
import email.utils
import hashlib
import html
import json
import re
import time
import urllib.parse
import xml.etree.ElementTree as ET
from pathlib import Path

import requests
from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "src" / "data" / "articles.json"
REPORT_PATH = ROOT / "docs" / "article-sources.md"
USER_AGENT = (
    "Mozilla/5.0 (compatible; AutismParentArticleIndexer/1.0; "
    "+https://autism-support-prototype.vercel.app)"
)
HEADERS = {"User-Agent": USER_AGENT}
TODAY = dt.date.today()
DEFAULT_CUTOFF = TODAY - dt.timedelta(days=365)

DMHXM_LIST_URL = "https://www.dmhxm.com/classes/article/method"
TRANSMITTER_FEED = "https://www.thetransmitter.org/spectrum/feed/"
SFARI_FEED = "https://www.sfari.org/feed/"
WECHAT_SEARCH_URL = "https://weixin.sogou.com/weixin"

WECHAT_QUERIES = [
    "孤独症 2026",
    "自闭症 2026",
    "孤独症 干预 2025",
    "自闭症 家长 2025",
    "孤独症 融合教育 2025",
    "孤独症 科普 2025",
    "自闭症 康复 2025",
    "孤独症 家庭 2025",
]

WECHAT_SOURCE_BLOCKLIST = {
    "学霸养成手册m",
    "南京天佑儿童医院自闭症之家",
    "职业技能规划",
    "云南医科院再生医学科普",
    "Soulsettlement",
    "北京富玛特",
    "医学科学院DNT细胞应用中心",
}

WECHAT_TITLE_BLOCKLIST = [
    "口碑榜",
    "机构全攻略",
    "证书报考",
    "有效率达",
    "细胞外囊泡",
    "强势领航",
]

CATEGORY_RULES = [
    ("家长支持", ["家长", "家庭", "照护", "父母", "妈妈", "爸爸", "压力", "情绪", "托孤"]),
    ("融合教育", ["融合", "学校", "教育", "入学", "就业", "成年", "职业", "社区", "同伴"]),
    ("干预方法", ["干预", "训练", "aba", "感统", "语言", "沟通", "行为", "社交", "睡眠", "游戏"]),
    ("诊断科普", ["诊断", "症状", "识别", "病因", "筛查", "误区", "区别", "患病", "数据"]),
    ("前沿研究", ["研究", "科研", "基因", "神经", "脑", "生物", "trial", "study", "research"]),
]


def clean_text(value: str, limit: int = 240) -> str:
    text = BeautifulSoup(html.unescape(value or ""), "html.parser").get_text(" ", strip=True)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit]


def parse_date(value: str) -> dt.date | None:
    if not value:
        return None

    value = value.strip()
    match = re.search(r"(20\d{2})[-/.年](\d{1,2})[-/.月](\d{1,2})", value)
    if match:
        return dt.date(*map(int, match.groups()))

    try:
        parsed = email.utils.parsedate_to_datetime(value)
        return parsed.date()
    except (TypeError, ValueError):
        return None


def categorize(title: str, summary: str, source_type: str) -> str:
    text = f"{title} {summary}".lower()
    scores = []
    for category, keywords in CATEGORY_RULES:
        score = sum(1 for keyword in keywords if keyword.lower() in text)
        scores.append((score, category))

    best_score, best_category = max(scores)
    if best_score:
        return best_category
    return "前沿研究" if source_type == "research" else "诊断科普"


def article_id(url: str) -> str:
    return hashlib.sha1(url.encode("utf-8")).hexdigest()[:12]


def make_article(
    *,
    title: str,
    summary: str,
    url: str,
    published: dt.date,
    source: str,
    source_type: str,
    language: str,
    link_label: str = "阅读原文",
) -> dict:
    cleaned_title = clean_text(title, 160)
    cleaned_summary = clean_text(summary, 260)
    return {
        "id": article_id(url),
        "title": cleaned_title,
        "summary": cleaned_summary or "点击查看来源文章。",
        "url": url,
        "publishedAt": published.isoformat(),
        "source": source,
        "sourceType": source_type,
        "language": language,
        "category": categorize(cleaned_title, cleaned_summary, source_type),
        "linkLabel": link_label,
    }


def request(session: requests.Session, url: str, **kwargs) -> requests.Response:
    response = session.get(url, headers=HEADERS, timeout=25, **kwargs)
    response.raise_for_status()
    return response


def scrape_dmhxm(cutoff: dt.date, limit: int) -> list[dict]:
    session = requests.Session()
    listing = request(session, DMHXM_LIST_URL)
    soup = BeautifulSoup(listing.text, "html.parser")
    urls = []
    for anchor in soup.select('a[href*="/classes/article/detail/"]'):
        url = urllib.parse.urljoin(DMHXM_LIST_URL, anchor.get("href", ""))
        if url not in urls:
            urls.append(url)

    def parse_detail(url: str) -> dict | None:
        try:
            detail = request(session, url)
            page = BeautifulSoup(detail.text, "html.parser")
            title_node = page.select_one("h1.title")
            date_node = page.select_one(".header .date")
            description_node = page.select_one('meta[name="description"]')
            published = parse_date(date_node.get_text(strip=True) if date_node else "")
            if not title_node or not published or published < cutoff or published > TODAY:
                return None
            return make_article(
                title=title_node.get_text(" ", strip=True),
                summary=description_node.get("content", "") if description_node else "",
                url=url,
                published=published,
                source="大米和小米",
                source_type="vertical",
                language="zh",
            )
        except (requests.RequestException, ValueError):
            return None

    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = [executor.submit(parse_detail, url) for url in urls[: max(limit * 3, 120)]]
        for future in concurrent.futures.as_completed(futures):
            article = future.result()
            if article:
                results.append(article)

    return sorted(results, key=lambda item: item["publishedAt"], reverse=True)[:limit]


def scrape_rss(base_url: str, source: str, cutoff: dt.date, limit: int) -> list[dict]:
    session = requests.Session()
    results = []
    page = 1
    while len(results) < limit and page <= 10:
        url = base_url if page == 1 else f"{base_url}?paged={page}"
        try:
            response = request(session, url)
            root = ET.fromstring(response.content)
        except (requests.RequestException, ET.ParseError):
            break

        items = root.findall("./channel/item")
        if not items:
            break

        reached_cutoff = False
        for item in items:
            published = parse_date(item.findtext("pubDate") or "")
            if not published:
                continue
            if published < cutoff:
                reached_cutoff = True
                continue
            if published > TODAY:
                continue
            article_url = item.findtext("link") or ""
            results.append(
                make_article(
                    title=item.findtext("title") or "",
                    summary=item.findtext("description") or "",
                    url=article_url,
                    published=published,
                    source=source,
                    source_type="research",
                    language="en",
                )
            )
        if reached_cutoff:
            break
        page += 1
        time.sleep(0.3)

    return sorted(results, key=lambda item: item["publishedAt"], reverse=True)[:limit]


def scrape_wechat(cutoff: dt.date, limit: int) -> list[dict]:
    session = requests.Session()
    session.headers.update({**HEADERS, "Referer": "https://weixin.sogou.com/"})
    results = []
    seen = set()

    for query in WECHAT_QUERIES:
        if len(results) >= limit * 2:
            break
        try:
            response = session.get(
                WECHAT_SEARCH_URL,
                params={"type": 2, "query": query, "ie": "utf8"},
                timeout=25,
            )
            response.raise_for_status()
        except requests.RequestException:
            continue

        soup = BeautifulSoup(response.text, "html.parser")
        for item in soup.select("ul.news-list li"):
            title_node = item.select_one("h3 a")
            summary_node = item.select_one(".txt-info")
            source_node = item.select_one(".all-time-y2")
            script_node = item.select_one(".s2 script")
            timestamp_match = re.search(
                r"timeConvert\('(\d+)'\)",
                script_node.get_text() if script_node else "",
            )
            if not title_node or not source_node or not timestamp_match:
                continue

            title = clean_text(title_node.get_text(" ", strip=True), 160)
            source = clean_text(source_node.get_text(" ", strip=True), 60)
            published = dt.datetime.fromtimestamp(int(timestamp_match.group(1))).date()
            dedupe_key = (title, source)
            if (
                published < cutoff
                or published > TODAY
                or dedupe_key in seen
                or source in WECHAT_SOURCE_BLOCKLIST
                or any(keyword in title for keyword in WECHAT_TITLE_BLOCKLIST)
            ):
                continue

            seen.add(dedupe_key)
            search_url = (
                f"{WECHAT_SEARCH_URL}?type=2&query="
                f"{urllib.parse.quote(title)}&ie=utf8"
            )
            results.append(
                make_article(
                    title=title,
                    summary=summary_node.get_text(" ", strip=True) if summary_node else "",
                    url=search_url,
                    published=published,
                    source=source,
                    source_type="wechat",
                    language="zh",
                    link_label="微信搜索原文",
                )
            )
        time.sleep(0.8)

    return sorted(results, key=lambda item: item["publishedAt"], reverse=True)[:limit]


def dedupe_articles(articles: list[dict]) -> list[dict]:
    result = []
    seen_urls = set()
    seen_titles = set()
    for article in sorted(articles, key=lambda item: item["publishedAt"], reverse=True):
        normalized_title = re.sub(r"\W+", "", article["title"]).lower()
        if article["url"] in seen_urls or normalized_title in seen_titles:
            continue
        seen_urls.add(article["url"])
        seen_titles.add(normalized_title)
        result.append(article)
    return result


def write_report(articles: list[dict], cutoff: dt.date) -> None:
    source_counts = {}
    category_counts = {}
    source_type_counts = {}
    for article in articles:
        source_counts[article["source"]] = source_counts.get(article["source"], 0) + 1
        category_counts[article["category"]] = category_counts.get(article["category"], 0) + 1
        source_type_counts[article["sourceType"]] = source_type_counts.get(article["sourceType"], 0) + 1

    lines = [
        "# 精品好文数据来源",
        "",
        f"- 生成日期：{TODAY.isoformat()}",
        f"- 时间范围：{cutoff.isoformat()} 至 {TODAY.isoformat()}",
        f"- 文章数量：{len(articles)}",
        "- 数据范围：仅保存标题、日期、来源、短摘要和原文链接，不保存或转载全文。",
        "- 微信说明：搜狗微信可提供公众号文章元数据，但微信原文可能要求验证码；因此使用微信标题搜索链接。",
        "",
        "## 来源类型",
        "",
    ]
    lines.extend(f"- {name}: {count}" for name, count in sorted(source_type_counts.items()))
    lines.extend(["", "## 分类", ""])
    lines.extend(f"- {name}: {count}" for name, count in sorted(category_counts.items()))
    lines.extend(["", "## 来源", ""])
    lines.extend(f"- {name}: {count}" for name, count in sorted(source_counts.items(), key=lambda item: (-item[1], item[0])))
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cutoff", default=DEFAULT_CUTOFF.isoformat())
    parser.add_argument("--limit", type=int, default=100)
    args = parser.parse_args()
    cutoff = dt.date.fromisoformat(args.cutoff)
    existing_by_url = {}
    if OUTPUT_PATH.exists():
        existing_by_url = {
            article["url"]: article
            for article in json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
        }

    vertical = scrape_dmhxm(cutoff, 80)
    transmitter = scrape_rss(
        TRANSMITTER_FEED,
        "The Transmitter / Spectrum",
        cutoff,
        30,
    )
    sfari = scrape_rss(SFARI_FEED, "SFARI", cutoff, 25)
    wechat = scrape_wechat(cutoff, 30)

    selected = [
        *wechat[:25],
        *transmitter[:20],
        *sfari[:15],
        *vertical[:40],
    ]
    leftovers = [
        *wechat[25:],
        *transmitter[20:],
        *sfari[15:],
        *vertical[40:],
    ]
    articles = dedupe_articles([*selected, *leftovers])[: args.limit]
    if len(articles) < args.limit:
        raise SystemExit(f"Only collected {len(articles)} valid articles; expected {args.limit}.")

    preserved_fields = {
        "originalTitle",
        "title",
        "summary",
        "readingGuide",
        "sourceDisplay",
        "language",
        "linkLabel",
    }
    for article in articles:
        existing = existing_by_url.get(article["url"], {})
        if "readingGuide" not in existing:
            continue
        article.update(
            {
                field: existing[field]
                for field in preserved_fields
                if field in existing
            }
        )

    OUTPUT_PATH.write_text(
        json.dumps(articles, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    write_report(articles, cutoff)
    print(
        json.dumps(
            {
                "count": len(articles),
                "newest": articles[0]["publishedAt"],
                "oldest": articles[-1]["publishedAt"],
                "output": str(OUTPUT_PATH),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
