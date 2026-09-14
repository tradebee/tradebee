import type { ActionArguments } from "../action-types.js";
import { requestFailure, callTradebeeApi, cloneJson, getApiKeyOrError, isPlainObject, saveBackupToFile, validateLanguage, validatePageCss, validatePageLayouts, validatePageName } from "../validation.js";

export default async function PageSave(args: ActionArguments<"page-save"> = {}) {
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
            msg: "Explicit user confirmation is required before page-save. Show the exact language, pageName, layouts, and css payload first, then set confirmation.approved=true."
        };
    }
    if (typeof args.confirmation.summary !== "string" || !args.confirmation.summary.trim()) {
        return {
            status: false,
            msg: "Missing required parameter: confirmation.summary. It must summarize the exact page-save payload approved by the user."
        };
    }

    const languageError = validateLanguage(args.language);
    if (languageError) return { status: false, msg: languageError };

    const pageNameError = validatePageName(args.pageName);
    if (pageNameError) return { status: false, msg: pageNameError };

    const layoutsError = validatePageLayouts(args.layouts, { required: true });
    if (layoutsError) return { status: false, msg: layoutsError };

    const cssError = validatePageCss(args.css);
    if (cssError) return { status: false, msg: cssError };

    const body: ActionArguments<"page-save"> = {
        language: args.language!.trim(), // validateLanguage above rejects missing/non-string values.
        pageName: args.pageName,
        layouts: args.layouts
    };
    if (args.css !== undefined) body.css = args.css;

    try {
        const current = await callTradebeeApi(
            "https://platform.tradew.com/openapis/page/html",
            API_KEY,
            {
                language: body.language,
                pageName: body.pageName
            }
        );

        if (!isPlainObject(current) || current.status !== true || !isPlainObject(current.data)) {
            return {
                status: false,
                msg: "Backup capture failed before page-save. Read the current page with page-html, then retry."
            };
        }

        let backup = null;
        if (current.data.exists === true) {
            const restorePayload: Record<string, unknown> = {
                language: body.language,
                pageName: body.pageName,
                layouts: cloneJson(current.data.layouts)
            };
            if (isPlainObject(current.data.css)) restorePayload.css = cloneJson(current.data.css);

            const backupFile = await saveBackupToFile({
                action: "page-save",
                language: body.language,
                entityId: body.pageName,
                rawReadResponse: current,
                snapshot: current.data,
                requestedPayload: body,
                restoreAction: "page-save",
                restorePayload,
                restoreLimitations: [
                    "Restoring the captured css object also restores shared style entries returned by page-html for this language."
                ],
                confirmationSummary: args.confirmation.summary
            });

            backup = {
                captured: true,
                action: "page-save",
                language: body.language,
                entity_id: body.pageName,
                storage: { type: "file", ...backupFile },
                snapshot_source: "page-html_api_response",
                raw_read_response: current,
                snapshot: current.data,
                restore_action: "page-save",
                restore_payload: restorePayload,
                restore_limitations: [
                    "Restoring the captured css object also restores shared style entries returned by page-html for this language."
                ]
            };
        }

        const result = await callTradebeeApi(
            "https://platform.tradew.com/openapis/page/save",
            API_KEY,
            body
        );

        if (!backup || !isPlainObject(result)) return result;
        return { ...result, backup };
    } catch (error) {
        return requestFailure(error);
    }
}
