---
name: tradebee
description: Query, analyze, and manage Tradebee website content, pages, SEO, inquiries, and visitor data.
version: 26.11.18
---

# Tradebee for OpenClaw

Use OpenClaw's connected Tradebee MCP tools directly. For example, call `tradebee__languages-get` with `{}`. Follow the tool names and schemas exposed by the client.

## Features

- Create, read, update, and delete products, news, blogs, FAQs, their groups, custom pages, and navigation.
- Read, create, and update product filter label sets, groups, and labels.
- List pages and available templates, read generation rules, preview HTML, save layouts and CSS, and read or update page SEO.
- Read inquiries, recent visitors, and keyword rankings.
- Look up languages, links, record IDs, and HTML rules; upload images.
- Read pre-change backups using `backup-read` and the returned backup filename.

## Usage

- Start with `languages-get`; use returned language codes, IDs, page names, and URLs. Read existing content before changing it.
- For pages, read `page-generation-definition`, use real IDs and links, then preview with `page-html` before requesting approval to `page-save`.
- Before writing or uploading, show the exact payload or target IDs and obtain explicit approval. Pass `confirmation: {"approved": true, "summary": "<approved operation>"}`. Explain update backups and navigation deletion's effect on children.
- Check `status`, `msg`, and any `data.fail` entries. API keys belong in client configuration, never chat or tool arguments.
