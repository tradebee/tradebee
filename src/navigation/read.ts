import type { ActionArguments } from "../action-types.js";
import { requestFailure, requestTradebeeJson, getApiKeyOrError, validateFields, validateLanguage } from "../validation.js";

export default async function NavigationRead(args: ActionArguments<"navigation-read"> = {}) {
    if (!args || typeof args !== "object" || Array.isArray(args)) {
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

    const navigation_id = Number(args.navigation_id ?? 0);
    if (!Number.isInteger(navigation_id) || navigation_id < 0) {
        return {
            status: false,
            msg: "Invalid parameter: navigation_id. Omit it or provide one positive integer."
        };
    }

    let parent_navigation_id;
    if (args.parent_navigation_id != null) {
        parent_navigation_id = Number(args.parent_navigation_id);
        if (!Number.isInteger(parent_navigation_id) || parent_navigation_id < 0) {
            return {
                status: false,
                msg: "Invalid parameter: parent_navigation_id. Use 0 for first-level navigation or one positive first-level navigation ID."
            };
        }
    }

    if (navigation_id > 0 && parent_navigation_id != null) {
        return {
            status: false,
            msg: "Invalid parameter: navigation_id and parent_navigation_id cannot be used together."
        };
    }

    const allowedFields = [
        "navigation_id",
        "parent_navigation_id",
        "language",
        "name",
        "url",
        "system_children_type",
        "content",
        "open_in_new_window",
        "sort",
        "create_time",
        "update_time",
        "is_leaf",
        "children"
    ];
    const fieldsError = validateFields(args.fields, allowedFields);
    if (fieldsError) {
        return { status: false, msg: fieldsError };
    }

    const body: ActionArguments<"navigation-read"> = {
        language: args.language,
        navigation_id,
        fields: Array.isArray(args.fields) && args.fields.length
            ? args.fields
            : []
    };

    if (parent_navigation_id != null) {
        body.parent_navigation_id = parent_navigation_id;
    }

    try {
        const response = await requestTradebeeJson(
            "https://platform.tradew.com/openapis/navigation/read",
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
