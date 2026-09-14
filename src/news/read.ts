import type { ActionArguments } from "../action-types.js";
import { requestFailure, requestTradebeeJson, getApiKeyOrError, validateFields, validateLanguage, validatePagination } from "../validation.js";

export default async function NewsRead(args: ActionArguments<"news-read"> = {}) {
    if (!args || typeof args !== "object" || Array.isArray(args)) {
        return {
            status: false,
            msg: "Invalid parameter: request.body. It must be a valid JSON object."
        };
    }

    const { apiKey: API_KEY, error: apiKeyError } = getApiKeyOrError(args);
    if (apiKeyError) return apiKeyError;

    const languageError = validateLanguage(args.language);
    if (languageError) {
        return { status: false, msg: languageError };
    }

    const news_id = Number(args.news_id ?? 0);
    const newsgroup_id = Number(args.newsgroup_id ?? 0);

    if (!Number.isInteger(news_id) || news_id < 0) {
        return {
            status: false,
            msg: "Invalid parameter: news_id. Omit it or provide one positive integer."
        };
    }

    if (!Number.isInteger(newsgroup_id) || newsgroup_id < 0) {
        return {
            status: false,
            msg: "Invalid parameter: newsgroup_id. Omit it or provide one positive integer selected from newsgroup-read."
        };
    }

    if (news_id > 0 && newsgroup_id > 0) {
        return {
            status: false,
            msg: "Invalid parameter: news_id and newsgroup_id cannot be used together."
        };
    }

    const allowedFields = [
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
        "news_url",
        "create_time",
        "update_time"
    ];
    const fieldsError = validateFields(args.fields, allowedFields);
    if (fieldsError) {
        return { status: false, msg: fieldsError };
    }

    const pagination = validatePagination(args);
    if (pagination.error) {
        return { status: false, msg: pagination.error };
    }

    const body = {
        language: args.language,
        news_id,
        newsgroup_id,
        fields: Array.isArray(args.fields) && args.fields.length
            ? args.fields
            : [],
        pagination: {
            current_page: pagination.current_page,
            page_size: pagination.page_size
        }
    };

    try {
        const response = await requestTradebeeJson(
            "https://platform.tradew.com/openapis/news/read",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        return response;
    } catch (error) {
        return requestFailure(error);
    }
}
