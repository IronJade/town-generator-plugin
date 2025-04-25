# Obsidian Town Generator

A procedural fantasy town and city generator for your worldbuilding and RPG campaigns in Obsidian.

![Town Generator Preview](https://github.com/IronJade/town-generator/assets/banner-image.png)

## Features

- **Procedural Generation**: Create unique fantasy towns and cities with varied layouts and districts
- **Multiple Town Sizes**: From small villages to sprawling metropolises
- **Customizable Seeds**: Use specific seeds to recreate towns or generate random ones
- **Export to Notes**: Save generated towns as Obsidian notes with embedded maps
- **District Information**: Automatically adds district details and notable locations
- **Quick Commands**: Generate different sized settlements with keyboard shortcuts

## Usage

### Generating Towns

1. Click the map icon in the ribbon or use the command palette to open the Town Generator
2. Select a town size from the dropdown menu
3. (Optional) Enter a specific seed number or leave blank for random generation
4. Click "Generate" to create your town
5. Export to a note with the "Export to Note" button

### Town Sizes

- **Small Town (6-9)**: Simple settlement with basic districts
- **Large Town (10-14)**: Growing town with diverse districts
- **Small City (15-23)**: Established city with walls and specialized districts
- **Large City (24-39)**: Sprawling city with complex layout
- **Metropolis (40+)**: Massive urban center

### Commands

- `Open Town Generator`: Opens the town generator view
- `Generate Small Town`: Quickly generates a small town (size 8)
- `Generate Large Town`: Quickly generates a large town (size 12)
- `Generate Small City`: Quickly generates a small city (size 20)
- `Generate Large City`: Quickly generates a large city (size 30)

## Settings

- **Default Town Size**: Set the default size for town generation
- **Show District Labels**: Toggle displaying labels for districts on the map
- **Default Palette**: Choose the color scheme for town maps
  - Options include: Default, Blueprint, Black & White, Ink, Night, Ancient, and Color

## Installation

### From Obsidian Community Plugins

1. Open Obsidian Settings
2. Go to Community plugins and turn off "Restricted mode"
3. Click "Browse" and search for "Town Generator"
4. Install the plugin and enable it

### Manual Installation

1. Download the latest release from the [releases page](https://github.com/IronJade/town-generator/releases)
2. Extract the downloaded ZIP file
3. Move the extracted folder to your Obsidian vault's `.obsidian/plugins/` directory
4. Enable the plugin in Obsidian's settings

## Development

### Prerequisites

- Node.js and npm

### Setup

```bash
# Clone the repository
git clone https://github.com/IronJade/town-generator.git

# Navigate to the plugin directory
cd town-generator

# Install dependencies
npm install

# Build the plugin
npm run build
```

## Credits

- Uses an OpenFL-based procedural town generator
- Font: IM FELL Great Primer Roman and Share Tech

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have feature requests, please file an issue on the [GitHub repository](https://github.com/IronJade/town-generator/issues).