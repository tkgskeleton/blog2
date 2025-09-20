const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { marked } = require("marked");

const app = express();
const PORT = process.env.PORT || 3000;

// EJSテンプレート設定
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 静的ファイル（CSSや画像）
app.use(express.static(path.join(__dirname, "public")));

// 記事ディレクトリ
const articlesDir = path.join(__dirname, "articles");

// トップページ（記事一覧）
// トップページ（記事一覧）
app.get("/", async (req, res) => {
    try {
        const files = await fs.readdir(articlesDir);
        const articleList = [];

        for (const file of files) {
            if (file.endsWith(".md")) {
                const mdPath = path.join(articlesDir, file);
                const mdContent = await fs.readFile(mdPath, "utf-8");

                // 行ごとに分割
                const lines = mdContent.split(/\r?\n/);

                // 1行目をタイトル (# を外す)
                const titleMatch = lines[0].match(/^#\s*(.+)/);
                const title = titleMatch ? titleMatch[1] : file.replace(".md", "");

                // 2行目を説明文
                const description = lines[1] ? lines[1].trim() : "";

                articleList.push({
                    title: title,
                    slug: file.replace(".md", ""),
                    description: description
                });
            }
        }

        res.render("index", { articles: articleList });
    } catch (err) {
        console.error("記事一覧の読み込みエラー:", err);
        res.status(500).send("記事一覧の読み込み中にエラーが発生しました。");
    }
});

// 記事詳細ページ
app.get("/article/:slug", async (req, res) => {
    try {
        const filePath = path.join(articlesDir, `${req.params.slug}.md`);
        const md = await fs.readFile(filePath, "utf-8");

        const html = marked.parse(md);

        // MDの1行目からタイトルを抽出
        const titleMatch = md.match(/^#\s(.+)/);
        const title = titleMatch ? titleMatch[1] : req.params.slug;

        res.render("articles", {
            title: title,
            content: html
        });
    } catch (err) {
        console.error("記事読み込みエラー:", err);
        res.status(404).send("記事が見つかりません");
    }
});

// AHAの創作利用規約ページ
app.get("/terms", (req, res) => {
    res.render("terms");
});

module.exports = app;