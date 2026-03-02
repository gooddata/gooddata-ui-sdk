// (C) 2025-2026 GoodData Corporation

import {
    type ReactElement,
    memo,
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import cx from "classnames";

import type { PositionType } from "@gooddata/sdk-ui-vis-commons";

import { type LegendMessageFormatter } from "./legendMessages.js";
import { MultiLayerLegendSection } from "./MultiLayerLegendSection.js";
import {
    type ILegendModel,
    type ILegendSection,
    isLegendColorCategoryItem,
} from "../../types/legend/model.js";

/**
 * State for tracking which sections are expanded.
 */
type ExpandedState = Record<string, boolean>;

type SectionRefs = Record<string, HTMLDivElement>;

type SectionHeights = Record<string, number>;

// Section header height (matches CSS variable --gd-geo-multi-layer-legend__section-header-height)
const COLLAPSED_SECTION_HEIGHT = 34;
// Matches the 10px top + 10px bottom spacing from `_geo-multi-layer-legend.scss`
// and the `max-height: calc(100% - 20px)` rule.
const LEGEND_VERTICAL_MARGIN_PX = 20;

/**
 * Hook to manage flexible height distribution for collapsible sections.
 *
 * Measures section heights and calculates which sections
 * should flex-grow based on their content height vs fair share of container.
 * We start from 0, calculate container height and grow to the available space to achieve equal share.
 */
function useFlexibleHeightSections(sections: ILegendSection[], expandedState: ExpandedState) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<SectionRefs>({});
    // Full heights (measured once on first render when all sections are expanded,
    // we can't measure after collapse/expand due to animation time)
    const fullContainerHeight = useRef<number | null>(null);
    const fullSectionHeights = useRef<SectionHeights>({});

    const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);
    const [flexibleSections, setFlexibleSections] = useState<string[]>([]);

    // Ref callback to store section refs by layerId
    const setSectionRef = useCallback((layerId: string) => {
        return (element: HTMLDivElement | null) => {
            if (element) {
                sectionRefs.current[layerId] = element;
            } else {
                delete sectionRefs.current[layerId];
            }
        };
    }, []);

    // Get ref object for a section by layerId
    const getSectionRef = useCallback((layerId: string): HTMLDivElement | undefined => {
        return sectionRefs.current?.[layerId];
    }, []);

    // Calculate which sections need flex-grow based on cached or measured heights
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // On first render, cache container height and section heights
        if (fullContainerHeight.current === null) {
            // Use the map container height as the available space, not the legend's initial content height.
            // Otherwise, expanding one section can incorrectly force other sections into "flexible/scrollable"
            // mode even when there is still plenty of vertical space.
            const parentHeight = container.parentElement?.clientHeight;
            fullContainerHeight.current =
                typeof parentHeight === "number" && parentHeight > 0
                    ? Math.max(0, parentHeight - LEGEND_VERTICAL_MARGIN_PX)
                    : container.clientHeight;
            sections.forEach((section) => {
                const el = sectionRefs.current[section.layerId];
                fullSectionHeights.current[section.layerId] = el?.scrollHeight ?? 0;
            });
        }

        const availableContainerHeight = fullContainerHeight.current ?? 0;

        // Calculate using cached heights for expanded sections, COLLAPSED_SECTION_HEIGHT for collapsed
        const flexibleLayerIds: string[] = [];
        let totalContentHeight = 0;
        const expandedCount = sections.filter((s) => expandedState[s.layerId] ?? true).length;

        // Sum of all collapsed section heights
        const collapsedHeight = (sections.length - expandedCount) * COLLAPSED_SECTION_HEIGHT;
        // Equal share of available space for expanded sections
        const equalShare =
            expandedCount > 0
                ? (availableContainerHeight - collapsedHeight) / expandedCount
                : availableContainerHeight;

        sections.forEach((section) => {
            const isExpanded = expandedState[section.layerId] ?? true;
            const sectionHeight = isExpanded
                ? (fullSectionHeights.current[section.layerId] ?? 0)
                : COLLAPSED_SECTION_HEIGHT;
            if (isExpanded && sectionHeight > equalShare) {
                flexibleLayerIds.push(section.layerId);
            }
            totalContentHeight += sectionHeight;
        });
        setFlexibleSections(flexibleLayerIds);
        setContainerHeight(Math.min(availableContainerHeight, totalContentHeight));
    }, [expandedState, sections]);

    return {
        containerRef,
        setSectionRef,
        getSectionRef,
        containerHeight,
        flexibleSections,
    };
}

