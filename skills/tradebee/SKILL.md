---
name: tradebee
display_name: 小蜜蜂数字营销
display_name_en: Tradebee
description: Use Tradebee to query, optimize, customize, analyze, or manage a connected Tradebee digital marketing website.
description_zh: 查询、优化、装修、分析和管理小蜜蜂数字营销网站的内容、数据与页面。
description_en: Query, optimize, customize, analyze, and manage content, data, and pages on a connected Tradebee website.
version: 26.9.28
author: Tradebee
---

# 小蜜蜂数字营销（Tradebee）

Use the connected `tradebee` MCP tool for Tradebee site content, inquiries, visitors, keywords, traffic, products, news, FAQs, custom pages, blogs, navigation, and pages. Its `action` parameter selects the operation; the tool schema defines the exact parameters and return values for each action. The user's Tradebee API Key is configured in the client connection. Never ask them to paste it into chat or include it in tool arguments.

## Choose an action

- Start with `languages-get` to obtain the site's exact language codes. Pass the chosen code as `language` where required.
- Use the matching `*-read` action before changing an existing product, group, FAQ, blog, news item, custom page, or navigation item. Use the corresponding `*-create`, `*-update`, or `*-delete` action only for the user's requested resource.
- `inquiry-read`, `visitor-recent`, and `keywords-rank` read site activity and search data. `links-list` returns existing site links. `file-upload` stores images and returns URLs for later use.
- For pages, use `page-list` to select an existing `pageName`, or `page-get-available-template-page-name` to select an available template name. Read `page-generation-definition` for its current rules. Use `data-ids-list` for real module record IDs and `links-list` for real links. Call `page-html` to preview; call `page-save` only after reviewing the latest rendered preview and receiving approval for the exact payload.

## Parameters and results

Every call requires an exact `action`. Follow the live MCP input schema for the selected action; do not infer IDs, language codes, page names, or URLs from examples. A result with `status: false` is a failure; read its `msg` and correct the input or reconnect if the API Key has expired. Do not present a failed call as a completed change.

Before any create, update, delete, file upload, or page save, show the user the target language and exact payload or IDs. Obtain their explicit approval, then pass `confirmation: {"approved": true, "summary": "<what the user approved>"}`. Never set `approved` from an assumption. For updates, explain the automatic backup; for navigation deletion, include the effect on child items in the approval request.
