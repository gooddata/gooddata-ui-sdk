// (C) 2007-2025 GoodData Corporation

export enum Browser {
    Chromium = "chromium",
    Firefox = "firefox",
}

export interface IViewport {
    label: string;
    width: number;
    height: number;
}

export interface IDelay {
    postReady?: number;
    postOperation?: number;
}

export interface IKeyPressSelector {
    keyPress: string;
    selector: string;
}

/** The Backstop test definition. See https://github.com/gooddata/gooddata-neobackstop/tree/master/scenario/types.go */
export interface INeobackstopScenarioConfig {
    /**
     * Test the scenario with the specified browsers
     */
    browsers?: Browser[];

    /**
     * Override global viewports
     */
    viewports?: IViewport[];

    /**
     * Wait until this selector exists before continuing
     */
    readySelector?: string;

    /**
     * Reload the page after the ready selector is found
     */
    reloadAfterReady?: boolean;

    /**
     * Wait for x milliseconds
     */
    delay?: number | IDelay;

    /**
     * Press key in the DOM element prior to screenshot
     */
    keyPressSelector?: IKeyPressSelector;

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
     * Wait for either selector or a defined number of millis before taking screenshot
     */
    postInteractionWait?: string | number;

    /**
     * Scroll the specified DOM element into view prior to screenshots
     */
    scrollToSelector?: string;

    /**
     * Percentage of different pixels allowed to pass test
     */
    misMatchThreshold?: number;
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
