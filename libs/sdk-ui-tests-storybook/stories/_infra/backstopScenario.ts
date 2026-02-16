// (C) 2007-2026 GoodData Corporation

// todo: MKN uncomment all commented code when merging new browser alias
export enum BrowserAlias {
    Chromium = "chromium", // regular chromium, very stable rendering
    // ChromiumSwiftShader = "chromium_swiftshader", // chromium with SwiftShader, slightly less stable rendering
    Firefox = "firefox", // regular firefox, most stable rendering
}

export interface IViewport {
    label: string;
    width: number;
    height: number;
}

export enum State {
    Attached = "attached",
    Detached = "detached",
    Visible = "visible",
    Hidden = "hidden",
}

export interface IReadySelector {
    selector: string;
    state: State;
}

export interface IDelay {
    postReady?: number;
    postOperation?: number;
}

export interface IKeyPressSelector {
    keyPress: string;
    selector: string;
}

export interface ISelectorWithBeforeAfterDelay {
    selector: string;
    waitBefore?: number;
    waitAfter?: number;
}

export interface ISelectorThenDelay {
    selector?: string;
    delay?: number;
}

/** The Backstop test definition. See https://github.com/gooddata/gooddata-neobackstop/tree/master/scenario/types.go */
export interface INeobackstopScenarioConfig {
    /**
     * Test the scenario with the specified browsers
     */
    browsers?: BrowserAlias[];

    /**
     * Override global viewports
     */
    viewports?: IViewport[];

    /**
     * Wait until this selector exists before continuing
     */
    readySelector?: IReadySelector;

    /**
     * Reload the page after the ready selector is found
     */
    reloadAfterReady?: boolean;

    /**
     * Wait for x milliseconds
     */
    delay?: IDelay;

    /**
     * Press key in the DOM element prior to screenshot
     */
    keyPressSelector?: IKeyPressSelector;

    /**
     * Move pointer over the given DOM element prior to screenshot
     */
    hoverSelector?: string;

    /**
     * Simulates multiple sequential hover interactions.
     *
     * Array of objects with explicit timing:
     * - `selector`: CSS selector to hover
     * - `waitBefore`: (optional) delay in ms before hovering
     * - `waitAfter`: (optional) delay in ms after hovering
     *
     * Example: [ \{ selector: 'selector-1', waitAfter: 200 \}, \{ selector: 'selector-2' \} ]
     * Results in: hover selector-1, wait 200ms, hover selector-2
     *
     * Note: postInteractionWait is applied after these operations complete.
     */
    hoverSelectors?: ISelectorWithBeforeAfterDelay[];

    /**
     * Click the specified DOM element prior to screenshot
     */
    clickSelector?: string;

    /**
     * Simulates multiple sequential click interactions.
     *
     * Array of objects with explicit timing:
     * - `selector`: CSS selector to click
     * - `waitBefore`: (optional) delay in ms before clicking
     * - `waitAfter`: (optional) delay in ms after clicking
     *
     * Example: [ \{ selector: 'selector-1', waitAfter: 100 \}, \{ selector: 'selector-2' \} ]
     * Results in: click selector-1, wait 100ms, click selector-2
     *
     * Note: postInteractionWait is applied after these operations complete.
     */
    clickSelectors?: ISelectorWithBeforeAfterDelay[];

    /**
     * Wait for either selector or a defined number of millis before taking screenshot, or both (selector first)
     */
    postInteractionWait?: ISelectorThenDelay;

    /**
     * Scroll the specified DOM element into view prior to screenshots
     */
    scrollToSelector?: string;

    /**
     * Percentage of different pixels allowed to pass test
     */
    misMatchThreshold?: number;

    /**
     * Number of retries to perform on failed test
     */
    retryCount?: number;
}

export interface INeobackstopConfig {
    /**
     * Backstop scenario ⇒ scenario configuration mapping. Key will be used to name the test scenario.
     */
    [name: string]: INeobackstopScenarioConfig;
}

export interface IStoryParameters {
    kind: string;
    screenshot?: boolean | INeobackstopScenarioConfig;
    screenshots?: INeobackstopConfig;
}
