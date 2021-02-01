// (C) 2019-2021 GoodData Corporation
import {
    IFluidLayoutColumn,
    IFluidLayoutSize,
    IFluidLayoutSizeByScreen,
    ResponsiveScreenType,
} from "../fluidLayout";

import { IFluidLayoutColumnMethods, IFluidLayoutFacade, IFluidLayoutRowMethods } from "../fluidLayoutMethods";

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export class FluidLayoutColumnMethods<TContent> implements IFluidLayoutColumnMethods<TContent> {
    private static Cache: WeakMap<IFluidLayoutColumn<any>, FluidLayoutColumnMethods<any>> = new WeakMap<
        IFluidLayoutColumn<any>,
        FluidLayoutColumnMethods<any>
    >();

    protected constructor(
        protected _layoutFacade: IFluidLayoutFacade<TContent>,
        protected _rowFacade: IFluidLayoutRowMethods<TContent>,
        protected _column: IFluidLayoutColumn<TContent>,
        protected readonly _index: number,
    ) {}

    public static for<TContent>(
        layoutFacade: IFluidLayoutFacade<TContent>,
        rowFacade: IFluidLayoutRowMethods<TContent>,
        column: IFluidLayoutColumn<TContent>,
        index: number,
    ): FluidLayoutColumnMethods<TContent> {
        if (!FluidLayoutColumnMethods.Cache.has(column)) {
            FluidLayoutColumnMethods.Cache.set(
                column,
                new FluidLayoutColumnMethods(layoutFacade, rowFacade, column, index),
            );
        }

        return FluidLayoutColumnMethods.Cache.get(column)!;
    }

    public raw = (): IFluidLayoutColumn<TContent> => this._column;

    public index = (): number => this._index;

    public size = (): IFluidLayoutSizeByScreen => this._column.size;

    public sizeForScreen = (screen: ResponsiveScreenType): IFluidLayoutSize | undefined =>
        this.size()[screen];

    public style = (): string | undefined => this._column.style;

    public content = (): TContent | undefined => this._column.content;

    public row = (): IFluidLayoutRowMethods<TContent> => this._rowFacade;

    public isLastInRow = (): boolean => this.index() + 1 === this._rowFacade.columns().raw().length;
}
