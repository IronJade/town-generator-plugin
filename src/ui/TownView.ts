import { ItemView, WorkspaceLeaf, TFile, Menu, Notice } from 'obsidian';
import TownGeneratorPlugin from '../../main';

export const VIEW_TYPE_TOWN_GENERATOR = 'town-generator-view';

export class TownGeneratorView extends ItemView {
    private plugin: TownGeneratorPlugin;
    private iframe: HTMLIFrameElement;
    private controlsEl: HTMLElement;
    private loadingEl: HTMLElement;
    private isGeneratorReady: boolean = false;
    private lastTownData: any = null;
    private lastImageData: string | null = null;
    private currentSize: number = 0;
    private currentSeed: number = 0;

    constructor(leaf: WorkspaceLeaf, plugin: TownGeneratorPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE_TOWN_GENERATOR;
    }

    getDisplayText(): string {
        return 'Town Generator';
    }

    async onOpen() {
        // Create container elements
        const container = this.contentEl.createDiv({ cls: 'town-generator-container' });
        this.controlsEl = container.createDiv({ cls: 'town-generator-controls' });
        
        // Create iframe for the OpenFL app
        this.iframe = document.createElement('iframe');
        this.iframe.className = 'town-generator-iframe';
        this.iframe.style.width = '100%';
        this.iframe.style.height = 'calc(100% - 40px)';  // Adjust for controls height
        this.iframe.style.border = 'none';
        this.iframe.style.backgroundColor = '#f5f5f5';
        
        // Set iframe source to the OpenFL app
        const openflPath = this.plugin.manifest.dir + '/openfl/index.html';
        this.iframe.src = openflPath;
        
        container.appendChild(this.iframe);
        
        // Create loading indicator
        this.loadingEl = container.createDiv({ cls: 'town-generator-loading' });
        this.loadingEl.innerHTML = `
            <div class="town-generator-spinner"></div>
            <div>Initializing generator...</div>
        `;
        
        // Set up message listener for communication with the iframe
        window.addEventListener('message', this.handleMessage.bind(this));
        
        // Create controls
        this.createControls();
        
        // Handle right-click for context menu
        container.addEventListener('contextmenu', (event: MouseEvent) => {
            if (this.lastTownData) {
                event.preventDefault();
                this.showContextMenu(event);
            }
        });
    }

    async onClose() {
        window.removeEventListener('message', this.handleMessage.bind(this));
    }

    private handleMessage(event: MessageEvent) {
        // Only accept messages from our iframe
        if (event.source !== this.iframe.contentWindow) return;
        
        const data = event.data;
        
        switch (data.type) {
            case 'generatorReady':
                this.isGeneratorReady = true;
                this.loadingEl.style.display = 'none';
                
                // Generate a town with default settings on load
                this.generateTown(this.plugin.settings.defaultSize, this.plugin.settings.defaultSeed);
                break;
                
            case 'townGenerated':
                this.loadingEl.style.display = 'none';
                this.lastTownData = data.town;
                this.lastImageData = data.image;
                
                // Validate town generation
                if (!this.lastImageData) {
                    new Notice('Failed to generate town image');
                }
                break;
                
            case 'generationError':
                this.loadingEl.style.display = 'none';
                new Notice('Error generating town: ' + data.error);
                break;
        }
    }

    private createControls() {
        this.controlsEl.empty();
        
        // Create size dropdown
        const sizeSelector = this.controlsEl.createEl('select', { cls: 'town-generator-size' });
        
        const sizeOptions = [
            { label: 'Small Town (6-9)', min: 6, max: 9 },
            { label: 'Large Town (10-14)', min: 10, max: 14 },
            { label: 'Small City (15-23)', min: 15, max: 23 },
            { label: 'Large City (24-39)', min: 24, max: 39 },
            { label: 'Metropolis (40+)', min: 40, max: 45 }
        ];
        
        sizeOptions.forEach(opt => {
            const option = sizeSelector.createEl('option', { 
                text: opt.label,
                value: JSON.stringify(opt)
            });
            
            // Set default selection based on settings
            if (this.plugin.settings.defaultSize >= opt.min && 
                this.plugin.settings.defaultSize <= opt.max) {
                option.selected = true;
            }
        });
        
        // Generate button
        const generateBtn = this.controlsEl.createEl('button', { 
            cls: 'town-generator-btn',
            text: 'Generate' 
        });
        
        generateBtn.addEventListener('click', () => {
            const selectedOption = JSON.parse(sizeSelector.value);
            const size = Math.floor(selectedOption.min + 
                          Math.random() * (selectedOption.max - selectedOption.min + 1));
            this.generateTown(size, -1); // -1 for random seed
        });
        
        // Random seed checkbox
        const seedContainer = this.controlsEl.createEl('div', { cls: 'town-generator-seed-container' });
        
        const seedLabel = seedContainer.createEl('span', { text: 'Seed: ' });
        const seedInput = seedContainer.createEl('input', { 
            cls: 'town-generator-seed',
            type: 'number',
            value: this.plugin.settings.defaultSeed.toString()
        });
        
        seedInput.addEventListener('change', () => {
            const seed = parseInt(seedInput.value);
            this.plugin.settings.defaultSeed = isNaN(seed) ? -1 : seed;
            this.plugin.saveSettings();
        });
        
        // Export button
        const exportBtn = this.controlsEl.createEl('button', {
            cls: 'town-generator-btn',
            text: 'Export to Note'
        });
        
        exportBtn.addEventListener('click', () => {
            this.createTownNote();
        });
    }

