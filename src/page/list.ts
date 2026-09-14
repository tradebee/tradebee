import type { ActionArguments } from "../action-types.js";
import { requestFailure, callTradebeeApi, getApiKeyOrError, isPlainObject } from "../validation.js";

export default async function PageList(args: ActionArguments<"page-list"> = {}) {
    if (!isPlainObject(args)) {
        return {
            status: false,
            msg: "Invalid parameter: request.body. It must be a valid JSON object."
        };
    }

    const { apiKey: API_KEY, error: apiKeyError } = getApiKeyOrError(args);
    if (apiKeyError) return apiKeyError;

    try {
        return await callTradebeeApi(
            "https://platform.tradew.com/openapis/page/list",
            API_KEY,
            {}
        );
    } catch (error) {
        return requestFailure(error);
    }
}
