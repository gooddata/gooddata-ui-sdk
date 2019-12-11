// (C) 2007-2019 GoodData Corporation

/*
 * These types were taken mostly as-is from the @types/backstopjs package. renamed interfaces to start with 'I'
 * removed legacy viewport and removed label and URL as those are added automatically by our storybook => backstop scenarios
 * builder
 */

export interface IKeypressSelector {
    selector: string;
    keyPress: string;
}

/** The Backstop test definition. See https://github.com/garris/BackstopJS#advanced-scenarios */
export interface IBackstopScenarioConfig {
    [key: string]: any; // Allow for custom properties.
    clickSelector?: string; // Click the specified DOM element prior to screenshot
    clickSelectors?: string[]; // Simulates multiple sequential click interactions
    cookiePath?: string; // Import cookies in JSON format
    delay?: number; // Wait for x milliseconds
    expect?: number; // Use with selectorExpansion true to expect number of results found
    hideSelectors?: string[]; // Selectors set to visibility: hidden
    hoverSelector?: string; // Move pointer over the given DOM element prior to screenshot
    hoverSelectors?: string[]; // Simulates multiple sequential hover interactions
    keyPressSelector?: IKeypressSelector; // Press key in the DOM element prior to screenshot
    keyPressSelectors?: IKeypressSelector[]; // Simulates multiple sequential keypress interactions
    misMatchThreshold?: number; // Percentage of different pixels allowed to pass test
    onBeforeScript?: string; // Used to set up browser state e.g. cookies
    onReadyScript?: string; // Used to modify UI state prior to screenshots e.g. hovers, clicks etc
    postInteractionWait?: number; // Wait for selector (ms) after interacting with hover or click
    readyEvent?: string; // Wait until this string has been logged to the console
    readySelector?: string; // Wait until this selector exists before continuing
    referenceUrl?: string; // Specify a different state or environment when creating reference
    removeSelectors?: string[]; // Selectors set to display: none
    requireSameDimensions?: boolean; // If true, any change in selector size will trigger a failure
    selectors?: string[]; // Selectors to capture
    selectorExpansion?: boolean; // If true, take screenshots of all matching selector instances
    scrollToSelector?: string; // Scroll the specified DOM element into view prior to screenshots
    viewports?: Viewport[]; // Override global viewports
}

export type Viewport = IViewportNext;

export interface IViewportNext {
    label: string;
    width: number;
    height: number;
}

export type BackstopConfig = {
    /**
     * Backstop scenario => scenario configuration mapping. Key will be used to name the test scenario.
     */
    [name: string]: IBackstopScenarioConfig;
};
