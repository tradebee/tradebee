# Tradebee OpenAPI Plugin

This repository contains the `tradebee` OpenClaw plugin for the Tradebee Website Builder Open API. It registers one `tradebee_api` tool whose action handlers are grouped into internal business-domain directories under `src/`.

Users invoke only `tradebee_api`. Files below the business-domain directories are TypeScript source modules, not independently published plugins or tools. `npm run build` emits the executable ESM JavaScript into `dist/`.

## Plugin Entry Policy

- `tradebee_api` is the plugin's only external tool entrypoint for Tradebee capabilities.
- Any newly added capability must be wired into [src/tradebee.ts](./src/tradebee.ts) and [tool.schema.json](./tool.schema.json), then documented here.
- New action modules may be added under the matching business-domain directory in `src/`, but they are not separate plugins, tools, or publish targets.
- Action naming inside `tradebee` should continue using the existing hyphenated pattern such as `products-read` and `visitor-recent`.

## Included Capabilities

The module paths below refer to generated files under `dist/`; their editable
sources use the same paths under `src/` with a `.ts` extension.

| Capability | Built runtime module | Purpose |
|------------|-----------------|---------|
| `languages-get` | `languages/get.js` | Get enabled site languages |
| `links-list` | `links/list.js` | Get real website links for rule-based HTML fragments, pages, and navigation |
| `rule-get` | `rule/get.js` | Read tenant HTML generation rules for one language and one scene |
| `blog-create` | `blog/create.js` | Create and publish a blog |
| `blog-read` | `blog/read.js` | Read blog list data |
| `blog-update` | `blog/update.js` | Update a blog with automatic backup |
| `blog-delete` | `blog/delete.js` | Move blogs to the recycle bin by ID list |
| `bloggroup-create` | `bloggroup/create.js` | Create and publish a blog group |
| `bloggroup-read` | `bloggroup/read.js` | Read blog group list data |
| `bloggroup-update` | `bloggroup/update.js` | Update a blog group with automatic backup |
| `bloggroup-delete` | `bloggroup/delete.js` | Delete blog groups by ID list |
| `custompage-create` | `custompage/create.js` | Create and publish a custom page |
| `custompage-read` | `custompage/read.js` | Read custom page list data |
| `custompage-update` | `custompage/update.js` | Update an existing custom page |
| `custompage-delete` | `custompage/delete.js` | Move custom pages to the recycle bin by ID list |
| `faq-create` | `faq/create.js` | Create and publish an FAQ |
| `faq-read` | `faq/read.js` | Read FAQ data |
| `faq-update` | `faq/update.js` | Update an FAQ with automatic backup |
| `faq-delete` | `faq/delete.js` | Delete FAQ records by ID list |
| `faqgroup-create` | `faqgroup/create.js` | Create and publish an FAQ group |
| `faqgroup-read` | `faqgroup/read.js` | Read FAQ group data |
| `faqgroup-update` | `faqgroup/update.js` | Update an FAQ group with automatic backup |
| `faqgroup-delete` | `faqgroup/delete.js` | Delete FAQ groups by ID list |
| `news-create` | `news/create.js` | Create and publish news |
| `news-read` | `news/read.js` | Read news with optional article/group filters |
| `news-update` | `news/update.js` | Update news with automatic backup |
| `news-delete` | `news/delete.js` | Delete news by ID list |
| `newsgroup-create` | `newsgroup/create.js` | Create a news group |
| `newsgroup-read` | `newsgroup/read.js` | Read news groups |
| `newsgroup-update` | `newsgroup/update.js` | Update a news group with automatic backup |
| `newsgroup-delete` | `newsgroup/delete.js` | Delete news groups by ID list |
| `navigation-create` | `navigation/create.js` | Create first- or second-level navigation |
| `navigation-read` | `navigation/read.js` | Read the complete two-level navigation tree |
| `navigation-update` | `navigation/update.js` | Update navigation with automatic backup |
| `navigation-delete` | `navigation/delete.js` | Cascade-delete navigation by ID list |
| `productsgroup-create` | `productsgroup/create.js` | Create and publish a product group |
| `productsgroup-update` | `productsgroup/update.js` | Update an existing product group |
| `productsgroup-delete` | `productsgroup/delete.js` | Delete product groups by ID list |
| `productsgroup-read` | `productsgroup/read.js` | Get published product groups |
| `products-read` | `products/read.js` | Read product list data |
| `products-create` | `products/create.js` | Create new products |
| `products-update` | `products/update.js` | Update existing products |
| `products-delete` | `products/delete.js` | Move products to the recycle bin |
| `inquiry-read` | `inquiry/read.js` | Read inquiry list data |
| `visitor-recent` | `visitor/recent.js` | Read recent visitor data |
| `keywords-rank` | `keywords/rank.js` | Read keyword ranking analytics |
| `file-upload` | `file/upload.js` | Upload page/content images and return hosted URLs plus file metadata |
| `page-list` | `page/list.js` | List exact available page names |
| `page-generation-definition` | `page/generation-definition.js` | Read page layouts, modules, schemas, and generation rules |
| `page-html` | `page/html.js` | Read or render a page as complete preview HTML without saving |
| `page-save` | `page/save.js` | Create or update a page with pre-overwrite backup |

