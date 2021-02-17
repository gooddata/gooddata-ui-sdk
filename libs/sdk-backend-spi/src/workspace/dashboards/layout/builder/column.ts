// (C) 2019-2021 GoodData Corporation
import invariant from "ts-invariant";
import { IFluidLayoutColumnFacade } from "../facade/interfaces";
import {
    IFluidLayoutColumn,
    IFluidLayoutRow,
    IFluidLayoutSizeByScreen,
    isFluidLayoutColumn,
} from "../fluidLayout";
import {
    FluidLayoutColumnModifications,
    IFluidLayoutColumnBuilder,
    IFluidLayoutColumnBuilderImpl,
    ValueOrUpdateCallback,
} from "./interfaces";
import { resolveValueOrUpdateCallback } from "./utils";
import { IFluidLayoutRowBuilderImpl } from "./interfaces";

/**
 * @alpha
 */
export class FluidLayoutColumnBuilder<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRow extends IFluidLayoutRow<TContent>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>
> implements IFluidLayoutColumnBuilder<TContent, TColumn, TColumnFacade> {
    protected constructor(
        protected setRow: (valueOrUpdateCallback: ValueOrUpdateCallback<TRow>) => void,
        protected getColumnFacade: () => TColumnFacade,
        protected columnIndex: number,
    ) {}

    /**
     * Creates an instance of FluidLayoutColumnBuilder for particular layout column.
     *
     * @param column - column to modify
     */
    public static for<TContent>(
        rowBuilder: IFluidLayoutRowBuilderImpl<TContent>,
        columnIndex: number,
    ): IFluidLayoutColumnBuilderImpl<TContent> {
        invariant(
            isFluidLayoutColumn(rowBuilder.facade().columns().column(columnIndex)?.raw()),
            "Provided data must be IFluidLayoutColumn!",
        );
        return new FluidLayoutColumnBuilder(
            rowBuilder.setRow,
            () => rowBuilder.facade().columns().column(columnIndex)!,
            columnIndex,
        );
    }

    public size(valueOrUpdateCallback: ValueOrUpdateCallback<IFluidLayoutSizeByScreen>): this {
        this.setColumn((column) => ({
            ...column,
            size: resolveValueOrUpdateCallback(valueOrUpdateCallback, column.size),
        }));
        return this;
    }

    public content(valueOrUpdateCallback: ValueOrUpdateCallback<TContent | undefined>): this {
        this.setColumn((column) => ({
            ...column,
            content: resolveValueOrUpdateCallback(valueOrUpdateCallback, column.content),
        }));
        return this;
    }

    public setColumn = (valueOrUpdateCallback: ValueOrUpdateCallback<TColumn>): this => {
        this.setRow((row) => {
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

    public modify(
        modifications: FluidLayoutColumnModifications<TContent, TColumn, TColumnFacade, this>,
    ): this {
        modifications(this, this.facade());
        return this;
    }

    public build(): TColumn {
        return this.facade().raw();
    }

    public facade(): TColumnFacade {
        return this.getColumnFacade();
    }
}
