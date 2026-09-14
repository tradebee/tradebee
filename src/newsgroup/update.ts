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
    validateLanguage,
    validateSeo,
    validateTags,
    withDefinedProperties
} from "../validation.js";

function buildRestorePayload(snapshot: Record<string, unknown> = {}) {
    const values = {
        newsgroup_id: firstPositiveInteger(snapshot.newsgroup_id),
        group_name: snapshot.group_name,
        tags: snapshot.tags,
        brief_description: snapshot.brief_description,
        seo: snapshot.seo
    };

    return withDefinedProperties(values, [
        "newsgroup_id",
        "group_name",
        "tags",
        "brief_description",
        "seo"
    ]);
}

export default async function NewsGroupUpdate(args: ActionArguments<"newsgroup-update"> = {}) {
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
            msg: "Explicit user confirmation is required before updating a news group. Show the language, target ID, exact payload, and backup behavior first."
        };
    }

    const languageError = validateLanguage(args.language);
    if (languageError) {
        return { status: false, msg: languageError };
    }

    const newsGroup = args.newsgroup;
    if (!isPlainObject(newsGroup)) {
        return { status: false, msg: "Missing required parameter: newsgroup." };
    }

    const newsGroupId = Number(newsGroup.newsgroup_id ?? 0);
    if (!Number.isInteger(newsGroupId) || newsGroupId <= 0) {
        return {
            status: false,
            msg: "Invalid parameter: newsgroup.newsgroup_id. Select one positive ID from newsgroup-read under the same language."
        };
    }

    if (hasOwn(newsGroup, "group_name")) {
        const hasValidName = typeof newsGroup.group_name === "string"
            && newsGroup.group_name.length >= 2
            && newsGroup.group_name.length <= 300;
        if (!hasValidName) {
            return {
                status: false,
                msg: "Invalid parameter: newsgroup.group_name. If provided, it must contain 2 to 300 characters."
            };
        }
    }

    if (hasOwn(newsGroup, "tags")) {
        const tagsError = validateTags(newsGroup.tags, "newsgroup.tags", {
            minItems: 1,
            maxItems: 6,
            minTagLength: 1,
            maxTagLength: 50
        });
        if (tagsError) {
            return {
                status: false,
                msg: "Invalid parameter: newsgroup.tags. If provided, supply 1 to 6 tags, each containing 1 to 50 characters."
            };
        }
    }

    if (hasOwn(newsGroup, "brief_description")) {
        const description = newsGroup.brief_description;
        if (typeof description !== "string" || description.length > 300) {
            return {
                status: false,
                msg: "Invalid parameter: newsgroup.brief_description. If provided, it must contain at most 300 characters."
            };
        }
    }

    if (hasOwn(newsGroup, "seo")) {
        const seoError = validateSeo(newsGroup.seo, "newsgroup", {
            mode: "update",
            actionLabel: "newsgroup-update"
        });
        if (seoError) {
            return { status: false, msg: seoError };
        }
    }

    const body = {
        language: args.language,
        newsgroup: newsGroup
    };

    try {
        const backupResponse = await callTradebeeApi(
            "https://platform.tradew.com/openapis/newsgroup/read",
            API_KEY,
            {
                language: args.language,
                newsgroup_id: newsGroupId,
                fields: [
                    "newsgroup_id",
                    "language",
                    "group_name",
                    "tags",
                    "brief_description",
                    "seo",
                    "update_time"
                ],
                pagination: { current_page: 1, page_size: 10 }
            }
        );
        const snapshot = extractFirstRecord(backupResponse, ["newsgroup", "newsgroups", "list", "items", "rows"], { idField: "newsgroup_id", id: newsGroupId });
        if (!isPlainObject(backupResponse) || !backupResponse.status || !snapshot) {
            return {
                status: false,
                msg: "Backup capture failed before newsgroup-update. Read the current news group first, then retry."
            };
        }

        const restorePayload = {
            language: args.language,
            newsgroup: buildRestorePayload(snapshot)
        };
        const backupFile = await saveBackupToFile({
            action: "newsgroup-update",
            language: args.language,
            entityId: newsGroupId,
            rawReadResponse: backupResponse,
            snapshot,
            requestedPayload: body,
            restoreAction: "newsgroup-update",
            restorePayload,
            restoreLimitations: [],
            confirmationSummary: confirmation.summary
        });
        const result = await callTradebeeApi(
            "https://platform.tradew.com/openapis/newsgroup/update",
            API_KEY,
            body
        );

        if (!isPlainObject(result)) return result;

        return appendPreviewNotice({
            ...result,
            backup: {
                captured: true,
                action: "newsgroup-update",
                language: args.language,
                entity_id: newsGroupId,
                storage: { type: "file", ...backupFile },
                snapshot_source: "read_api_response",
                raw_read_response: backupResponse,
                snapshot,
                restore_action: "newsgroup-update",
                restore_payload: restorePayload,
                restore_limitations: []
            }
        });
    } catch (error) {
        return requestFailure(error);
    }
}
