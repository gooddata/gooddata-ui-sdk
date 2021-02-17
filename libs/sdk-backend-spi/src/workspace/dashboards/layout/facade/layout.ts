// (C) 2019-2021 GoodData Corporation
import invariant from "ts-invariant";
import { IFluidLayout, IFluidLayoutSize, isFluidLayout } from "../fluidLayout";

import { IFluidLayoutFacade, IFluidLayoutFacadeImpl, IFluidLayoutRowsFacadeImpl } from "./interfaces";
import { FluidLayoutRowsFacade } from "./rows";

/**
 * @alpha
 */
export class FluidLayoutFacade<TContent, TLayout extends IFluidLayout<TContent>>
    implements IFluidLayoutFacade<TContent, TLayout> {
    protected constructor(protected layout: TLayout) {}

    /**
     * Creates an instance of FluidLayoutFacade
     * @param layout - layout to wrap
     */
    public static for<TContent>(layout: IFluidLayout<TContent>): IFluidLayoutFacadeImpl<TContent> {
        invariant(isFluidLayout(layout), "Provided data must be IFluidLayout!");
        return new FluidLayoutFacade(layout);
    }

    public rows(): IFluidLayoutRowsFacadeImpl<TContent> {
        return FluidLayoutRowsFacade.for(this, this.layout.rows);
    }

    public size(): IFluidLayoutSize | undefined {
        return this.layout.size;
    }

    public raw(): TLayout {
        return this.layout;
    }
}
