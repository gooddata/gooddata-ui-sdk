// (C) 2019-2021 GoodData Corporation
import invariant from "ts-invariant";
import difference from "lodash/difference";
import isArray from "lodash/isArray";
import identity from "lodash/identity";
import { UnexpectedError } from "../../../../errors/index";
import {
    IFluidLayoutColumnFacade,
    IFluidLayoutColumnsFacade,
    IFluidLayoutFacade,
    IFluidLayoutRowFacade,
    IFluidLayoutRowsFacade,
} from "../facade/interfaces";
import { FluidLayoutFacade } from "../facade/layout";
import {
    IFluidLayout,
    IFluidLayoutColumn,
    IFluidLayoutRow,
    IFluidLayoutSize,
    isFluidLayout,
} from "../fluidLayout";
import {
    FluidLayoutModifications,
    FluidLayoutRowModifications,
    FluidLayoutRowsSelector,
    IFluidLayoutBuilder,
    IFluidLayoutBuilderImpl,
    IFluidLayoutColumnBuilder,
    IFluidLayoutRowBuilder,
    IFluidLayoutRowBuilderImpl,
    ValueOrUpdateCallback,
} from "./interfaces";
import { FluidLayoutRowBuilder } from "./row";
import { resolveValueOrUpdateCallback } from "./utils";

/**
 * @alpha
 */
export class FluidLayoutBuilder<
    TContent,
    TLayout extends IFluidLayout<TContent>,
    TRow extends IFluidLayoutRow<TContent>,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>,
    TRowsFacade extends IFluidLayoutRowsFacade<TContent, TRow, TRowFacade>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>,
    TColumnsFacade extends IFluidLayoutColumnsFacade<TContent, TColumn, TColumnFacade>,
    TLayoutFacade extends IFluidLayoutFacade<TContent, TLayout>,
    TColumnBuilder extends IFluidLayoutColumnBuilder<TContent, TColumn, TColumnFacade>,
    TRowBuilder extends IFluidLayoutRowBuilder<
        TContent,
        TRow,
        TColumn,
        TRowFacade,
        TColumnFacade,
        TColumnsFacade,
        TColumnBuilder
    >
