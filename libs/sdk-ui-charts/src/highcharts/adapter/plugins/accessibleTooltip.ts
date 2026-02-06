// (C) 2025-2026 GoodData Corporation

/*
 Accessible tooltip behavior:
 - Delay tooltip updates when moving across points (grace period)
 - Delay tooltip hide when leaving chart area
 - Freeze tooltip when hovered; no point activation while over tooltip
 - Per-chart state; safe for multiple charts on page
 - DOES NOT WORK WITH split and shared tooltip
 - DOES NOT WORK WITH touch devices
*/

type StickyState = {
    isFrozen: boolean;
    currentPoint?: any;
    pendingPoint?: any;
    activationTimer?: number | null;
    hideTimer?: number | null;
    activationDelayMs: number;
    boundEl?: Element | null;
    _onEnter?: () => void;
    _onLeave?: () => void;
};

function getStickyState(chart: Highcharts.Chart): StickyState {
    const c = chart as any;
    if (!c.__gdStickyTooltipState) {
        c.__gdStickyTooltipState = {
            isFrozen: false,
            currentPoint: null,
            pendingPoint: null,
            activationTimer: null,
            hideTimer: null,
            // reasonable default delay to allow passing through neighboring points
            activationDelayMs: 300,
            boundEl: null,
            _onEnter: undefined,
            _onLeave: undefined,
        } as StickyState;
    }
    return c.__gdStickyTooltipState as StickyState;
}

function isTooltipCurrentlyVisible(tooltip: Highcharts.Tooltip): boolean {
    if (!tooltip) {
        return false;
    }
    return !(tooltip as any).isHidden; // Accessing internal prop of tooltip
}

function bindTooltipHoverEvents(tooltip: Highcharts.Tooltip): void {
    const chart = tooltip.chart;
    const state = getStickyState(chart);
    const label = (tooltip as any).label; // Accessing internal prop of tooltip
    const el = label?.div ? (label.div as Element) : null; // Accessing internal prop of tooltip label
    if (!el) {
        return;
    }

    if (state.boundEl === el) {
        return; // already bound to this label instance
    }

    // unbind previous
    if (state.boundEl && state._onEnter && state._onLeave) {
        state.boundEl.removeEventListener("mouseenter", state._onEnter);
        state.boundEl.removeEventListener("mouseleave", state._onLeave);
    }

    state._onEnter = () => {
        state.isFrozen = true;
        if (state.activationTimer) {
            clearTimeout(state.activationTimer);
            state.activationTimer = null;
        }
        if (state.hideTimer) {
            clearTimeout(state.hideTimer);
            state.hideTimer = null;
        }
    };

    state._onLeave = () => {
        state.isFrozen = false;
        tooltip.hide(0);
    };

    // Support both mouse and pointer events for broader device coverage
    el.addEventListener("mouseenter", state._onEnter);
    el.addEventListener("mouseleave", state._onLeave);
    state.boundEl = el;
}

let installed = false;

