// (C) 2007-2025 GoodData Corporation
import { type SVGAttributes } from "react";

import { type IColor } from "@gooddata/sdk-model";
import { type IHeaderPredicate } from "@gooddata/sdk-ui";

/**
 * @public
 */
export interface IColorMapping {
    /**
     * Predicate function which will be called for each entity that will be charted.
     *
     * @remarks
     * If matched, the `color` will assigned to that entity when it is rendered (be it as a bar, column, point, slice etc)
     */
    predicate: IHeaderPredicate;

    /**
     * Color to assign.
     *
     * @remarks
     * It is possible to assign color from colorPalette or provide custom color as RGB code.
     */
    color: IColor;
}

/**
 * @public
 */
export type ChartFillType = "solid" | "pattern" | "outline";

/**
 * @internal
 */
export interface IPatternOptionsObject {
    path: SVGAttributes<SVGPathElement>;
    width: number;
    height: number;
    color?: string;
    opacity?: number;
}

/**
 * @internal
 */
export interface IPatternObject {
    pattern: IPatternOptionsObject;
}
