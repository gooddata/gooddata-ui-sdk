// (C) 2007-2019 GoodData Corporation

/*
 * These types were taken mostly as-is from the @types/backstopjs package. renamed interfaces to start with 'I'
 * removed legacy viewport and removed label and URL as those are added automatically by our storybook ⇒ backstop scenarios
 * builder
 */

export interface IKeypressSelector {
    selector: string;
    keyPress: string;
}

/** The Backstop test definition. See https://github.com/garris/BackstopJS#advanced-scenarios */
export interface IBackstopScenarioConfig {
    [key: string]: any; // Allow for custom properties.
    /**
     * Click the specified DOM element prior to screenshot
     */
    clickSelector?: string;

    /**
     * Simulates multiple sequential click interactions. It is also possible to include a wait in milliseconds
     * inside this array. Just specify a number of millis.
     *
     * Example: [ 'selector-1', 100, 'selector-2' ] == first click selector-1, then wait 100 millis, then
     * click 'selector-2'.
     *
     * Note: after performing these operations, the backstop driver will apply 'postInteractionWait' so there
     * is no need to include a trailing timeout.
     */
    clickSelectors?: Array<string | number>;

    /**
     * Import cookies in JSON format
     */
    cookiePath?: string;

    /**
     * Wait for x milliseconds
     */
    delay?: number;

    /**
     * Use with selectorExpansion true to expect number of results found
     */
    expect?: number; //

    /**
     * Selectors set to visibility: hidden
     */
    hideSelectors?: string[];

    /**
     * Move pointer over the given DOM element prior to screenshot
     */
    hoverSelector?: string;

    /**
     * Simulates multiple sequential hover interactions. It is also possible to include a wait in milliseconds
     * inside this array. Just specify a number of millis.
     *
     * Example: [ 'selector-1', 100, 'selector-2' ] == first hover selector-1, then wait 100 millis, then
     * hover 'selector-2'.
     *
     * Note: after performing this hovering, backstop driver will proceed deal with clickSelectors. if you need
     * to wait before starting clicking, then include trailing timeout here. There is also postInteractionWait; this
     * is applied _after_ the click selectors processing.
     */
    hoverSelectors?: Array<string | number>;

    /**
     * Press key in the DOM element prior to screenshot
     */
    keyPressSelector?: IKeypressSelector;

    /**
     * Simulates multiple sequential keypress interactions
     */
    keyPressSelectors?: IKeypressSelector[];

    /**
     * Percentage of different pixels allowed to pass test
     */
    misMatchThreshold?: number;

    /**
     * Used to set up browser state e.g. cookies
     */
    onBeforeScript?: string;

    /**
     * Used to modify UI state prior to screenshots e.g. hovers, clicks etc
     */
    onReadyScript?: string;
    /**
     * Wait for either selector or a defined number of millis before taking screenshot
     */
    postInteractionWait?: string | number;

    /**
     * Wait until this string has been logged to the console
     */
    readyEvent?: string;

    /**
     * Wait until this selector exists before continuing
     */
    readySelector?: string;

    /**
     * Specify a different state or environment when creating reference
     */
    referenceUrl?: string;

    /**
     * Selectors set to display: none
     */
    removeSelectors?: string[];

    /**
     * If true, any change in selector size will trigger a failure
     */
    requireSameDimensions?: boolean;

    /**
     * Selectors to capture
     */
    selectors?: string[];

    /**
     * If true, take screenshots of all matching selector instances
     */
    selectorExpansion?: boolean;

    /**
     * Scroll the specified DOM element into view prior to screenshots
     */
    scrollToSelector?: string;

    /**
     * Override global viewports
     */
    viewports?: Viewport[];
}

export type Viewport = IViewportNext;

export interface IViewportNext {
    label: string;
    width: number;
    height: number;
}

export type BackstopConfig = {
    /**
     * Backstop scenario ⇒ scenario configuration mapping. Key will be used to name the test scenario.
     */
    [name: string]: IBackstopScenarioConfig;
};
