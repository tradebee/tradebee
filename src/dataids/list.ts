import type { ActionArguments } from "../action-types.js";
import {
    requestFailure,
    callTradebeeApi,
    getApiKeyOrError,
    isPlainObject,
    validateLanguage,
    validatePagination
} from "../validation.js";

const DATA_ID_TYPES = new Set([
    "products",
    "productsgroup",
    "news",
    "newsgroup",
    "blog",
    "bloggroup",
    "faq",
    "faqgroup",
    "cases",
    "casesgroup",
    "exhibition",
    "exhibitiongroup",
    "certificate",
    "download",
    "downloadgroup",
    "contact"
]);

export default async function DataIdsList(args: ActionArguments<"data-ids-list"> = {}) {
    if (!isPlainObject(args)) {
        return {
            status: false,
            msg: "Invalid parameter: request.body. It must be a valid JSON object."
        };
    }

    const { apiKey: API_KEY, error: apiKeyError } = getApiKeyOrError(args);
    if (apiKeyError) return apiKeyError;

    const languageError = validateLanguage(args.language);
    if (languageError) return { status: false, msg: languageError };

    const type = args.type;
    if (typeof type !== "string" || !DATA_ID_TYPES.has(type)) {
        return {
            status: false,
            msg: `Invalid parameter: type. Supported values: ${[...DATA_ID_TYPES].join(", ")}.`
        };
    }

    const pagination = validatePagination(args);
    if (pagination.error) {
        return { status: false, msg: pagination.error };
    }

    try {
        return await callTradebeeApi(
            "https://platform.tradew.com/openapis/data-ids",
            API_KEY,
            {
                language: args.language!.trim(),
                type,
                pagination: {
                    current_page: pagination.current_page,
                    page_size: pagination.page_size
                }
            }
        );
    } catch (error) {
        return requestFailure(error);
    }
}
