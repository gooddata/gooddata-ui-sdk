// (C) 2019-2021 GoodData Corporation
import invariant from "ts-invariant";
import { FluidLayoutFacade, isFluidLayout } from "@gooddata/sdk-backend-spi";
import { IDashboardViewLayout } from "../interfaces/dashboardLayout";
import { IDashboardViewLayoutFacade, IDashboardViewLayoutRowsFacade } from "./interfaces";
import { DashboardViewLayoutRowsFacade } from "./rows";

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export class DashboardViewLayoutFacade<TContent>
    extends FluidLayoutFacade<TContent, IDashboardViewLayout<TContent>>
    implements IDashboardViewLayoutFacade<TContent> {
    protected constructor(protected readonly layout: IDashboardViewLayout<TContent>) {
        super(layout);
    }

    /**
     * Creates an instance of DashboardViewLayoutFacade
     * @param layout - layout to wrap
     */
    public static for<TContent>(
        layout: IDashboardViewLayout<TContent>,
    ): IDashboardViewLayoutFacade<TContent> {
        invariant(isFluidLayout(layout), "Provided data must be IDashboardViewLayout!");
        return new DashboardViewLayoutFacade(layout);
    }

    public rows(): IDashboardViewLayoutRowsFacade<TContent> {
        return DashboardViewLayoutRowsFacade.for(this, this.layout.rows);
    }
}
