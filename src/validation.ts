import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ImageUpload, PageCss, PageLayouts, PageSection, PlainObject, ProductAttribute, SeoMetadata } from "./types.js";
import type { RequestArguments as TradebeeArguments } from "./request-types.js";

type ValidationMessage = string | null;

interface RequiredOption {
    required?: boolean;
}

interface StringValidationOptions extends RequiredOption {
    min?: number;
    max?: number;
}

interface SeoValidationOptions {
    mode?: "create" | "update";
    actionLabel?: string | null;
    descriptionFieldName?: keyof SeoMetadata;
    descriptionMax?: number;
}

interface TagValidationOptions extends RequiredOption {
    minItems?: number;
    maxItems?: number;
    minTagLength?: number;
    maxTagLength?: number;
    unique?: boolean;
}

interface HtmlValidationOptions extends RequiredOption {
    actionLabel?: string;
    maxImageCount?: number;
    maxLength?: number;
    allowH1?: boolean;
    validateImageSources?: boolean;
}

interface SectionValidationOptions {
    mode?: "create" | "update";
    actionLabel?: string | null;
    maxImageCount?: number;
}

interface RecordIdentity {
    idField?: string;
    id?: number | string;
}

interface SaveBackupOptions {
    action?: string;
    language?: string;
    entityId?: string | number;
    rawReadResponse?: unknown;
    snapshot?: PlainObject;
    requestedPayload?: object;
    restoreAction?: string;
    restorePayload?: object;
    restoreLimitations?: string[];
    confirmationSummary?: string;
}

export function isPlainObject<T>(value: T): value is T & PlainObject {
    return !!value && typeof value === "object" && !Array.isArray(value);
}

export function cloneJson<T>(value: T): T {
    if (value == null) {
        return value;
    }

    return JSON.parse(JSON.stringify(value)) as T;
}

export function getApiKeyOrError(args: TradebeeArguments = {}) {
    const configuredApiKey = typeof args.configuredApiKey === "string"
        ? args.configuredApiKey.trim()
        : "";
    let envApiKey = "";
    try {
        envApiKey = (process.env.BEE_API_KEY || "").trim();
    } catch {
        envApiKey = "";
    }

    const API_KEY = configuredApiKey || envApiKey;

    if (!API_KEY) {
        return {
            error: {
                status: false,
                msg: "Missing API_KEY. Configure plugins.entries.tradebee.config.apiKey or BEE_API_KEY before use."
            }
        };
    }

    return { apiKey: API_KEY };
}

export function hasOwn(object: unknown, key: PropertyKey): boolean {
    return isPlainObject(object) && Object.prototype.hasOwnProperty.call(object, key);
}

export function validateLanguage(language: string | null | undefined, { required = true }: RequiredOption = {}): ValidationMessage {
    if (language == null || language === "") {
        return required
            ? "Missing required parameter: language."
            : null;
    }

    if (typeof language !== "string" || !/^[a-z]{2}$/.test(language.trim())) {
        return "Invalid parameter: language. Use an exact enabled site language code returned by languages-get, for example en. Do not guess or translate the language value.";
    }

    return null;
}

export function validatePageName(pageName: string | null | undefined): ValidationMessage {
    if (typeof pageName !== "string" || !pageName.trim()) {
        return "Missing required parameter: pageName. Select one exact pageName returned by page-list.";
    }

    if (pageName !== pageName.trim()) {
        return "Invalid parameter: pageName. Copy the exact pageName returned by page-list without leading or trailing whitespace.";
    }

    return null;
}

export function validatePageLayouts(layouts: PageLayouts | null | undefined, { required = false }: RequiredOption = {}): ValidationMessage {
    if (layouts == null) {
        return required ? "Missing required parameter: layouts." : null;
    }

    if (!Array.isArray(layouts)) {
        return "Invalid parameter: layouts. It must be an array that follows the outputSchema returned by page-generation-definition for the same pageName.";
    }

    return null;
}