export function initAccessibleTooltipPluginOnce(Highcharts: any): void {
    if (installed) {
        return;
    }
    installed = true;

    // Ensure all timers/listeners are cleaned when chart is destroyed to avoid deferred callbacks
    Highcharts.addEvent(
        Highcharts.Chart.prototype,
        "destroy",
        function onChartDestroy(this: Highcharts.Chart) {
            const state = getStickyState(this);
            if (state.activationTimer) {
                clearTimeout(state.activationTimer);
                state.activationTimer = null;
            }
            if (state.hideTimer) {
                clearTimeout(state.hideTimer);
                state.hideTimer = null;
            }
            state.pendingPoint = null;
            state.currentPoint = null;
            state.isFrozen = false;
            if (state.boundEl && state._onEnter && state._onLeave) {
                state.boundEl.removeEventListener("mouseenter", state._onEnter);
                state.boundEl.removeEventListener("mouseleave", state._onLeave);
            }
            state.boundEl = null;
            state._onEnter = undefined;
            state._onLeave = undefined;
        },
    );

    // Ensure we rebind hover events once label exists
    Highcharts.wrap(
        Highcharts.Tooltip.prototype,
        "getLabel",
        function wrapGetLabel(this: Highcharts.Tooltip, proceed: any, ...args: any[]) {
            const res = proceed.apply(this, args);
            bindTooltipHoverEvents(this);
            return res;
        },
    );

    // Delay refresh when moving between points; skip updates while tooltip is hovered/frozen
    Highcharts.wrap(
        Highcharts.Tooltip.prototype,
        "refresh",
        function wrapRefresh(this: Highcharts.Tooltip, proceed: any, pointsOrPoint: any, event?: any) {
            const chart = this.chart;
            const state = getStickyState(chart);
            bindTooltipHoverEvents(this);

            const nextPoint = Array.isArray(pointsOrPoint) ? pointsOrPoint[0] : pointsOrPoint;

            if (state.isFrozen) {
                return; // do not update while interacting with tooltip
            }

            // If no tooltip is currently visible, show immediately (do not postpone first show)
            if (!isTooltipCurrentlyVisible(this)) {
                state.currentPoint = nextPoint ?? null;
                return proceed.call(this, pointsOrPoint, event);
            }

            if (!state.currentPoint || nextPoint === state.currentPoint) {
                state.currentPoint = nextPoint ?? null;
                return proceed.call(this, pointsOrPoint, event);
            }

            if (state.activationTimer) {
                clearTimeout(state.activationTimer);
                state.activationTimer = null;
            }
            state.pendingPoint = nextPoint ?? null;

            // oxlint-disable-next-line @typescript-eslint/no-this-alias
            const tooltip = this;
            state.activationTimer = window.setTimeout(() => {
                state.currentPoint = state.pendingPoint ?? null;
                state.activationTimer = null;
                if (state.isFrozen) {
                    return;
                }
                if (state.currentPoint) {
                    return proceed.call(tooltip, state.currentPoint, event);
                }
            }, state.activationDelayMs);
        },
    );

    // Keep tooltip when leaving container
    Highcharts.wrap(
        Highcharts.Pointer.prototype,
        "onContainerMouseLeave",
        function wrapLeave(this: any, proceed: any, e: any) {
            const chart = this.chart;
            const state = getStickyState(chart);
            // Always cancel any pending delayed update when leaving chart area
            if (state.activationTimer) {
                clearTimeout(state.activationTimer);
                state.activationTimer = null;
            }
            state.pendingPoint = null;
            if (state.hideTimer) {
                clearTimeout(state.hideTimer);
                state.hideTimer = null;
            }
            // Swallow only when tooltip is hovered/frozen; otherwise let Highcharts handle it
            if (state.isFrozen) {
                return;
            }
            return proceed.call(this, e);
        },
    );

    // On container move/enter, if tooltip is not visible anymore, clear the frozen state and pending timers
    Highcharts.wrap(
        Highcharts.Pointer.prototype,
        "onContainerMouseEnter",
        function wrapMove(this: any, proceed: any, e: any) {
            const chart = this.chart;
            const state = getStickyState(chart);
            const tooltip = chart?.tooltip;
            if (tooltip && !isTooltipCurrentlyVisible(tooltip)) {
                // reset frozen state if tooltip is already hidden
                state.isFrozen = false;
                if (state.activationTimer) {
                    clearTimeout(state.activationTimer);
                    state.activationTimer = null;
                }
                if (state.hideTimer) {
                    clearTimeout(state.hideTimer);
                    state.hideTimer = null;
                }
                state.pendingPoint = null;
            }
            return proceed.call(this, e);
        },
    );

    // delay hide and cancel if tooltip gets frozen (hovered)
    Highcharts.wrap(
        Highcharts.Tooltip.prototype,
        "hide",
        function wrapHide(this: Highcharts.Tooltip, proceed: any, delay?: number) {
            const chart = this.chart;
            const state = getStickyState(chart);
            if (state.isFrozen) {
                return;
            }
            // Already scheduling a hide → do nothing
            if (state.hideTimer) {
                return;
            }
            // oxlint-disable-next-line @typescript-eslint/no-this-alias
            const tooltip = this;
            state.hideTimer = window.setTimeout(() => {
                state.hideTimer = null;
                if (!state.isFrozen) {
                    proceed.call(tooltip, delay);
                }
            }, state.activationDelayMs);
        },
    );
}
