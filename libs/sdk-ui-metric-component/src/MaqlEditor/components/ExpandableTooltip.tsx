// (C) 2021-2026 GoodData Corporation

import {
    type MutableRefObject,
    type PropsWithChildren,
    type ReactElement,
    useCallback,
    useEffect,
} from "react";

import { type Root, createRoot } from "react-dom/client";

import {
    FLOATING_ELEMENT_DATA_ATTR,
    IconClose,
    IconExpand,
    useRegisterFloatingAnchor,
} from "@gooddata/sdk-ui-kit";

import { type MaqlEditorDefaultTheme } from "../theme/default.js";
import { makeStyles } from "../theme/styles.js";

import { ExpandableTooltipContextProvider } from "./ExpandableTooltipContext.js";
import { useExpandableTooltip } from "./hooks/useExpandableTooltip.js";
import { useRePosition } from "./hooks/useRePosition.js";

export const ExpandedClass = "expanded";
export const ScrollbarClass = "with-scrollbar";

const useStyles = makeStyles()((theme: MaqlEditorDefaultTheme) => ({
    root: {
        position: "absolute",
        zIndex: 9999,
        fontFamily: theme.globals.font,
        border: theme.tooltip.borders.default,
        background: theme.tooltip.colors.background,
        boxShadow: `0 1px 20px ${theme.globals.colors.shadow}`,
        borderRadius: theme.tooltip.borderRadius,
        overflow: "hidden",
        transition: "top 200ms, left 200ms, transform 200ms, max-width 200ms, max-height 200ms",

        [`&.${ExpandedClass}`]: {
            top: "50% !important",
            left: "50% !important",
            transform: "translateX(-50%) translateY(-50%)",
        },
    },

    expand: {
        position: "absolute",
        zIndex: 99,
        top: 15,
        right: 15,
        cursor: "pointer",

        [`&.${ScrollbarClass}`]: {
            right: 30,
        },

        "&:hover svg path": {
            fill: theme.tooltip.colors.hover,
        },
    },
    open: {
        position: "absolute",
        zIndex: 99,
        top: 15,
        right: 45,
        cursor: "pointer",
        color: "#464E56",

        [`&.${ScrollbarClass}`]: {
            right: 60,
        },

        "&:hover": {
            color: theme.tooltip.colors.hover,
        },
    },
    overflow: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },

    divider: {
        top: 19,
        right: 36,
        width: 1,
        backgroundColor: theme.tooltip.colors.line,
        height: 12,
        zIndex: 99,
        position: "absolute",
    },
}));

export interface IExpandableTooltipProps {
    reference: MutableRefObject<IRootRef | null>;
    elements: Array<HTMLElement>;
    /**
     * Element that owns the tooltip for outside-click attribution (see {@link IExpandableTooltipSettings.anchor}).
     */
    anchor?: HTMLElement;
    className: string;
    readOnly?: boolean;
    onOpen?: () => void;
    onDestroy?: () => void;
    cachedPositions?: Array<
        | {
              top: number;
              left: number;
              width: number;
              height: number;
          }
        | undefined
    >;
}

