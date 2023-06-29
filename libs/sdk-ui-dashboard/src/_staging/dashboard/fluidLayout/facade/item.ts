// (C) 2019-2022 GoodData Corporation
import isEqual from "lodash/isEqual.js";
import isNil from "lodash/isNil.js";
import {
    ObjRef,
    areObjRefsEqual,
    IKpiWidget,
    IKpiWidgetDefinition,
    IInsightWidget,
    IInsightWidgetDefinition,
    IWidget,
    IWidgetDefinition,
    isWidget,
    isWidgetDefinition,
    isKpiWidgetDefinition,
    isKpiWidget,
    isInsightWidgetDefinition,
    isInsightWidget,
    IDashboardLayout,
    IDashboardWidget,
    IDashboardLayoutSize,
    IDashboardLayoutSizeByScreenSize,
    IDashboardLayoutItem,
    ScreenSize,
    isDashboardLayout,
    isDashboardLayoutItem,
    isObjRef,
} from "@gooddata/sdk-model";
import { IDashboardLayoutItemFacade, IDashboardLayoutSectionFacade } from "./interfaces.js";

/**
 * @alpha
 */
export class DashboardLayoutItemFacade<TWidget> implements IDashboardLayoutItemFacade<TWidget> {
    protected constructor(
        protected readonly sectionFacade: IDashboardLayoutSectionFacade<TWidget>,
        protected readonly item: IDashboardLayoutItem<TWidget>,
        protected readonly itemIndex: number,
    ) {}

    public static for<TWidget>(
        sectionFacade: IDashboardLayoutSectionFacade<TWidget>,
        item: IDashboardLayoutItem<TWidget>,
        index: number,
    ): IDashboardLayoutItemFacade<TWidget> {
        return new DashboardLayoutItemFacade(sectionFacade, item, index);
    }
    public raw(): IDashboardLayoutItem<TWidget> {
        return this.item;
    }

    public section(): IDashboardLayoutSectionFacade<TWidget> {
        return this.sectionFacade;
    }

    public index(): number {
        return this.itemIndex;
    }

    public indexIs(index: number): boolean {
        return this.index() === index;
    }

    public isFirst(): boolean {
        return this.indexIs(0);
    }

    public isLast(): boolean {
        return this.indexIs(this.sectionFacade.items().count() - 1);
    }

    public widget(): TWidget | undefined {
        return this.item.widget;
    }

    public ref(): ObjRef | undefined {
        if (isObjRef(this.item.widget)) {
            return this.item.widget;
        }
        return undefined;
    }

    public widgetEquals(widget: TWidget | undefined): boolean {
        return isEqual(this.widget(), widget);
    }

    public widgetIs(widget: TWidget): boolean {
        return this.widget() === widget;
    }

    public isEmpty(): boolean {
        return isNil(this.widget());
    }

    public size(): IDashboardLayoutSizeByScreenSize {
        return this.item.size;
    }

    public sizeForScreen(screen: ScreenSize): IDashboardLayoutSize | undefined {
        return this.size()[screen];
    }

    public hasSizeForScreen(screen: ScreenSize): boolean {
        return !isNil(this.sizeForScreen(screen));
    }

    public testRaw(pred: (column: IDashboardLayoutItem<TWidget>) => boolean): boolean {
        return pred(this.raw());
    }

    public test(pred: (column: IDashboardLayoutItemFacade<TWidget>) => boolean): boolean {
        return pred(this);
    }

    public isWidgetItem(): this is DashboardLayoutItemFacade<IWidget> {
        return isWidget(this.widget());
    }
    public isWidgetDefinitionItem(): this is DashboardLayoutItemFacade<IWidgetDefinition> {
        return isWidgetDefinition(this.widget());
    }
    public isKpiWidgetItem(): this is DashboardLayoutItemFacade<IKpiWidget> {
        return isKpiWidget(this.widget());
    }
    public isKpiWidgetDefinitionItem(): this is DashboardLayoutItemFacade<IKpiWidgetDefinition> {
        return isKpiWidgetDefinition(this.widget());
    }
    public isInsightWidgetItem(): this is DashboardLayoutItemFacade<IInsightWidget> {
        return isInsightWidget(this.widget());
    }
    public isInsightWidgetDefinitionItem(): this is DashboardLayoutItemFacade<IInsightWidgetDefinition> {
        return isInsightWidgetDefinition(this.widget());
    }
    public isLayoutItem(): this is DashboardLayoutItemFacade<IDashboardLayout<TWidget>> {
        return isDashboardLayout(this.widget());
    }
    public isCustomItem(): this is DashboardLayoutItemFacade<Exclude<TWidget, IDashboardWidget>> {
        return !isDashboardLayoutItem(this.widget());
    }

    public isWidgetItemWithRef(ref: ObjRef): boolean {
        if (this.isWidgetItem()) {
            return areObjRefsEqual(this.item.widget?.ref, ref);
        }
        return false;
    }

    public isWidgetItemWithInsightRef(ref: ObjRef): boolean {
        if (this.isInsightWidgetItem() || this.isInsightWidgetDefinitionItem()) {
            return areObjRefsEqual(this.item.widget?.insight, ref);
        }
        return false;
    }

    public isWidgetItemWithKpiRef(ref: ObjRef): boolean {
        if (this.isKpiWidgetItem() || this.isKpiWidgetDefinitionItem()) {
            return areObjRefsEqual(this.item.widget?.ref, ref);
        }
        return false;
    }
}
