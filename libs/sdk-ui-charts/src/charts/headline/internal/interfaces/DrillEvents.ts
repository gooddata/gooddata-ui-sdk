// (C) 2023 GoodData Corporation
import { Identifier } from "@gooddata/sdk-model";
import { HeadlineElementType } from "@gooddata/sdk-ui";
import { IHeadlineDataItem } from "./Headlines.js";

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
