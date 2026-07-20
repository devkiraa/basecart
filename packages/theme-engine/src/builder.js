"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeBuilder = void 0;
class ThemeBuilder {
    state;
    history = [];
    historyIndex = -1;
    constructor(initialState) {
        this.state = JSON.parse(JSON.stringify(initialState));
        this.pushHistory();
    }
    pushHistory() {
        // Truncate future stack if acting after undo
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        this.history.push(JSON.parse(JSON.stringify(this.state)));
        this.historyIndex = this.history.length - 1;
        this.state.updatedAt = new Date().toISOString();
    }
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }
    canUndo() {
        return this.historyIndex > 0;
    }
    canRedo() {
        return this.historyIndex < this.history.length - 1;
    }
    undo() {
        if (this.canUndo()) {
            this.historyIndex--;
            this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
        }
        return this.getState();
    }
    redo() {
        if (this.canRedo()) {
            this.historyIndex++;
            this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
        }
        return this.getState();
    }
    addSection(type, defaultSettings = {}) {
        const newSection = {
            id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            type,
            settings: defaultSettings,
            blocks: [],
        };
        this.state.sections.push(newSection);
        this.pushHistory();
        return newSection;
    }
    removeSection(sectionId) {
        const idx = this.state.sections.findIndex((s) => s.id === sectionId);
        if (idx !== -1) {
            this.state.sections.splice(idx, 1);
            this.pushHistory();
            return true;
        }
        return false;
    }
    reorderSections(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.state.sections.length || toIndex < 0 || toIndex >= this.state.sections.length) {
            return;
        }
        const [moved] = this.state.sections.splice(fromIndex, 1);
        this.state.sections.splice(toIndex, 0, moved);
        this.pushHistory();
    }
    updateSectionSettings(sectionId, newSettings) {
        const section = this.state.sections.find((s) => s.id === sectionId);
        if (section) {
            section.settings = { ...section.settings, ...newSettings };
            this.pushHistory();
            return true;
        }
        return false;
    }
    updateGlobalSettings(newSettings) {
        this.state.globalSettings = { ...this.state.globalSettings, ...newSettings };
        this.pushHistory();
    }
    exportConfig() {
        return JSON.stringify(this.state, null, 2);
    }
    importConfig(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (parsed.sections && Array.isArray(parsed.sections)) {
                this.state = parsed;
                this.pushHistory();
                return true;
            }
        }
        catch { }
        return false;
    }
}
exports.ThemeBuilder = ThemeBuilder;
