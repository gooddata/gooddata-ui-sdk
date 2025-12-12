// (C) 2023-2025 GoodData Corporation
import { type Identifier } from "@gooddata/sdk-model";
import { type HeadlineElementType } from "@gooddata/sdk-ui";

import { type IHeadlineDataItem } from "./Headlines.js";

export interface IHeadlineFiredDrillEventItemContext {
    localIdentifier: Identifier;
    value: string | null;
    element: HeadlineElementType;
}

export type HeadlineFiredDrillEvent = (
    item: IHeadlineFiredDrillEventItemContext,
    elementTarget?: EventTarget,
) => void;

export type FiredDrillEventCallback = (
    item: IHeadlineDataItem,
    elementType: HeadlineElementType,
    elementTarget: EventTarget,
) => void;
