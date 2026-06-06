#!/usr/bin/env python3
"""Translate article metadata and build copyright-safe Chinese reading guides."""

from __future__ import annotations

import argparse
import json
import os
import re
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
ARTICLES_PATH = ROOT / "src" / "data" / "articles.json"
USER_AGENT = (
    "Mozilla/5.0 (compatible; AutismParentArticleIndexer/1.0; "
    "+https://autism-support-prototype.vercel.app)"
)
HEADERS = {"User-Agent": USER_AGENT}


def clean_text(value: str, limit: int) -> str:
    return re.sub(r"\s+", " ", value or "").strip()[:limit]


def extract_source_excerpt(article: dict) -> str:
    if article["sourceType"] == "wechat":
        return article["summary"]

    try:
        response = requests.get(article["url"], headers=HEADERS, timeout=25)
        response.raise_for_status()
    except requests.RequestException:
        return article["summary"]

    soup = BeautifulSoup(response.text, "html.parser")
    for node in soup.select("script, style, nav, header, footer, aside, form"):
        node.decompose()

    candidates = soup.select(
        "article, main, .article-content, .entry-content, .post-content, "
        ".content-detail, .detail-content, .content"
    )
    if not candidates:
        return article["summary"]

    text = max(
        (candidate.get_text(" ", strip=True) for candidate in candidates),
        key=len,
        default="",
    )
    return clean_text(text, 2800) or article["summary"]


def build_payload(batch: list[dict]) -> list[dict]:
    return [
        {
            "id": article["id"],
            "title": article["title"],
            "summary": article["summary"],
            "source": article["source"],
            "category": article["category"],
            "sourceType": article["sourceType"],
            "publicExcerpt": extract_source_excerpt(article),
        }
        for article in batch
    ]


def prompt_messages(batch: list[dict]) -> list[dict]:
    return [
        {
            "role": "system",
            "content": "\n".join(
                [
                    "你是自闭症家长内容编辑，只能依据输入的公开文章标题、摘要和正文摘录整理内容。",
                    "不得补充输入中没有的研究结论、数字、疗效或医疗建议。",
                    "所有输出必须是简体中文；英文标题和内容需要准确翻译。",
                    "不得复制大段原文，要用自己的话形成版权安全的结构化导读。",
                    "不得把科普内容写成诊断或个别化治疗方案。",
                    "只返回合法 JSON，不要 Markdown。",
                ]
            ),
        },
        {
            "role": "user",
            "content": json.dumps(
                {
                    "task": "为每篇文章生成可在网站内阅读的中文导读。",
                    "articles": batch,
                    "outputShape": {
                        "articles": [
                            {
                                "id": "与输入 id 完全一致",
                                "title": "简体中文标题",
                                "summary": "80-150字中文摘要",
                                "overview": ["2-3段中文导读，每段80-160字"],
                                "keyPoints": ["3条核心要点，每条25-70字"],
                                "parentNotes": ["2-3条家长阅读提示，每条25-70字"],
                                "boundary": "说明信息边界和何时应咨询专业人员，40-100字",
                            }
                        ]
                    },
                },
                ensure_ascii=False,
            ),
        },
    ]


def call_endpoint(endpoint: str, token: str, batch: list[dict]) -> dict:
    response = requests.post(
        endpoint,
        headers={"Authorization": f"Bearer {token}"},
        json={"articles": batch},
        timeout=90,
    )
    response.raise_for_status()
    return response.json()


def call_deepseek(batch: list[dict]) -> dict:
    api_key = os.environ.get("DEEPSEEK_API_KEY", "")
    if not api_key:
        raise RuntimeError("DEEPSEEK_API_KEY is required")

    response = requests.post(
        "https://api.deepseek.com/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": os.environ.get("DEEPSEEK_MODEL", "deepseek-chat"),
            "temperature": 0.1,
            "response_format": {"type": "json_object"},
            "messages": prompt_messages(batch),
        },
        timeout=90,
    )
    response.raise_for_status()
    data = response.json()
    return json.loads(data["choices"][0]["message"]["content"])


def normalized_guide(raw: dict) -> dict:
    def string_list(name: str, minimum: int, maximum: int) -> list[str]:
        values = raw.get(name)
        if not isinstance(values, list):
            raise ValueError(f"{name} must be a list")
        result = [clean_text(str(value), maximum) for value in values if str(value).strip()]
        if len(result) < minimum:
            raise ValueError(f"{name} has too few items")
        return result[:3]

    return {
        "overview": string_list("overview", 2, 220),
        "keyPoints": string_list("keyPoints", 3, 100),
        "parentNotes": string_list("parentNotes", 2, 100),
        "boundary": clean_text(str(raw.get("boundary", "")), 160),
    }


def source_display(article: dict) -> str:
    if article["source"] == "The Transmitter / Spectrum":
        return "国际神经科学研究媒体"
    if article["source"] == "SFARI":
        return "西蒙斯基金会孤独症研究计划"
    return article["source"]


def enrich(args: argparse.Namespace) -> None:
    articles = json.loads(ARTICLES_PATH.read_text(encoding="utf-8"))
    token = Path(args.token_file).read_text(encoding="utf-8").strip() if args.token_file else ""

    pending = articles if args.force else [article for article in articles if "readingGuide" not in article]
    completed = len(articles) - len(pending)
    for start in range(0, len(pending), args.batch_size):
        batch = pending[start : start + args.batch_size]
        payload = build_payload(batch)
        last_error = None

        for attempt in range(3):
            try:
                if args.endpoint:
                    result = call_endpoint(args.endpoint, token, payload)
                else:
                    result = call_deepseek(payload)
                raw_articles = result.get("articles", [])
                by_id = {item["id"]: item for item in raw_articles}

                for article in batch:
                    raw = by_id[article["id"]]
                    original_title = article.get("originalTitle") or article["title"]
                    article["originalTitle"] = original_title
                    article["title"] = clean_text(str(raw["title"]), 160)
                    article["summary"] = clean_text(str(raw["summary"]), 260)
                    article["readingGuide"] = normalized_guide(raw)
                    article["language"] = "zh"
                    article["linkLabel"] = "查看来源"
                    article["sourceDisplay"] = source_display(article)
                break
            except (KeyError, ValueError, RuntimeError, requests.RequestException) as error:
                last_error = error
                time.sleep(2 * (attempt + 1))
        else:
            raise RuntimeError(f"Failed batch at {start}: {last_error}")

        completed += len(batch)
        ARTICLES_PATH.write_text(
            json.dumps(articles, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"Enriched {completed}/{len(articles)}", flush=True)
        time.sleep(0.5)

    for article in articles:
        article["sourceDisplay"] = source_display(article)
    ARTICLES_PATH.write_text(
        json.dumps(articles, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--endpoint")
    parser.add_argument("--token-file")
    parser.add_argument("--batch-size", type=int, default=5)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    if bool(args.endpoint) != bool(args.token_file):
        raise SystemExit("--endpoint and --token-file must be used together")
    if args.batch_size < 1 or args.batch_size > 5:
        raise SystemExit("--batch-size must be between 1 and 5")

    enrich(args)


if __name__ == "__main__":
    main()