export function validatePageCss(css: PageCss | null | undefined): ValidationMessage {
    if (css == null) {
        return null;
    }

    if (!isPlainObject(css)) {
        return "Invalid parameter: css. It must be an object whose keys are 0 or numeric module IDs and whose values are CSS strings.";
    }

    for (const [key, value] of Object.entries(css)) {
        if (!/^\d+$/.test(key) || Number(key) < 0 || typeof value !== "string") {
            return "Invalid parameter: css. Every key must be 0 or a numeric module ID, and every value must be a CSS string.";
        }
        if (/data\s*:\s*image\//i.test(value)) {
            return "Invalid parameter: css. Embedded base64 image data URLs are not supported by the Tradebee plugin. Upload the image with file-upload and use the returned data.success[].url in CSS.";
        }
    }

    return null;
}

export function validateFileUploads(uploads: Partial<ImageUpload>[] | null | undefined): ValidationMessage {
    if (!Array.isArray(uploads) || uploads.length < 1 || uploads.length > 50) {
        return "Invalid parameter: uploads. Provide 1 to 50 JPG, PNG, or GIF images.";
    }

    for (const upload of uploads) {
        if (!isPlainObject(upload)
            || typeof upload.name !== "string"
            || !upload.name.trim()
            || upload.name.length > 100
            || !/\.(jpg|png|gif)$/i.test(upload.name)
            || typeof upload.base64 !== "string"
            || !upload.base64.trim()) {
            return "Invalid parameter: uploads. Each item must contain a name of 1 to 100 characters ending in .jpg, .png, or .gif and non-empty base64 image data.";
        }
    }

    return null;
}

export function validateRuleScene(scene: string | null | undefined, { required = true }: RequiredOption = {}): ValidationMessage {
    if (scene == null || scene === "") {
        return required
            ? "Missing required parameter: scene."
            : null;
    }

    if (typeof scene !== "string") {
        return "Invalid parameter: scene. Use one exact supported scene value.";
    }

    const normalizedScene = scene.trim();
    const allowedScenes = new Set([
        "navigation.content",
        "news.description",
        "blog.description",
        "faq.answer",
        "products.description",
        "productsgroup.section.top",
        "productsgroup.section.bottom",
        "custompage.content"
    ]);

    if (!allowedScenes.has(normalizedScene)) {
        return "Invalid parameter: scene. Supported values: navigation.content, news.description, blog.description, faq.answer, products.description, productsgroup.section.top, productsgroup.section.bottom, custompage.content.";
    }

    return null;
}

export function validatePagination(args: TradebeeArguments = {}) {
    const currentPageRaw = args.pagination?.current_page ?? args.current_page ?? 1;
    const pageSizeRaw = args.pagination?.page_size ?? args.page_size ?? 5;

    const current_page = Number(currentPageRaw);
    if (!Number.isInteger(current_page) || current_page < 1) {
        return {
            error: "Invalid parameter: pagination.current_page. It must be an integer greater than or equal to 1."
        };
    }

    const page_size = Number(pageSizeRaw);
    if (!Number.isInteger(page_size) || page_size < 1 || page_size > 10) {
        return {
            error: "Invalid parameter: pagination.page_size. It must be an integer between 1 and 10."
        };
    }

    return { current_page, page_size };
}

export function validateFields(fields: string[] | null | undefined, allowedFields: string[]): ValidationMessage {
    if (fields == null) {
        return null;
    }

    if (!Array.isArray(fields)) {
        return "Invalid parameter: fields. It must be an array of field names supported by this API.";
    }

    if (fields.some((field) => typeof field !== "string" || !allowedFields.includes(field))) {
        return `Invalid parameter: fields. Supported values: ${allowedFields.join(", ")}.`;
    }

    return null;
}

