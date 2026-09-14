import type { ActionArguments } from "../action-types.js";
import { requestFailure, requestTradebeeJson, getApiKeyOrError, isPlainObject, validateIdList, validateLanguage } from "../validation.js";

export default async function NewsDelete(args: ActionArguments<"news-delete"> = {}) {
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
            msg: "Explicit user confirmation is required before deleting news. Show the language and exact news ID list first."
        };
    }

    const languageError = validateLanguage(args.language);
    if (languageError) {
        return { status: false, msg: languageError };
    }

    const idError = validateIdList(args.id_list);
    if (idError) {
        return { status: false, msg: idError };
    }

    const body = {
        language: args.language,
        id_list: args.id_list
    };

    try {
        const response = await requestTradebeeJson(
            "https://platform.tradew.com/openapis/news/delete",
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
