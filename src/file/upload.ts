import type { ActionArguments } from "../action-types.js";
import { requestFailure, callTradebeeApi, getApiKeyOrError, isPlainObject, validateFileUploads, validateLanguage } from "../validation.js";

export default async function FileUpload(args: ActionArguments<"file-upload"> = {}) {
    if (!isPlainObject(args)) {
        return {
            status: false,
            msg: "Invalid parameter: request.body. It must be a valid JSON object."
        };
    }

    const { apiKey: API_KEY, error: apiKeyError } = getApiKeyOrError(args);
    if (apiKeyError) return apiKeyError;

    if (!isPlainObject(args.confirmation) || args.confirmation.approved !== true) {
        return {
            status: false,
            msg: "Explicit user confirmation is required before file-upload. Show the exact language and image filenames first, then set confirmation.approved=true."
        };
    }
    if (typeof args.confirmation.summary !== "string" || !args.confirmation.summary.trim()) {
        return {
            status: false,
            msg: "Missing required parameter: confirmation.summary. It must summarize the language and image filenames approved by the user."
        };
    }

    const languageError = validateLanguage(args.language);
    if (languageError) return { status: false, msg: languageError };

    const uploadsError = validateFileUploads(args.uploads);
    if (uploadsError) return { status: false, msg: uploadsError };

    try {
        return await callTradebeeApi(
            "https://platform.tradew.com/openapis/file/upload",
            API_KEY,
            {
                language: args.language!.trim(), // validateLanguage above rejects missing/non-string values.
                uploads: args.uploads
            }
        );
    } catch (error) {
        return requestFailure(error);
    }
}
