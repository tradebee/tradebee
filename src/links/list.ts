import type { ActionArguments } from "../action-types.js";
import { requestFailure,
    callTradebeeApi,
    getApiKeyOrError,
    isPlainObject,
    validateLanguage,
    validatePagination
} from "../validation.js";

const LINK_TYPES = new Set([
    "main",
    "products",
    "membergroup",
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
    "mybar",
    "certificate",
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "rar",
    "zip"
]);

export default async function LinksList(args: ActionArguments<"links-list"> = {}) {
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

    const type = args.type ?? "main";
    if (typeof type !== "string" || !LINK_TYPES.has(type)) {
        return {
            status: false,
            msg: `Invalid parameter: type. Supported values: ${[...LINK_TYPES].join(", ")}.`
        };
    }

    const pagination = validatePagination(args);
    if (pagination.error) {
        return { status: false, msg: pagination.error };
    }

    try {
        return await callTradebeeApi(
            "https://platform.tradew.com/openapis/links",
            API_KEY,
            {
                language: args.language!.trim(), // validateLanguage above rejects missing/non-string values.
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
