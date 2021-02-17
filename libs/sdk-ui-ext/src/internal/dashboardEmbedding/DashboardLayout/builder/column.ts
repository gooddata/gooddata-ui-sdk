// (C) 2019-2021 GoodData Corporation
import {
    isFluidLayoutColumn,
    ValueOrUpdateCallback,
    FluidLayoutColumnBuilder,
    isKpiWidgetDefinition,
    isKpiWidget,
    isInsightWidget,
    isInsightWidgetDefinition,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { IDashboardViewLayoutColumnFacade } from "../facade/interfaces";
import {
    IDashboardViewLayoutRow,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutContent,
} from "../interfaces/dashboardLayout";
import { IDashboardViewLayoutColumnBuilder, IDashboardViewLayoutRowBuilder } from "./interfaces";
import { InsightWidgetBuilder, KpiWidgetBuilder } from "@gooddata/sdk-backend-base";
import identity from "lodash/identity";

export class DashboardViewLayoutColumnBuilder<TContent extends IDashboardViewLayoutContent<any>>
    extends FluidLayoutColumnBuilder<
        TContent,
        IDashboardViewLayoutColumn<TContent>,
        IDashboardViewLayoutRow<TContent>,
        IDashboardViewLayoutColumnFacade<TContent>
    >
    implements IDashboardViewLayoutColumnBuilder<TContent> {
    protected constructor(
        protected setRow: (
            valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardViewLayoutRow<TContent>>,
        ) => void,
        protected getColumnFacade: () => IDashboardViewLayoutColumnFacade<TContent>,
        protected columnIndex: number,
    ) {
        super(setRow, getColumnFacade, columnIndex);
    }

    /**
     * Creates an instance of DashboardViewLayoutColumnBuilder for particular layout column.
     *
     * @param column - column to modify
     */
    public static for<TContent extends IDashboardViewLayoutContent<any>>(
        rowBuilder: IDashboardViewLayoutRowBuilder<TContent>,
        columnIndex: number,
    ): DashboardViewLayoutColumnBuilder<TContent> {
        invariant(
            isFluidLayoutColumn(rowBuilder.facade().columns().column(columnIndex)?.raw()),
            "Provided data must be IDashboardViewLayoutColumn!",
        );

        return new DashboardViewLayoutColumnBuilder(
            rowBuilder.setRow,
            () => rowBuilder.facade().columns().column(columnIndex)!,
            columnIndex,
        );
    }

    public newInsightWidget(
        insight: ObjRef,
        create: (builder: InsightWidgetBuilder) => InsightWidgetBuilder = identity,
    ): this {
        this.content(create(InsightWidgetBuilder.forNew(insight)).build() as TContent);
        return this;
    }

    public modifyInsightWidget(modify: (builder: InsightWidgetBuilder) => InsightWidgetBuilder): this {
        const content = this.facade().content();
        invariant(
            isInsightWidgetDefinition(content) || isInsightWidget(content),
            "Content of the column is not a kpi widget!",
        );
        this.content(modify(InsightWidgetBuilder.for(content)).build() as TContent);
        return this;
    }

    public newKpiWidget(
        measure: ObjRef,
        create: (builder: KpiWidgetBuilder) => KpiWidgetBuilder = identity,
    ): this {
        this.content(create(KpiWidgetBuilder.forNew(measure)).build() as TContent);
        return this;
    }

    public modifyKpiWidget(modify: (builder: KpiWidgetBuilder) => KpiWidgetBuilder): this {
        const content = this.facade().content();
        invariant(
            isKpiWidgetDefinition(content) || isKpiWidget(content),
            "Content of the column is not a kpi widget!",
        );
        this.content(modify(KpiWidgetBuilder.for(content)).build() as TContent);
        return this;
    }
}
