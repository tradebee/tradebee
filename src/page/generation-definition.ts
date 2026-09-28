import type { ActionArguments } from "../action-types.js";
import { requestFailure, callTradebeeApi, getApiKeyOrError, isPlainObject, validateLanguage, validatePageName } from "../validation.js";

export default async function PageGenerationDefinition(args: ActionArguments<"page-generation-definition"> = {}) {
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

    const pageNameError = validatePageName(args.pageName);
    if (pageNameError) {
        return { status: false, msg: pageNameError };
    }

    try {
        return await callTradebeeApi(
            "https://platform.tradew.com/openapis/page/generationdefinition",
            API_KEY,
            {
                language: args.language!.trim(), // validateLanguage above rejects missing/non-string values.
                pageName: args.pageName
            }
        );
    } catch (error) {
        return requestFailure(error);
    }
}
