// (C) 2007-2025 GoodData Corporation

import { Children, ElementType, Fragment, PureComponent, ReactNode, cloneElement } from "react";

import cx from "classnames";
import pickBy from "lodash/pickBy.js";
import { v4 as uuid } from "uuid";

/**
 * @internal
 */
export interface IBubbleTriggerProps {
    className?: string;
    children?: ReactNode;
    eventsOnBubble?: boolean;
    tagName?: ElementType;
    onBubbleOpen?: () => void;
    onBubbleClose?: () => void;
    openOnInit?: boolean;
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
export class BubbleTrigger<P extends IBubbleTriggerProps> extends PureComponent<P, IBubbleTriggerState> {
    public static defaultProps: IBubbleTriggerProps = {
        className: "",
        children: false,
        eventsOnBubble: false,
        tagName: "span",
        openOnInit: false,
    };

    public override readonly state: Readonly<IBubbleTriggerState> = {
        bubbleId: `bubble-${uuid()}`,
        isBubbleVisible: this.props.openOnInit ?? false,
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

    public override render() {
        const { children, eventsOnBubble, className, tagName, ...others } = this.props;
        const dataAttributes = pickBy(others, (_, key) => key.startsWith("data-"));

        const classNames = cx("gd-bubble-trigger", className, {
            [this.state.bubbleId]: true,
        });

        const TagName = tagName;
        let BubbleElement;
        let WrappedTrigger;

        Children.map(children, (child: any) => {
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
            this.state.isBubbleVisible && BubbleElement ? cloneElement(BubbleElement, bubbleProps) : "";

        return (
            <Fragment>
                <TagName {...dataAttributes} {...this.eventListeners()} className={classNames}>
                    {WrappedTrigger}
                </TagName>
                {BubbleOverlay}
            </Fragment>
        );
    }
}
