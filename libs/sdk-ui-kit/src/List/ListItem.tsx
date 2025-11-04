// (C) 2007-2025 GoodData Corporation

import { FC, MouseEvent, ReactNode, Ref, forwardRef, useCallback, useEffect, useRef, useState } from "react";

import cx from "classnames";

import { stringUtils } from "@gooddata/util";

import { Bubble, BubbleHoverTrigger } from "../Bubble/index.js";
import { IMenuAccessibilityConfig } from "../typings/accessibility.js";

const BUBBLE_OFFSET_X = 16;

/**
 * @internal
 */
export type SingleSelectListItemType = "header" | "separator";

/**
 * @internal
 */
export interface ISingleSelectListItemProps {
    title?: string;
    icon?: string | ReactNode;
    type?: SingleSelectListItemType;
    className?: string;
    info?: string | ReactNode;
    eventsOnBubble?: boolean;
    hideDelayBubble?: number;
    isSelected?: boolean;
    isFocused?: boolean;
    isMenu?: boolean;
    accessibilityConfig?: IMenuAccessibilityConfig;
    tabIndex?: number;
    elementType?: "div" | "button";
    /**
     * Visual variant to indicate special emphasis, e.g. "delete".
     * Example: "default" | "delete"
     */
    variant?: "default" | "delete";

    iconRenderer?: (icon: string | ReactNode | FC) => ReactNode;
    infoRenderer?: (info: string | ReactNode | FC) => ReactNode;

    onClick?: (e: MouseEvent<HTMLElement>) => void;
    onMouseOver?: (e: MouseEvent<HTMLElement>) => void;
    onMouseOut?: (e: MouseEvent<HTMLElement>) => void;
}

/**
 * @internal
 */
const DivElement = forwardRef<HTMLDivElement, ISingleSelectListItemProps & { children?: ReactNode }>(
    function DivElement({ children, ...props }, ref) {
        return (
            <div
                ref={ref}
                className={props.className}
                onClick={props.onClick}
                onMouseOver={props.onMouseOver}
                onMouseOut={props.onMouseOut}
                role={props.accessibilityConfig?.role}
                aria-disabled={props.accessibilityConfig?.ariaDisabled}
                aria-haspopup={props.accessibilityConfig?.ariaHasPopup}
                aria-expanded={props.accessibilityConfig?.ariaExpanded}
                aria-describedby={props.accessibilityConfig?.ariaDescribedBy}
                tabIndex={props.tabIndex}
                data-testid={
                    props.type === "separator"
                        ? "item-separator"
                        : props.type === "header"
                          ? "item-header"
                          : undefined
                }
            >
                {children}
            </div>
        );
    },
);

/**
 * @internal
 */
const ButtonElement = forwardRef<HTMLButtonElement, ISingleSelectListItemProps & { children?: ReactNode }>(
    function ButtonElement({ children, ...props }, ref) {
        return (
            <button
                ref={ref}
                type="button"
                className={props.className}
                onClick={props.onClick}
                onMouseOver={props.onMouseOver}
                onMouseOut={props.onMouseOut}
                role={props.accessibilityConfig?.role}
                aria-disabled={props.accessibilityConfig?.ariaDisabled}
                aria-haspopup={props.accessibilityConfig?.ariaHasPopup}
                aria-expanded={props.accessibilityConfig?.ariaExpanded}
                aria-describedby={props.accessibilityConfig?.ariaDescribedBy}
                tabIndex={props.tabIndex}
            >
                {children}
            </button>
        );
    },
);

/**
 * @internal
 */
export const SingleSelectListItem = forwardRef<
    HTMLDivElement | HTMLButtonElement,
    ISingleSelectListItemProps
