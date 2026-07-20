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

export class ThemeBuilder {
  private state: ThemeBuilderState;
  private history: ThemeBuilderState[] = [];
  private historyIndex: number = -1;

  constructor(initialState: ThemeBuilderState) {
    this.state = JSON.parse(JSON.stringify(initialState));
    this.pushHistory();
  }

  private pushHistory() {
    // Truncate future stack if acting after undo
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(JSON.parse(JSON.stringify(this.state)));
    this.historyIndex = this.history.length - 1;
    this.state.updatedAt = new Date().toISOString();
  }

  getState(): ThemeBuilderState {
    return JSON.parse(JSON.stringify(this.state));
  }

  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  undo(): ThemeBuilderState {
    if (this.canUndo()) {
      this.historyIndex--;
      this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
    }
    return this.getState();
  }

  redo(): ThemeBuilderState {
    if (this.canRedo()) {
      this.historyIndex++;
      this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
    }
    return this.getState();
  }

  addSection(type: SectionType, defaultSettings: Record<string, any> = {}): SectionInstance {
    const newSection: SectionInstance = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      settings: defaultSettings,
      blocks: [],
    };
    this.state.sections.push(newSection);
    this.pushHistory();
    return newSection;
  }

  removeSection(sectionId: string): boolean {
    const idx = this.state.sections.findIndex((s) => s.id === sectionId);
    if (idx !== -1) {
      this.state.sections.splice(idx, 1);
      this.pushHistory();
      return true;
    }
    return false;
  }

  reorderSections(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.state.sections.length || toIndex < 0 || toIndex >= this.state.sections.length) {
      return;
    }
    const [moved] = this.state.sections.splice(fromIndex, 1);
    this.state.sections.splice(toIndex, 0, moved);
    this.pushHistory();
  }

  updateSectionSettings(sectionId: string, newSettings: Record<string, any>): boolean {
    const section = this.state.sections.find((s) => s.id === sectionId);
    if (section) {
      section.settings = { ...section.settings, ...newSettings };
      this.pushHistory();
      return true;
    }
    return false;
  }

  updateGlobalSettings(newSettings: Record<string, any>): void {
    this.state.globalSettings = { ...this.state.globalSettings, ...newSettings };
    this.pushHistory();
  }

  exportConfig(): string {
    return JSON.stringify(this.state, null, 2);
  }

  importConfig(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.sections && Array.isArray(parsed.sections)) {
        this.state = parsed;
        this.pushHistory();
        return true;
      }
    } catch {}
    return false;
  }
}
