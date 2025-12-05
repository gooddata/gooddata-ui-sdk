// (C) 2007-2025 GoodData Corporation

import { BubbleTrigger, IBubbleTriggerProps } from "./BubbleTrigger.js";

export const SHOW_DELAY = 425;
export const HIDE_DELAY = 200;

/**
 * @internal
 */
export interface IBubbleHoverTriggerProps extends IBubbleTriggerProps {
    showDelay?: number;
    hideDelay?: number;
    hoverHideDelay?: number;
    enabled?: boolean;
}
/**
 * @internal
 */
export class BubbleHoverTrigger extends BubbleTrigger<IBubbleHoverTriggerProps> {
    public static override defaultProps: IBubbleHoverTriggerProps = {
        showDelay: SHOW_DELAY,
        hideDelay: HIDE_DELAY,
        hoverHideDelay: 0,
        eventsOnBubble: false,
        tagName: "span",
        enabled: true,
    };

    scheduleId: number = 0;

    public override componentWillUnmount(): void {
        this.cancelBubbleVisibilityChange();
    }

    private cancelBubbleVisibilityChange(): void {
        if (this.scheduleId) {
            window.clearTimeout(this.scheduleId);
        }
    }

    private scheduleBubbleVisibilityChange(visible: boolean, delay: number = 0): void {
        if (!this.props.enabled) {
            return;
        }

        this.cancelBubbleVisibilityChange();

        this.scheduleId = window.setTimeout(() => {
            this.changeBubbleVisibility(visible);

            const { hoverHideDelay } = this.props;
            if (visible && hoverHideDelay) {
                this.scheduleBubbleVisibilityChange(false, hoverHideDelay);
            }
        }, delay);
    }

    protected override eventListeners(): any {
        return {
            onMouseEnter: this.scheduleBubbleVisibilityChange.bind(this, true, this.props.showDelay),
            onMouseLeave: this.scheduleBubbleVisibilityChange.bind(this, false, this.props.hideDelay),
        };
    }
}
