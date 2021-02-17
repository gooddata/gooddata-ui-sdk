// (C) 2019-2021 GoodData Corporation
import invariant from "ts-invariant";
import identity from "lodash/identity";
import isArray from "lodash/isArray";
import difference from "lodash/difference";
import { UnexpectedError } from "../../../../errors/index";
import {
    IFluidLayoutColumnFacade,
    IFluidLayoutColumnsFacade,
    IFluidLayoutRowFacade,
} from "../facade/interfaces";
import {
    IFluidLayoutRow,
    isFluidLayoutRow,
    IFluidLayoutSectionHeader,
    IFluidLayoutSize,
    IFluidLayoutColumn,
    IFluidLayout,
} from "../fluidLayout";
import {
    FluidLayoutColumnModifications,
    FluidLayoutColumnsSelector,
    FluidLayoutRowModifications,
    IFluidLayoutColumnBuilder,
    IFluidLayoutColumnBuilderImpl,
    IFluidLayoutRowBuilder,
    IFluidLayoutRowBuilderImpl,
    ValueOrUpdateCallback,
} from "./interfaces";
import { FluidLayoutColumnBuilder } from "./column";
import { resolveValueOrUpdateCallback } from "./utils";
import { IFluidLayoutBuilderImpl } from "./interfaces";

/**
 * @alpha
 */
export class FluidLayoutRowBuilder<
    TContent,
    TRow extends IFluidLayoutRow<TContent>,
    TColumn extends IFluidLayoutColumn<TContent>,
    TLayout extends IFluidLayout<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>,
    TColumnsFacade extends IFluidLayoutColumnsFacade<TContent, TColumn, TColumnFacade>,
    TColumnBuilder extends IFluidLayoutColumnBuilder<TContent, TColumn, TColumnFacade>
