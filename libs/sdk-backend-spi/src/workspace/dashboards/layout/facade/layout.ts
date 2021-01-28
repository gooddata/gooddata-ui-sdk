// (C) 2019-2021 GoodData Corporation
import { IFluidLayout, isFluidLayout } from "../fluidLayout";
import invariant from "ts-invariant";

import { IFluidLayoutFacade, IFluidLayoutRowsMethods } from "../fluidLayoutMethods";
import { FluidLayoutRowsMethods } from "./rows";

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export class FluidLayoutFacade<TContent> implements IFluidLayoutFacade<TContent> {
    protected constructor(protected _layout: IFluidLayout<TContent>) {}

    /**
     * Creates an instance of FluidLayoutFacade
     * @param layout - layout to wrap
     */
    public static for<TContent>(layout: IFluidLayout<TContent>): IFluidLayoutFacade<TContent> {
        invariant(isFluidLayout(layout), "Provided data must be IFluidLayout!");
        return new FluidLayoutFacade<TContent>(layout);
    }

    public rows = (): IFluidLayoutRowsMethods<TContent> => {
        return FluidLayoutRowsMethods.for(this);
    };

    public raw = (): IFluidLayout<TContent> => {
        return this._layout;
    };
}
