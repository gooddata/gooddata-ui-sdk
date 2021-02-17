// (C) 2019-2021 GoodData Corporation
import invariant from "ts-invariant";
import { isFluidLayout, FluidLayoutBuilder } from "@gooddata/sdk-backend-spi";
import {
    IDashboardViewLayoutColumnFacade,
    IDashboardViewLayoutColumnsFacade,
    IDashboardViewLayoutFacade,
    IDashboardViewLayoutRowFacade,
    IDashboardViewLayoutRowsFacade,
} from "../facade/interfaces";
import { DashboardViewLayoutFacade } from "../facade/layout";
import {
    IDashboardViewLayoutBuilder,
    IDashboardViewLayoutColumnBuilder,
    IDashboardViewLayoutRowBuilder,
} from "./interfaces";
import { DashboardViewLayoutRowBuilder } from "./row";
import {
    IDashboardViewLayout,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutRow,
} from "../interfaces/dashboardLayout";

/**
 * @alpha
 */
export class DashboardViewLayoutBuilder<TContent>
    extends FluidLayoutBuilder<
        TContent,
        IDashboardViewLayout<TContent>,
        IDashboardViewLayoutRow<TContent>,
        IDashboardViewLayoutColumn<TContent>,
        IDashboardViewLayoutRowFacade<TContent>,
        IDashboardViewLayoutRowsFacade<TContent>,
        IDashboardViewLayoutColumnFacade<TContent>,
        IDashboardViewLayoutColumnsFacade<TContent>,
        IDashboardViewLayoutFacade<TContent>,
        IDashboardViewLayoutColumnBuilder<TContent>,
        IDashboardViewLayoutRowBuilder<TContent>
    >
    implements IDashboardViewLayoutBuilder<TContent> {
    protected constructor(
        protected layoutFacade: IDashboardViewLayoutFacade<TContent>,
        protected layoutFacadeConstructor: (
            layout: IDashboardViewLayout<TContent>,
        ) => IDashboardViewLayoutFacade<TContent>,
        protected getRowBuilder: (rowIndex: number) => IDashboardViewLayoutRowBuilder<TContent>,
    ) {
        super(layoutFacade, layoutFacadeConstructor, getRowBuilder);
    }

    /**
     * Creates an instance of DashboardViewLayoutBuilder for particular layout.
     *
     * @param layout - layout to modify
     */
    public static for<TContent>(
        layout: IDashboardViewLayout<TContent>,
    ): DashboardViewLayoutBuilder<TContent> {
        invariant(isFluidLayout(layout), "Provided data must be IDashboardViewLayout!");
        const layoutFacade = DashboardViewLayoutFacade.for(layout);

        const layoutBuilder = new DashboardViewLayoutBuilder(
            layoutFacade,
            DashboardViewLayoutFacade.for,
            getRowBuilder,
        );

        function getRowBuilder(rowIndex: number): IDashboardViewLayoutRowBuilder<TContent> {
            return DashboardViewLayoutRowBuilder.for(layoutBuilder, rowIndex);
        }

        return layoutBuilder;
    }

    /**
     * Creates an instance of DashboardViewLayoutBuilder with empty layout.
     */
    public static forNewLayout<TContent>(): DashboardViewLayoutBuilder<TContent> {
        const emptyFluidLayout: IDashboardViewLayout<TContent> = {
            type: "fluidLayout",
            rows: [],
        };
        return DashboardViewLayoutBuilder.for(emptyFluidLayout);
    }
}
