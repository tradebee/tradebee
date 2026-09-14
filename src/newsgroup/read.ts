import type { ActionArguments } from "../action-types.js";
import { requestFailure, requestTradebeeJson, getApiKeyOrError, validateFields, validateLanguage, validatePagination } from "../validation.js";

export default async function NewsGroupRead(args: ActionArguments<"newsgroup-read"> = {}) {
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

    const newsgroup_id = Number(args.newsgroup_id ?? 0);
    if (!Number.isInteger(newsgroup_id) || newsgroup_id < 0) {
        return {
            status: false,
            msg: "Invalid parameter: newsgroup_id. Omit it or provide one positive integer."
        };
    }

    const allowedFields = [
        "newsgroup_id",
        "language",
        "group_name",
        "tags",
        "brief_description",
        "seo",
        "newsgroup_url",
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
            "https://platform.tradew.com/openapis/newsgroup/read",
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
