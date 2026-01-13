// (C) 2025-2026 GoodData Corporation

import {
    type KeyboardEvent,
    type ReactElement,
    type TransitionEvent,
    memo,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import cx from "classnames";

import { ChevronIcon } from "./ChevronIcon.js";
import { LayerToggleSwitch } from "./LayerToggleSwitch.js";
import { LegendGroupColor } from "./LegendGroupColor.js";
import { LegendGroupColorScale } from "./LegendGroupColorScale.js";
import { LegendGroupSize } from "./LegendGroupSize.js";
import type { ILegendGroup, ILegendSection } from "../../types/legend/index.js";

/**
 * Props for MultiLayerLegendSection component.
 *
 * @alpha
 */
export interface IMultiLayerLegendSectionProps {
    /**
     * Section data containing layer info and legend groups.
     */
    section: ILegendSection;

    /**
     * Unique ID for the section (used for aria-labelledby).
     */
    sectionId: string;

    /**
     * Whether the section content is expanded.
     */
    isExpanded?: boolean;

    /**
     * Whether the layer is visible on the map.
     */
    isVisible?: boolean;

    /**
     * Whether to show the layer visibility toggle switch.
     * When false, the toggle is hidden (used for single-layer legends).
     * Defaults to true.
     */
    showToggle?: boolean;

    /**
     * Whether this section is flexible (should grow to fill available space).
     * Set to true for sections whose content exceeds their equal share.
     */
    isFlexible?: boolean;

    /**
     * Ref callback to set the section's root DOM element.
     * Used by parent for height measurements.
     */
    setSectionRef?: (element: HTMLDivElement | null) => void;

    /**
     * The section's root DOM element (for internal CSS reading).
     * Provided by parent from its refs store.
     */
    sectionElement?: HTMLDivElement;

    /**
     * Callback when expand/collapse state changes.
     */
    onExpandedChange?: (layerId: string, expanded: boolean) => void;

    /**
     * Callback when visibility toggle is clicked.
     * Toggles the layer visibility state.
     */
    onVisibilityChange?: (layerId: string) => void;

    /**
     * Callback when a legend item is clicked.
     * Used to toggle individual category items.
     *
     * @param layerId - The ID of the layer containing the item
     * @param uri - The URI of the clicked item
     */
    onItemClick?: (layerId: string, uri: string) => void;
}

/**
 * Renders a legend group based on its kind.
 */
function renderGroup(
    group: ILegendGroup,
    groupIndex: number,
    onItemClick?: (uri: string) => void,
): ReactElement {
    switch (group.kind) {
        case "size":
            return <LegendGroupSize key={groupIndex} group={group} />;
        case "color":
            return <LegendGroupColor key={groupIndex} group={group} onItemClick={onItemClick} />;
        case "colorScale":
            return <LegendGroupColorScale key={groupIndex} group={group} />;
        default:
            return <></>;
    }
}

/**
 * Multi-layer legend section for a single layer.
 *
 * @remarks
 * Displays the layer title with expand/collapse chevron and visibility toggle.
 * Shows legend groups (size, color, etc.) when expanded.
 *
 * @alpha
 */
export const MultiLayerLegendSection = memo(function MultiLayerLegendSection({
    section,
    sectionId,
    isExpanded = true,
    isVisible = true,
    showToggle = true,
    isFlexible = false,
    setSectionRef,
    sectionElement,
    onExpandedChange,
    onVisibilityChange,
    onItemClick,
}: IMultiLayerLegendSectionProps): ReactElement {
    const displayTitle = section.layerTitle;
    const titleId = `${sectionId}-title`;
    const toggleId = `${sectionId}-toggle`;
    const isFirstRenderRef = useRef(true);
    const expandTimeoutRef = useRef<number | undefined>(undefined);

    // Wrap onItemClick to include layerId - this binds the section's layerId
    // so inner components don't need to know about multi-layer context
    const handleItemClick = useCallback(
        (uri: string) => {
            onItemClick?.(section.layerId, uri);
        },
        [onItemClick, section.layerId],
    );

    // When the layer is hidden, disable interaction with legend items in the section content.
    // Section stays expandable, but content should not be focusable/clickable.
    const itemClickHandler = isVisible ? handleItemClick : undefined;

    /**
     * Scroll is enabled only after the expand animation completes.
     * This avoids showing scrollbar during the expand transition and works reliably across browsers
     * (CSS keyframes are not a dependable way to switch `overflow`).
     */
    const [isScrollEnabled, setIsScrollEnabled] = useState(false);

    const clearExpandTimeout = useCallback(() => {
        if (expandTimeoutRef.current !== undefined) {
            window.clearTimeout(expandTimeoutRef.current);
            expandTimeoutRef.current = undefined;
        }
    }, []);

    const getToggleDurationMs = useCallback((): number => {
        const element = sectionElement;
        if (!element || typeof window === "undefined") {
            return 200;
        }

        const durationRaw = window
            .getComputedStyle(element)
            .getPropertyValue("--gd-geo-multi-layer-legend__toggle-duration")
            .trim();

        if (!durationRaw) {
            return 200;
        }

        // Supports values like "0.2s" or "200ms"
        const msMatch = durationRaw.match(/^(\d+(?:\.\d+)?)ms$/);
        if (msMatch) {
            return Math.max(0, Math.round(Number(msMatch[1])));
        }

        const sMatch = durationRaw.match(/^(\d+(?:\.\d+)?)s$/);
        if (sMatch) {
            return Math.max(0, Math.round(Number(sMatch[1]) * 1000));
        }

        return 200;
    }, [sectionElement]);

    useEffect(() => {
        if (!isExpanded) {
            clearExpandTimeout();
            setIsScrollEnabled(false);
            return;
        }

        // If the section is expanded on initial mount, there is no "expand animation" to wait for.
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            setIsScrollEnabled(true);
            return;
        }

        // If user prefers reduced motion, transitions may be disabled -> enable scroll immediately.
        if (
            typeof window !== "undefined" &&
            window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
        ) {
            setIsScrollEnabled(true);
            return;
        }

        // Otherwise wait for transition end (with a timeout fallback if the event doesn't fire).
        clearExpandTimeout();
        setIsScrollEnabled(false);
        const durationMs = getToggleDurationMs();
        expandTimeoutRef.current = window.setTimeout(() => {
            setIsScrollEnabled(true);
            expandTimeoutRef.current = undefined;
        }, durationMs + 50);
    }, [clearExpandTimeout, getToggleDurationMs, isExpanded]);

    const handleExpandClick = () => {
        onExpandedChange?.(section.layerId, !isExpanded);
    };

    // LayerToggleSwitch calls onChange with the new checked value, but we use toggle pattern
    const handleVisibilityChange = (_visible: boolean) => {
        onVisibilityChange?.(section.layerId);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleExpandClick();
        }
    };

    const handleSectionTransitionEnd = useCallback(
        (event: TransitionEvent<HTMLDivElement>) => {
            // We care only about the section's own grid transition, not nested transitions.
            if (event.target !== event.currentTarget) {
                return;
            }
            if (event.propertyName !== "grid-template-rows") {
                return;
            }
            if (isExpanded) {
                clearExpandTimeout();
                setIsScrollEnabled(true);
            }
        },
        [clearExpandTimeout, isExpanded],
    );

    const sectionClassName = cx("gd-geo-multi-layer-legend__section", {
        "gd-geo-multi-layer-legend__section--pushpin": section.layerKind === "pushpin",
        "gd-geo-multi-layer-legend__section--area": section.layerKind === "area",
        "gd-geo-multi-layer-legend__section--expanded": isExpanded,
        "gd-geo-multi-layer-legend__section--collapsed": !isExpanded,
        "gd-geo-multi-layer-legend__section--scroll-enabled": isScrollEnabled,
        "gd-geo-multi-layer-legend__section--hidden": !isVisible,
        "gd-geo-multi-layer-legend__section--flexible": isFlexible && isExpanded,
    });

    return (
        <div
            className={sectionClassName}
            role="group"
            aria-labelledby={titleId}
            data-testid={`gd-geo-legend-section-${section.layerId}`}
            onTransitionEnd={handleSectionTransitionEnd}
            ref={setSectionRef}
        >
            <div
                className="gd-geo-multi-layer-legend__section-header"
                onClick={handleExpandClick}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-controls={`${sectionId}-content`}
            >
                <span className="gd-geo-multi-layer-legend__section-chevron">
                    <ChevronIcon isExpanded={isExpanded} />
                </span>
                <span id={titleId} className="gd-geo-multi-layer-legend__section-title" title={displayTitle}>
                    {displayTitle}
                </span>
                {showToggle ? (
                    <span
                        className="gd-geo-multi-layer-legend__section-toggle"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                    >
                        <LayerToggleSwitch
                            id={toggleId}
                            checked={isVisible}
                            onChange={handleVisibilityChange}
                            ariaLabel={`Toggle ${displayTitle} visibility`}
                        />
                    </span>
                ) : null}
            </div>
            {/* Content wrapper for CSS Grid animation - always rendered */}
            <div className="gd-geo-multi-layer-legend__section-content-wrapper">
                <div
                    id={`${sectionId}-content`}
                    className="gd-geo-multi-layer-legend__section-content"
                    aria-disabled={!isVisible}
                >
                    {section.groups.map((group, index) => renderGroup(group, index, itemClickHandler))}
                </div>
            </div>
        </div>
    );
});
