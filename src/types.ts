export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue | undefined };

export type PageCss = Record<number, string>;

export type PageLayouts = unknown[];

export interface ImageUpload {
    name: string;
    base64: string;
}

export interface SeoMetadata {
    title?: string;
    description?: string;
    keywords?: string;
}

export interface ProductAttribute {
    name: string;
    value: string;
}

export interface PageSection {
    top?: string;
    bottom?: string;
}

export interface Confirmation {
    approved?: boolean;
    summary?: string;
}

export type { ActionRequest as TradebeeRequest } from "./action-types.js";

export interface TradebeeResult extends Record<string, unknown> {
    status: boolean;
    msg: string;
    data?: unknown;
    backup?: unknown;
}

export type PlainObject = Record<string, unknown>;
