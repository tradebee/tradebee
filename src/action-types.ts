import type { ImageUpload, PageCss, PageLayouts, SeoMetadata } from "./types.js";

export interface ActionInputs {
    "file-upload": {
        language: string;
        uploads: Array<{
            name: string;
            base64: string;
        }>;
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "blog-create": {
        language: string;
        blog: {
            bloggroup_id: number;
            publisher?: string;
            publication_date?: string;
            title: string;
            cover_image: {
                name?: string;
                base64?: string;
            };
            tags: Array<string>;
            summary: string;
            description: string;
            seo?: {
                title?: string;
                description?: string;
                keywords?: string;
            };
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "blog-delete": {
        language: string;
        id_list: Array<number>;
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "blog-read": {
        language: string;
        blog_id?: number;
        bloggroup_id?: number;
        fields?: Array<string>;
        pagination?: {
            current_page: number;
            page_size: number;
        };
    };
    "blog-update": {
        language: string;
        blog: {
            blog_id: number;
            bloggroup_id?: number;
            publisher?: string;
            publication_date?: string;
            title?: string;
            cover_image?: {
                name?: string;
                base64?: string;
            };
            tags?: Array<string>;
            summary?: string;
            description?: string;
            seo?: {
                title?: string;
                description?: string;
                keywords?: string;
            };
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "custompage-create": {
        language: string;
        custompage: {
            title: string;
            content: string;
            seo?: {
                title?: string;
                description?: string;
                keywords?: string;
            };
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "custompage-delete": {
        language: string;
        id_list: Array<number>;
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "custompage-read": {
        language: string;
        custompage_id?: number;
        fields?: Array<string>;
        pagination?: {
            current_page?: number;
            page_size?: number;
        };
    };
    "custompage-update": {
        language: string;
        custompage: {
            custompage_id: number;
            title?: string;
            content?: string;
            seo?: {
                title?: string;
                description?: string;
                keywords?: string;
            };
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "bloggroup-create": {
        language: string;
        bloggroup: {
            group_name: string;
            tags: Array<string>;
            brief_description?: string;
            seo?: {
                title?: string;
                description?: string;
                keywords?: string;
            };
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "bloggroup-delete": {
        language: string;
        id_list: Array<number>;
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "bloggroup-read": {
        language: string;
        bloggroup_id?: number;
        fields?: Array<string>;
        pagination?: {
            current_page: number;
            page_size: number;
        };
    };
    "bloggroup-update": {
        language: string;
        bloggroup: {
            bloggroup_id: number;
            group_name?: string;
            tags?: Array<string>;
            brief_description?: string;
            seo?: {
                title?: string;
                description?: string;
                keywords?: string;
            };
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "faq-create": {
        language: string;
        faq: {
            faqgroup_id: number;
            cover_image?: {
                name?: string;
                base64?: string;
            };
            question: string;
            tags: Array<string>;
            summary: string;
            answer: string;
            seo?: {
                title?: string;
                description?: string;
                keywords?: string;
            };
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "faq-delete": {
        language: string;
        id_list: Array<number>;
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "faq-read": {
        language: string;
        faq_id?: number;
        faqgroup_id?: number;
        fields?: Array<string>;
        pagination?: {
            current_page: number;
            page_size: number;
        };
    };
    "faq-update": {
        language: string;
        faq: {
            faq_id: number;
            faqgroup_id?: number;
            cover_image?: Partial<ImageUpload>;
            question?: string;
            tags?: Array<string>;
            summary?: string;
            answer?: string;
            seo?: SeoMetadata;
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "faqgroup-create": {
        language: string;
        faqgroup: {
            group_name: string;
            brief_description?: string;
            seo?: SeoMetadata;
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "faqgroup-delete": {
        language: string;
        id_list: Array<number>;
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "faqgroup-read": {
        language: string;
        faqgroup_id?: number;
        fields?: Array<string>;
        pagination?: {
            current_page: number;
            page_size: number;
        };
    };
    "faqgroup-update": {
        language: string;
        faqgroup: {
            faqgroup_id: number;
            group_name?: string;
            brief_description?: string;
            seo?: SeoMetadata;
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "inquiry-read": {
        language?: string;
        recent_days?: number;
        fields?: Array<string>;
        pagination?: {
            current_page: number;
            page_size: number;
        };
    };
    "keywords-rank": {
        keywords?: string;
        rank?: number;
        pagination?: {
            current_page: number;
            page_size: number;
        };
    };
    "languages-get": {};
    "links-list": {
        language: string;
        type?: "main" | "products" | "membergroup" | "news" | "newsgroup" | "blog" | "bloggroup" | "faq" | "faqgroup" | "cases" | "casesgroup" | "exhibition" | "exhibitiongroup" | "mybar" | "certificate" | "pdf" | "doc" | "docx" | "xls" | "xlsx" | "rar" | "zip";
    };
    "navigation-create": {
        language: string;
        navigation: {
            navigation_id?: number;
            parent_navigation_id?: number;
            name: string;
            url: string;
            system_children_type?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
            content?: string;
            open_in_new_window?: boolean;
            sort?: number;
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "navigation-delete": {
        language: string;
        id_list: Array<number>;
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "navigation-read": {
        language: string;
        navigation_id?: number;
        parent_navigation_id?: number;
        fields?: Array<string>;
    };
    "navigation-update": {
        language: string;
        navigation: {
            navigation_id: number;
            parent_navigation_id?: number;
            name?: string;
            url?: string;
            system_children_type?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
            content?: string;
            open_in_new_window?: boolean;
            sort?: number;
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "news-create": {
        language: string;
        news: {
            news_id?: number;
            newsgroup_id: number;
            publisher?: string;
            publication_date: string;
            source?: string;
            title: string;
            cover_image?: {
                name?: string;
                base64?: string;
            };
            tags: Array<string>;
            summary: string;
            description: string;
            seo?: {
                title?: string;
                description?: string;
                keywords?: string;
            };
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "news-delete": {
        language: string;
        id_list: Array<number>;
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "news-read": {
        language: string;
        news_id?: number;
        newsgroup_id?: number;
        fields?: Array<string>;
    };
    "news-update": {
        language: string;
        news: {
            news_id: number;
            newsgroup_id?: number;
            publisher?: string;
            publication_date?: string;
            source?: string;
            title?: string;
            cover_image?: {
                name?: string;
                base64?: string;
            };
            tags?: Array<string>;
            summary?: string;
            description?: string;
            seo?: {
                title?: string;
                description?: string;
                keywords?: string;
            };
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "newsgroup-create": {
        language: string;
        newsgroup: {
            newsgroup_id?: number;
            group_name: string;
            tags: Array<string>;
            brief_description?: string;
            seo?: {
                title?: string;
                description?: string;
                keywords?: string;
            };
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "newsgroup-delete": {
        language: string;
        id_list: Array<number>;
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "newsgroup-read": {
        language: string;
        newsgroup_id?: number;
        fields?: Array<string>;
    };
    "newsgroup-update": {
        language: string;
        newsgroup: {
            newsgroup_id: number;
            group_name?: string;
            tags?: Array<string>;
            brief_description?: string;
            seo?: {
                title?: string;
                description?: string;
                keywords?: string;
            };
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "products-create": {
        language: string;
        products: {
            productsgroup_id: number;
            product_name: string;
            model?: string;
            upload_images: Array<{
                name: string;
                base64: string;
            }>;
            attributes?: Array<{
                name: string;
                value: string;
            }>;
            tags: Array<string>;
            brief_description: string;
            description: string;
            seo?: {
                title?: string;
                description?: string;
                keywords?: string;
            };
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "page-generation-definition": {
        pageName: string;
    };
    "page-html": {
        language: string;
        pageName: string;
        layouts?: PageLayouts;
        css?: PageCss;
    };
    "page-list": {};
    "page-save": {
        language: string;
        pageName: string;
        layouts: PageLayouts;
        css?: PageCss;
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "products-delete": {
        language: string;
        id_list: Array<number>;
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "products-read": {
        language: string;
        products_id?: number;
        productsgroup_id?: number;
        fields?: Array<string>;
        pagination?: {
            current_page: number;
            page_size: number;
        };
    };
    "products-update": {
        language: string;
        products: {
            products_id: number;
            productsgroup_id?: number;
            product_name?: string;
            model?: string;
            upload_images?: Array<{
                name: string;
                base64: string;
            }>;
            attributes?: Array<{
                name: string;
                value: string;
            }>;
            tags?: Array<string>;
            brief_description?: string;
            description?: string;
            seo?: {
                title?: string;
                description?: string;
                keywords?: string;
            };
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "productsgroup-create": {
        language: string;
        productsgroup: {
            parent_productsgroup_id?: number;
            group_name: string;
            tags: Array<string>;
            brief_description?: string;
            seo?: SeoMetadata;
            section?: {
                top?: string;
                bottom?: string;
            };
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "productsgroup-delete": {
        language: string;
        id_list: Array<number>;
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "productsgroup-read": {
        language: string;
        parent_productsgroup_id?: number;
        productsgroup_id?: number;
        fields?: Array<string>;
    };
    "productsgroup-update": {
        language: string;
        productsgroup: {
            productsgroup_id: number;
            group_name?: string;
            tags?: Array<string>;
            brief_description?: string;
            section?: {
                top?: string;
                bottom?: string;
            };
            seo?: {
                title?: string;
                description?: string;
                keywords?: string;
            };
        };
        confirmation: {
            approved: boolean;
            summary: string;
        };
    };
    "rule-get": {
        language: string;
        scene: "navigation.content" | "news.description" | "blog.description" | "faq.answer" | "products.description" | "productsgroup.section.top" | "productsgroup.section.bottom" | "custompage.content";
    };
    "visitor-recent": {
        ip?: string;
        pagination?: {
            current_page: number;
            page_size: number;
        };
    };
}
export type ActionName = keyof ActionInputs;
export type ActionRequest = {
    [K in ActionName]: {
        action: K;
    } & ActionInputs[K];
}[ActionName];
type PartialInput<T> = T extends readonly (infer U)[] ? PartialInput<U>[] : T extends object ? {
    [P in keyof T]?: P extends "css" ? T[P] : PartialInput<T[P]>;
} : T;
export type ActionArguments<K extends ActionName> = PartialInput<ActionInputs[K]> & {
    current_page?: number;
    page_size?: number;
};