## Repository Principles

- Publish and use `tradebee` as one OpenClaw plugin that exposes `tradebee_api`.
- Keep one directory per business domain under `src/` and one TypeScript module per action.
- Keep plugin metadata and the tool schema at the root; internal action modules must not contain separate plugin manifests or schemas.
- Keep `src/tradebee.ts`, root `tool.schema.json`, and this README aligned with every supported action.
- Keep request validation lightweight in `src/tradebee.ts` and let the server perform detailed business validation when possible.
- Use shared dependency patterns across capabilities, especially language selection and product group selection.

## Calling the plugin tool

For TypeScript source integrations, import the default function from `src/tradebee.ts`.
Direct consumers of the built implementation import `dist/tradebee.js`. OpenClaw
loads the registered `tradebee_api` tool from `dist/index.js` automatically.
Typed callers use the default export with `TradebeeRequest`, a discriminated
union of all 51 actions defined in `action-types.ts`. The 33 original action
contracts were adapted from the legacy `tradebee-mu-skill` package; later capabilities
follow the current tool schema and original `MNskill_js` implementations. Current
navigation/news rule scenes are preserved even though the older schema lacks them.

For example, `{ action: "blog-read", language: "en" }` is valid; a numeric
language or an omitted required language is a compile error. Raw JSON callers
use the named `executeTradebeeRequest` export, retaining runtime
validation and the original JSON error responses. Known validation inputs use
explicit types (strings, string/number arrays, PageCss, ImageUpload,
SeoMetadata, ProductAttribute and PageSection), with null/undefined where
the existing checks handle missing input. Runtime shape checks are retained.
`unknown` is reserved for raw JSON responses, exceptions, object guards and
page-specific layout entries whose schema is returned by the server.

Run `npm run typecheck` to check the TypeScript source.
All 51 existing action names stay unchanged. Their runtime input and output
contracts are defined in `tool.schema.json` and registered by the plugin entrypoint.
Requests time out after 30 seconds and are not automatically retried.
For an uncertain write outcome, read the current record before retrying.

## Authentication

The unified `tradebee` plugin and its underlying capability modules require a Tradebee API key.

Preferred plugin configuration path:

```text
plugins.entries.tradebee.config.apiKey
```

For environment-based deployments, `BEE_API_KEY` remains the fallback when the plugin configuration is omitted. Never provide API keys in tool inputs, prompts, examples, logs, or chat text. Tradebee requests send site and business data to the external Tradebee Website Builder API, so only send the minimum data needed for the user's stated task.

## HTML Fragment Rule Source

All images used inside generated HTML must first be uploaded with `file-upload`, then referenced with the matching URL from `data.success[]`. Each successful item also returns `fileState` with the exact fields `Suffix`, `Type`, `Guid`, `Width`, `Height`, and `ContentLength`. Use `url` for HTML/CSS; if a downstream schema requires file metadata, copy the matching `fileState` object exactly as returned and preserve its field casing. The plugin rejects embedded base64 image data URLs in HTML. This does not change structured `cover_image` or `upload_images` request fields, which continue to use their existing base64 object contracts, and it does not remove base64 compatibility from MNplatform APIs.

For any generated HTML fragment in:

- `navigation.content`
- `faq.answer`
- `news.description`
- `blog.description`
- `products.description`
- `productsgroup.section.top`
- `productsgroup.section.bottom`
- `custompage.content`

the caller should first call `rule-get` with the exact selected `language` and the exact matching `scene`.

`rule-get` call requirements:

- `language` is required
- `scene` is required
- reuse the exact `language` value already selected for the create or update action
- do not guess, translate, normalize, or replace the `language` value
- do not invent, shorten, translate, or rename any `scene` value
- use only the fixed scene mapping below. Do not call the current frontend website domain for this rule API.

