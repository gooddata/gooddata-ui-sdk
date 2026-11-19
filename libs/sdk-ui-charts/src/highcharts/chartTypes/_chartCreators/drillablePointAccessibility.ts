// (C) 2026 GoodData Corporation

/**
 * Name of the DOM event that a host dispatches on the chart container when the drill menu opened from a
 * chart point opens or closes.
 *
 * @internal
 */
export const DRILL_MENU_EXPANDED_CHANGE_EVENT = "gdc-drill-menu-expanded-change";

/**
 * Data attribute that a host sets on an element wrapping the chart when the host opens a drill menu from the
 * chart data points and reports its state with {@link notifyDrillMenuExpandedChange}.
 *
 * @remarks
 * Only data points inside such a host are exposed with `aria-haspopup="menu"` and `aria-expanded`.
 *
 * @internal
 */
export const DRILL_MENU_HOST_ATTRIBUTE = "data-gd-drill-menu-host";

/**
 * Detail of the {@link DRILL_MENU_EXPANDED_CHANGE_EVENT} event.
 *
 * @internal
 */
export interface IDrillMenuExpandedChangeDetail {
    /**
     * Whether the drill menu opened from the chart data point is open.
     */
    expanded: boolean;
}

/**
 * Tells the chart that the drill menu opened from its data point opened or closed, so that the point can
 * expose the state through `aria-expanded`.
 *
 * @param chartContainer - chart container the drill event was fired from (`IDrillEvent.target`)
 * @param expanded - whether the drill menu is open
 * @internal
 */
export function notifyDrillMenuExpandedChange(
    chartContainer: EventTarget | undefined,
    expanded: boolean,
): void {
    chartContainer?.dispatchEvent(
        new CustomEvent<IDrillMenuExpandedChangeDetail>(DRILL_MENU_EXPANDED_CHANGE_EVENT, {
            detail: { expanded },
        }),
    );
}

interface IActivatedPoints {
    elements: Element[];
    expanded: boolean;
}

interface IDrillablePoint {
    drilldown?: boolean;
    isNull?: boolean;
    graphic?: { element?: Element };
}

interface IDrillableChart {
    container?: HTMLElement;
    options?: { accessibility?: { enabled?: boolean } };
    series?: Array<{ points?: IDrillablePoint[] }>;
}

const activatedPointsByContainer = new WeakMap<Element, IActivatedPoints>();
const containersWithListener = new WeakSet<Element>();

function applyExpanded(elements: Element[], expanded: boolean): void {
    elements.forEach((element) => element.setAttribute("aria-expanded", String(expanded)));
}

function onExpandedChange(event: Event): void {
    const container = event.currentTarget as Element;
    const activated = activatedPointsByContainer.get(container);
    if (!activated) {
        return;
    }
    activated.expanded = (event as CustomEvent<IDrillMenuExpandedChangeDetail>).detail.expanded;
    applyExpanded(activated.elements, activated.expanded);
}

export function rememberActivatedDrillPoint(
    chartContainer: Element | undefined,
    pointElement: Element | undefined,
): void {
    if (!chartContainer || !pointElement) {
        return;
    }
    const previous = activatedPointsByContainer.get(chartContainer);
    if (previous) {
        applyExpanded(previous.elements, false);
    }
    activatedPointsByContainer.set(chartContainer, { elements: [pointElement], expanded: false });
}

export function processDrillablePointAccessibility(chart: IDrillableChart): void {
    const container = chart.container;
    if (!container || chart.options?.accessibility?.enabled === false) {
        return;
    }

    if (!containersWithListener.has(container)) {
        container.addEventListener(DRILL_MENU_EXPANDED_CHANGE_EVENT, onExpandedChange);
        containersWithListener.add(container);
    }

    const isDrillMenuHost = container.closest(`[${DRILL_MENU_HOST_ATTRIBUTE}]`) !== null;
    const activated = activatedPointsByContainer.get(container);
    const expandedElements = new Set(activated?.expanded ? activated.elements : []);

    chart.series?.forEach((series) =>
        series.points?.forEach((point) => {
            const element = point.graphic?.element;
            if (!element) {
                return;
            }

            const isDrillable = Boolean(point.drilldown) && !point.isNull;
            if (isDrillable) {
                element.setAttribute("role", "button");
            }

            if (isDrillable && isDrillMenuHost) {
                element.setAttribute("aria-haspopup", "menu");
                element.setAttribute("aria-expanded", String(expandedElements.has(element)));
            } else {
                element.removeAttribute("aria-haspopup");
                element.removeAttribute("aria-expanded");
            }
        }),
    );
}
