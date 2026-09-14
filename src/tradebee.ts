import blogCreate from "./blog/create.js";
import blogDelete from "./blog/delete.js";
import blogRead from "./blog/read.js";
import blogUpdate from "./blog/update.js";
import customPageCreate from "./custompage/create.js";
import customPageDelete from "./custompage/delete.js";
import customPageRead from "./custompage/read.js";
import customPageUpdate from "./custompage/update.js";
import blogGroupCreate from "./bloggroup/create.js";
import blogGroupDelete from "./bloggroup/delete.js";
import blogGroupRead from "./bloggroup/read.js";
import blogGroupUpdate from "./bloggroup/update.js";
import faqCreate from "./faq/create.js";
import faqDelete from "./faq/delete.js";
import faqRead from "./faq/read.js";
import faqUpdate from "./faq/update.js";
import faqGroupCreate from "./faqgroup/create.js";
import faqGroupDelete from "./faqgroup/delete.js";
import faqGroupRead from "./faqgroup/read.js";
import faqGroupUpdate from "./faqgroup/update.js";
import inquiryRead from "./inquiry/read.js";
import keywordsRank from "./keywords/rank.js";
import languagesGet from "./languages/get.js";
import linksList from "./links/list.js";
import fileUpload from "./file/upload.js";
import navigationCreate from "./navigation/create.js";
import navigationDelete from "./navigation/delete.js";
import navigationRead from "./navigation/read.js";
import navigationUpdate from "./navigation/update.js";
import newsCreate from "./news/create.js";
import newsDelete from "./news/delete.js";
import newsRead from "./news/read.js";
import newsUpdate from "./news/update.js";
import newsGroupCreate from "./newsgroup/create.js";
import newsGroupDelete from "./newsgroup/delete.js";
import newsGroupRead from "./newsgroup/read.js";
import newsGroupUpdate from "./newsgroup/update.js";
import pageGenerationDefinition from "./page/generation-definition.js";
import pageHtml from "./page/html.js";
import pageList from "./page/list.js";
import pageSave from "./page/save.js";
import productsCreate from "./products/create.js";
import productsDelete from "./products/delete.js";
import productsRead from "./products/read.js";
import productsUpdate from "./products/update.js";
import productsGroupCreate from "./productsgroup/create.js";
import productsGroupDelete from "./productsgroup/delete.js";
import productsGroupRead from "./productsgroup/read.js";
import productsGroupUpdate from "./productsgroup/update.js";
import ruleGet from "./rule/get.js";
import visitorRecent from "./visitor/recent.js";
import { isPlainObject } from "./validation.js";
import type { TradebeeRequest } from "./types.js";
import type { RequestArguments as TradebeeArguments } from "./request-types.js";

const READ_ACTIONS = new Set([
    "blog-read",
    "bloggroup-read",
    "custompage-read",
    "faq-read",
    "faqgroup-read",
    "inquiry-read",
    "keywords-rank",
    "languages-get",
    "links-list",
    "navigation-read",
    "news-read",
    "newsgroup-read",
    "page-generation-definition",
    "page-html",
    "page-list",
    "products-read",
    "productsgroup-read",
    "rule-get",
    "visitor-recent"
]);

const MUTATION_ACTIONS = new Set([
    "blog-create",
    "blog-delete",
    "blog-update",
    "bloggroup-create",
    "bloggroup-delete",
    "bloggroup-update",
    "custompage-create",
    "custompage-delete",
    "custompage-update",
    "faq-create",
    "faq-delete",
    "faq-update",
    "faqgroup-create",
    "faqgroup-delete",
    "faqgroup-update",
    "file-upload",
    "navigation-create",
    "navigation-delete",
    "navigation-update",
    "news-create",
    "news-delete",
    "news-update",
    "newsgroup-create",
    "newsgroup-delete",
    "newsgroup-update",
    "page-save",
    "products-create",
    "products-delete",
    "products-update",
    "productsgroup-create",
    "productsgroup-delete",
    "productsgroup-update"
]);

