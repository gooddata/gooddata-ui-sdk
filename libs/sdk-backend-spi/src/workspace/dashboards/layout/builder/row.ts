// (C) 2019-2021 GoodData Corporation
import invariant from "ts-invariant";
import identity from "lodash/identity";
import isArray from "lodash/isArray";
import difference from "lodash/difference";
import { UnexpectedError } from "../../../../errors/index";
import { IFluidLayoutRowMethods } from "../facade/interfaces";
import {
    IFluidLayoutRow,
    isFluidLayoutRow,
    IFluidLayoutSectionHeader,
    IFluidLayoutSize,
} from "../fluidLayout";
import {
    FluidLayoutColumnModifications,
    FluidLayoutColumnsSelector,
    FluidLayoutRowModifications,
    IFluidLayoutBuilder,
    IFluidLayoutColumnBuilder,
    IFluidLayoutRowBuilder,
    ValueOrUpdateCallback,
} from "./interfaces";
import { FluidLayoutColumnBuilder } from "./column";
import { resolveValueOrUpdateCallback } from "./utils";

export class FluidLayoutRowBuilder<TContent> implements IFluidLayoutRowBuilder<TContent> {
    protected constructor(
        protected layoutBuilder: IFluidLayoutBuilder<TContent>,
        protected rowIndex: number,
    ) {}

    /**
     * Creates an instance of FluidLayoutRowBuilder for particular layout column.
     *
     * @param column - column to modify
     */
    public static for<TContent>(
        layoutBuilder: IFluidLayoutBuilder<TContent>,
        rowIndex: number,
    ): FluidLayoutRowBuilder<TContent> {
        invariant(
            isFluidLayoutRow(layoutBuilder.facade().rows().row(rowIndex)?.raw()),
            "Provided data must be IFluidLayoutRow!",
        );
        return new FluidLayoutRowBuilder(layoutBuilder, rowIndex);
    }

    /**
     * Creates an instance of FluidLayoutRowBuilder with empty row.
     */
    public static forNewRow<TContent>(
        layoutBuilder: IFluidLayoutBuilder<TContent>,
        rowIndex: number = layoutBuilder.facade().rows().count(),
    ): FluidLayoutRowBuilder<TContent> {
        const emptyFluidRow: IFluidLayoutRow<TContent> = {
            columns: [],
        };
        layoutBuilder.setLayout((layout) => {
            const updatedRows = [...layout.rows];
            updatedRows.splice(rowIndex, 0, emptyFluidRow);
            return {
                ...layout,
                rows: updatedRows,
            };
        });
        return FluidLayoutRowBuilder.for(layoutBuilder, rowIndex);
    }

    public header = (
        valueOrUpdateCallback: ValueOrUpdateCallback<IFluidLayoutSectionHeader | undefined>,
    ): this => {
        this.setRow((row) => ({
            ...row,
            header: resolveValueOrUpdateCallback(valueOrUpdateCallback, row.header),
        }));
        return this;
    };

    public addColumn = (
        xlSize: IFluidLayoutSize,
        create: (
            builder: IFluidLayoutColumnBuilder<TContent>,
        ) => IFluidLayoutColumnBuilder<TContent> = identity,
        index?: number,
    ): this => {
        FluidLayoutColumnBuilder.forNewColumn<TContent>(this, xlSize, index).modify(create);
        return this;
    };

    public modifyColumn = (index: number, modify: FluidLayoutColumnModifications<TContent>): this => {
        const columnFacade = this.facade().columns().column(index);
        if (!columnFacade) {
            throw new UnexpectedError(`Cannot modify the column - column at index ${index} does not exist!`);
        }
        FluidLayoutColumnBuilder.for(this, index).modify(modify);
        return this;
    };

    public removeColumn = (index: number): this => {
        const columnFacade = this.facade().columns().column(index);
        if (!columnFacade) {
            throw new UnexpectedError(`Cannot remove the column - column at index ${index} does not exist!`);
        }
        this.setRow((row) => {
            const updatedColumns = [...row.columns];
            updatedColumns.splice(index, 1);
            return {
                ...row,
                columns: updatedColumns,
            };
        });
        return this;
    };

    public moveColumn = (fromIndex: number, toIndex: number): this => {
        const columnFacade = this.facade().columns().column(fromIndex);
        if (!columnFacade) {
            throw new UnexpectedError(
                `Cannot move the column - column at index ${fromIndex} does not exist!`,
            );
        }
        this.removeColumn(fromIndex);
        this.addColumn(columnFacade.sizeForScreen("xl")!, (c) => c.setColumn(columnFacade.raw()), toIndex);
        return this;
    };

    public removeColumns = (
        selector: FluidLayoutColumnsSelector<TContent> = (columns) => columns.all(),
    ): this => {
        const columnsToRemove = selector(this.facade().columns());
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
    };

    public modifyColumns = (
        modify: FluidLayoutColumnModifications<TContent>,
        selector: FluidLayoutColumnsSelector<TContent> = (columns) => columns.all(),
    ): this => {
        const columnsToModify = selector(this.facade().columns());
        if (isArray(columnsToModify)) {
            this.setRow((row) => {
                const updatedColumns = [...row.columns];
                columnsToModify.forEach((column) => {
                    const columnBuilder = FluidLayoutColumnBuilder.for(this, column.index());
                    const modifiedColumn = modify(columnBuilder, column).build();
                    updatedColumns[column.index()] = modifiedColumn;
                });
                return {
                    ...row,
                    columns: updatedColumns,
                };
            });
        } else if (columnsToModify) {
            this.modifyColumn(columnsToModify.index(), modify);
        }
        return this;
    };

    public setRow = (valueOrUpdateCallback: ValueOrUpdateCallback<IFluidLayoutRow<TContent>>): this => {
        this.layoutBuilder.setLayout((layout) => {
            const updatedRows = [...layout.rows];
            updatedRows[this.rowIndex] = resolveValueOrUpdateCallback(valueOrUpdateCallback, this.build());
            return {
                ...layout,
                rows: updatedRows,
            };
        });
        return this;
    };

    public facade(): IFluidLayoutRowMethods<TContent> {
        return this.layoutBuilder.facade().rows().row(this.rowIndex)!;
    }

    public modify = (modifications: FluidLayoutRowModifications<TContent>): this => {
        modifications(this, this.facade());
        return this;
    };

    public build = (): IFluidLayoutRow<TContent> => {
        return this.facade().raw();
    };
}
