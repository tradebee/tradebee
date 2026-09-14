import type { PageCss, PageLayouts } from "./types.js";

export interface RequestArguments {
    configuredApiKey?: string;
    action?: string;
    uploads?: Array<{
        name?: string;
        base64?: string;
    }>;
    pageName?: string;
    layouts?: PageLayouts;
    css?: PageCss;
    type?: "main" | "products" | "membergroup" | "news" | "newsgroup" | "blog" | "bloggroup" | "faq" | "faqgroup" | "cases" | "casesgroup" | "exhibition" | "exhibitiongroup" | "mybar" | "certificate" | "pdf" | "doc" | "docx" | "xls" | "xlsx" | "rar" | "zip";
    blog?: {
        blog_id?: number;
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
    blog_id?: number;
    bloggroup?: {
        bloggroup_id?: number;
        group_name?: string;
        tags?: Array<string>;
        brief_description?: string;
        seo?: {
            title?: string;
            description?: string;
            keywords?: string;
        };
    };
    bloggroup_id?: number;
    faq?: {
        faq_id?: number;
        faqgroup_id?: number;
        cover_image?: {
            name?: string;
            base64?: string;
        };
        question?: string;
        tags?: Array<string>;
        summary?: string;
        answer?: string;
        seo?: {
            title?: string;
            description?: string;
            keywords?: string;
        };
    };
    faq_id?: number;
    faqgroup?: {
        faqgroup_id?: number;
        group_name?: string;
        brief_description?: string;
        seo?: {
            title?: string;
            description?: string;
            keywords?: string;
        };
    };
    faqgroup_id?: number;
    custompage?: {
        custompage_id?: number;
        title?: string;
        content?: string;
        seo?: {
            title?: string;
            description?: string;
            keywords?: string;
        };
    };
    custompage_id?: number;
    news?: {
        news_id?: number;
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
    news_id?: number;
    newsgroup?: {
        newsgroup_id?: number;
        group_name?: string;
        tags?: Array<string>;
        brief_description?: string;
        seo?: {
            title?: string;
            description?: string;
            keywords?: string;
        };
    };
    newsgroup_id?: number;
    navigation?: {
        navigation_id?: number;
        parent_navigation_id?: number;
        name?: string;
        url?: string;
        system_children_type?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
        content?: string;
        open_in_new_window?: boolean;
        sort?: number;
    };
    navigation_id?: number;
    parent_navigation_id?: number;
    confirmation?: {
        approved?: boolean;
        summary?: string;
    };
    fields?: Array<string>;
    id_list?: Array<number>;
    ip?: string;
    keywords?: string;
    language?: string;
    pagination?: {
        current_page?: number;
        page_size?: number;
    };
    parent_productsgroup_id?: number;
    products?: {
        products_id?: number;
        productsgroup_id?: number;
        product_name?: string;
        model?: string;
        upload_images?: Array<{
            name?: string;
            base64?: string;
        }>;
        attributes?: Array<{
            name?: string;
            value?: string;
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
    products_id?: number;
    productsgroup?: {
        productsgroup_id?: number;
        parent_productsgroup_id?: number;
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
    productsgroup_id?: number;
    rank?: number;
    recent_days?: number;
    scene?: "navigation.content" | "news.description" | "blog.description" | "faq.answer" | "products.description" | "productsgroup.section.top" | "productsgroup.section.bottom" | "custompage.content";
    current_page?: number;
    page_size?: number;
}