interface ActionDefinition {
    handler: (args: TradebeeArguments) => Promise<unknown>;
    buildArgs: (args: TradebeeArguments) => TradebeeArguments;
}

const ACTIONS: Record<string, ActionDefinition> = {
    "file-upload": {
        handler: fileUpload,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                uploads: args.uploads,
                confirmation: args.confirmation
            };
        }
    },
    "blog-create": {
        handler: blogCreate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                blog: args.blog,
                confirmation: args.confirmation
            };
        }
    },
    "blog-delete": {
        handler: blogDelete,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                id_list: args.id_list,
                confirmation: args.confirmation
            };
        }
    },
    "blog-read": {
        handler: blogRead,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                blog_id: args.blog_id,
                bloggroup_id: args.bloggroup_id,
                fields: args.fields,
                current_page: args.pagination?.current_page,
                page_size: args.pagination?.page_size
            };
        }
    },
    "blog-update": {
        handler: blogUpdate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                blog: args.blog,
                confirmation: args.confirmation
            };
        }
    },
    "custompage-create": {
        handler: customPageCreate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                custompage: args.custompage,
                confirmation: args.confirmation
            };
        }
    },
    "custompage-delete": {
        handler: customPageDelete,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                id_list: args.id_list,
                confirmation: args.confirmation
            };
        }
    },
    "custompage-read": {
        handler: customPageRead,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                custompage_id: args.custompage_id,
                fields: args.fields,
                current_page: args.pagination?.current_page,
                page_size: args.pagination?.page_size
            };
        }
    },
    "custompage-update": {
        handler: customPageUpdate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                custompage: args.custompage,
                confirmation: args.confirmation
            };
        }
    },
    "bloggroup-create": {
        handler: blogGroupCreate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                bloggroup: args.bloggroup,
                confirmation: args.confirmation
            };
        }
    },
    "bloggroup-delete": {
        handler: blogGroupDelete,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                id_list: args.id_list,
                confirmation: args.confirmation
            };
        }
    },
    "bloggroup-read": {
        handler: blogGroupRead,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                bloggroup_id: args.bloggroup_id,
                fields: args.fields,
                current_page: args.pagination?.current_page,
                page_size: args.pagination?.page_size
            };
        }
    },
    "bloggroup-update": {
        handler: blogGroupUpdate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                bloggroup: args.bloggroup,
                confirmation: args.confirmation
            };
        }
    },
    "faq-create": {
        handler: faqCreate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                faq: args.faq,
                confirmation: args.confirmation
            };
        }
    },
    "faq-delete": {
        handler: faqDelete,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                id_list: args.id_list,
                confirmation: args.confirmation
            };
        }
    },
    "faq-read": {
        handler: faqRead,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                faq_id: args.faq_id,
                faqgroup_id: args.faqgroup_id,
                fields: args.fields,
                current_page: args.pagination?.current_page,
                page_size: args.pagination?.page_size
            };
        }
    },
    "faq-update": {
        handler: faqUpdate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                faq: args.faq,
                confirmation: args.confirmation
            };
        }
    },
    "faqgroup-create": {
        handler: faqGroupCreate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                faqgroup: args.faqgroup,
                confirmation: args.confirmation
            };
        }
    },
    "faqgroup-delete": {
        handler: faqGroupDelete,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                id_list: args.id_list,
                confirmation: args.confirmation
            };
        }
    },
    "faqgroup-read": {
        handler: faqGroupRead,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                faqgroup_id: args.faqgroup_id,
                fields: args.fields,
                current_page: args.pagination?.current_page,
                page_size: args.pagination?.page_size
            };
        }
    },
    "faqgroup-update": {
        handler: faqGroupUpdate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                faqgroup: args.faqgroup,
                confirmation: args.confirmation
            };
        }
    },
    "inquiry-read": {
        handler: inquiryRead,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                recent_days: args.recent_days,
                fields: args.fields,
                current_page: args.pagination?.current_page,
                page_size: args.pagination?.page_size
            };
        }
    },
    "keywords-rank": {
        handler: keywordsRank,
        buildArgs(args: TradebeeArguments) {
            return {
                keywords: args.keywords,
                rank: args.rank,
                current_page: args.pagination?.current_page,
                page_size: args.pagination?.page_size
            };
        }
    },
    "languages-get": {
        handler: languagesGet,
        buildArgs(args: TradebeeArguments) {
            return {};
        }
    },
    "links-list": {
        handler: linksList,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                type: args.type,
                current_page: args.pagination?.current_page,
                page_size: args.pagination?.page_size
            };
        }
    },
    "navigation-create": {
        handler: navigationCreate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                navigation: args.navigation,
                confirmation: args.confirmation
            };
        }
    },
    "navigation-delete": {
        handler: navigationDelete,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                id_list: args.id_list,
                confirmation: args.confirmation
            };
        }
    },
    "navigation-read": {
        handler: navigationRead,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                navigation_id: args.navigation_id,
                parent_navigation_id: args.parent_navigation_id,
                fields: args.fields
            };
        }
    },
    "navigation-update": {
        handler: navigationUpdate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                navigation: args.navigation,
                confirmation: args.confirmation
            };
        }
    },
    "news-create": {
        handler: newsCreate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                news: args.news,
                confirmation: args.confirmation
            };
        }
    },
    "news-delete": {
        handler: newsDelete,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                id_list: args.id_list,
                confirmation: args.confirmation
            };
        }
    },
    "news-read": {
        handler: newsRead,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                news_id: args.news_id,
                newsgroup_id: args.newsgroup_id,
                fields: args.fields,
                current_page: args.pagination?.current_page,
                page_size: args.pagination?.page_size
            };
        }
    },
    "news-update": {
        handler: newsUpdate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                news: args.news,
                confirmation: args.confirmation
            };
        }
    },
    "newsgroup-create": {
        handler: newsGroupCreate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                newsgroup: args.newsgroup,
                confirmation: args.confirmation
            };
        }
    },
    "newsgroup-delete": {
        handler: newsGroupDelete,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                id_list: args.id_list,
                confirmation: args.confirmation
            };
        }
    },
    "newsgroup-read": {
        handler: newsGroupRead,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                newsgroup_id: args.newsgroup_id,
                fields: args.fields,
                current_page: args.pagination?.current_page,
                page_size: args.pagination?.page_size
            };
        }
    },
    "newsgroup-update": {
        handler: newsGroupUpdate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                newsgroup: args.newsgroup,
                confirmation: args.confirmation
            };
        }
    },
    "products-create": {
        handler: productsCreate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                products: args.products,
                confirmation: args.confirmation
            };
        }
    },
    "page-generation-definition": {
        handler: pageGenerationDefinition,
        buildArgs(args: TradebeeArguments) {
            return {
                pageName: args.pageName
            };
        }
    },
    "page-html": {
        handler: pageHtml,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                pageName: args.pageName,
                layouts: args.layouts,
                css: args.css
            };
        }
    },
    "page-list": {
        handler: pageList,
        buildArgs() {
            return {};
        }
    },
    "page-save": {
        handler: pageSave,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                pageName: args.pageName,
                layouts: args.layouts,
                css: args.css,
                confirmation: args.confirmation
            };
        }
    },
    "products-delete": {
        handler: productsDelete,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                id_list: args.id_list,
                confirmation: args.confirmation
            };
        }
    },
    "products-read": {
        handler: productsRead,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                products_id: args.products_id,
                productsgroup_id: args.productsgroup_id,
                fields: args.fields,
                current_page: args.pagination?.current_page,
                page_size: args.pagination?.page_size
            };
        }
    },
    "products-update": {
        handler: productsUpdate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                products: args.products,
                confirmation: args.confirmation
            };
        }
    },
    "productsgroup-create": {
        handler: productsGroupCreate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                productsgroup: args.productsgroup,
                confirmation: args.confirmation
            };
        }
    },
    "productsgroup-delete": {
        handler: productsGroupDelete,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                id_list: args.id_list,
                confirmation: args.confirmation
            };
        }
    },
    "productsgroup-read": {
        handler: productsGroupRead,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                parent_productsgroup_id: args.parent_productsgroup_id,
                productsgroup_id: args.productsgroup_id,
                fields: args.fields
            };
        }
    },
    "productsgroup-update": {
        handler: productsGroupUpdate,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                productsgroup: args.productsgroup,
                confirmation: args.confirmation
            };
        }
    },
    "rule-get": {
        handler: ruleGet,
        buildArgs(args: TradebeeArguments) {
            return {
                language: args.language,
                scene: args.scene
            };
        }
    },
    "visitor-recent": {
        handler: visitorRecent,
        buildArgs(args: TradebeeArguments) {
            return {
                ip: args.ip,
                current_page: args.pagination?.current_page,
                page_size: args.pagination?.page_size
            };
        }
    }
};

