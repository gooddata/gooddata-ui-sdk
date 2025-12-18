// (C) 2025 GoodData Corporation

import { type ReactElement, memo, useCallback, useId, useState } from "react";

import cx from "classnames";

import type { PositionType } from "@gooddata/sdk-ui-vis-commons";

import { MultiLayerLegendSection } from "./MultiLayerLegendSection.js";
import type { ILegendModel } from "../../types/legend/index.js";

/**
 * State for tracking which sections are expanded.
 */
type ExpandedState = Record<string, boolean>;

/**
 * Props for MultiLayerLegendPanel component.
 *
 * @alpha
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
 * @alpha
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
}: IMultiLayerLegendPanelProps): ReactElement | null {
    const panelId = useId();

    // Manage expanded/collapsed state for each section
    const [expandedState, setExpandedState] = useState<ExpandedState>(() => initializeExpandedState(model));

    const handleExpandedChange = useCallback((layerId: string, expanded: boolean) => {
        setExpandedState((prev) => ({
            ...prev,
            [layerId]: expanded,
        }));
    }, []);

    const handleVisibilityChange = useCallback(
        (layerId: string) => {
            // When hiding a layer, also collapse it
            // When showing a layer, also expand it
            const isCurrentlyHidden = hiddenLayers.has(layerId);
            const willBeVisible = isCurrentlyHidden;

            setExpandedState((prev) => ({
                ...prev,
                [layerId]: willBeVisible,
            }));

            onLayerVisibilityChange?.(layerId);
        },
        [hiddenLayers, onLayerVisibilityChange],
    );

    if (!enabled || model.sections.length === 0) {
        return null;
    }

    // For single-layer legends, hide the layer visibility toggle
    const isSingleLayer = model.sections.length === 1;

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

    const panelStyle = maxHeightPx ? { maxHeight: maxHeightPx, overflowY: "auto" as const } : undefined;

    return (
        <div
            className={panelClassName}
            style={panelStyle}
            role="group"
            aria-label={model.title ?? "Map legend"}
            data-testid="gd-geo-multi-layer-legend"
        >
            {model.sections.map((section, index) => (
                <MultiLayerLegendSection
                    key={section.layerId}
                    section={section}
                    sectionId={`${panelId}-section-${index}`}
                    isExpanded={expandedState[section.layerId] ?? true}
                    isVisible={!hiddenLayers.has(section.layerId)}
                    showToggle={!isSingleLayer}
                    onExpandedChange={handleExpandedChange}
                    onVisibilityChange={handleVisibilityChange}
                    onItemClick={onItemClick}
                />
            ))}
        </div>
    );
});
