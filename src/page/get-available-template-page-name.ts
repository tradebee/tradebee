import type { ActionArguments } from "../action-types.js";
import { requestFailure, callTradebeeApi, getApiKeyOrError, isPlainObject, validateLanguage } from "../validation.js";

export default async function PageGetAvailableTemplatePageName(args: ActionArguments<"page-get-available-template-page-name"> = {}) {
    if (!isPlainObject(args)) {
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

    try {
        return await callTradebeeApi(
            "https://platform.tradew.com/openapis/page/getavailabletemplatepagename",
            API_KEY,
            { language: args.language!.trim() }
        );
    } catch (error) {
        return requestFailure(error);
    }
}