export function validateIdList(idList: number[] | null | undefined): ValidationMessage {
    if (!Array.isArray(idList)) {
        return "Missing required parameter: id_list.";
    }

    if (idList.length < 1 || idList.length > 100) {
        return "Invalid parameter: id_list. It must contain 1 to 100 items.";
    }

    if (idList.some((id) => !Number.isInteger(Number(id)) || Number(id) <= 0)) {
        return "Invalid parameter: id_list. Every item must be a positive integer.";
    }

    return null;
}

export function validateString(value: string | null | undefined, path: string, { required = false, min = 0, max = Number.MAX_SAFE_INTEGER }: StringValidationOptions = {}): ValidationMessage {
    if (value == null || value === "") {
        return required ? `Missing required parameter: ${path}.` : null;
    }

    if (typeof value !== "string") {
        return `Invalid parameter: ${path}.`;
    }

    const length = value.trim().length;
    if (required && length < min) {
        return `Missing required parameter: ${path}.`;
    }

    if ((!required && value.length > 0 && value.length < min) || value.length > max) {
        return `Invalid parameter: ${path}.`;
    }

    return null;
}

export function validateSeo(
    seo: SeoMetadata | null | undefined,
    prefix: string,
    {
        mode = "create",
        actionLabel = null,
        descriptionFieldName = "description",
        descriptionMax = 200
    }: SeoValidationOptions = {}
): ValidationMessage {
    if (seo == null) {
        return null;
    }

    if (!isPlainObject(seo)) {
        return `Invalid parameter: ${prefix}.seo.`;
    }

    const suffix = mode === "update"
        ? ` for ${actionLabel || "update"}`
        : "";

    if (hasOwn(seo, "title")) {
        if (typeof seo.title !== "string" || (seo.title.length > 0 && seo.title.length > 90)) {
            return `Invalid parameter: ${prefix}.seo.title. If provided${suffix}, it must contain 1 to 90 characters${mode === "update" ? ". Omit this field to keep the current SEO title unchanged." : "."}`;
        }
    }

    if (hasOwn(seo, descriptionFieldName)) {
        const description = seo[descriptionFieldName];
        if (typeof description !== "string" || (description.length > 0 && description.length > descriptionMax)) {
            return `Invalid parameter: ${prefix}.seo.${descriptionFieldName}. If provided${suffix}, it must contain 1 to ${descriptionMax} characters${mode === "update" ? `. Omit this field to keep the current SEO ${descriptionFieldName} unchanged.` : "."}`;
        }
    }

    if (hasOwn(seo, "keywords")) {
        if (typeof seo.keywords !== "string" || (seo.keywords.length > 0 && seo.keywords.length > 120)) {
            return `Invalid parameter: ${prefix}.seo.keywords. If provided${suffix}, send one comma-separated string with total length 1 to 120 characters${mode === "update" ? ". Omit this field to keep the current SEO keywords unchanged." : "."}`;
        }
    }

    return null;
}

export function validateTags(tags: string[] | null | undefined, path: string, { required = false, minItems = 0, maxItems = 6, minTagLength = 1, maxTagLength = 50, unique = false }: TagValidationOptions = {}): ValidationMessage {
    if (tags == null) {
        return required ? `Missing required parameter: ${path}.` : null;
    }

    if (!Array.isArray(tags)) {
        return `Invalid parameter: ${path}.`;
    }

    if (tags.length < minItems || tags.length > maxItems) {
        return `Invalid parameter: ${path}.`;
    }

    const normalized: string[] = [];
    for (const tag of tags) {
        if (typeof tag !== "string" || tag.length < minTagLength || tag.length > maxTagLength) {
            return `Invalid parameter: ${path}.`;
        }
        normalized.push(tag.toLowerCase());
    }

    if (unique && new Set(normalized).size !== normalized.length) {
        return `Invalid parameter: ${path}.`;
    }

    return null;
}

