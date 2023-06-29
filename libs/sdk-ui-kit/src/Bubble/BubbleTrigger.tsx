// (C) 2007-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { v4 as uuid } from "uuid";
import pickBy from "lodash/pickBy.js";

/**
 * @internal
 */
export interface IBubbleTriggerProps {
    className?: string;
    children?: React.ReactNode;
    eventsOnBubble?: boolean;
    tagName?: React.ElementType;
    onBubbleOpen?: () => void;
    onBubbleClose?: () => void;
}

/**
 * @internal
 */
export interface IBubbleTriggerState {
    bubbleId: string;
    isBubbleVisible: boolean;
}

/**
 * @internal
 */
export class BubbleTrigger<P extends IBubbleTriggerProps> extends React.PureComponent<
    P,
    IBubbleTriggerState
> {
    public static defaultProps: IBubbleTriggerProps = {
        className: "",
        children: false,
        eventsOnBubble: false,
        tagName: "span",
    };

    public readonly state: Readonly<IBubbleTriggerState> = {
        bubbleId: `bubble-${uuid()}`,
        isBubbleVisible: false,
    };

    private onClose = (): void => {
        this.changeBubbleVisibility(false);
    };

    protected eventListeners(): any {
        return {};
    }

    protected changeBubbleVisibility(active: boolean): void {
        const { onBubbleOpen, onBubbleClose } = this.props;
        const { isBubbleVisible } = this.state;
        if (active && isBubbleVisible !== active && onBubbleOpen) {
            onBubbleOpen();
        }
        if (!active && onBubbleClose) {
            onBubbleClose();
        }
        this.setState({ isBubbleVisible: active });
    }

    public render() {
        const { children, eventsOnBubble, className, tagName, ...others } = this.props;
        const dataAttributes = pickBy(others, (_, key) => key.startsWith("data-"));

        const classNames = cx("gd-bubble-trigger", className, {
            [this.state.bubbleId]: true,
        });

        const TagName = tagName;
        let BubbleElement;
        let WrappedTrigger;

        React.Children.map(children, (child: any) => {
            if (child) {
                if (child.type?.identifier === "Bubble") {
                    BubbleElement = child;
                } else {
                    WrappedTrigger = child;
                }
            }
        });

        const bubbleProps = {
            ...(eventsOnBubble ? this.eventListeners() : {}),
            alignTo: `.${this.state.bubbleId}`,
            onClose: this.onClose,
        };

        const BubbleOverlay =
            this.state.isBubbleVisible && BubbleElement ? React.cloneElement(BubbleElement, bubbleProps) : "";

        return (
            <React.Fragment>
                <TagName {...dataAttributes} {...this.eventListeners()} className={classNames}>
                    {WrappedTrigger}
                </TagName>
                {BubbleOverlay}
            </React.Fragment>
        );
    }
}
