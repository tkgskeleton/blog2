import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { marked } from "marked";
import serverless from "serverless-http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");
const articlesDir = path.join(__dirname, "../articles");

app.get("/", async (req, res) => {
    try {
        const files = await fs.readdir(articlesDir);
        const articleList = [];

        for (const file of files) {
            if (file.endsWith(".md")) {
                const mdPath = path.join(articlesDir, file);
                const mdContent = await fs.readFile(mdPath, "utf-8");
                const lines = mdContent.split(/\r?\n/);
                const titleMatch = lines[0].match(/^#\s*(.+)/);
                const title = titleMatch ? titleMatch[1] : file.replace(".md", "");
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

app.get("/article/:slug", async (req, res) => {
    try {
        const filePath = path.join(articlesDir, `${req.params.slug}.md`);
        const md = await fs.readFile(filePath, "utf-8");
        const html = marked.parse(md);
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

app.get("/terms", (req, res) => {
    res.render("terms");
});

export default serverless(app);