export function validateImages(images: Partial<ImageUpload>[] | null | undefined, { required = false }: RequiredOption = {}): ValidationMessage {
    if (images == null) {
        return required ? "Invalid parameter: products.upload_images. For products-create, provide 1 to 5 images. The first image is the main image. Each image must be valid base64 with a supported format and must be 500 kB or smaller." : null;
    }

    if (!Array.isArray(images) || images.length < (required ? 1 : 0) || images.length > 5) {
        return required
            ? "Invalid parameter: products.upload_images. For products-create, provide 1 to 5 images. The first image is the main image. Each image must be valid base64 with a supported format and must be 500 kB or smaller."
            : "Invalid parameter: products.upload_images. If provided, supply 0 to 5 images. Each image must be a {name, base64} object.";
    }

    for (const image of images) {
        if (!isPlainObject(image) || typeof image.name !== "string" || !image.name.trim() || typeof image.base64 !== "string" || !image.base64.trim()) {
            return required
                ? "Invalid parameter: products.upload_images. For products-create, provide 1 to 5 images. The first image is the main image. Each image must be valid base64 with a supported format and must be 500 kB or smaller."
                : "Invalid parameter: products.upload_images. If provided, supply 0 to 5 images. Each image must be a {name, base64} object.";
        }
    }

    return null;
}

export function validateAttributes(attributes: Partial<ProductAttribute>[] | null | undefined): ValidationMessage {
    if (attributes == null) {
        return null;
    }

    if (!Array.isArray(attributes) || attributes.length > 15) {
        return "Invalid parameter: products.attributes. If provided, supply 0 to 15 attribute objects.";
    }

    for (const attribute of attributes) {
        if (!isPlainObject(attribute)
            || typeof attribute.name !== "string"
            || attribute.name.length < 1
            || attribute.name.length > 100
            || typeof attribute.value !== "string"
            || attribute.value.length < 1
            || attribute.value.length > 100) {
            return "Invalid parameter: products.attributes. Each item must include name and value strings with 1 to 100 characters.";
        }
    }

    return null;
}

export function getHtmlLengthWithoutImages(html: string | null | undefined): number {
    if (typeof html !== "string" || html === "") {
        return 0;
    }

    return html.replace(/<img\b[^>]*>/gi, "").length;
}

export function getHtmlImageCount(html: string | null | undefined): number {
    if (typeof html !== "string" || html === "") {
        return 0;
    }

    const matches = html.match(/<img\b[^>]*>/gi);
    return matches ? matches.length : 0;
}

function getHtmlImageSources(html: string): string[] {
    const imageTags = html.match(/<img\b[^>]*>/gi) || [];
    return imageTags.map((tag) => {
        const sourceMatch = tag.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i);
        return sourceMatch ? (sourceMatch[1] ?? sourceMatch[2] ?? sourceMatch[3] ?? "").trim() : "";
    });
}

function hasExternalStylesheetLink(html: string): boolean {
    const linkTags = html.match(/<link\b[^>]*>/gi) || [];
    return linkTags.some((tag) => /\brel\s*=\s*(?:"[^"]*\bstylesheet\b[^"]*"|'[^']*\bstylesheet\b[^']*'|stylesheet\b)/i.test(tag));
}

function hasInlineStyleAttributes(html: string): boolean {
    const tags = html.match(/<\s*[a-z][^>]*>/gi) || [];
    return tags.some((tag) => !/^<\s*style\b/i.test(tag) && /\sstyle\s*=/i.test(tag));
}

function validateGeneratedHtmlStyles(html: string, path: string): ValidationMessage {
    if (hasInlineStyleAttributes(html)) {
        return `Invalid parameter: ${path}. The HTML fragment may use an embedded <style> tag, but inline style attributes are not allowed.`;
    }
    if (hasExternalStylesheetLink(html)) {
        return `Invalid parameter: ${path}. The HTML fragment may use an embedded <style> tag, but external stylesheet links are not allowed.`;
    }
    return null;
}

