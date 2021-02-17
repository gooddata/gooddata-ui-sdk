// (C) 2019-2021 GoodData Corporation
import { FluidLayoutRowFacade } from "@gooddata/sdk-backend-spi";
import {
    IDashboardViewLayoutColumnsFacade,
    IDashboardViewLayoutRowFacade,
    IDashboardViewLayoutFacade,
} from "./interfaces";
import { IDashboardViewLayout, IDashboardViewLayoutRow } from "../interfaces/dashboardLayout";
import { DashboardViewLayoutColumnsFacade } from "./columns";

/**
 * @alpha
 */
export class DashboardViewLayoutRowFacade<TContent>
    extends FluidLayoutRowFacade<
        TContent,
        IDashboardViewLayoutRow<TContent>,
        IDashboardViewLayout<TContent>,
        IDashboardViewLayoutFacade<TContent>
    >
    implements IDashboardViewLayoutRowFacade<TContent> {
    protected constructor(
        protected readonly layoutFacade: IDashboardViewLayoutFacade<TContent>,
        protected readonly row: IDashboardViewLayoutRow<TContent>,
        protected readonly rowIndex: number,
    ) {
        super(layoutFacade, row, rowIndex);
    }

    public static for<TContent>(
        layoutFacade: IDashboardViewLayoutFacade<TContent>,
        row: IDashboardViewLayoutRow<TContent>,
        index: number,
    ): DashboardViewLayoutRowFacade<TContent> {
        return new DashboardViewLayoutRowFacade(layoutFacade, row, index);
    }

    public columns(): IDashboardViewLayoutColumnsFacade<TContent> {
        return DashboardViewLayoutColumnsFacade.for(this, this.row.columns);
    }

    public layout(): IDashboardViewLayoutFacade<TContent> {
        return this.layoutFacade;
    }
}