Minimal request body:

```json
{
  "action": "rule-get",
  "language": "en",
  "scene": "products.description"
}
```

Required execution order:

1. Select the exact site `language` first.
2. Select the exact fixed `scene` that matches the target HTML field.
3. Call `rule-get`.
4. After `rule-get` succeeds, fetch required website link targets with `links-list` under the same exact language. Skip link lookup when the fragment needs no links.
5. Generate the HTML fragment using the returned scene rules and, when needed, the selected URLs from `links-list`.

### Link lookup for rule-based fragments

This applies to all eight scenes: `navigation.content`, `news.description`,
`blog.description`, `faq.answer`, `products.description`,
`productsgroup.section.top`, `productsgroup.section.bottom`, and `custompage.content`.

`rule-get` supplies scene, structure, style, and link-use constraints.
Retrieve actual existing website destinations with the unified `links-list`
action; do not depend on the legacy `link_resources` field returned by Rule
(the server property was named `LinkResources`). Its absence or an empty
list does not prevent a separate link lookup.

Reuse the exact language chosen for `rule-get`. Start with `type=main`
for main pages or category discovery; choose other types from
`data.group[].options[].value`. Reuse an already retrieved matching category
when available. Request only the categories needed for this content.

```json
{
  "action": "links-list",
  "language": "en",
  "type": "main",
  "pagination": { "current_page": 1, "page_size": 10 }
}
```

The example language must be replaced with the exact selected site language.
Copy the matching `data.list[].url` exactly. Every URL used from `links-list`
must be a relative path without a protocol, hostname, domain, or protocol-relative
`//host` prefix. Never prepend `data.host`, the current website domain, or any
other domain. If a returned URL unexpectedly contains a domain, do not use or
rewrite it; report the invalid link result instead. If more results are needed,
follow `data.pagination.has_next_page` and use the returned `next_page`;
stop when the destination is found or `has_next_page=false`.
If lookup fails or no matching destination exists, report it and do not
invent a path or silently substitute `#`. Link lookup does not replace
`rule-get` or relax its scene-specific rules.

Failure rule:

- If `rule-get` fails, do not continue by guessing colors, fonts, links, layout, or other fragment rules.
- Stop and report the rule-call failure instead of generating a fragment from assumptions.

Expected scene mapping:

- `navigation.content` -> `navigation.content`
- `faq.answer` -> `faq.answer`
- `news.description` -> `news.description`
- `blog.description` -> `blog.description`
- `products.description` -> `products.description`
- `productsgroup.section.top` -> `productsgroup.section.top`
- `productsgroup.section.bottom` -> `productsgroup.section.bottom`
- `custompage.content` -> `custompage.content`

The returned rule payload is the source of truth for all fragment-generation constraints.

The caller should:

- follow the full returned rule payload, not only part of it
- not guess, replace, shorten, rename, or partially ignore returned rule fields
- not hardcode assumptions here about future rule details, because the rule payload returned by `rule-get` may add new constraints later without requiring `tradebee` changes

## Typical Workflows

### Product Operations

1. Use `languages-get` to select the site language.
2. Use `productsgroup-create` only after explicit user confirmation of language and product group payload.
3. Use `productsgroup-update` only after explicit user confirmation of language and product group payload.
4. Use `productsgroup-delete` only after explicit user confirmation of language and product group IDs.
5. Use `productsgroup-read` to select a valid leaf product group when needed.
6. Use `products-create` to create a product.
7. Use `products-update` to update an existing product.
8. Use `products-delete` to move products to the recycle bin.

### Blog, Inquiry, and Visitor Operations

1. Use `languages-get` when a downstream action requires language selection.
2. Use `bloggroup-create` only after explicit user confirmation of language and blog group payload.
3. Use `bloggroup-read` to retrieve blog group data.
4. Use `blog-read` to retrieve blog data.
5. Use `blog-create` only after explicit user confirmation of language and blog payload.
6. Use `blog-delete` only after explicit user confirmation of language and blog IDs.
7. Use `bloggroup-delete` only after explicit user confirmation of language and blog group IDs.
8. Use `inquiry-read` to retrieve inquiry data.
9. Use `visitor-recent` to retrieve recent visitor data.

### Custom Page Operations

