// (C) 2019-2021 GoodData Corporation
import {
    IDashboardViewLayoutColumnFacade,
    IDashboardViewLayoutColumnsFacade,
    IDashboardViewLayoutRowFacade,
} from "./interfaces";
import { DashboardViewLayoutColumnFacade } from "./column";
import { IDashboardViewLayoutColumn } from "../interfaces/dashboardLayout";
import { FluidLayoutColumnsFacade } from "@gooddata/sdk-backend-spi";

/**
 * @alpha
 */
export class DashboardViewLayoutColumnsFacade<TContent>
    extends FluidLayoutColumnsFacade<
        TContent,
        IDashboardViewLayoutColumn<TContent>,
        IDashboardViewLayoutColumnFacade<TContent>
    >
    implements IDashboardViewLayoutColumnsFacade<TContent> {
    protected constructor(protected readonly columnFacades: IDashboardViewLayoutColumnFacade<TContent>[]) {
        super(columnFacades);
    }

    public static for<TContent>(
        rowFacade: IDashboardViewLayoutRowFacade<TContent>,
        columns: IDashboardViewLayoutColumn<TContent>[],
    ): IDashboardViewLayoutColumnsFacade<TContent> {
        const columnFacades = columns.map((column, index) =>
            DashboardViewLayoutColumnFacade.for(rowFacade, column, index),
        );

        return new DashboardViewLayoutColumnsFacade(columnFacades);
    }
}
