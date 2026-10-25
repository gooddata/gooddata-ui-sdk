// (C) 2022-2026 GoodData Corporation

import { type KeyboardEvent } from "react";

import { BubbleTrigger, type IBubbleHoverTriggerProps } from "@gooddata/sdk-ui-kit";

export interface IReportDescriptionTriggerProps extends IBubbleHoverTriggerProps {
    isCloseBlocked?: () => boolean;
    onBubbleClose?: () => void;
}

export class ReportDescriptionTrigger extends BubbleTrigger<IReportDescriptionTriggerProps> {
    public static override defaultProps: IBubbleHoverTriggerProps = {
        showDelay: 0,
        hideDelay: 200,
        hoverHideDelay: 0,
        eventsOnBubble: true,
        tagName: "span",
    };

    scheduleId: number;

    public override componentWillUnmount(): void {
        this.cancelBubbleVisibilityChange();
    }

    private cancelBubbleVisibilityChange(): void {
        if (this.scheduleId) {
            window.clearTimeout(this.scheduleId);
        }
    }

    private scheduleBubbleVisibilityChange(visible: boolean, delay = 0, skipCheck: boolean): void {
        if (this.props.isCloseBlocked?.() && !visible && !skipCheck) {
            this.cancelBubbleVisibilityChange();
            this.scheduleId = window.setTimeout(() => {
                this.scheduleBubbleVisibilityChange(false, delay, false);
            }, delay);
            return;
        }

        this.cancelBubbleVisibilityChange();

        this.scheduleId = window.setTimeout(() => {
            this.changeBubbleVisibility(visible);

            const { hoverHideDelay } = this.props;
            if (visible && hoverHideDelay) {
                this.scheduleBubbleVisibilityChange(false, hoverHideDelay, false);
            }
        }, delay);
    }

    private onKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) {
            e.preventDefault();
            this.scheduleBubbleVisibilityChange(false, 0, true);
        }
    }

    protected override eventListeners() {
        return {
            onMouseEnter: this.scheduleBubbleVisibilityChange.bind(this, true, this.props.showDelay, false),
            onMouseLeave: this.scheduleBubbleVisibilityChange.bind(this, false, this.props.hideDelay, false),
            onKeyDown: this.onKeyDown.bind(this),
        };
    }
}
