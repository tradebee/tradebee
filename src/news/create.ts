import type { ActionArguments } from "../action-types.js";
import { requestFailure, requestTradebeeJson,
    appendPreviewNotice,
    getApiKeyOrError,
    hasOwn,
    isPlainObject,
    validateHtml,
    validateImages,
    validateLanguage,
    validateSeo,
    validateTags
} from "../validation.js";

export default async function NewsCreate(args: ActionArguments<"news-create"> = {}) {
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
            msg: "Explicit user confirmation is required before creating news. Show the language and exact news payload first, then provide confirmation.approved=true and confirmation.summary."
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

    const newsGroupId = Number(news.newsgroup_id ?? 0);
    if (!Number.isInteger(newsGroupId) || newsGroupId <= 0) {
        return {
            status: false,
            msg: "Invalid parameter: news.newsgroup_id. Select one positive ID from newsgroup-read under the same language."
        };
    }

    if (hasOwn(news, "publisher")
        && (typeof news.publisher !== "string" || news.publisher.length > 100)) {
        return {
            status: false,
            msg: "Invalid parameter: news.publisher. If provided, it must contain at most 100 characters."
        };
    }

    const hasValidPublicationDate = typeof news.publication_date === "string"
        && news.publication_date.trim().length > 0
        && !Number.isNaN(Date.parse(news.publication_date));
    if (!hasValidPublicationDate) {
        return {
            status: false,
            msg: "Invalid parameter: news.publication_date. This field is required and must be a valid date, for example 2026/8/21."
        };
    }

    if (hasOwn(news, "source")
        && (typeof news.source !== "string" || news.source.length > 100)) {
        return {
            status: false,
            msg: "Invalid parameter: news.source. If provided, it must contain at most 100 characters."
        };
    }

    const hasValidTitle = typeof news.title === "string"
        && news.title.length >= 2
        && news.title.length <= 500;
    if (!hasValidTitle) {
        return {
            status: false,
            msg: "Invalid parameter: news.title. This field is required and must contain 2 to 500 characters."
        };
    }

    if (hasOwn(news, "cover_image")) {
        const images = news.cover_image == null ? [] : [news.cover_image];
        const imageError = validateImages(images);
        if (imageError) {
            return {
                status: false,
                msg: "Invalid parameter: news.cover_image. If provided, it must be one {name, base64} image not larger than 500 kB."
            };
        }
    }

    const tagsError = validateTags(news.tags, "news.tags", {
        required: true,
        minItems: 1,
        maxItems: 6,
        minTagLength: 3,
        maxTagLength: 50
    });
    if (tagsError) {
        return {
            status: false,
            msg: "Invalid parameter: news.tags. Provide 1 to 6 tags, each containing 3 to 50 characters."
        };
    }

    const hasValidSummary = typeof news.summary === "string"
        && news.summary.length >= 10
        && news.summary.length <= 500;
    if (!hasValidSummary) {
        return {
            status: false,
            msg: "Invalid parameter: news.summary. This field is required and must contain 10 to 500 characters."
        };
    }

    const htmlError = validateHtml(news.description, "news.description", {
        required: true,
        actionLabel: "news-create",
        maxImageCount: 50,
        maxLength: 100000,
        validateImageSources: true
    });
    if (htmlError) {
        return { status: false, msg: htmlError };
    }

    if (hasOwn(news, "seo")) {
        const seoError = validateSeo(news.seo, "news");
        if (seoError) {
            return { status: false, msg: seoError };
        }
    }

    const body = {
        language: args.language,
        news
    };

    try {
        const response = await requestTradebeeJson(
            "https://platform.tradew.com/openapis/news/create",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        return appendPreviewNotice(response);
    } catch (error) {
        return requestFailure(error);
    }
}
