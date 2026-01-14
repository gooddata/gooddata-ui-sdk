// (C) 2023-2026 GoodData Corporation

import { type Identifier } from "@gooddata/sdk-model";
import { type HeadlineElementType, type IChartCoordinates } from "@gooddata/sdk-ui";

import { type IHeadlineDataItem } from "./Headlines.js";

export interface IHeadlineFiredDrillEventItemContext {
    localIdentifier: Identifier;
    value: string | null;
    element: HeadlineElementType;
}

export type HeadlineFiredDrillEvent = (
    item: IHeadlineFiredDrillEventItemContext,
    elementTarget?: EventTarget,
    chartCoordinates?: IChartCoordinates,
) => void;

export type FiredDrillEventCallback = (
    item: IHeadlineDataItem,
    elementType: HeadlineElementType,
    elementTarget: EventTarget,
    chartCoordinates?: IChartCoordinates,
) => void;
