# Drafts

This folder contains blog posts that are not ready to be published yet. They are **not visible** on the blog.

## How to publish a draft

1. Move the file from `_drafts/` to `_posts/`
2. Rename the file to include a date prefix: `YYYY-MM-DD-your-post-name.md`
   - Example: `my-2025-in-books.md` → `2025-12-31-my-2025-in-books.md`
3. Commit and push — the post will appear on the blog automatically.

## How to preview drafts locally

Run Jekyll with the `--drafts` flag to include draft posts in the local preview:

```bash
bundle exec jekyll serve --drafts
```
