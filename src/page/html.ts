import type { ActionArguments } from "../action-types.js";
import { requestFailure, callTradebeeApi, getApiKeyOrError, isPlainObject, validateLanguage, validatePageCss, validatePageLayouts, validatePageName } from "../validation.js";

export default async function PageHtml(args: ActionArguments<"page-html"> = {}) {
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

    const pageNameError = validatePageName(args.pageName);
    if (pageNameError) return { status: false, msg: pageNameError };

    const layoutsError = validatePageLayouts(args.layouts);
    if (layoutsError) return { status: false, msg: layoutsError };

    const cssError = validatePageCss(args.css);
    if (cssError) return { status: false, msg: cssError };

    const body: ActionArguments<"page-html"> = {
        language: args.language!.trim(), // validateLanguage above rejects missing/non-string values.
        pageName: args.pageName
    };
    if (args.layouts !== undefined) body.layouts = args.layouts;
    if (args.css !== undefined) body.css = args.css;

    try {
        return await callTradebeeApi(
            "https://platform.tradew.com/openapis/page/html",
            API_KEY,
            body
        );
    } catch (error) {
        return requestFailure(error);
    }
}
