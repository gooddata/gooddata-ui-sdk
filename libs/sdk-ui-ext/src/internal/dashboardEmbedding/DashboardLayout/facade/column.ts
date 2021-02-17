// (C) 2019-2021 GoodData Corporation
import {
    FluidLayoutColumnFacade,
    IKpiWidget,
    IKpiWidgetDefinition,
    IInsightWidget,
    IInsightWidgetDefinition,
    IDashboardLayoutContent,
    isKpiWidget,
    isKpiWidgetDefinition,
    isInsightWidget,
    isInsightWidgetDefinition,
    isFluidLayout,
    isDashboardLayoutContent,
    IWidget,
    IWidgetDefinition,
} from "@gooddata/sdk-backend-spi";
import {
    IDashboardViewLayout,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutContent,
    IDashboardViewLayoutRow,
} from "../interfaces/dashboardLayout";
import { IDashboardViewLayoutColumnFacade, IDashboardViewLayoutRowFacade } from "./interfaces";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export class DashboardViewLayoutColumnFacade<TContent>
    extends FluidLayoutColumnFacade<
        TContent,
        IDashboardViewLayoutColumn<TContent>,
        IDashboardViewLayoutRow<TContent>,
        IDashboardViewLayoutRowFacade<TContent>
    >
    implements IDashboardViewLayoutColumnFacade<TContent> {
    private constructor(
        protected readonly rowFacade: IDashboardViewLayoutRowFacade<TContent>,
        protected readonly column: IDashboardViewLayoutColumn<TContent>,
        protected readonly columnIndex: number,
    ) {
        super(rowFacade, column, columnIndex);
    }

    public static for<TContent>(
        rowFacade: IDashboardViewLayoutRowFacade<TContent>,
        column: IDashboardViewLayoutColumn<TContent>,
        index: number,
    ): DashboardViewLayoutColumnFacade<TContent> {
        return new DashboardViewLayoutColumnFacade(rowFacade, column, index);
    }

    public hasWidgetContent(): this is DashboardViewLayoutColumnFacade<IWidget> {
        return isKpiWidget(this.content());
    }
    public hasWidgetDefinitionContent(): this is DashboardViewLayoutColumnFacade<IWidgetDefinition> {
        return isKpiWidget(this.content());
    }
    public hasKpiWidgetContent(): this is DashboardViewLayoutColumnFacade<IKpiWidget> {
        return isKpiWidget(this.content());
    }
    public hasKpiWidgetDefinitionContent(): this is DashboardViewLayoutColumnFacade<IKpiWidgetDefinition> {
        return isKpiWidgetDefinition(this.content());
    }
    public hasInsightWidgetContent(): this is DashboardViewLayoutColumnFacade<IInsightWidget> {
        return isInsightWidget(this.content());
    }
    public hasInsightWidgetDefinitionContent(): this is DashboardViewLayoutColumnFacade<
        IInsightWidgetDefinition
    > {
        return isInsightWidgetDefinition(this.content());
    }
    public hasLayoutContent(): this is DashboardViewLayoutColumnFacade<IDashboardViewLayout<TContent>> {
        return isFluidLayout(this.content());
    }
    public hasCustomContent(): this is DashboardViewLayoutColumnFacade<
        Exclude<IDashboardViewLayoutContent<TContent>, IDashboardLayoutContent>
    > {
        return !isDashboardLayoutContent(this.content());
    }

    public hasWidgetWithRef(ref: ObjRef): boolean {
        if (this.hasWidgetContent()) {
            return areObjRefsEqual(this.column.content.ref, ref);
        }
        return false;
    }

    public hasWidgetWithInsightRef(ref: ObjRef): boolean {
        if (this.hasInsightWidgetContent() || this.hasInsightWidgetDefinitionContent()) {
            return areObjRefsEqual(this.column.content.insight, ref);
        }
        return false;
    }

    public hasWidgetWithKpiRef(ref: ObjRef): boolean {
        if (this.hasKpiWidgetContent() || this.hasKpiWidgetDefinitionContent()) {
            return areObjRefsEqual(this.column.content.ref, ref);
        }
        return false;
    }

    public row(): IDashboardViewLayoutRowFacade<TContent> {
        return this.rowFacade;
    }
}