function validateHtmlImageSources(html: string, path: string): ValidationMessage {
    if (/data\s*:\s*image\//i.test(html)) {
        return `Invalid parameter: ${path}. Embedded base64 image data URLs are not supported by the Tradebee plugin. Upload the image with file-upload and use the returned data.success[].url in the HTML or embedded CSS.`;
    }

    for (const source of getHtmlImageSources(html)) {
        try {
            const url = new URL(source);
            if (url.protocol === "http:" || url.protocol === "https:") continue;
        } catch (error) {
        }

        return `Invalid parameter: ${path}. Each <img src> must be an http:// or https:// URL returned by file-upload or another existing hosted image URL.`;
    }

    return null;
}

export function validateHtml(html: string | null | undefined, path: string, {
    required = false,
    actionLabel = "update",
    maxImageCount = 20,
    maxLength = 100000,
    allowH1 = false,
    validateImageSources = false
}: HtmlValidationOptions = {}): ValidationMessage {
    if (html == null || html === "") {
        return required ? `Missing required parameter: ${path}.` : null;
    }

    if (typeof html !== "string") {
        return `Invalid parameter: ${path}.`;
    }

    const styleError = validateGeneratedHtmlStyles(html, path);
    if (styleError) return styleError;

    if (!allowH1 && /<\s*\/?\s*h1\b/i.test(html)) {
        return `Invalid parameter: ${path}. ${path} must not contain <h1> tags${required ? "" : ` for ${actionLabel}`}. Use <h2> to <h6> or normal block elements instead.`;
    }

    if (getHtmlLengthWithoutImages(html) > maxLength) {
        return `Invalid parameter: ${path}. ${path} must contain 1 to ${maxLength} HTML characters after removing <img> tags${required ? "" : ` for ${actionLabel}`}.`;
    }

    if (getHtmlImageCount(html) > maxImageCount) {
        return `Invalid parameter: ${path}. At most ${maxImageCount} <img> tags are allowed${required ? "" : ` for ${actionLabel}`}.`;
    }

    if (validateImageSources) {
        const imageSourceError = validateHtmlImageSources(html, path);
        if (imageSourceError) return imageSourceError;
    }

    return null;
}

export function validateHtmlWithoutH1(html: string | null | undefined, path: string, options: HtmlValidationOptions = {}): ValidationMessage {
    return validateHtml(html, path, options);
}

export function validateSection(section: PageSection | null | undefined, path: string, { mode = "create", actionLabel = null, maxImageCount = 20 }: SectionValidationOptions = {}): ValidationMessage {
    if (section == null) {
        return null;
    }

    if (!isPlainObject(section)) {
        return `Invalid parameter: ${path}.`;
    }

    const suffix = mode === "update"
        ? ` for ${actionLabel || "update"}`
        : "";

    if (hasOwn(section, "top")) {
        if (typeof section.top !== "string" || getHtmlLengthWithoutImages(section.top) > 100000) {
            return `Invalid parameter: ${path}.top. If provided${suffix}, it must contain 0 to 100,000 HTML characters after removing <img> tags and must follow the current rule-get fragment structure${mode === "update" ? ". Omit this field to keep the current section top unchanged." : "."}`;
        }
        if (getHtmlImageCount(section.top) > maxImageCount) {
            return `Invalid parameter: ${path}.top. If provided${suffix}, at most ${maxImageCount} <img> tags are allowed${mode === "update" ? ". Omit this field to keep the current section top unchanged." : "."}`;
        }
        if (/<\s*\/?\s*h1\b/i.test(section.top)) {
            return `Invalid parameter: ${path}.top. If provided${suffix}, it must not contain <h1> tags. Use <h2> to <h6> or normal block elements instead${mode === "update" ? ". Omit this field or pass an empty string to keep the current section top unchanged." : "."}`;
        }
        const topStyleError = validateGeneratedHtmlStyles(section.top, `${path}.top`);
        if (topStyleError) return topStyleError;
        const topImageSourceError = validateHtmlImageSources(section.top, `${path}.top`);
        if (topImageSourceError) return topImageSourceError;
    }

    if (hasOwn(section, "bottom")) {
        if (typeof section.bottom !== "string" || getHtmlLengthWithoutImages(section.bottom) > 100000) {
            return `Invalid parameter: ${path}.bottom. If provided${suffix}, it must contain 0 to 100,000 HTML characters after removing <img> tags and must follow the current rule-get fragment structure${mode === "update" ? ". Omit this field to keep the current section bottom unchanged." : "."}`;
        }
        if (getHtmlImageCount(section.bottom) > maxImageCount) {
            return `Invalid parameter: ${path}.bottom. If provided${suffix}, at most ${maxImageCount} <img> tags are allowed${mode === "update" ? ". Omit this field to keep the current section bottom unchanged." : "."}`;
        }
        if (/<\s*\/?\s*h1\b/i.test(section.bottom)) {
            return `Invalid parameter: ${path}.bottom. If provided${suffix}, it must not contain <h1> tags. Use <h2> to <h6> or normal block elements instead${mode === "update" ? ". Omit this field or pass an empty string to keep the current section bottom unchanged." : "."}`;
        }
        const bottomStyleError = validateGeneratedHtmlStyles(section.bottom, `${path}.bottom`);
        if (bottomStyleError) return bottomStyleError;
        const bottomImageSourceError = validateHtmlImageSources(section.bottom, `${path}.bottom`);
        if (bottomImageSourceError) return bottomImageSourceError;
    }

    return null;
}

