// (C) 2007-2022 GoodData Corporation
import { IHeaderPredicate } from "@gooddata/sdk-ui";
import { IColor } from "@gooddata/sdk-model";

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