    public generateTown(size: number, seed: number = -1) {
        if (!this.isGeneratorReady) {
            new Notice('Town generator is not yet ready. Please wait...');
            return;
        }
        
        this.loadingEl.style.display = 'flex';
        
        // Save current parameters
        this.currentSize = size;
        this.currentSeed = seed;
        
        // Generate a random seed if none provided
        if (seed === -1) {
            seed = Math.floor(Math.random() * 1000000);
            this.currentSeed = seed;
        }
        
        // Send message to OpenFL app
        this.iframe.contentWindow?.postMessage({
            type: 'generateTown',
            size: size,
            seed: seed,
            showLabels: this.plugin.settings.showLabels,
            palette: this.plugin.settings.defaultPalette
        }, '*');
    }

    private showContextMenu(event: MouseEvent) {
        const menu = new Menu();
        
        menu.addItem(item => {
            item.setTitle('Export to Note')
                .setIcon('document')
                .onClick(() => this.createTownNote());
        });
        
        menu.addItem(item => {
            item.setTitle('Copy Seed')
                .setIcon('clipboard-copy')
                .onClick(() => {
                    navigator.clipboard.writeText(this.currentSeed.toString());
                    new Notice('Seed copied to clipboard');
                });
        });
        
        menu.addItem(item => {
            item.setTitle('Regenerate with New Seed')
                .setIcon('reset')
                .onClick(() => this.generateTown(this.currentSize, -1));
        });
        
        menu.showAtMouseEvent(event);
    }

    private async createTownNote() {
        if (!this.lastImageData || !this.lastTownData) {
            new Notice('No town data available');
            return;
        }
        
        try {
            // Generate town name
            const townType = this.getTownTypeName(this.currentSize);
            const townName = this.generateTownName();
            const fileName = `${townName} - ${townType}.md`;
            
            // Create image file
            const imageFileName = `${townName.replace(/\s+/g, '-').toLowerCase()}-map.png`;
            const imageData = this.lastImageData.replace(/^data:image\/png;base64,/, '');
            await this.saveBase64AsFile(imageData, imageFileName);
            
            // Generate town content
            let content = `# ${townName} - ${townType}\n\n`;
            content += `![[${imageFileName}]]\n\n`;
            content += `## Town Information\n`;
            content += `- **Size**: ${this.currentSize}\n`;
            content += `- **Seed**: ${this.currentSeed}\n\n`;
            
            // Add town districts
            content += `## Districts\n`;
            if (this.lastTownData.districts) {
                Object.entries(this.lastTownData.districts).forEach(([name, count]) => {
                    content += `- ${name}: ${count}\n`;
                });
            }
            
            // Add notable locations and points of interest
            content += `\n## Notable Locations\n`;
            content += this.generateNotableLocations();
            
            // Create the note
            const file = await this.app.vault.create(fileName, content);
            
            // Open the file
            await this.app.workspace.getLeaf().openFile(file);
            
            new Notice(`Town note created: ${fileName}`);
        } catch (error) {
            console.error('Error creating town note:', error);
            new Notice('Error creating town note');
        }
    }

    private getTownTypeName(size: number): string {
        if (size < 10) return "Small Town";
        if (size < 15) return "Large Town";
        if (size < 24) return "Small City";
        if (size < 40) return "Large City";
        return "Metropolis";
    }

    private generateTownName(): string {
        // Simple name generator
        const prefixes = ["North", "South", "East", "West", "New", "Old", "High", "Low", "Great"];
        const roots = ["bridge", "haven", "ford", "crest", "vale", "shire", "wood", "field", "ton", "wick", "mouth", "dale"];
        
        const usePrefixChance = Math.random() < 0.5;
        const prefix = usePrefixChance ? prefixes[Math.floor(Math.random() * prefixes.length)] : "";
        const root = roots[Math.floor(Math.random() * roots.length)];
        
        // Capitalize first letter of root if no prefix
        const processedRoot = usePrefixChance ? root : root.charAt(0).toUpperCase() + root.slice(1);
        
        return (prefix + processedRoot).replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    private generateNotableLocations(): string {
        // Generate some random notable locations based on town type
        const locations = [];
        
        // Add locations based on town data from OpenFL generator
        if (this.lastTownData.districts) {
            if (this.lastTownData.districts['Temple'] > 0) {
                locations.push("## Temple District\n- Grand Cathedral of the Silver Light\n- Shrine of the Moon Goddess");
            }
            
            if (this.lastTownData.districts['Market'] > 0) {
                locations.push("## Market Square\n- The Golden Chalice Inn\n- Blacksmith's Forge\n- Exotic Goods Emporium");
            }
            
            if (this.lastTownData.districts['Castle'] > 0) {
                locations.push("## Castle Ward\n- Lord's Manor\n- Royal Gardens\n- Guard Barracks");
            }
            
            if (this.lastTownData.districts['Slum'] > 0) {
                locations.push("## Lower Ward\n- The Rat's Nest Tavern\n- Abandoned Warehouse\n- Thieves' Guild Hideout (secret)");
            }
        }
        
        // Add generic locations if needed
        if (locations.length === 0) {
            locations.push("## Town Center\n- Town Hall\n- Market Square\n- The Prancing Pony Inn");
        }
        
        return locations.join("\n\n");
    }

    private async saveBase64AsFile(base64Data: string, fileName: string): Promise<TFile> {
        const binaryData = this.base64ToBinary(base64Data);
        return await this.app.vault.createBinary(fileName, binaryData);
    }

    private base64ToBinary(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
}