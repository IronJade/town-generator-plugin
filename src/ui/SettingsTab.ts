import { App, PluginSettingTab, Setting } from 'obsidian';
import TownGeneratorPlugin from '../main';

export class TownGeneratorSettingsTab extends PluginSettingTab {
    plugin: TownGeneratorPlugin;

    constructor(app: App, plugin: TownGeneratorPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Town Generator Settings' });

        new Setting(containerEl)
            .setName('Default Town Size')
            .setDesc('Default size for generated towns (6-40)')
            .addSlider(slider => slider
                .setLimits(6, 40, 1)
                .setValue(this.plugin.settings.defaultSize)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.defaultSize = value;
                    await this.plugin.saveSettings();
                }))
            .addExtraButton(button => button
                .setIcon('reset')
                .setTooltip('Reset to default (15)')
                .onClick(async () => {
                    this.plugin.settings.defaultSize = 15;
                    await this.plugin.saveSettings();
                    this.display();
                }));

        new Setting(containerEl)
            .setName('Show District Labels')
            .setDesc('Show labels for districts on the map')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showLabels)
                .onChange(async (value) => {
                    this.plugin.settings.showLabels = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Default Palette')
            .setDesc('Color scheme for town maps')
            .addDropdown(dropdown => {
                dropdown
                    .addOption('DEFAULT', 'Default')
                    .addOption('BLUEPRINT', 'Blueprint')
                    .addOption('BW', 'Black & White')
                    .addOption('INK', 'Ink')
                    .addOption('NIGHT', 'Night')
                    .addOption('ANCIENT', 'Ancient')
                    .addOption('COLOUR', 'Color')
                    .setValue(this.plugin.settings.defaultPalette)
                    .onChange(async (value) => {
                        this.plugin.settings.defaultPalette = value;
                        await this.plugin.saveSettings();
                    });
            });

        containerEl.createEl('h3', { text: 'About Town Generator' });
        
        const aboutEl = containerEl.createDiv();
        aboutEl.innerHTML = `
            <p>This plugin uses an OpenFL-based procedural town generator 
            to create detailed fantasy town and city maps for your worldbuilding 
            and RPG campaigns.</p>
            <p>The generator creates different types of settlements:</p>
            <ul>
                <li><strong>Small Town (6-9)</strong>: Simple settlement with basic districts</li>
                <li><strong>Large Town (10-14)</strong>: Growing town with diverse districts</li>
                <li><strong>Small City (15-23)</strong>: Established city with walls and specialized districts</li>
                <li><strong>Large City (24-39)</strong>: Sprawling city with complex layout</li>
                <li><strong>Metropolis (40+)</strong>: Massive urban center</li>
            </ul>
        `;
    }
}