function ExpandableTooltip({
    className,
    reference,
    elements,
    anchor,
    children,
    readOnly,
    onOpen,
    onDestroy,
    cachedPositions,
}: PropsWithChildren<IExpandableTooltipProps>) {
    const { classes, cx } = useStyles();

    const { expanded, setExpanded, hasScrollbar, setHasScrollbar } = useExpandableTooltip();
    const memoizedDestroy = useCallback(() => destroyTooltip(reference), [reference]);
    const { element, position } = useRePosition(
        reference,
        elements,
        classes.root,
        expanded,
        memoizedDestroy,
        cachedPositions,
    );

    // The tooltip renders into its own React root appended to <body>, outside the editor that
    // opened it, so an enclosing overlay/dialog with outside-click dismissal (e.g. the KD insight
    // overlay hosting AD) cannot attribute clicks inside it by DOM containment and would close on
    // the "edit" click. Mark it as a floating element anchored to its owner so ownership resolves
    // through the anchor chain (same contract as UiFloatingElement / PositionedMenuContent).
    const assignRootEl = useCallback(
        (node: HTMLElement | null) => {
            element.current = node as HTMLDivElement | null;
        },
        [element],
    );
    const setRootElWithAnchorRegistry = useRegisterFloatingAnchor(
        assignRootEl,
        anchor ?? elements[0] ?? null,
    );

    // Run onDestroy when component unmounts
    useEffect(() => {
        return () => onDestroy?.();
    }, [onDestroy]);

    return (
        <div className={cx(classes.overflow, expanded && ExpandedClass)}>
            <div
                className={cx(classes.root, className, expanded && ExpandedClass)}
                style={position}
                ref={setRootElWithAnchorRegistry}
                {...{ [FLOATING_ELEMENT_DATA_ATTR]: true }}
            >
                {onOpen && (
                    <div
                        className={cx(classes.open, hasScrollbar && ScrollbarClass, "s-maql_tooltip-open")}
                        onClick={() => {
                            onOpen();
                            destroyTooltip(reference);
                        }}
                    >
                        {readOnly ? (
                            <span className="gd-icon-visible" />
                        ) : (
                            <span className="gd-icon-pencil" />
                        )}
                    </div>
                )}
                {!expanded && (
                    <div
                        className={cx(
                            classes.expand,
                            hasScrollbar && ScrollbarClass,
                            "s-maql_tooltip-expand",
                        )}
                        onClick={() => {
                            setExpanded(true);
                            setHasScrollbar(false);
                        }}
                    >
                        <IconExpand />
                    </div>
                )}
                {onOpen && expanded && <div className={classes.divider} />}
                {expanded && (
                    <div
                        className={cx(classes.expand, hasScrollbar && ScrollbarClass, "s-maql_tooltip-close")}
                        onClick={() => destroyTooltip(reference)}
                    >
                        <IconClose />
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}

export interface IExpandableTooltipSettings {
    elements: Array<HTMLElement>;
    /**
     * Element that owns the tooltip for outside-click attribution: the tooltip is treated as part
     * of this element's subtree by overlay/dialog outside-click detection. It must be stable for
     * the tooltip's lifetime — the hovered `elements` are virtual-rendered by Monaco and may be
     * swapped for fresh nodes while the tooltip is open, so pass the editor's container node
     * rather than relying on the default (the first hovered element).
     */
    anchor?: HTMLElement;
    className?: string;
    readOnly?: boolean;
    onOpen?: () => void;
    onDestroy?: () => void;
    cachedPositions?: Array<
        | {
              top: number;
              left: number;
              width: number;
              height: number;
          }
        | undefined
    >;
}

export interface IRootRef {
    element: HTMLElement;
    root: Root;
}

export function renderTooltip(
    ref: MutableRefObject<IRootRef | null>,
    {
        elements,
        anchor,
        className = "",
        readOnly = false,
        onOpen,
        onDestroy,
        cachedPositions,
    }: IExpandableTooltipSettings,
    content: ReactElement,
): void {
    // First ensure any previous tooltip is destroyed
    destroyTooltip(ref);

    // Validate elements to ensure they're still in the DOM
    const validElements = elements.filter((el) => {
        const isValid = el && document.body.contains(el);

        // Additional validation to check if elements are visible/have dimensions
        if (isValid) {
            try {
                const rect = el.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
            } catch {
                return false;
            }
        }

        return isValid;
    });

    if (validElements.length === 0) {
        return;
    }

    const div = document.createElement("div");
    document.body.appendChild(div);

    try {
        const root = createRoot(div);
        root.render(
            <ExpandableTooltipContextProvider>
                <ExpandableTooltip
                    className={className}
                    reference={ref}
                    elements={validElements}
                    anchor={anchor}
                    readOnly={readOnly}
                    onOpen={onOpen}
                    onDestroy={onDestroy}
                    cachedPositions={cachedPositions}
                >
                    {content}
                </ExpandableTooltip>
            </ExpandableTooltipContextProvider>,
        );
        ref.current = { element: div, root };
    } catch {
        // If there's an error during rendering, clean up to avoid memory leaks
        div.remove();
    }
}

export function destroyTooltip(ref: MutableRefObject<IRootRef | null>): void {
    if (ref.current) {
        const { element, root } = ref.current;
        // Clear the ref first to prevent any race conditions
        ref.current = null;

        // Use try-catch to handle potential errors during unmounting
        try {
            // Unmount first to allow React to clean up properly
            root?.unmount();
        } catch {
            // Silently handle errors during unmounting
        } finally {
            // Always attempt to remove the element from the DOM
            element?.remove();
        }
    }
}
