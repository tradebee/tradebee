# Tradebee tool usage

Use the connected `tradebee` MCP tool to query and manage a Tradebee website. Each call selects an operation through `action`. The tool's input schema defines the exact parameters and required fields for that operation.

These instructions apply to Tradebee connections in OpenClaw, Codex, and WorkBuddy. Configure the API Key in the client connection; do not put it in chat, tool arguments, or generated content.

## Start with the site language

Call `languages-get` before a language-specific operation:

```json
{
  "action": "languages-get"
}
```

Show the returned languages to the user and use their selected exact language code. Do not guess or translate language codes.

## Choose an action

| Task | Actions |
| --- | --- |
| Read or manage products and product groups | `products-read/create/update/delete`, `productsgroup-read/create/update/delete` |
| Read or manage news, blogs, and FAQs | `news-*`, `blog-*`, `faq-*`, and their matching `newsgroup-*`, `bloggroup-*`, `faqgroup-*` actions |
| Read or manage custom pages and navigation | `custompage-read/create/update/delete`, `navigation-read/create/update/delete` |
| Read inquiries, recent visitors, or keyword rankings | `inquiry-read`, `visitor-recent`, `keywords-rank` |
| Find existing record IDs and website links | `data-ids-list`, `links-list` |
| Get HTML fragment generation rules | `rule-get` |
| Upload images | `file-upload` |
| Select, generate, preview, or save website pages | `page-list`, `page-get-available-template-page-name`, `page-generation-definition`, `page-html`, `page-save` |
| Read or update page SEO | `page-tdk`, `page-tdk-update` |
| Read an existing mutation backup | `backup-read` |

Slash-separated and wildcard names in this table summarize action families. Send one exact action from the tool schema, such as `products-read` or `blog-update`.

## Read before changing content

1. Select the exact site language.
2. Call the matching read action and identify the existing resource from the returned data.
3. Prepare only the changes requested by the user. Preserve unrelated fields.
4. Show the target language and exact payload or IDs, explain the automatic update backup, and obtain explicit approval.
5. Call the matching create, update, or delete action with the required confirmation.

Use `confirmation` only after the user has approved the exact operation:

```json
{
  "approved": true,
  "summary": "Describe the exact language, target, and changes approved by the user."
}
```

This object is the value of the action's `confirmation` field, not a complete tool call. Do not assume approval. For navigation deletion, explain that deleting a first-level item also deletes its children.

## Generate HTML content

Before generating a fragment, call `rule-get` with the selected language and the exact matching scene:

- `navigation.content`
- `news.description`
- `blog.description`
- `faq.answer`
- `products.description`
- `productsgroup.section.top`
- `productsgroup.section.bottom`
- `custompage.content`

Follow the complete returned rules. Stop if the rule request fails. Product-group top fragments and custom-page content may contain at most one `<h1>`; product-group bottom fragments must not contain `<h1>`.

Use the required embedded `<style>` block rather than inline style attributes or external stylesheet links. Upload images with `file-upload` and use the returned `data.success[].url`; do not embed base64 images.

When existing website links are needed, call `links-list` with the same language and follow its pagination. Copy returned `data.list[].url` values as relative paths without adding a hostname. Do not invent links.

## Preview and save a website page

1. Use `page-list` to choose an existing exact `pageName`. For a new template page, use `page-get-available-template-page-name` to obtain an available name.
2. Read `page-generation-definition` and follow the returned page, layout, module, and CSS rules.
3. If the page or its modules require record or group IDs, call `data-ids-list` with the same language and matching type. Copy exact `data.list[].id` values.
4. Read the current page with `page-html`. Generate or adjust the requested layouts and CSS, then call `page-html` with the latest candidate to preview it without saving.
5. Render the returned `pageHtml` in a browser at desktop, tablet, and mobile widths. Check alignment, overflow, spacing, images, text, and interactions. Fix issues and review the latest preview again.
6. Show the exact final changes and obtain explicit approval before `page-save`. Existing page overwrites are backed up locally.

For pages tied to a concrete record or group, obtain the required `guid` from `data-ids-list`. Pass it in the URL query for `page-html` and in the JSON body for `page-save`; the MCP tool handles this transport from its `guid` argument. Do not infer IDs from titles, URLs, or examples.

Use `page-tdk` to read page SEO and `page-tdk-update` to replace its Title, Description, and Keywords after approval. Follow the schema's scope restrictions; content-specific SEO uses the matching content APIs.

## Check results and recover from errors

A response with `status: false` is a failure. Read `msg`, correct the input or connection, and retry only when appropriate. Do not report a failed request as a completed change. Read back the affected resource when verification is needed.

Retain any returned backup filename. To inspect a backup, call `backup-read` with that exact filename. Review its `data.snapshot`, `data.restore_action`, `data.restore_payload`, and `data.restore_limitations`. Restoration requires approval and a separate call to the indicated restore action; reading a backup does not restore it. If the backup is unavailable, report that result rather than inventing restoration data.

The registered tool schema and current API responses define the available operations. Follow returned rules and validation errors when they are more specific than these examples.