/**
 * Props for MultiLayerLegendPanel component.
 *
 * @internal
 */
export interface IMultiLayerLegendPanelProps {
    /**
     * Legend model containing all sections.
     */
    model: ILegendModel;

    /**
     * Whether the legend should render at all.
     * Allows the caller to gate the component without extra branching.
     */
    enabled?: boolean;

    /**
     * Legend position relative to the chart.
     */
    position?: PositionType;

    /**
     * Optional maximum height in pixels (for scrollable legend).
     */
    maxHeightPx?: number;

    /**
     * Set of layer IDs that are currently hidden.
     * Controlled externally - layers not in this set are visible.
     */
    hiddenLayers?: Set<string>;

    /**
     * Callback when layer visibility changes.
     * Called when user toggles the visibility switch for a layer.
     */
    onLayerVisibilityChange?: (layerId: string) => void;

    /**
     * Callback when a legend item is clicked.
     * Called when user clicks a category item to toggle its visibility.
     *
     * @param layerId - The ID of the layer containing the item
     * @param uri - The URI of the clicked item
     */
    onItemClick?: (layerId: string, uri: string) => void;

    /**
     * Enables enhanced a11y semantics and live announcements for legend interactions.
     */
    enableGeoChartA11yImprovements?: boolean;

    /**
     * Optional formatter for accessibility messages.
     */
    formatMessage?: LegendMessageFormatter;

    /**
     * Optional ref callback to expose panel root DOM element.
     */
    setPanelElementRef?: (element: HTMLDivElement | null) => void;
}

/**
 * Initialize expanded state from model sections.
 * All sections are expanded by default for multi-layer legend.
 */
function initializeExpandedState(model: ILegendModel): ExpandedState {
    const state: ExpandedState = {};
    model.sections.forEach((section) => {
        // Use section's isExpanded if defined, otherwise expanded by default
        state[section.layerId] = section.isExpanded ?? true;
    });
    return state;
}

/**
 * Multi-layer legend panel that renders sections for all layers.
 *
 * @remarks
 * Displays a stacked list of legend sections, one per layer.
 * Each section shows the layer's legend groups (size, color, etc.).
 * Supports expand/collapse for sections and visibility toggles for layers.
 *
 * @internal
 */
const EMPTY_HIDDEN_LAYERS = new Set<string>();

