// (C) 2019-2021 GoodData Corporation
import { IFluidLayoutRow, IFluidLayoutSectionHeader } from "../fluidLayout";

import {
    IFluidLayoutColumnsMethods,
    IFluidLayoutRowMethods,
    IFluidLayoutFacade,
} from "../fluidLayoutMethods";
import { FluidLayoutColumnsMethods } from "./columns";

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export class FluidLayoutRowMethods<TContent> implements IFluidLayoutRowMethods<TContent> {
    protected constructor(
        protected readonly _layoutFacade: IFluidLayoutFacade<TContent>,
        protected readonly _row: IFluidLayoutRow<TContent>,
        protected readonly _index: number,
    ) {}

    public static for<TContent>(
        layoutFacade: IFluidLayoutFacade<TContent>,
        row: IFluidLayoutRow<TContent>,
        index: number,
    ): FluidLayoutRowMethods<TContent> {
        return new FluidLayoutRowMethods(layoutFacade, row, index);
    }

    public raw = (): IFluidLayoutRow<TContent> => this._row;

    public header = (): IFluidLayoutSectionHeader | undefined => this._row.header;

    public style = (): string | undefined => this._row.style;

    public index = (): number => this._index;

    public columns = (): IFluidLayoutColumnsMethods<TContent> =>
        FluidLayoutColumnsMethods.for(this._layoutFacade, this);

    public isLast = (): boolean => this.index() + 1 === this._layoutFacade.rows().raw().length;

    public layout = (): IFluidLayoutFacade<TContent> => this._layoutFacade;
}
