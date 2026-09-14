import type { ActionArguments } from "../action-types.js";
import { requestFailure, requestTradebeeJson,
    appendPreviewNotice,
    getApiKeyOrError,
    isPlainObject,
    validateHtml,
    validateLanguage
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

export default async function NavigationCreate(args: ActionArguments<"navigation-create"> = {}) {
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
            msg: "Explicit user confirmation is required before creating navigation. Show the language and exact navigation payload first."
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

    const parentNavigationId = Number(navigation.parent_navigation_id ?? 0);
    if (!Number.isInteger(parentNavigationId) || parentNavigationId < 0) {
        return {
            status: false,
            msg: "Invalid parameter: navigation.parent_navigation_id. Use 0 for first level or a positive first-level navigation ID for second level."
        };
    }

    const hasValidName = typeof navigation.name === "string"
        && navigation.name.length >= 2
        && navigation.name.length <= 100;
    if (!hasValidName) {
        return {
            status: false,
            msg: "Invalid parameter: navigation.name. It must contain 2 to 100 characters."
        };
    }

    const urlError = validateUrl(navigation.url);
    if (urlError) {
        return { status: false, msg: urlError };
    }

    const systemChildrenType = Number(navigation.system_children_type ?? 0);
    const hasValidSystemType = Number.isInteger(systemChildrenType)
        && systemChildrenType >= 0
        && systemChildrenType <= 7;
    if (!hasValidSystemType) {
        return {
            status: false,
            msg: "Invalid parameter: navigation.system_children_type. It must be an integer between 0 and 7."
        };
    }

    const content = navigation.content ?? "";
    const contentError = validateHtml(content, "navigation.content", {
        actionLabel: "navigation-create",
        maxImageCount: 50,
        maxLength: 100000,
        validateImageSources: true
    });
    if (contentError) return { status: false, msg: contentError };

    const isSecondLevel = parentNavigationId > 0;
    if (isSecondLevel && (systemChildrenType !== 0 || content !== "")) {
        return {
            status: false,
            msg: "Invalid parameter: navigation. A manually added second-level navigation requires system_children_type=0 and content=\"\"."
        };
    }

    if (systemChildrenType > 0 && content !== "") {
        return {
            status: false,
            msg: "Invalid parameter: navigation.content. It must be \"\" when system_children_type is greater than 0."
        };
    }

    if (navigation.open_in_new_window != null
        && typeof navigation.open_in_new_window !== "boolean") {
        return {
            status: false,
            msg: "Invalid parameter: navigation.open_in_new_window. It must be boolean."
        };
    }

    const sort = Number(navigation.sort ?? 999999);
    if (!Number.isInteger(sort) || sort < 1 || sort > 999999) {
        return {
            status: false,
            msg: "Invalid parameter: navigation.sort. It must be an integer between 1 and 999999."
        };
    }

    const body = {
        language: args.language,
        navigation: {
            ...navigation,
            parent_navigation_id: parentNavigationId,
            system_children_type: systemChildrenType,
            content,
            sort
        }
    };

    try {
        const response = await requestTradebeeJson(
            "https://platform.tradew.com/openapis/navigation/create",
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