>
    implements
        IFluidLayoutRowBuilder<
            TContent,
            TRow,
            TColumn,
            TRowFacade,
            TColumnFacade,
            TColumnsFacade,
            TColumnBuilder
        > {
    protected constructor(
        protected rowIndex: number,
        protected setLayout: (valueOrUpdateCallback: ValueOrUpdateCallback<TLayout>) => void,
        protected getRowFacade: () => TRowFacade,
        protected getColumnsFacade: () => TColumnsFacade,
        protected getColumnBuilder: (columnIndex: number) => TColumnBuilder,
    ) {}

    /**
     * Creates an instance of FluidLayoutRowBuilder for particular layout column.
     *
     * @param column - column to modify
     */
    public static for<TContent>(
        layoutBuilder: IFluidLayoutBuilderImpl<TContent>,
        rowIndex: number,
    ): IFluidLayoutRowBuilderImpl<TContent> {
        invariant(
            isFluidLayoutRow(layoutBuilder.facade().rows().row(rowIndex)?.raw()),
            "Provided data must be IFluidLayoutRow!",
        );

        const rowBuilder: IFluidLayoutRowBuilderImpl<TContent> = new FluidLayoutRowBuilder(
            rowIndex,
            layoutBuilder.setLayout,
            () => layoutBuilder.facade().rows().row(rowIndex)!,
            () => layoutBuilder.facade().rows().row(rowIndex)!.columns(),
            getColumnBuilder,
        );

        function getColumnBuilder(columnIndex: number): IFluidLayoutColumnBuilderImpl<TContent> {
            return FluidLayoutColumnBuilder.for<TContent>(rowBuilder, columnIndex);
        }

        return rowBuilder;
    }

    public header(valueOrUpdateCallback: ValueOrUpdateCallback<IFluidLayoutSectionHeader | undefined>): this {
        return this.setRow((row) => ({
            ...row,
            header: resolveValueOrUpdateCallback(valueOrUpdateCallback, row.header),
        }));
    }

    public addColumn(
        xlSize: IFluidLayoutSize,
        create: (builder: TColumnBuilder) => TColumnBuilder = identity,
        index: number = this.facade().columns().count(),
    ): this {
        const emptyFluidColumn: IFluidLayoutColumn<TContent> = {
            size: {
                xl: xlSize,
            },
        };
        this.setRow((row) => {
            const updatedColumns = [...row.columns];
            updatedColumns.splice(index, 0, emptyFluidColumn);
            return {
                ...row,
                columns: updatedColumns,
            };
        });
        this.getColumnBuilder(index).modify(create);
        return this;
    }

    public modifyColumn(
        index: number,
        modify: FluidLayoutColumnModifications<TContent, TColumn, TColumnFacade, TColumnBuilder>,
    ): this {
        const columnFacade = this.facade().columns().column(index);
        if (!columnFacade) {
            throw new UnexpectedError(`Cannot modify the column - column at index ${index} does not exist!`);
        }
        this.getColumnBuilder(index).modify(modify);
        return this;
    }

    public removeColumn(index: number): this {
        const columnFacade = this.facade().columns().column(index);
        if (!columnFacade) {
            throw new UnexpectedError(`Cannot remove the column - column at index ${index} does not exist!`);
        }
        return this.setRow((row) => {
            const updatedColumns = [...row.columns];
            updatedColumns.splice(index, 1);
            return {
                ...row,
                columns: updatedColumns,
            };
        });
    }

    public moveColumn(fromIndex: number, toIndex: number): this {
        const columnFacade = this.getColumnsFacade().column(fromIndex);
        if (!columnFacade) {
            throw new UnexpectedError(
                `Cannot move the column - column at index ${fromIndex} does not exist!`,
            );
        }
        this.removeColumn(fromIndex);
        this.addColumn(columnFacade.sizeForScreen("xl")!, (c) => c.setColumn(columnFacade.raw()), toIndex);
        return this;
    }

    public removeColumns(
        selector: FluidLayoutColumnsSelector<TContent, TColumn, TColumnFacade, TColumnsFacade> = (columns) =>
            columns.all(),
    ): this {
        const columnsToRemove = selector(this.getColumnsFacade());
        if (isArray(columnsToRemove)) {
            this.setRow((row) => {
                const updatedColumns = difference(
                    row.columns,
                    columnsToRemove.map((r) => r.raw()),
                );
                return {
                    ...row,
                    columns: updatedColumns,
                };
            });
        } else if (columnsToRemove) {
            this.removeColumn(columnsToRemove.index());
        }
        return this;
    }

    public removeEmptyColumns = (): this => {
        return this.removeColumns((columns) => columns.filter((column) => column.isEmpty()));
    };

    public modifyColumns(
        modify: FluidLayoutColumnModifications<TContent, TColumn, TColumnFacade, TColumnBuilder>,
        selector: FluidLayoutColumnsSelector<TContent, TColumn, TColumnFacade, TColumnsFacade> = (columns) =>
            columns.all(),
    ): this {
        const columnsToModify = selector(this.getColumnsFacade());
        if (isArray(columnsToModify)) {
            columnsToModify.forEach((column) => {
                this.modifyColumn(column.index(), modify);
            });
        } else if (columnsToModify) {
            this.modifyColumn(columnsToModify.index(), modify);
        }
        return this;
    }

    public setRow = (valueOrUpdateCallback: ValueOrUpdateCallback<TRow>): this => {
        this.setLayout((layout) => {
            const updatedRows = [...layout.rows];
            updatedRows[this.rowIndex] = resolveValueOrUpdateCallback(valueOrUpdateCallback, this.build());
            return {
                ...layout,
                rows: updatedRows,
            };
        });
        return this;
    };

    public facade(): TRowFacade {
        return this.getRowFacade();
    }

    public modify(
        modifications: FluidLayoutRowModifications<
            TContent,
            TColumn,
            TRow,
            TRowFacade,
            TColumnFacade,
            TColumnsFacade,
            TColumnBuilder,
            this
        >,
    ): this {
        modifications(this, this.facade());
        return this;
    }

    public build(): TRow {
        return this.facade().raw();
    }
}
