// (C) 2019-2021 GoodData Corporation
import invariant from "ts-invariant";
import { IFluidLayoutColumnMethods } from "../facade/interfaces";
import {
    IFluidLayoutColumn,
    IFluidLayoutSize,
    IFluidLayoutSizeByScreen,
    isFluidLayoutColumn,
} from "../fluidLayout";
import {
    FluidLayoutColumnModifications,
    IFluidLayoutColumnBuilder,
    IFluidLayoutRowBuilder,
    ValueOrUpdateCallback,
} from "./interfaces";
import { resolveValueOrUpdateCallback } from "./utils";

export class FluidLayoutColumnBuilder<TContent> implements IFluidLayoutColumnBuilder<TContent> {
    protected constructor(
        protected rowBuilder: IFluidLayoutRowBuilder<TContent>,
        protected columnIndex: number,
    ) {}

    /**
     * Creates an instance of FluidLayoutColumnBuilder for particular layout column.
     *
     * @param column - column to modify
     */
    public static for<TContent>(
        rowBuilder: IFluidLayoutRowBuilder<TContent>,
        columnIndex: number,
    ): FluidLayoutColumnBuilder<TContent> {
        invariant(
            isFluidLayoutColumn(rowBuilder.facade().columns().column(columnIndex)?.raw()),
            "Provided data must be IFluidLayoutColumn!",
        );
        return new FluidLayoutColumnBuilder(rowBuilder, columnIndex);
    }

    /**
     * Creates an instance of FluidLayoutColumnBuilder with empty column.
     *
     * Note: You have to setup width for xl screen (which is defined as a layout grid columns count).
     * Optionally, you can also set the height for xl screen (specified as the percentage of the actual rendered width)
     *
     * Example: FluidLayoutColumnBuilder.forNewColumn({ widthAsGridColumnsCount: 12, heightAsRatio: 50 }) says,
     * that column will be 12 columns wide and its height will be 50% of rendered width.
     *
     * @param xlSize - column size for xl screen
     */
    public static forNewColumn<TContent>(
        rowBuilder: IFluidLayoutRowBuilder<TContent>,
        xlSize: IFluidLayoutSize,
        columnIndex: number = rowBuilder.facade().columns().count(),
    ): FluidLayoutColumnBuilder<TContent> {
        const emptyFluidColumn: IFluidLayoutColumn<TContent> = {
            size: {
                xl: xlSize,
            },
        };
        rowBuilder.setRow((row) => {
            const updatedColumns = [...row.columns];
            updatedColumns.splice(columnIndex, 0, emptyFluidColumn);
            return {
                ...row,
                columns: updatedColumns,
            };
        });
        return FluidLayoutColumnBuilder.for(rowBuilder, columnIndex);
    }

    public size = (valueOrUpdateCallback: ValueOrUpdateCallback<IFluidLayoutSizeByScreen>): this => {
        this.setColumn((column) => ({
            ...column,
            size: resolveValueOrUpdateCallback(valueOrUpdateCallback, column.size),
        }));
        return this;
    };

    public content = (valueOrUpdateCallback: ValueOrUpdateCallback<TContent | undefined>): this => {
        this.setColumn((column) => ({
            ...column,
            content: resolveValueOrUpdateCallback(valueOrUpdateCallback, column.content),
        }));
        return this;
    };

    public setColumn = (valueOrUpdateCallback: ValueOrUpdateCallback<IFluidLayoutColumn<TContent>>): this => {
        this.rowBuilder.setRow((row) => {
            const updatedColumns = [...row.columns];
            updatedColumns[this.columnIndex] = resolveValueOrUpdateCallback(
                valueOrUpdateCallback,
                this.build(),
            );
            return {
                ...row,
                columns: updatedColumns,
            };
        });
        return this;
    };

    public facade(): IFluidLayoutColumnMethods<TContent> {
        return this.rowBuilder.facade().columns().column(this.columnIndex)!;
    }

    public modify = (modifications: FluidLayoutColumnModifications<TContent>): this => {
        modifications(this, this.facade());
        return this;
    };

    public build = (): IFluidLayoutColumn<TContent> => {
        return this.facade().raw();
    };
}
