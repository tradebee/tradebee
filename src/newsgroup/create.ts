import type { ActionArguments } from "../action-types.js";
import { requestFailure, requestTradebeeJson,
    appendPreviewNotice,
    getApiKeyOrError,
    hasOwn,
    isPlainObject,
    validateLanguage,
    validateSeo,
    validateTags
} from "../validation.js";

export default async function NewsGroupCreate(args: ActionArguments<"newsgroup-create"> = {}) {
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
            msg: "Explicit user confirmation is required before creating a news group. Show the language and exact news group payload first."
        };
    }

    const languageError = validateLanguage(args.language);
    if (languageError) {
        return { status: false, msg: languageError };
    }

    const newsGroup = args.newsgroup;
    if (!isPlainObject(newsGroup)) {
        return { status: false, msg: "Missing required parameter: newsgroup." };
    }

    const hasValidName = typeof newsGroup.group_name === "string"
        && newsGroup.group_name.length >= 2
        && newsGroup.group_name.length <= 300;
    if (!hasValidName) {
        return {
            status: false,
            msg: "Invalid parameter: newsgroup.group_name. This field is required and must contain 2 to 300 characters."
        };
    }

    const tagsError = validateTags(newsGroup.tags, "newsgroup.tags", {
        required: true,
        minItems: 1,
        maxItems: 6,
        minTagLength: 1,
        maxTagLength: 50
    });
    if (tagsError) {
        return {
            status: false,
            msg: "Invalid parameter: newsgroup.tags. Provide 1 to 6 tags, each containing 1 to 50 characters."
        };
    }

    if (hasOwn(newsGroup, "brief_description")) {
        const description = newsGroup.brief_description;
        if (typeof description !== "string" || description.length > 300) {
            return {
                status: false,
                msg: "Invalid parameter: newsgroup.brief_description. If provided, it must contain at most 300 characters."
            };
        }
    }

    if (hasOwn(newsGroup, "seo")) {
        const seoError = validateSeo(newsGroup.seo, "newsgroup");
        if (seoError) {
            return { status: false, msg: seoError };
        }
    }

    const body = {
        language: args.language,
        newsgroup: newsGroup
    };

    try {
        const response = await requestTradebeeJson(
            "https://platform.tradew.com/openapis/newsgroup/create",
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
