import { App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, addIcon } from 'obsidian';
import { TownGeneratorView, VIEW_TYPE_TOWN_GENERATOR } from './ui/TownView';
import { TownGeneratorSettingsTab } from './ui/SettingsTab';

interface TownGeneratorSettings {
    defaultSize: number;
    defaultSeed: number;
    showLabels: boolean;
    defaultPalette: string;
}

const DEFAULT_SETTINGS: TownGeneratorSettings = {
    defaultSize: 15,
    defaultSeed: -1,
    showLabels: true,
    defaultPalette: 'DEFAULT'
}

export default class TownGeneratorPlugin extends Plugin {
    settings: TownGeneratorSettings;

    async onload() {
        await this.loadSettings();

        // Register view
        this.registerView(
            VIEW_TYPE_TOWN_GENERATOR,
            (leaf) => new TownGeneratorView(leaf, this)
        );

        // Add ribbon icon
        this.addRibbonIcon('map', 'Generate Town', () => {
            this.activateTownGeneratorView();
        });

        // Add commands
        this.addCommand({
            id: 'open-town-generator',
            name: 'Open Town Generator',
            callback: () => this.activateTownGeneratorView()
        });

        this.addCommand({
            id: 'generate-small-town',
            name: 'Generate Small Town',
            callback: () => this.generateTownWithSize(8)
        });

        this.addCommand({
            id: 'generate-large-town',
            name: 'Generate Large Town',
            callback: () => this.generateTownWithSize(12)
        });

        this.addCommand({
            id: 'generate-small-city',
            name: 'Generate Small City',
            callback: () => this.generateTownWithSize(20)
        });

        this.addCommand({
            id: 'generate-large-city',
            name: 'Generate Large City',
            callback: () => this.generateTownWithSize(30)
        });

        // Add settings tab
        this.addSettingTab(new TownGeneratorSettingsTab(this.app, this));
    }

    onunload() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_TOWN_GENERATOR);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async activateTownGeneratorView() {
        const { workspace } = this.app;
        
        let leaf = workspace.getLeavesOfType(VIEW_TYPE_TOWN_GENERATOR)[0];
        
        if (!leaf) {
            leaf = workspace.getLeaf('split', 'vertical');
            await leaf.setViewState({
                type: VIEW_TYPE_TOWN_GENERATOR,
                active: true
            });
        }
        
        workspace.revealLeaf(leaf);
    }

    async generateTownWithSize(size: number) {
        await this.activateTownGeneratorView();
        
        // Get the view
        const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_TOWN_GENERATOR)[0];
        if (leaf) {
            const view = leaf.view as TownGeneratorView;
            view.generateTown(size, this.settings.defaultSeed);
        }
    }
}