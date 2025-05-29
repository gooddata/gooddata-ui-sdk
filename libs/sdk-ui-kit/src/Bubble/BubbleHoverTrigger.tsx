// (C) 2007-2020 GoodData Corporation
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
}
/**
 * @internal
 */
export class BubbleHoverTrigger extends BubbleTrigger<IBubbleHoverTriggerProps> {
    public static defaultProps: IBubbleHoverTriggerProps = {
        showDelay: SHOW_DELAY,
        hideDelay: HIDE_DELAY,
        hoverHideDelay: 0,
        eventsOnBubble: false,
        tagName: "span",
    };

    scheduleId: number;

    public componentWillUnmount(): void {
        this.cancelBubbleVisibilityChange();
    }

    private cancelBubbleVisibilityChange(): void {
        if (this.scheduleId) {
            window.clearTimeout(this.scheduleId);
        }
    }

    private scheduleBubbleVisibilityChange(visible: boolean, delay: number = 0): void {
        this.cancelBubbleVisibilityChange();

        this.scheduleId = window.setTimeout(() => {
            this.changeBubbleVisibility(visible);

            const { hoverHideDelay } = this.props;
            if (visible && hoverHideDelay) {
                this.scheduleBubbleVisibilityChange(false, hoverHideDelay);
            }
        }, delay);
    }

    protected eventListeners(): any {
        return {
            onMouseEnter: this.scheduleBubbleVisibilityChange.bind(this, true, this.props.showDelay),
            onMouseLeave: this.scheduleBubbleVisibilityChange.bind(this, false, this.props.hideDelay),
        };
    }
}
