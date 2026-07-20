export type SectionType = "hero" | "featured-products" | "collections" | "image-banner" | "gallery" | "newsletter" | "faq" | "brands" | "testimonials" | "rich-text" | "product-grid" | "recently-viewed" | "recommendations" | "custom-html";
export type BlockType = "text" | "heading" | "button" | "image" | "video" | "icons" | "product-card" | "collection-card" | "countdown" | "social-links" | "divider";
export interface SettingSchema {
    id: string;
    type: "text" | "number" | "color" | "select" | "checkbox" | "image" | "url";
    label: string;
    default: any;
    options?: {
        label: string;
        value: string;
    }[];
}
export interface BlockDefinition {
    type: BlockType;
    name: string;
    limit?: number;
    settings: SettingSchema[];
}
export interface SectionDefinition {
    type: SectionType;
    name: string;
    description?: string;
    maxBlocks?: number;
    settings: SettingSchema[];
    blocks?: BlockDefinition[];
}
export declare const CORE_SECTIONS: Record<SectionType, SectionDefinition>;
