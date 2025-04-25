export {};

// Add your bridge code here if needed, or move it entirely to openfl/bridge.js

// If you need to declare any types for the bridge, you can do it here:
declare global {
    interface Window {
        ObsidianBridge: {
            notifyTownGenerated: (townData: any, imageData: string) => void;
            notifyError: (errorMessage: string) => void;
        };
        lime?: {
            embed: (appName: string, containerId: string, width: number, height: number, params: any) => any;
            app: any;
        };
    }
}