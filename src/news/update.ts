import type { ActionArguments } from "../action-types.js";
import { requestFailure,
    appendPreviewNotice,
    callTradebeeApi,
    extractFirstRecord,
    firstPositiveInteger,
    getApiKeyOrError,
    hasOwn,
    isPlainObject,
    saveBackupToFile,
    validateHtml,
    validateImages,
    validateLanguage,
    validateSeo,
    validateTags,
    withDefinedProperties
} from "../validation.js";

const NEWS_BACKUP_FIELDS = [
    "news_id",
    "language",
    "group",
    "publisher",
    "publication_date",
    "source",
    "title",
    "images",
    "tags",
    "summary",
    "description",
    "seo",
    "update_time"
];

function buildRestorePayload(snapshot: Record<string, unknown> = {}) {
    const values = {
        news_id: firstPositiveInteger(snapshot.news_id),
        newsgroup_id: firstPositiveInteger(
            snapshot.newsgroup_id,
            (snapshot.group as Record<string, unknown> | null | undefined)?.newsgroup_id,
            (snapshot.group as Record<string, unknown> | null | undefined)?.id
        ),
        publisher: snapshot.publisher,
        publication_date: snapshot.publication_date,
        source: snapshot.source,
        title: snapshot.title,
        tags: snapshot.tags,
        summary: snapshot.summary,
        description: snapshot.description,
        seo: snapshot.seo
    };

    return withDefinedProperties(values, [
        "news_id",
        "newsgroup_id",
        "publisher",
        "publication_date",
        "source",
        "title",
        "tags",
        "summary",
        "description",
        "seo"
    ]);
}

function validateNews(news: NonNullable<ActionArguments<"news-update">["news"]>): string | null {
    const newsId = Number(news.news_id ?? 0);
    if (!Number.isInteger(newsId) || newsId <= 0) {
        return "Invalid parameter: news.news_id. Select one positive ID from news-read under the same language.";
    }

    if (hasOwn(news, "newsgroup_id")) {
        const newsGroupId = Number(news.newsgroup_id);
        if (!Number.isInteger(newsGroupId) || newsGroupId <= 0) {
            return "Invalid parameter: news.newsgroup_id. Omit it or select one positive ID from newsgroup-read under the same language.";
        }
    }

    if (hasOwn(news, "publisher")
        && (typeof news.publisher !== "string" || news.publisher.length > 100)) {
        return "Invalid parameter: news.publisher. If provided, it must contain at most 100 characters.";
    }

    if (hasOwn(news, "publication_date")) {
        const hasValidPublicationDate = typeof news.publication_date === "string"
            && news.publication_date.trim().length > 0
            && !Number.isNaN(Date.parse(news.publication_date));
        if (!hasValidPublicationDate) {
            return "Invalid parameter: news.publication_date. If provided, it must be a valid date.";
        }
    }

    if (hasOwn(news, "source")
        && (typeof news.source !== "string" || news.source.length > 100)) {
        return "Invalid parameter: news.source. If provided, it must contain at most 100 characters.";
    }

    if (hasOwn(news, "title")) {
        const hasValidTitle = typeof news.title === "string"
            && news.title.length >= 2
            && news.title.length <= 500;
        if (!hasValidTitle) {
            return "Invalid parameter: news.title. If provided, it must contain 2 to 500 characters.";
        }
    }

    if (hasOwn(news, "cover_image")) {
        const images = news.cover_image == null ? [] : [news.cover_image];
        if (validateImages(images)) {
            return "Invalid parameter: news.cover_image. If provided, it must be one {name, base64} image not larger than 500 kB.";
        }
    }

    if (hasOwn(news, "tags")) {
        const tagsError = validateTags(news.tags, "news.tags", {
            minItems: 1,
            maxItems: 6,
            minTagLength: 3,
            maxTagLength: 50
        });
        if (tagsError) {
            return "Invalid parameter: news.tags. If provided, supply 1 to 6 tags, each containing 3 to 50 characters.";
        }
    }

    if (hasOwn(news, "summary")) {
        const hasValidSummary = typeof news.summary === "string"
            && news.summary.length >= 10
            && news.summary.length <= 500;
        if (!hasValidSummary) {
            return "Invalid parameter: news.summary. If provided, it must contain 10 to 500 characters.";
        }
    }

    if (hasOwn(news, "description")) {
        const htmlError = validateHtml(news.description, "news.description", {
            actionLabel: "news-update",
            maxImageCount: 50,
            maxLength: 100000,
            validateImageSources: true
        });
        if (htmlError) return htmlError;
    }

    if (hasOwn(news, "seo")) {
        const seoError = validateSeo(news.seo, "news", {
            mode: "update",
            actionLabel: "news-update"
        });
        if (seoError) return seoError;
    }

    return null;
}

