import { SectionType, BlockType } from "./sections.js";
export interface SectionInstance {
    id: string;
    type: SectionType;
    settings: Record<string, any>;
    blocks?: BlockInstance[];
}
export interface BlockInstance {
    id: string;
    type: BlockType;
    settings: Record<string, any>;
}
export interface ThemeBuilderState {
    themeId: string;
    templateName: string;
    sections: SectionInstance[];
    globalSettings: Record<string, any>;
    updatedAt: string;
}
export declare class ThemeBuilder {
    private state;
    private history;
    private historyIndex;
    constructor(initialState: ThemeBuilderState);
    private pushHistory;
    getState(): ThemeBuilderState;
    canUndo(): boolean;
    canRedo(): boolean;
    undo(): ThemeBuilderState;
    redo(): ThemeBuilderState;
    addSection(type: SectionType, defaultSettings?: Record<string, any>): SectionInstance;
    removeSection(sectionId: string): boolean;
    reorderSections(fromIndex: number, toIndex: number): void;
    updateSectionSettings(sectionId: string, newSettings: Record<string, any>): boolean;
    updateGlobalSettings(newSettings: Record<string, any>): void;
    exportConfig(): string;
    importConfig(jsonString: string): boolean;
}