class TradebeeRequestError extends Error { }

export function requestFailure(error: unknown) {
    if (error instanceof TradebeeRequestError) return { status: false, msg: error.message };
    if (isPlainObject(error) && typeof error.code === "string" && ["EACCES", "EPERM", "ENOSPC", "EROFS"].includes(error.code)) {
        return { status: false, msg: "Local backup storage failed. Check write permissions and disk space; the update was not sent." };
    }
    return { status: false, msg: "Request failed." };
}

export async function requestTradebeeJson(url: string, options: RequestInit, timeoutMs = 30000): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        if (!response.ok) {
            throw new TradebeeRequestError(`HTTP ${response.status}. Check authentication, permissions or service availability. Verify the current record before retrying a write.`);
        }
        try {
            return await response.json() as unknown;
        } catch (error) {
            if (controller.signal.aborted) throw error;
            throw new TradebeeRequestError("Invalid API JSON response. Verify the current record before retrying a write.");
        }
    } catch (error) {
        if (controller.signal.aborted) {
            throw new TradebeeRequestError("Request timed out. The server outcome is unknown; verify the current record before retrying a write.");
        }
        if (error instanceof TradebeeRequestError) throw error;
        throw new TradebeeRequestError("Network request failed. The server outcome is unknown; verify the current record before retrying a write.");
    } finally {
        clearTimeout(timer);
    }
}

export async function callTradebeeApi(url: string, apiKey: string, body: object): Promise<unknown> {
    const response = await requestTradebeeJson(
        url,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }
    );

    return response;
}

export function appendPreviewNotice(result: unknown, message = "Preview the returned url in a browser."): unknown {
    if (!isPlainObject(result)) {
        return result;
    }

    if (result.status !== true || !isPlainObject(result.data) || typeof result.data.url !== "string" || !result.data.url.trim()) {
        return result;
    }

    const next = { ...result };
    const baseMessage = typeof next.msg === "string" && next.msg.trim()
        ? next.msg.trim()
        : "Request succeeded.";

    if (!baseMessage.includes(message)) {
        next.msg = `${baseMessage} ${message}`;
    }

    return next;
}

