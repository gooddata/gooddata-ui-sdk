// (C) 2019-2021 GoodData Corporation
import { FluidLayoutRowsFacade } from "@gooddata/sdk-backend-spi";
import { IDashboardViewLayout, IDashboardViewLayoutRow } from "../interfaces/dashboardLayout";
import {
    IDashboardViewLayoutRowsFacade,
    IDashboardViewLayoutFacade,
    IDashboardViewLayoutRowFacade,
} from "./interfaces";
import { DashboardViewLayoutRowFacade } from "./row";

/**
 * @alpha
 */
export class DashboardViewLayoutRowsFacade<TContent>
    extends FluidLayoutRowsFacade<
        TContent,
        IDashboardViewLayoutRow<TContent>,
        IDashboardViewLayoutRowFacade<TContent>,
        IDashboardViewLayout<TContent>,
        IDashboardViewLayoutFacade<TContent>
    >
    implements IDashboardViewLayoutRowsFacade<TContent> {
    protected constructor(
        protected readonly layoutFacade: IDashboardViewLayoutFacade<TContent>,
        protected readonly rowFacades: IDashboardViewLayoutRowFacade<TContent>[],
    ) {
        super(layoutFacade, rowFacades);
    }

    public static for<TContent>(
        layoutFacade: IDashboardViewLayoutFacade<TContent>,
        rows: IDashboardViewLayoutRow<TContent>[],
    ): IDashboardViewLayoutRowsFacade<TContent> {
        const rowFacades = rows.map((row, index) =>
            DashboardViewLayoutRowFacade.for(layoutFacade, row, index),
        );
        return new DashboardViewLayoutRowsFacade(layoutFacade, rowFacades);
    }
}