>
    implements
        IFluidLayoutBuilder<
            TContent,
            TLayout,
            TRow,
            TColumn,
            TRowFacade,
            TRowsFacade,
            TColumnFacade,
            TColumnsFacade,
            TLayoutFacade,
            TColumnBuilder,
            TRowBuilder
        > {
    protected constructor(
        protected layoutFacade: TLayoutFacade,
        protected layoutFacadeConstructor: (layout: TLayout) => TLayoutFacade,
        protected getRowBuilder: (rowIndex: number) => TRowBuilder,
    ) {}

    /**
     * Creates an instance of FluidLayoutBuilder for particular layout.
     *
     * @param layout - layout to modify
     */
    public static for<TContent>(layout: IFluidLayout<TContent>): IFluidLayoutBuilderImpl<TContent> {
        invariant(isFluidLayout(layout), "Provided data must be IFluidLayout!");
        const fluidLayoutBuilder: IFluidLayoutBuilderImpl<TContent> = new FluidLayoutBuilder(
            FluidLayoutFacade.for(layout),
            FluidLayoutFacade.for,
            getRowBuilder,
        );

        function getRowBuilder(rowIndex: number): IFluidLayoutRowBuilderImpl<TContent> {
            return FluidLayoutRowBuilder.for(fluidLayoutBuilder, rowIndex);
        }

        return fluidLayoutBuilder;
    }

    /**
     * Creates an instance of FluidLayoutBuilder with empty layout.
     */
    public static forNewLayout<TContent>(): IFluidLayoutBuilderImpl<TContent> {
        const emptyFluidLayout: IFluidLayout<TContent> = {
            type: "fluidLayout",
            rows: [],
        };
        return FluidLayoutBuilder.for(emptyFluidLayout);
    }

    public size(valueOrUpdateCallback: ValueOrUpdateCallback<IFluidLayoutSize | undefined>): this {
        return this.setLayout((layout) => ({
            ...layout,
            size: resolveValueOrUpdateCallback(valueOrUpdateCallback, this.facade().size()),
        }));
    }

    public addRow(
        create: FluidLayoutRowModifications<
            TContent,
            TColumn,
            TRow,
            TRowFacade,
            TColumnFacade,
            TColumnsFacade,
            TColumnBuilder,
            TRowBuilder
        > = identity,
        index: number = this.facade().rows().count(),
    ): this {
        const emptyFluidRow: IFluidLayoutRow<TContent> = {
            columns: [],
        };
        this.setLayout((layout) => {
            const updatedRows = [...layout.rows];
            updatedRows.splice(index, 0, emptyFluidRow);
            return {
                ...layout,
                rows: updatedRows,
            };
        });
        this.getRowBuilder(index).modify(create);
        return this;
    }

    public modifyRow(
        index: number,
        modify: FluidLayoutRowModifications<
            TContent,
            TColumn,
            TRow,
            TRowFacade,
            TColumnFacade,
            TColumnsFacade,
            TColumnBuilder,
            TRowBuilder
        >,
    ): this {
        const rowFacade = this.facade().rows().row(index);
        if (!rowFacade) {
            throw new UnexpectedError(`Cannot modify the row - row at index ${index} does not exist!`);
        }
        this.getRowBuilder(index).modify(modify);
        return this;
    }

    public removeRow(index: number): this {
        const rowFacade = this.facade().rows().row(index);
        if (!rowFacade) {
            throw new UnexpectedError(`Cannot remove the row - row at index ${index} does not exist!`);
        }
        return this.setLayout((layout) => {
            const updatedRows = [...layout.rows];
            updatedRows.splice(index, 1);
            return {
                ...layout,
                rows: updatedRows,
            };
        });
    }

    public moveRow(fromIndex: number, toIndex: number): this {
        const row = this.facade().rows().row(fromIndex)?.raw() as TRow;
        if (!row) {
            throw new UnexpectedError(`Cannot move the row - row at index ${fromIndex} does not exist!`);
        }
        this.removeRow(fromIndex);
        this.addRow((r) => r.setRow(row), toIndex);
        return this;
    }

    public removeRows(
        selector: FluidLayoutRowsSelector<TContent, TRow, TRowFacade, TRowsFacade> = (rows) => rows.all(),
    ): this {
        const rowsToRemove = selector(this.facade().rows() as TRowsFacade);
        if (isArray(rowsToRemove)) {
            this.setLayout((layout) => {
                const updatedRows = difference(
                    layout.rows,
                    rowsToRemove.map((r) => r.raw()),
                );
                return {
                    ...layout,
                    rows: updatedRows,
                };
            });
        } else if (rowsToRemove) {
            this.removeRow(rowsToRemove.index());
        }
        return this;
    }

    public removeEmptyRows(): this {
        return this.removeRows((rows) => rows.filter((row) => row.isEmpty()));
    }

    public modifyRows(
        modify: FluidLayoutRowModifications<
            TContent,
            TColumn,
            TRow,
            TRowFacade,
            TColumnFacade,
            TColumnsFacade,
            TColumnBuilder,
            TRowBuilder
        >,
        selector: FluidLayoutRowsSelector<TContent, TRow, TRowFacade, TRowsFacade> = (rows) => rows.all(),
    ): this {
        const rowsToModify = selector(this.facade().rows() as TRowsFacade);
        if (isArray(rowsToModify)) {
            rowsToModify.forEach((row) => {
                this.modifyRow(row.index(), modify);
            });
        } else if (rowsToModify) {
            this.modifyRow(rowsToModify.index(), modify);
        }
        return this;
    }

    public setLayout = (valueOrUpdateCallback: ValueOrUpdateCallback<TLayout>): this => {
        const updatedLayout = resolveValueOrUpdateCallback(valueOrUpdateCallback, this.build());
        this.layoutFacade = this.layoutFacadeConstructor(updatedLayout);
        return this;
    };

    public facade(): TLayoutFacade {
        return this.layoutFacade;
    }

    public modify(
        modifications: FluidLayoutModifications<
            TContent,
            TLayout,
            TRow,
            TColumn,
            TRowFacade,
            TRowsFacade,
            TColumnFacade,
            TColumnsFacade,
            TLayoutFacade,
            TColumnBuilder,
            TRowBuilder,
            this
        >,
    ): this {
        modifications(this, this.facade());
        return this;
    }

    public build(): TLayout {
        return this.layoutFacade.raw();
    }
}