export const MultiLayerLegendPanel = memo(function MultiLayerLegendPanel({
    model,
    enabled = true,
    position = "right",
    maxHeightPx,
    hiddenLayers = EMPTY_HIDDEN_LAYERS,
    onLayerVisibilityChange,
    onItemClick,
    enableGeoChartA11yImprovements = false,
    formatMessage,
    setPanelElementRef,
}: IMultiLayerLegendPanelProps): ReactElement | null {
    const panelId = useId();

    // Render legend sections in reverse order so the first defined layer appears on top.
    // This is purely a presentation concern - underlying layer order stays unchanged.
    const sections = useMemo(() => [...model.sections].reverse(), [model.sections]);

    // Manage expanded/collapsed state for each section
    const [expandedState, setExpandedState] = useState<ExpandedState>(() => initializeExpandedState(model));

    // Live region announcement for screen readers
    const [announcement, setAnnouncement] = useState("");
    const announcementFrameIdRef = useRef<number | null>(null);

    // Clear-then-set pattern so screen readers pick up repeated identical messages
    const announce = useCallback((msg: string) => {
        if (announcementFrameIdRef.current !== null) {
            cancelAnimationFrame(announcementFrameIdRef.current);
        }

        setAnnouncement("");
        announcementFrameIdRef.current = requestAnimationFrame(() => {
            setAnnouncement(msg);
            announcementFrameIdRef.current = null;
        });
    }, []);

    useEffect(() => {
        return () => {
            if (announcementFrameIdRef.current !== null) {
                cancelAnimationFrame(announcementFrameIdRef.current);
            }
        };
    }, []);

    const formatLegendMessage = useCallback<LegendMessageFormatter>(
        (id, values) => {
            return formatMessage?.(id, values) ?? "";
        },
        [formatMessage],
    );
    const layerTitleById = useMemo(() => {
        return Object.fromEntries(
            model.sections.map((section) => [section.layerId, section.layerTitle] as const),
        );
    }, [model.sections]);

    // Flexible height management
    const { containerRef, getSectionRef, setSectionRef, containerHeight, flexibleSections } =
        useFlexibleHeightSections(sections, expandedState);
    const setRootPanelRef = useCallback(
        (element: HTMLDivElement | null) => {
            containerRef.current = element;
            setPanelElementRef?.(element);
        },
        [containerRef, setPanelElementRef],
    );

    const handleExpandedChange = useCallback((layerId: string, expanded: boolean) => {
        setExpandedState((prev) => ({
            ...prev,
            [layerId]: expanded,
        }));
    }, []);
    const syncExpandedStateWithVisibility = useCallback((layerId: string, visible: boolean) => {
        // Keep section expand/collapse in sync with visibility intent from the switch interaction.
        setExpandedState((prev) => ({
            ...prev,
            [layerId]: visible,
        }));
    }, []);
    const announceLayerVisibilityChange = useCallback(
        (layerId: string, visible: boolean) => {
            if (!enableGeoChartA11yImprovements) {
                return;
            }

            const layerTitle = layerTitleById[layerId] ?? layerId;
            const messageId = visible ? "geochart.legend.layer.shown" : "geochart.legend.layer.hidden";
            announce(formatLegendMessage(messageId, { name: layerTitle }));
        },
        [announce, enableGeoChartA11yImprovements, formatLegendMessage, layerTitleById],
    );

    const handleVisibilityChange = useCallback(
        (layerId: string, visible: boolean) => {
            announceLayerVisibilityChange(layerId, visible);
            syncExpandedStateWithVisibility(layerId, visible);
            onLayerVisibilityChange?.(layerId);
        },
        [announceLayerVisibilityChange, onLayerVisibilityChange, syncExpandedStateWithVisibility],
    );

    const handleItemClick = useCallback(
        (layerId: string, uri: string) => {
            const section = model.sections.find((s) => s.layerId === layerId);
            if (!section) {
                onItemClick?.(layerId, uri);
                return;
            }

            for (const group of section.groups) {
                for (const item of group.items) {
                    if (isLegendColorCategoryItem(item) && item.uri === uri) {
                        const messageId = item.isVisible
                            ? "geochart.legend.item.hidden"
                            : "geochart.legend.item.shown";
                        announce(formatLegendMessage(messageId, { name: item.label }));
                        onItemClick?.(layerId, uri);
                        return;
                    }
                }
            }

            onItemClick?.(layerId, uri);
        },
        [model.sections, announce, onItemClick, formatLegendMessage],
    );

    if (!enabled || sections.length === 0) {
        return null;
    }

    // For single-layer legends, hide the layer visibility toggle
    const isSingleLayer = sections.length === 1;

    // Map position to overlay corner
    // Multi-layer legend overlays the map, so we default to top-right to not obscure the map
    const positionToCorner: Record<string, string> = {
        left: "top-left",
        right: "top-right",
        top: "top-right", // Default to top-right for overlay legend
        bottom: "bottom-right",
        auto: "top-right",
    };
    const corner = positionToCorner[position] ?? "top-right";

    const panelClassName = cx("gd-geo-multi-layer-legend", `gd-geo-multi-layer-legend--${corner}`);

    const panelStyle = {
        ...(containerHeight && { height: containerHeight }),
        ...(maxHeightPx && { maxHeight: maxHeightPx, overflowY: "auto" as const }),
    };

    return (
        <div
            ref={setRootPanelRef}
            className={panelClassName}
            style={panelStyle}
            role="group"
            aria-label={model.title ?? "Map legend"}
            data-testid="gd-geo-multi-layer-legend"
        >
            {sections.map((section, index) => (
                <MultiLayerLegendSection
                    key={section.layerId}
                    setSectionRef={setSectionRef(section.layerId)}
                    sectionElement={getSectionRef(section.layerId)}
                    section={section}
                    sectionId={`${panelId}-section-${index}`}
                    isExpanded={expandedState[section.layerId] ?? true}
                    isVisible={!hiddenLayers.has(section.layerId)}
                    showToggle={!isSingleLayer}
                    isFlexible={flexibleSections.includes(section.layerId)}
                    onExpandedChange={handleExpandedChange}
                    onVisibilityChange={handleVisibilityChange}
                    onItemClick={
                        enableGeoChartA11yImprovements
                            ? onItemClick
                                ? handleItemClick
                                : undefined
                            : onItemClick
                    }
                    enableGeoChartA11yImprovements={enableGeoChartA11yImprovements}
                    formatMessage={formatLegendMessage}
                />
            ))}
            {enableGeoChartA11yImprovements ? (
                <div
                    aria-live="polite"
                    aria-atomic="true"
                    className="sr-only"
                    data-testid="gd-geo-legend-live-region"
                >
                    {announcement}
                </div>
            ) : null}
        </div>
    );
});
