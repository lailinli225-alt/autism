import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const articles = JSON.parse(readFileSync(new URL("../src/data/articles.json", import.meta.url), "utf8"));
assert(articles.length > 0, "Article index is empty");

const ids = new Set();
for (const article of articles) {
  const url = new URL(article.url);
  assert(!ids.has(article.id), `Duplicate article ID: ${article.id}`);
  ids.add(article.id);
  assert.equal(article.language, "zh", `${article.id}: article must be Chinese`);
  assert(["vertical", "official"].includes(article.sourceType), `${article.id}: unverified source type`);
  assert(url.protocol === "https:", `${article.id}: source must use HTTPS`);
  assert(!url.hostname.includes("sogou.com"), `${article.id}: search page is not an article source`);
  assert(!url.searchParams.has("query"), `${article.id}: search page is not an article source`);
  assert(/[\u4e00-\u9fff]/.test(article.title), `${article.id}: title is not Chinese`);
  assert(/[\u4e00-\u9fff]/.test(article.summary), `${article.id}: summary is not Chinese`);
  const guide = article.readingGuide;
  assert(guide && guide.overview?.length >= 2, `${article.id}: missing in-app reading guide`);
  assert(guide.keyPoints?.length >= 2, `${article.id}: missing key points`);
  assert(guide.parentNotes?.length >= 1, `${article.id}: missing parent notes`);
}

console.log(`Validated ${articles.length} Chinese articles with in-app guides and direct source URLs.`);
