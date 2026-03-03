// (C) 2026 GoodData Corporation

import { type MessageDescriptor, defineMessages } from "react-intl";

import {
    type IMapInteractionOptions,
    isMapRotationInteractionEnabled,
    resolveMapInteractionOptions,
} from "../map/runtime/mapConfig.js";
import { type IGeoChartConfig } from "../types/config/unified.js";

export interface IMapCanvasInstructionCapabilities {
    isStatic: boolean;
    canPan: boolean;
    canZoom: boolean;
    canRotatePitch: boolean;
}

export interface IMapCanvasRuntimeCapabilities extends IMapCanvasInstructionCapabilities {
    isKeyboardInteractionEnabled: boolean;
    isKeyboardRotationEnabled: boolean;
}

/**
 * Derives map canvas interaction capabilities from the same inputs used by map initialization.
 *
 * @internal
 */
export function getMapCanvasRuntimeCapabilities(
    config?: Pick<IGeoChartConfig, "viewport" | "applyViewportNavigation">,
    interactionOverrides?: Partial<IMapInteractionOptions>,
): IMapCanvasRuntimeCapabilities {
    const isStatic = Boolean(config?.viewport?.frozen);
    const shouldApplyViewportNavigation = config?.applyViewportNavigation !== false;
    const canPanByNavigation = !shouldApplyViewportNavigation || (config?.viewport?.navigation?.pan ?? true);
    const canZoomByNavigation =
        !shouldApplyViewportNavigation || (config?.viewport?.navigation?.zoom ?? true);
    const interactionOptions = resolveMapInteractionOptions({
        interactive: !isStatic,
        ...interactionOverrides,
    });
    const isKeyboardInteractionEnabled = interactionOptions.interactive !== false;
    const isKeyboardRotationEnabled = isMapRotationInteractionEnabled(interactionOptions);

    return {
        isStatic,
        canPan: isKeyboardInteractionEnabled && canPanByNavigation,
        canZoom: isKeyboardInteractionEnabled && canZoomByNavigation,
        canRotatePitch: isKeyboardRotationEnabled,
        isKeyboardInteractionEnabled,
        isKeyboardRotationEnabled,
    };
}

/**
 * @internal
 */
export type MapCanvasInstructionMessageId =
    | "geochart.map.canvas.static"
    | "geochart.map.canvas.instructions.panZoomRotatePitch"
    | "geochart.map.canvas.instructions.panZoom"
    | "geochart.map.canvas.instructions.panOnly"
    | "geochart.map.canvas.instructions.zoomOnly";

export const mapCanvasInstructionMessagesById: Record<MapCanvasInstructionMessageId, MessageDescriptor> =
    defineMessages({
        "geochart.map.canvas.static": {
            id: "geochart.map.canvas.static",
        },
        "geochart.map.canvas.instructions.panZoomRotatePitch": {
            id: "geochart.map.canvas.instructions.panZoomRotatePitch",
        },
        "geochart.map.canvas.instructions.panZoom": {
            id: "geochart.map.canvas.instructions.panZoom",
        },
        "geochart.map.canvas.instructions.panOnly": {
            id: "geochart.map.canvas.instructions.panOnly",
        },
        "geochart.map.canvas.instructions.zoomOnly": {
            id: "geochart.map.canvas.instructions.zoomOnly",
        },
    });

/**
 * Resolves localized SR instruction message id for map canvas keyboard usage.
 *
 * @internal
 */
export function getMapCanvasInstructionMessageId({
    isStatic,
    canPan,
    canZoom,
    canRotatePitch,
}: IMapCanvasInstructionCapabilities): MapCanvasInstructionMessageId {
    if (isStatic) {
        return "geochart.map.canvas.static";
    }

    if (canPan && canZoom && canRotatePitch) {
        return "geochart.map.canvas.instructions.panZoomRotatePitch";
    }

    if (canPan && canZoom) {
        return "geochart.map.canvas.instructions.panZoom";
    }

    if (canPan) {
        return "geochart.map.canvas.instructions.panOnly";
    }

    if (canZoom) {
        return "geochart.map.canvas.instructions.zoomOnly";
    }

    return "geochart.map.canvas.static";
}
