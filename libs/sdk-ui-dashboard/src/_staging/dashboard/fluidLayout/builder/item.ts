// (C) 2019-2022 GoodData Corporation
import { invariant } from "ts-invariant";
import {
    DashboardLayoutItemModifications,
    IDashboardLayoutItemBuilder,
    IDashboardLayoutSectionBuilder,
} from "./interfaces.js";
import { IDashboardLayoutItemFacade } from "../facade/interfaces.js";
import {
    InsightWidgetBuilder,
    KpiWidgetBuilder,
    resolveValueOrUpdateCallback,
    ValueOrUpdateCallback,
} from "@gooddata/sdk-backend-base";
import {
    ObjRef,
    isKpiWidgetDefinition,
    isKpiWidget,
    isInsightWidgetDefinition,
    isInsightWidget,
    IDashboardLayoutSection,
    IDashboardLayoutSizeByScreenSize,
    IDashboardLayoutItem,
    isDashboardLayoutItem,
} from "@gooddata/sdk-model";
import identity from "lodash/identity.js";

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
     * @param item - item to modify
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
        create: (builder: InsightWidgetBuilder) => InsightWidgetBuilder = identity,
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
        create: (builder: KpiWidgetBuilder) => KpiWidgetBuilder = identity,
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
        this.widget(modify(KpiWidgetBuilder.for(content)).build() as unknown as TWidget);
        return this;
    }
}