1. Use `languages-get` when a downstream action requires language selection.
2. Use `custompage-read` to retrieve one exact custom page or list custom pages.
3. Use `custompage-create` only after explicit user confirmation of language and custom page payload.
4. Use `custompage-update` only after explicit user confirmation of language, target custom page ID, payload, and backup behavior.
5. Use `custompage-delete` only after explicit user confirmation of language and custom page IDs.

### SEO and Ranking Operations

1. Use `keywords-rank` to retrieve keyword ranking records and history.

### Page Generation Operations

1. Use `languages-get` to select the exact site language.
2. Use `page-list` to select the exact page name.
3. Use `page-generation-definition` before constructing layouts.
4. When the page needs existing destinations, use `links-list` and copy the selected relative URLs exactly. They must not contain a protocol, hostname, or domain, and `data.host` must not be prepended.
5. Upload required images with `file-upload`, preview with `page-html`, and use `page-save` only after approval.

## Directory Layout

```text
tradebee/
  src/
    index.ts
    tradebee.ts
    action-types.ts
    request-types.ts
    types.ts
    validation.ts
    blog/
      create.ts
      delete.ts
      read.ts
      update.ts
    bloggroup/
    custompage/
    faq/
    faqgroup/
    file/
    inquiry/
    keywords/
    languages/
    links/
    navigation/
    news/
    newsgroup/
    page/
      generation-definition.ts
      html.ts
      list.ts
      save.ts
    products/
    productsgroup/
    rule/
    visitor/

  README.md
  LICENSE
  .clawhubignore
  .gitignore
  package-lock.json
  package.json
  openclaw.plugin.json
  tool.schema.json
  tsconfig.check.json
  tsconfig.json
```

## Publishing Guidance

The package file allowlist excludes generated `backups/` JSON files. Build,
validate, and create the manually uploadable ClawPack with:

```powershell
npm install
npm run build
npm run plugin:validate
clawhub package validate . --openclaw .\node_modules\openclaw
clawhub package pack . --pack-destination .\release
```

Upload the generated `.tgz` file from `release/` to the ClawHub package page.
If ClawHub CLI 0.23.3 reports `spawnSync npm ENOENT` on Windows, its pack
operation can be performed directly with the same npm packer:

```powershell
New-Item -ItemType Directory -Path .\release -Force
npm pack --pack-destination .\release
```

This directory is one publishable OpenClaw plugin: `tradebee`.

- User experience: one `tradebee_api` tool with multiple actions.
- Maintenance model: add action modules under their business domain, then expose them through the root `tradebee` router and schema.
- Recommended naming pattern:
  - plugin ID: `tradebee`
  - tool name: `tradebee_api`
  - action names: keep the existing hyphenated naming

## Notes

- `blog-create` is a high-impact publishing action and requires explicit user confirmation before execution.
- `blog-update` is a high-impact update action and requires explicit user confirmation before execution.
- `blog-delete` moves blogs to the recycle bin and requires explicit user confirmation before execution.
- `bloggroup-create` is a high-impact publishing action and requires explicit user confirmation before execution.
- `bloggroup-update` is a high-impact update action and requires explicit user confirmation before execution.
- `bloggroup-delete` is a destructive action and requires explicit user confirmation before execution.
- `custompage-create` is a high-impact publishing action and requires explicit user confirmation before execution.
- `custompage-update` is a high-impact update action and requires explicit user confirmation before execution.
- `custompage-delete` moves custom pages to the recycle bin and requires explicit user confirmation before execution.
- `productsgroup-create` is a high-impact publishing action and requires explicit user confirmation before execution.
- `productsgroup-update` is a high-impact update action and requires explicit user confirmation before execution.
- `productsgroup-delete` is a destructive action and requires explicit user confirmation before execution.
- `products-create` is a high-impact publishing action and requires explicit user confirmation before execution.
- `products-update` is a high-impact update action and requires explicit user confirmation before execution.
- `products-delete` moves products to the recycle bin instead of permanently deleting them and requires explicit user confirmation before execution.
- `products-update` and `products-create` share similar request structures, but `update` requires `products_id`.
- `rule-get` is the required source of truth before generating any supported HTML fragment and should not be skipped or replaced with assumptions.
- `languages-get` should be used first when a downstream action depends on the exact site language.
- `links-list` should be used whenever a rule-get HTML fragment or generated page content needs an existing Tradebee destination. Use only relative `data.list[].url` values without a protocol, hostname, domain, or `//host` prefix; never prepend `data.host` or invent a link.
- When adding a new capability later, update the root action enum, root routing logic, and root documentation in the same change.

