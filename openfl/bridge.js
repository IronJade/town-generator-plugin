(function() {
    // Store the original lime.embed function
    const originalEmbed = window.lime?.embed;
    
    // Keep a reference to the OpenFL application instance
    let townGenerator = null;
    
    // Override the lime.embed function to capture the application instance
    if (window.lime) {
        window.lime.embed = function(appName, containerId, width, height, params) {
            // Call the original function
            const result = originalEmbed(appName, containerId, width, height, params);
            
            // Store the application instance
            townGenerator = window.lime.app;
            
            // Notify the parent (Obsidian plugin) that the generator is ready
            setTimeout(() => {
                parent.postMessage({ type: 'generatorReady' }, '*');
            }, 1000); // Give it a second to fully initialize
            
            return result;
        };
    }
    
    // Listen for messages from Obsidian plugin
    window.addEventListener('message', function(event) {
        // For security, you should check the origin of the message
        // if (event.origin !== "app://obsidian.md") return;
        
        const data = event.data;
        
        if (data.type === 'generateTown') {
            try {
                // Call the OpenFL generator functions
                generateTown(data.size, data.seed, data.showLabels, data.palette);
            } catch (error) {
                console.error('Error generating town:', error);
                parent.postMessage({ 
                    type: 'generationError',
                    error: error.message 
                }, '*');
            }
        }
    });
    
    // Function to generate a town
    function generateTown(size, seed, showLabels, palette) {
        if (!townGenerator) {
            throw new Error('Town generator not initialized');
        }
        
        try {
            // This part will depend on the specific API of your OpenFL town generator
            // These are example calls - you'll need to adjust based on your actual implementation
            
            // Set parameters
            townGenerator.setSeed(seed);
            townGenerator.setSize(size);
            townGenerator.setShowLabels(showLabels);
            townGenerator.setPalette(palette);
            
            // Generate town
            const townData = townGenerator.generateTown();
            
            // Get the map as an image
            const imageData = townGenerator.getMapAsBase64();
            
            // Send the generated town back to Obsidian
            parent.postMessage({
                type: 'townGenerated',
                town: townData,
                image: imageData
            }, '*');
        } catch (error) {
            console.error('Error in town generation:', error);
            parent.postMessage({ 
                type: 'generationError',
                error: error.message 
            }, '*');
        }
    }
    
    // Export functions for direct use from OpenFL
    window.ObsidianBridge = {
        notifyTownGenerated: function(townData, imageData) {
            parent.postMessage({
                type: 'townGenerated',
                town: townData,
                image: imageData
            }, '*');
        },
        
        notifyError: function(errorMessage) {
            parent.postMessage({ 
                type: 'generationError',
                error: errorMessage 
            }, '*');
        }
    };
})();