export function extractFirstRecord(response: unknown, preferredKeys: string[] = [], identity: RecordIdentity = {}): PlainObject | null {
    const candidates: PlainObject[] = [];

    const collect = (value: unknown): void => {
        if (Array.isArray(value)) {
            for (const item of value) {
                if (isPlainObject(item)) {
                    candidates.push(item);
                }
            }
            return;
        }

        if (isPlainObject(value)) {
            candidates.push(value);
        }
    };

    if (!isPlainObject(response) || response.status !== true) return null;

    if (isPlainObject(response?.data)) {
        for (const key of preferredKeys) {
            collect(response.data[key]);
        }

        for (const [key, value] of Object.entries(response.data)) {
            if (preferredKeys.includes(key)) {
                continue;
            }
            collect(value);
        }
    }

    collect(response.list);
    collect(response.result);
    collect(response.data);
    const records = candidates.filter((item) => !hasOwn(item, "pagination")
        && ![...preferredKeys, "list", "items", "rows"].some((key) => Array.isArray(item[key]) || isPlainObject(item[key])));
    if (identity.idField) {
        const idField = identity.idField;
        const expected = Number(identity.id);
        if (!Number.isInteger(expected) || expected <= 0) return null;
        return records.find((record) => Number(record[idField]) === expected) || null;
    }
    return records.find((record) => Object.keys(record).length > 0) || null;
}

export function withDefinedProperties(source: PlainObject, allowedKeys: string[]): PlainObject {
    const target: PlainObject = {};
    for (const key of allowedKeys) {
        if (source[key] !== undefined) {
            target[key] = cloneJson(source[key]);
        }
    }
    return target;
}

export function firstPositiveInteger(...values: unknown[]): number | undefined {
    for (const value of values) {
        const numericValue = Number(value);
        if (Number.isInteger(numericValue) && numericValue > 0) {
            return numericValue;
        }
    }

    return undefined;
}

const runtimeRootDir = path.dirname(fileURLToPath(import.meta.url));
const runtimeDirectoryName = path.basename(runtimeRootDir).toLowerCase();
const packageRootDir = runtimeDirectoryName === "dist" || runtimeDirectoryName === "src"
    ? path.dirname(runtimeRootDir)
    : runtimeRootDir;
const backupRootDir = path.join(packageRootDir, "backups");

function sanitizeFileNamePart(value: string | number | null | undefined, fallback = "unknown"): string {
    const text = String(value ?? "").trim();
    if (!text) {
        return fallback;
    }

    return text.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || fallback;
}

export async function saveBackupToFile({
    action,
    language,
    entityId,
    rawReadResponse,
    snapshot,
    requestedPayload,
    restoreAction,
    restorePayload,
    restoreLimitations = [],
    confirmationSummary = ""
}: SaveBackupOptions = {}) {
    const timestamp = new Date().toISOString();
    const timestampForFile = timestamp.replace(/[:.]/g, "-");
    const backupId = randomUUID();
    const actionPart = sanitizeFileNamePart(action, "action");
    const languagePart = sanitizeFileNamePart(language, "lang");
    const entityPart = sanitizeFileNamePart(entityId, "entity");
    const fileName = `${timestampForFile}_${actionPart}_${languagePart}_${entityPart}_${backupId}.json`;
    const directoryPath = path.join(backupRootDir, actionPart);
    const filePath = path.join(directoryPath, fileName);

    const backupDocument = {
        backup_id: backupId,
        saved_at: timestamp,
        action,
        language,
        entity_id: entityId,
        confirmation_summary: confirmationSummary,
        raw_read_response: cloneJson(rawReadResponse),
        snapshot: cloneJson(snapshot),
        requested_update_payload: cloneJson(requestedPayload),
        restore_action: restoreAction,
        restore_payload: cloneJson(restorePayload),
        restore_limitations: cloneJson(restoreLimitations)
    };

    await mkdir(directoryPath, { recursive: true });
    await writeFile(filePath, `${JSON.stringify(backupDocument, null, 2)}\n`, "utf8");

    return {
        backup_id: backupId,
        saved_at: timestamp,
        directory_path: directoryPath,
        file_path: filePath,
        file_name: fileName
    };
}