>(function SingleSelectListItem(props, ref) {
    const {
        title,
        icon,
        type,
        className,
        info,
        variant = "default",
        eventsOnBubble = false,
        hideDelayBubble,
        isSelected,
        isFocused,
        isMenu,
        elementType = "div",
        iconRenderer,
        infoRenderer,
    } = props;

    const [isOverflowed, setIsOverflowed] = useState(false);
    const titleRef = useRef<HTMLSpanElement>(null);

    const checkOverflow = useCallback(() => {
        if (titleRef.current) {
            const hasOverflow = titleRef.current.offsetWidth < titleRef.current.scrollWidth;
            setIsOverflowed(hasOverflow);
        }
    }, []);

    useEffect(() => {
        checkOverflow();

        window.addEventListener("resize", checkOverflow);

        let resizeObserver: ResizeObserver | null = null;
        if (titleRef.current && window.ResizeObserver) {
            resizeObserver = new ResizeObserver(checkOverflow);
            resizeObserver.observe(titleRef.current);
        }

        return () => {
            window.removeEventListener("resize", checkOverflow);
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    }, [title, checkOverflow]);

    const getClassNames = () => {
        const testClassName = `s-${stringUtils.simplifyText(title)}`;
        return cx("gd-list-item", className, testClassName, {
            "is-selected": isSelected,
            "is-submenu": isMenu,
            "is-focused": isFocused,
            [`variant-${variant}`]: variant !== "default",
        });
    };

    const renderIcon = (iconProp: ReactNode) => {
        if (!iconProp) return null;

        const iconClasses = cx("gd-list-icon", typeof iconProp === "string" ? iconProp : undefined);
        return (
            <span data-testid="icon" aria-hidden className={iconClasses}>
                {typeof iconProp === "string" ? null : iconProp}
            </span>
        );
    };

    const renderTitle = () => {
        const titleElement = <span ref={titleRef}>{title}</span>;

        if (isOverflowed) {
            return (
                <BubbleHoverTrigger>
                    {titleElement}
                    <Bubble
                        className="bubble-primary"
                        alignPoints={[{ align: "cr cl" }, { align: "cl cr" }]}
                        arrowOffsets={{
                            "cr cl": [BUBBLE_OFFSET_X, 0],
                            "cl cr": [-BUBBLE_OFFSET_X, 0],
                        }}
                    >
                        {title}
                    </Bubble>
                </BubbleHoverTrigger>
            );
        }
        return titleElement;
    };

    const renderInfo = () => {
        if (!info) {
            return null;
        }

        return (
            <div data-testid="item-info" className="gd-list-item-bubble s-list-item-info">
                <BubbleHoverTrigger
                    tagName="div"
                    showDelay={200}
                    hideDelay={hideDelayBubble ?? 0}
                    eventsOnBubble={eventsOnBubble}
                >
                    <div className="inlineBubbleHelp" />
                    <Bubble
                        className="bubble-primary"
                        alignPoints={[{ align: "cr cl" }]}
                        arrowOffsets={{ "cr cl": [15, 0] }}
                    >
                        {info}
                    </Bubble>
                </BubbleHoverTrigger>
            </div>
        );
    };

    const children = (
        <>
            {iconRenderer ? iconRenderer(icon) : renderIcon(icon)}
            {renderTitle()}
            {infoRenderer ? infoRenderer(info) : renderInfo()}
        </>
    );

    if (type === "separator" || type === "header") {
        return (
            <DivElement
                ref={ref as Ref<HTMLDivElement>}
                {...props}
                className={cx(
                    "gd-list-item",
                    {
                        "gd-list-item-separator s-list-separator": type === "separator",
                        "gd-list-item-header s-list-header": type === "header",
                    },
                    className,
                )}
            >
                {type === "header" ? children : null}
            </DivElement>
        );
    }

    return elementType === "button" ? (
        <ButtonElement ref={ref as Ref<HTMLButtonElement>} {...props} className={getClassNames()}>
            {children}
        </ButtonElement>
    ) : (
        <DivElement ref={ref as Ref<HTMLDivElement>} {...props} className={getClassNames()}>
            {children}
        </DivElement>
    );
});
