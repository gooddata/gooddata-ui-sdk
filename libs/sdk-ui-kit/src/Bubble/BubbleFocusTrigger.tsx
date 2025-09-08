// (C) 2020 GoodData Corporation
import { BubbleTrigger, IBubbleTriggerProps } from "./BubbleTrigger.js";

/**
 * @internal
 */
export type BubbleFocusTriggerProps = IBubbleTriggerProps;

/**
 * @internal
 */
export class BubbleFocusTrigger extends BubbleTrigger<BubbleFocusTriggerProps> {
    static override defaultProps: BubbleFocusTriggerProps = {
        tagName: "span",
        eventsOnBubble: true,
    };

    protected override eventListeners(): any {
        return {
            onFocus: this.changeBubbleVisibility.bind(this, true),
            onBlur: this.changeBubbleVisibility.bind(this, false),
        };
    }
}
