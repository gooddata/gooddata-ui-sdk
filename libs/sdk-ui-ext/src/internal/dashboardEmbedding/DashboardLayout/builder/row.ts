// (C) 2019-2021 GoodData Corporation
import invariant from "ts-invariant";
import { isFluidLayoutRow, FluidLayoutRowBuilder } from "@gooddata/sdk-backend-spi";
import {
    IDashboardViewLayoutColumnFacade,
    IDashboardViewLayoutColumnsFacade,
    IDashboardViewLayoutRowFacade,
} from "../facade/interfaces";
import {
    IDashboardViewLayout,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutRow,
} from "../interfaces/dashboardLayout";
import {
    IDashboardViewLayoutBuilder,
    IDashboardViewLayoutColumnBuilder,
    IDashboardViewLayoutRowBuilder,
} from "./interfaces";
import { DashboardViewLayoutColumnBuilder } from "./column";

export class DashboardViewLayoutRowBuilder<TContent>
    extends FluidLayoutRowBuilder<
        TContent,
        IDashboardViewLayoutRow<TContent>,
        IDashboardViewLayoutColumn<TContent>,
        IDashboardViewLayout<TContent>,
        IDashboardViewLayoutRowFacade<TContent>,
        IDashboardViewLayoutColumnFacade<TContent>,
        IDashboardViewLayoutColumnsFacade<TContent>,
        IDashboardViewLayoutColumnBuilder<TContent>
    >
    implements IDashboardViewLayoutRowBuilder<TContent> {
    protected constructor(
        protected rowIndex: number,
        protected setLayout: (valueOrUpdateCallback: IDashboardViewLayout<TContent>) => void,
        protected getRowFacade: () => IDashboardViewLayoutRowFacade<TContent>,
        protected getColumnsFacade: () => IDashboardViewLayoutColumnsFacade<TContent>,
        protected getColumnBuilder: (columnIndex: number) => IDashboardViewLayoutColumnBuilder<TContent>,
    ) {
        super(rowIndex, setLayout, getRowFacade, getColumnsFacade, getColumnBuilder);
    }

    /**
     * Creates an instance of DashboardViewLayoutRowBuilder for particular layout column.
     *
     * @param column - column to modify
     */
    public static for<TContent>(
        layoutBuilder: IDashboardViewLayoutBuilder<TContent>,
        rowIndex: number,
    ): IDashboardViewLayoutRowBuilder<TContent> {
        invariant(
            isFluidLayoutRow(layoutBuilder.facade().rows().row(rowIndex)?.raw()),
            "Provided data must be IDashboardViewLayoutRow!",
        );

        const rowBuilder = new DashboardViewLayoutRowBuilder(
            rowIndex,
            layoutBuilder.setLayout,
            () => layoutBuilder.facade().rows().row(rowIndex)!,
            () => layoutBuilder.facade().rows().row(rowIndex)!.columns(),
            getColumnBuilder,
        );

        function getColumnBuilder(columnIndex: number): IDashboardViewLayoutColumnBuilder<TContent> {
            return DashboardViewLayoutColumnBuilder.for<TContent>(rowBuilder, columnIndex);
        }

        return rowBuilder;
    }
}