function listActions() {
    return Object.keys(ACTIONS).sort().join(", ");
}

function validateMutationConfirmation(action: string, args: TradebeeArguments) {
    if (!MUTATION_ACTIONS.has(action)) {
        return null;
    }

    const confirmation = args.confirmation;
    if (!confirmation || typeof confirmation !== "object" || Array.isArray(confirmation)) {
        return {
            status: false,
            msg: `Missing required parameter: confirmation. Before using ${action}, require explicit user confirmation that includes the action, language, and target payload or IDs.`
        };
    }

    if (confirmation.approved !== true) {
        return {
            status: false,
            msg: `Explicit user confirmation is required before using ${action}. Set confirmation.approved=true only after showing the user the language and payload or IDs to be changed.`
        };
    }

    if (typeof confirmation.summary !== "string" || !confirmation.summary.trim()) {
        return {
            status: false,
            msg: `Missing required parameter: confirmation.summary. It must summarize the action, language, and target payload or IDs confirmed by the user.`
        };
    }

    return null;
}

function validateActionCategory(action: string) {
    if (READ_ACTIONS.has(action) || MUTATION_ACTIONS.has(action)) {
        return null;
    }

    return {
        status: false,
        msg: `Unsupported action category: ${action}.`
    };
}

export async function executeTradebeeRequest(request: unknown = {}, configuredApiKey?: string): Promise<unknown> {
    if (!isPlainObject(request)) {
        return {
            status: false,
            msg: "Invalid parameter: request.body. It must be a valid JSON object."
        };
    }

    const args = request as TradebeeArguments;
    const action = typeof args.action === "string" ? args.action.trim() : "";

    if (!action) {
        return {
            status: false,
            msg: `Missing required parameter: action. Supported actions: ${listActions()}.`
        };
    }

    const definition = ACTIONS[action];
    if (!definition) {
        return {
            status: false,
            msg: `Unsupported action: ${action}. Supported actions: ${listActions()}.`
        };
    }

    const actionCategoryError = validateActionCategory(action);
    if (actionCategoryError) {
        return actionCategoryError;
    }

    const confirmationError = validateMutationConfirmation(action, args);
    if (confirmationError) {
        return confirmationError;
    }

    const actionArgs = definition.buildArgs(args);
    actionArgs.configuredApiKey = configuredApiKey;
    return await definition.handler(actionArgs);
}

export default function TradebeeOpenApi(args: TradebeeRequest, configuredApiKey?: string): Promise<unknown> {
    return executeTradebeeRequest(args, configuredApiKey);
}
