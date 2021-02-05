// (C) 2019-2021 GoodData Corporation
import isEqual from "lodash/isEqual";
import isNil from "lodash/isNil";
import { IFluidLayoutRow, IFluidLayoutSectionHeader } from "../fluidLayout";
import { IFluidLayoutColumnsMethods, IFluidLayoutRowMethods, IFluidLayoutFacade } from "./interfaces";
import { FluidLayoutColumnsMethods } from "./columns";

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export class FluidLayoutRowMethods<TContent> implements IFluidLayoutRowMethods<TContent> {
    private constructor(
        private readonly layoutFacade: IFluidLayoutFacade<TContent>,
        private readonly row: IFluidLayoutRow<TContent>,
        private readonly rowIndex: number,
    ) {}

    public static for<TContent>(
        layoutFacade: IFluidLayoutFacade<TContent>,
        row: IFluidLayoutRow<TContent>,
        index: number,
    ): FluidLayoutRowMethods<TContent> {
        return new FluidLayoutRowMethods(layoutFacade, row, index);
    }

    public raw = (): IFluidLayoutRow<TContent> => this.row;

    public header = (): IFluidLayoutSectionHeader | undefined => this.row.header;

    public title = (): string | undefined => this.header()?.title;

    public description = (): string | undefined => this.header()?.description;

    public index = (): number => this.rowIndex;

    public columns = (): IFluidLayoutColumnsMethods<TContent> =>
        FluidLayoutColumnsMethods.for(this, this.row.columns);

    public isFirst = (): boolean => this.indexIs(0);

    public isLast = (): boolean => this.indexIs(this.layoutFacade.rows().raw().length - 1);

    public layout = (): IFluidLayoutFacade<TContent> => this.layoutFacade;

    public testRaw = (pred: (row: IFluidLayoutRow<TContent>) => boolean): boolean => pred(this.raw());

    public test = (pred: (row: IFluidLayoutRowMethods<TContent>) => boolean): boolean => pred(this);

    public indexIs = (index: number): boolean => this.index() === index;

    public headerEquals = (header: IFluidLayoutSectionHeader): boolean => isEqual(this.header(), header);

    public hasHeader = (): boolean => !isNil(this.header());

    public hasTitle = (): boolean => !isNil(this.title());

    public hasDescription = (): boolean => !isNil(this.description());

    public titleEquals = (title: string): boolean => isEqual(this.title(), title);

    public descriptionEquals = (description: string): boolean => isEqual(this.description(), description);
}
