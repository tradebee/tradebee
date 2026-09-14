import type { ActionArguments } from "../action-types.js";
import { requestFailure, requestTradebeeJson, getApiKeyOrError, isPlainObject } from "../validation.js";

export default async function LanguagesGet(args: ActionArguments<"languages-get"> = {}) {
    if (!isPlainObject(args)) {
        return {
            status: false,
            msg: "Invalid parameter: request.body. It must be a valid JSON object."
        };
    }

    const { apiKey: API_KEY, error: apiKeyError } = getApiKeyOrError(args);
    if (apiKeyError) return apiKeyError;

    try {
        const response = await requestTradebeeJson("https://platform.tradew.com/openapis/languages", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        return response;

    } catch (error) {
        return requestFailure(error);
    }
}
