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
    private static Cache: WeakMap<IFluidLayout<any>, FluidLayoutFacade<any>> = new WeakMap<
        IFluidLayout<any>,
        FluidLayoutFacade<any>
    >();
    protected constructor(protected _layout: IFluidLayout<TContent>) {}

    /**
     * Creates an instance of FluidLayoutFacade
     * @param layout - layout to wrap
     */
    public static for<TContent>(layout: IFluidLayout<TContent>): IFluidLayoutFacade<TContent> {
        invariant(isFluidLayout(layout), "Provided data must be IFluidLayout!");
        if (!FluidLayoutFacade.Cache.has(layout)) {
            FluidLayoutFacade.Cache.set(layout, new FluidLayoutFacade(layout));
        }

        return FluidLayoutFacade.Cache.get(layout)!;
    }

    public rows = (): IFluidLayoutRowsMethods<TContent> => {
        return FluidLayoutRowsMethods.for(this, this._layout.rows);
    };

    public raw = (): IFluidLayout<TContent> => {
        return this._layout;
    };
}
