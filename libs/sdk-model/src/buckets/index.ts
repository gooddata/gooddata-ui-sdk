// (C) 2019 GoodData Corporation
import { IAttribute } from "../attribute";
import { Identifier, INativeTotalItem } from "../base";
import { IMeasure } from "../measure";

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type AttributeOrMeasure = IMeasure | IAttribute;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type AttributeOrMeasureOrTotal = IMeasure | IAttribute | INativeTotalItem;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IBucket {
    localIdentifier?: Identifier;
    items: AttributeOrMeasureOrTotal[];
}
