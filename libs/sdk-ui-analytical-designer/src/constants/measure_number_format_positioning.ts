// (C) 2020-2026 GoodData Corporation

import { type IPositioning, SnapPoint } from "@gooddata/sdk-ui-kit";

export const PRESETS_DROPDOWN_POSITIONING: IPositioning[] = [
    {
        snapPoints: { parent: SnapPoint.BottomLeft, child: SnapPoint.TopLeft },
        offset: { x: -7 },
    },
    {
        snapPoints: { parent: SnapPoint.TopLeft, child: SnapPoint.BottomLeft },
        offset: { x: -7 },
    },
];

export const CUSTOM_FORMAT_DIALOG_POSITIONING: IPositioning[] = [
    {
        snapPoints: {
            parent: SnapPoint.CenterRight,
            child: SnapPoint.CenterLeft,
        },
        offset: { x: 20 },
    },
    {
        snapPoints: { parent: SnapPoint.TopRight, child: SnapPoint.TopLeft },
        offset: { x: 20 },
    },
    {
        snapPoints: {
            parent: SnapPoint.BottomRight,
            child: SnapPoint.BottomLeft,
        },
        offset: { x: 20 },
    },
];
