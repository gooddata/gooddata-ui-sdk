// (C) 2019-2025 GoodData Corporation

import { invariant } from "ts-invariant";

import {
    InsightWidgetBuilder,
    KpiWidgetBuilder,
    type ValueOrUpdateCallback,
    resolveValueOrUpdateCallback,
} from "@gooddata/sdk-backend-base";
import {
    type IDashboardLayout,
    type IDashboardLayoutItem,
    type IDashboardLayoutSection,
    type IDashboardLayoutSizeByScreenSize,
    type ObjRef,
    isDashboardLayout,
    isDashboardLayoutItem,
    isInsightWidget,
    isInsightWidgetDefinition,
    isKpiWidget,
    isKpiWidgetDefinition,
} from "@gooddata/sdk-model";

import {
    type DashboardLayoutItemModifications,
    type IDashboardLayoutBuilder,
    type IDashboardLayoutItemBuilder,
    type IDashboardLayoutSectionBuilder,
} from "./interfaces.js";
import { type ILayoutItemPath } from "../../../../types.js";
import { type IDashboardLayoutItemFacade } from "../facade/interfaces.js";

/**
 * @alpha
 */
export class DashboardLayoutItemBuilder<TWidget> implements IDashboardLayoutItemBuilder<TWidget> {
    protected constructor(
        protected setSection: (
            valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardLayoutSection<TWidget>>,
        ) => void,
        protected getItemFacade: () => IDashboardLayoutItemFacade<TWidget>,
        protected itemIndex: number,
    ) {}

    /**
     * Creates an instance of DashboardLayoutItemBuilder for particular layout item.
     *
     * @param sectionBuilder - section builder
     * @param itemIndex - item to modify
     */
    public static for<TWidget>(
        sectionBuilder: IDashboardLayoutSectionBuilder<TWidget>,
        itemIndex: number,
    ): IDashboardLayoutItemBuilder<TWidget> {
        invariant(
            isDashboardLayoutItem<TWidget>(sectionBuilder.facade().item(itemIndex)?.raw()),
            `Provided data must be IDashboardLayoutItem! ${itemIndex} ${sectionBuilder
                .facade()
                .item(itemIndex)}`,
        );
        return new DashboardLayoutItemBuilder(
            (section) => sectionBuilder.setSection(section),
            () => sectionBuilder.facade().item(itemIndex)!,
            itemIndex,
        );
    }

    public size(valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardLayoutSizeByScreenSize>): this {
        this.setItem((item) => ({
            ...item,
            size: resolveValueOrUpdateCallback(valueOrUpdateCallback, item.size),
        }));
        return this;
    }

    public widget(valueOrUpdateCallback: ValueOrUpdateCallback<TWidget | undefined>): this {
        this.setItem((item) => ({
            ...item,
            widget: resolveValueOrUpdateCallback(valueOrUpdateCallback, item.widget),
        }));
        return this;
    }

    public setItem(valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardLayoutItem<TWidget>>): this {
        this.setSection((section) => {
            const updatedItems = [...section.items];
            updatedItems[this.itemIndex] = resolveValueOrUpdateCallback(valueOrUpdateCallback, this.build());
            return {
                ...section,
                items: updatedItems,
            };
        });
        return this;
    }

    public modify(modifications: DashboardLayoutItemModifications<TWidget>): this {
        modifications(this, this.facade());
        return this;
    }

    public build(): IDashboardLayoutItem<TWidget> {
        return this.facade().raw();
    }

    public facade(): IDashboardLayoutItemFacade<TWidget> {
        return this.getItemFacade();
    }

    public newInsightWidget(
        insight: ObjRef,
        create: (builder: InsightWidgetBuilder) => InsightWidgetBuilder = (v) => v,
    ): this {
        this.widget(create(InsightWidgetBuilder.forNew(insight)).build() as unknown as TWidget);
        return this;
    }

    public modifyInsightWidget(modify: (builder: InsightWidgetBuilder) => InsightWidgetBuilder): this {
        const content = this.facade().widget();
        invariant(
            isInsightWidgetDefinition(content) || isInsightWidget(content),
            "Content of the item is not a kpi widget.",
        );
        this.widget(modify(InsightWidgetBuilder.for(content)).build() as unknown as TWidget);
        return this;
    }

    public newKpiWidget(
        measure: ObjRef,
        create: (builder: KpiWidgetBuilder) => KpiWidgetBuilder = (v) => v,
    ): this {
        this.widget(create(KpiWidgetBuilder.forNew(measure)).build() as unknown as TWidget);
        return this;
    }

    public modifyKpiWidget(modify: (builder: KpiWidgetBuilder) => KpiWidgetBuilder): this {
        const content = this.facade().widget();
        invariant(
            isKpiWidgetDefinition(content) || isKpiWidget(content),
            "Content of the item is not a kpi widget.",
        );
        const builder = KpiWidgetBuilder.for(content);
        this.widget(modify(builder).build() as unknown as TWidget);
        return this;
    }

    public modifyLayoutWidget(
        modify: (builder: IDashboardLayoutBuilder<TWidget>) => IDashboardLayoutBuilder<TWidget>,
        dashboardLayoutBuilderConstructor: (
            layout: IDashboardLayout<TWidget>,
            layoutPath?: ILayoutItemPath,
        ) => IDashboardLayoutBuilder<TWidget>,
    ): this {
        const content = this.facade().widget();
        invariant(isDashboardLayout<TWidget>(content), "Content of the item is not a layout widget.");
        const itemPath = this.getItemFacade().index();
        const builder = dashboardLayoutBuilderConstructor(content, itemPath);
        this.widget(modify(builder).build() as unknown as TWidget);
        return this;
    }
}
