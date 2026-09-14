import type { ActionArguments } from "../action-types.js";
import { requestFailure, requestTradebeeJson, appendPreviewNotice, getApiKeyOrError, getHtmlLengthWithoutImages, hasOwn, isPlainObject, validateHtml, validateLanguage, validateSeo } from "../validation.js";

export default async function CustomPageCreate(args: ActionArguments<"custompage-create"> = {}) {
    if (!args || typeof args !== "object" || Array.isArray(args)) {
        return {
            status: false,
            msg: "Invalid parameter: request.body. It must be a valid JSON object."
        };
    }

    const { apiKey: API_KEY, error: apiKeyError } = getApiKeyOrError(args);
    if (apiKeyError) return apiKeyError;

    if (!args.confirmation || typeof args.confirmation !== "object" || Array.isArray(args.confirmation)) {
        return {
            status: false,
            msg: "Missing required parameter: confirmation. Before creating a custom page, require explicit user confirmation that includes the language and custom page payload."
        };
    }

    if (args.confirmation.approved !== true) {
        return {
            status: false,
            msg: "Explicit user confirmation is required before creating a custom page. Set confirmation.approved=true only after showing the user the language and custom page payload to be created."
        };
    }

    if (typeof args.confirmation.summary !== "string" || !args.confirmation.summary.trim()) {
        return {
            status: false,
            msg: "Missing required parameter: confirmation.summary. It must summarize the language and custom page payload confirmed by the user."
        };
    }

    const languageError = validateLanguage(args.language);
    if (languageError) {
        return {
            status: false,
            msg: languageError
        };
    }

    if (!isPlainObject(args.custompage)) {
        return {
            status: false,
            msg: "Missing required parameter: custompage."
        };
    }

    if (typeof args.custompage.title !== "string" || args.custompage.title.length < 1 || args.custompage.title.length > 100) {
        return {
            status: false,
            msg: "Invalid parameter: custompage.title. This field is required and must contain 1 to 100 characters."
        };
    }

    if (typeof args.custompage.content !== "string" || args.custompage.content.length < 1 || getHtmlLengthWithoutImages(args.custompage.content) > 100000) {
        return {
            status: false,
            msg: "Invalid parameter: custompage.content. This field is required and must contain 1 to 100000 HTML characters after removing <img> tags. Each <img> must use an HTTP(S) URL returned by file-upload; embedded base64 data URLs are not supported by the Tradebee plugin."
        };
    }

    const contentStructureError = validateHtml(args.custompage.content, "custompage.content", {
        required: true,
        actionLabel: "custompage-create",
        maxImageCount: 50,
        allowH1: true,
        validateImageSources: true
    });
    if (contentStructureError) {
        return {
            status: false,
            msg: contentStructureError
        };
    }

    if (hasOwn(args.custompage, "seo")) {
        const seoError = validateSeo(args.custompage.seo, "custompage", {
            descriptionFieldName: "description"
        });
        if (seoError) {
            return {
                status: false,
                msg: seoError
            };
        }
    }

    const body = {
        language: args.language,
        custompage: args.custompage
    };

    try {
        const response = await requestTradebeeJson(
            "https://platform.tradew.com/openapis/custompage/create",
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
