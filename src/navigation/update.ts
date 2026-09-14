import type { ActionArguments } from "../action-types.js";
import { requestFailure,
    appendPreviewNotice,
    callTradebeeApi,
    extractFirstRecord,
    firstPositiveInteger,
    getApiKeyOrError,
    hasOwn,
    isPlainObject,
    saveBackupToFile,
    validateHtml,
    validateLanguage,
    withDefinedProperties
} from "../validation.js";

function validateUrl(url: string | null | undefined): string | null {
    if (typeof url !== "string" || url.length < 1 || url.length > 500) {
        return "Invalid parameter: navigation.url. It must contain 1 to 500 characters.";
    }

    if (url.startsWith("/") && !url.startsWith("//")) {
        return null;
    }

    try {
        const parsed = new URL(url);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            return null;
        }
    } catch (error) {
    }

    return "Invalid parameter: navigation.url. Internal links must start with / and omit the domain; external links must be valid http:// or https:// URLs.";
}

function buildRestorePayload(snapshot: Record<string, unknown> = {}) {
    const values = {
        navigation_id: firstPositiveInteger(snapshot.navigation_id),
        name: snapshot.name,
        url: snapshot.url,
        system_children_type: snapshot.system_children_type,
        content: snapshot.content,
        open_in_new_window: snapshot.open_in_new_window,
        sort: snapshot.sort
    };

    return withDefinedProperties(values, [
        "navigation_id",
        "name",
        "url",
        "system_children_type",
        "content",
        "open_in_new_window",
        "sort"
    ]);
}

export default async function NavigationUpdate(args: ActionArguments<"navigation-update"> = {}) {
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
            msg: "Explicit user confirmation is required before updating navigation. Show the language, target ID, exact payload, and backup behavior first."
        };
    }

    const languageError = validateLanguage(args.language);
    if (languageError) {
        return { status: false, msg: languageError };
    }

    const navigation = args.navigation;
    if (!isPlainObject(navigation)) {
        return { status: false, msg: "Missing required parameter: navigation." };
    }

    const navigationId = Number(navigation.navigation_id ?? 0);
    if (!Number.isInteger(navigationId) || navigationId <= 0) {
        return {
            status: false,
            msg: "Invalid parameter: navigation.navigation_id. Select one positive ID from navigation-read under the same language."
        };
    }

    if (hasOwn(navigation, "name")) {
        const hasValidName = typeof navigation.name === "string"
            && navigation.name.length >= 2
            && navigation.name.length <= 100;
        if (!hasValidName) {
            return {
                status: false,
                msg: "Invalid parameter: navigation.name. If provided, it must contain 2 to 100 characters."
            };
        }
    }

    if (hasOwn(navigation, "url")) {
        const urlError = validateUrl(navigation.url);
        if (urlError) {
            return { status: false, msg: urlError };
        }
    }

    if (hasOwn(navigation, "system_children_type")) {
        const systemChildrenType = Number(navigation.system_children_type);
        const hasValidSystemType = Number.isInteger(systemChildrenType)
            && systemChildrenType >= 0
            && systemChildrenType <= 7;
        if (!hasValidSystemType) {
            return {
                status: false,
                msg: "Invalid parameter: navigation.system_children_type. If provided, it must be an integer between 0 and 7."
            };
        }
    }

    if (hasOwn(navigation, "content")) {
        const contentError = validateHtml(navigation.content, "navigation.content", {
            actionLabel: "navigation-update",
            maxImageCount: 50,
            maxLength: 100000,
            validateImageSources: true
        });
        if (contentError) return { status: false, msg: contentError };
    }

    const setsSystemChildren = Number(navigation.system_children_type) > 0;
    if (setsSystemChildren && hasOwn(navigation, "content") && navigation.content !== "") {
        return {
            status: false,
            msg: "Invalid parameter: navigation.content. It must be \"\" when system_children_type is greater than 0."
        };
    }

    if (hasOwn(navigation, "open_in_new_window")
        && typeof navigation.open_in_new_window !== "boolean") {
        return {
            status: false,
            msg: "Invalid parameter: navigation.open_in_new_window. If provided, it must be boolean."
        };
    }

    if (hasOwn(navigation, "sort")) {
        const sort = Number(navigation.sort);
        if (!Number.isInteger(sort) || sort < 1 || sort > 999999) {
            return {
                status: false,
                msg: "Invalid parameter: navigation.sort. If provided, it must be an integer between 1 and 999999."
            };
        }
    }

    const navigationChanges = { ...navigation };
    if (navigationChanges.content === "") {
        delete navigationChanges.content;
    }

    const body = {
        language: args.language,
        navigation: navigationChanges
    };

    try {
        const backupResponse = await callTradebeeApi(
            "https://platform.tradew.com/openapis/navigation/read",
            API_KEY,
            {
                language: args.language,
                navigation_id: navigationId,
                fields: [
                    "navigation_id",
                    "parent_navigation_id",
                    "language",
                    "name",
                    "url",
                    "system_children_type",
                    "content",
                    "open_in_new_window",
                    "sort",
                    "update_time",
                    "is_leaf",
                    "children"
                ]
            }
        );
        const snapshot = extractFirstRecord(backupResponse, ["navigation", "navigations", "list", "items", "rows"], { idField: "navigation_id", id: navigationId });
        if (!isPlainObject(backupResponse) || !backupResponse.status || !snapshot) {
            return {
                status: false,
                msg: "Backup capture failed before navigation-update. Read the current navigation first, then retry."
            };
        }

        const restorePayload = {
            language: args.language,
            navigation: buildRestorePayload(snapshot)
        };
        const restoreLimitations = [
            "parent_navigation_id cannot be restored because navigation-update does not allow changing the parent relationship."
        ];
        const backupFile = await saveBackupToFile({
            action: "navigation-update",
            language: args.language,
            entityId: navigationId,
            rawReadResponse: backupResponse,
            snapshot,
            requestedPayload: body,
            restoreAction: "navigation-update",
            restorePayload,
            restoreLimitations,
            confirmationSummary: confirmation.summary
        });
        const result = await callTradebeeApi(
            "https://platform.tradew.com/openapis/navigation/update",
            API_KEY,
            body
        );

        if (!isPlainObject(result)) return result;

        return appendPreviewNotice({
            ...result,
            backup: {
                captured: true,
                action: "navigation-update",
                language: args.language,
                entity_id: navigationId,
                storage: { type: "file", ...backupFile },
                snapshot_source: "read_api_response",
                raw_read_response: backupResponse,
                snapshot,
                restore_action: "navigation-update",
                restore_payload: restorePayload,
                restore_limitations: restoreLimitations
            }
        });
    } catch (error) {
        return requestFailure(error);
    }
}