export default async function NewsUpdate(args: ActionArguments<"news-update"> = {}) {
    if (!isPlainObject(args)) {
        return {
            status: false,
            msg: "Invalid parameter: request.body. It must be a valid JSON object."
        };
    }

    const { apiKey: API_KEY, error: apiKeyError } = getApiKeyOrError(args);
    if (apiKeyError) return apiKeyError;

    const confirmation = args.confirmation;
    const hasConfirmation = isPlainObject(confirmation)
        && confirmation.approved === true
        && typeof confirmation.summary === "string"
        && confirmation.summary.trim().length > 0;
    if (!hasConfirmation) {
        return {
            status: false,
            msg: "Explicit user confirmation is required before updating news. Show the language, target news ID, exact payload, and backup behavior first."
        };
    }

    const languageError = validateLanguage(args.language);
    if (languageError) {
        return { status: false, msg: languageError };
    }

    const news = args.news;
    if (!isPlainObject(news)) {
        return { status: false, msg: "Missing required parameter: news." };
    }

    const newsError = validateNews(news);
    if (newsError) {
        return { status: false, msg: newsError };
    }

    const newsId = Number(news.news_id);
    const body = {
        language: args.language,
        news
    };

    try {
        const backupResponse = await callTradebeeApi(
            "https://platform.tradew.com/openapis/news/read",
            API_KEY,
            {
                language: args.language,
                news_id: newsId,
                newsgroup_id: 0,
                fields: NEWS_BACKUP_FIELDS,
                pagination: { current_page: 1, page_size: 10 }
            }
        );
        const snapshot = extractFirstRecord(
            backupResponse,
            ["news", "list", "items", "rows"]
        , { idField: "news_id", id: newsId });
        if (!isPlainObject(backupResponse) || !backupResponse.status || !snapshot) {
            return {
                status: false,
                msg: "Backup capture failed before news-update. Read the current news record first, then retry."
            };
        }

        const restorePayload = {
            language: args.language,
            news: buildRestorePayload(snapshot)
        };
        const restoreLimitations = [
            "cover_image cannot be auto-restored because news-read does not return original image base64 data."
        ];
        const backupFile = await saveBackupToFile({
            action: "news-update",
            language: args.language,
            entityId: newsId,
            rawReadResponse: backupResponse,
            snapshot,
            requestedPayload: body,
            restoreAction: "news-update",
            restorePayload,
            restoreLimitations,
            confirmationSummary: confirmation.summary
        });
        const result = await callTradebeeApi(
            "https://platform.tradew.com/openapis/news/update",
            API_KEY,
            body
        );

        if (!isPlainObject(result)) return result;

        return appendPreviewNotice({
            ...result,
            backup: {
                captured: true,
                action: "news-update",
                language: args.language,
                entity_id: newsId,
                storage: { type: "file", ...backupFile },
                snapshot_source: "read_api_response",
                raw_read_response: backupResponse,
                snapshot,
                restore_action: "news-update",
                restore_payload: restorePayload,
                restore_limitations: restoreLimitations
            }
        });
    } catch (error) {
        return requestFailure(error);
    }
}
