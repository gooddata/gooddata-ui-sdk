// (C) 2007-2025 GoodData Corporation
import React, { useState, useRef, ReactElement, useEffect, useMemo } from "react";
import { v4 as uuid } from "uuid";
import cx from "classnames";

import { Overlay } from "../Overlay/index.js";

import { IBubbleTriggerProps } from "./BubbleTrigger.js";
// import { IBubbleProps } from "./Bubble.js";

// export const SHOW_DELAY = 425;
// export const HIDE_DELAY = 200;

/**
 * @internal
 */
export interface IBubbleHoverTriggerProps extends IBubbleTriggerProps {
    showDelay?: number;
    hideDelay?: number;
    hoverHideDelay?: number;
    isInteractive?: boolean;
}
/**
 * @internal
 */
// class LegacyBubbleHoverTrigger extends BubbleTrigger<IBubbleHoverTriggerProps> {
//     public static defaultProps: IBubbleHoverTriggerProps = {
//         showDelay: SHOW_DELAY,
//         hideDelay: HIDE_DELAY,
//         hoverHideDelay: 0,
//         eventsOnBubble: false,
//         tagName: "span",
//     };
//
//     scheduleId: number;
//
//     public componentWillUnmount(): void {
//         this.cancelBubbleVisibilityChange();
//     }
//
//     private cancelBubbleVisibilityChange(): void {
//         if (this.scheduleId) {
//             window.clearTimeout(this.scheduleId);
//         }
//     }
//
//     private scheduleBubbleVisibilityChange(visible: boolean, delay: number = 0): void {
//         this.cancelBubbleVisibilityChange();
//
//         this.scheduleId = window.setTimeout(() => {
//             this.changeBubbleVisibility(visible);
//
//             const { hoverHideDelay } = this.props;
//             if (visible && hoverHideDelay) {
//                 this.scheduleBubbleVisibilityChange(false, hoverHideDelay);
//             }
//         }, delay);
//     }

// private onKeyDown(e: React.KeyboardEvent) {
//     if (e.key === "Escape") {
//         console.log("escape tooltip")
//         e.preventDefault();
//         e.stopPropagation();
//         this.scheduleBubbleVisibilityChange(false, 0);
//     }
// }
//
//     protected eventListeners(): any {
//         return {
//             onMouseEnter: this.scheduleBubbleVisibilityChange.bind(this, true, this.props.showDelay),
//             onMouseLeave: this.scheduleBubbleVisibilityChange.bind(this, false, this.props.hideDelay),
//             onFocus: this.scheduleBubbleVisibilityChange.bind(this, true, this.props.showDelay),
//             onBlur: this.scheduleBubbleVisibilityChange.bind(this, false, this.props.hideDelay),
//             // onKeyDown: this.onKeyDown.bind(this),
//         };
//     }
// }

// TODO implement rest of the stuff from previous trigger
//  - showDelay
//  - hideDelay
export const BubbleHoverTrigger: React.FC<IBubbleHoverTriggerProps> = ({
    children,
    tagName = "span",
    openOnInit = false,
    isInteractive = false,
    onBubbleOpen,
    onBubbleClose,
}) => {
    const TagName = tagName;
    const [isOpen, setIsOpen] = useState(openOnInit);
    const triggerAnchorClassName = useMemo(() => `bubble-${uuid()}`, []);
    const tooltipId = useMemo(() => `bubble-${uuid()}`, []);
    const triggerRef = useRef<HTMLElement | null>(null);
    // TODO ensure that Bubble is always the second child, therefore Overlay will be here as it is internally
    //  used by Bubble - this could be fragile
    const tooltipRef = useRef<Overlay | null>(null);

    // TODO soften this check
    if (React.Children.count(children) !== 2) {
        throw new Error("Tooltip must have exactly two children: <Bubble> and <Trigger>");
    }

    // TODO interpolate child to match them by type?
    const [trigger, bubble] = React.Children.toArray(children) as [ReactElement, ReactElement];

    // Handle focus shifting for interactive tooltips
    useEffect(() => {
        if (isInteractive && isOpen && tooltipRef.current) {
            // TODO set focus to bubble content, ref contains Bubble component which does not have focus now
            console.log("set focus to bubble");
            // TODO does not work now, maybe we need to forward ref? Maybe the focus is send to wrong element?
            tooltipRef.current?.getRefs().overlayRef.focus();
        }
    }, [isOpen, isInteractive]);

    const handleClose = () => {
        setIsOpen(false);
        console.log("return focus to trigger", triggerRef.current);
        triggerRef.current?.focus(); // Restore focus to the trigger
    };

    const emitStateEventHandlers = useRef(false);

    useEffect(() => {
        if (emitStateEventHandlers.current) {
            if (isOpen) {
                onBubbleOpen?.();
            } else {
                onBubbleClose?.();
            }
        }
        emitStateEventHandlers.current = true;
    }, [isOpen, onBubbleOpen, onBubbleClose]);

    // TODO memoize event handlers
    const TriggerElement = React.cloneElement(trigger, {
        ref: triggerRef,
        "aria-describedby": isInteractive ? undefined : tooltipId,
        "aria-controls": isInteractive ? tooltipId : undefined,
        "aria-haspopup": isInteractive ? "dialog" : undefined,
        "aria-expanded": String(isOpen),
        onFocus: () => setIsOpen(true),
        onBlur: (e: React.FocusEvent) => {
            // TODO extract to body, memoize, extract condition to a helper fn, reuse in bubble onBlur
            if (
                isInteractive &&
                tooltipRef.current &&
                !tooltipRef.current.getRefs().overlayRef.contains(e.relatedTarget as Node)
            ) {
                handleClose();
            } else {
                setIsOpen(false);
            }
        },
        onMouseEnter: () => {
            setIsOpen(true);
        },
        onMouseLeave: () => !isInteractive && setIsOpen(false),
        className: cx(trigger.props.className, triggerAnchorClassName),
    });

    // TODO memoize event handlers
    const BubbleElement = isOpen
        ? React.cloneElement(bubble, {
              id: tooltipId,
              ref: tooltipRef, // TODO maybe wrap Bubble to forwardRef so we can tyoe the cloneElement with it and have typed props propragated to clone fn for strong typing
              isInteractive, // will set tabIndex: isInteractive ? -1 : undefined
              alignTo: `.${triggerAnchorClassName}`,
              // TODO extract to body, memoize, extract condition to a helper fn, reuse in trigger onBlur
              onBlur: (e: React.FocusEvent) => {
                  if (
                      isInteractive &&
                      tooltipRef.current &&
                      !tooltipRef.current.getRefs().overlayRef.contains(e.relatedTarget as Node)
                  ) {
                      handleClose();
                  }
              },
          })
        : null;

    return (
        // wrap in tag to not have jumping element when tooltip bubble is rendered and the parent element
        // is using flex layout with gap rule
        <TagName>
            {TriggerElement}
            {BubbleElement}
        </TagName>
    );
};
