// (C) 2019-2022 GoodData Corporation
import {
    ObjRef,
    IDashboardLayout,
    IDashboardWidget,
    IDashboardLayoutSection,
    IDashboardLayoutSectionHeader,
    IDashboardLayoutSize,
    IDashboardLayoutSizeByScreenSize,
    IDashboardLayoutItem,
} from "@gooddata/sdk-model";
import { InsightWidgetBuilder, KpiWidgetBuilder, ValueOrUpdateCallback } from "@gooddata/sdk-backend-base";
import {
    IDashboardLayoutFacade,
    IDashboardLayoutItemFacade,
    IDashboardLayoutItemsFacade,
    IDashboardLayoutSectionFacade,
    IDashboardLayoutSectionsFacade,
} from "../facade/interfaces.js";

/**
 * Represents a query to select a subset of layout sections.
 *
 * @beta
 * @param sectionsFacade - sections facade to create a query
 * @returns array of section facades, single section facade, or undefined
 */
export type DashboardLayoutSectionsSelector<TWidget = IDashboardWidget> = (
    sectionsFacade: IDashboardLayoutSectionsFacade<TWidget>,
) => IDashboardLayoutSectionFacade<TWidget>[] | IDashboardLayoutSectionFacade<TWidget> | undefined;

/**
 * Represents a callback to modify the layout section.
 *
 * @beta
 * @param sectionBuilder - section builder on which the transformations will be performed
 * @param sectionFacade - section facade for convenient work with the item
 * @returns section builder with applied transforms
 */
export type DashboardLayoutSectionModifications<TWidget = IDashboardWidget> = (
    sectionBuilder: IDashboardLayoutSectionBuilder<TWidget>,
    sectionFacade: IDashboardLayoutSectionFacade<TWidget>,
) => IDashboardLayoutSectionBuilder<TWidget>;

/**
 * Represents a query to select a subset of section items.
 *
 * @beta
 * @param itemsFacade - items facade to create a query
 * @returns array of item facades, single item facade, or undefined
 */
export type DashboardLayoutItemsSelector<TWidget = IDashboardWidget> = (
    itemsFacade: IDashboardLayoutItemsFacade<TWidget>,
) => IDashboardLayoutItemFacade<TWidget>[] | IDashboardLayoutItemFacade<TWidget> | undefined;

/**
 * Represents a callback to modify the layout item.
 *
 * @beta
 * @param itemBuilder - item builder on which the transformations will be performed
 * @param itemFacade - item facade for convenient work with the layout item
 * @returns section builder with applied transforms
 */
export type DashboardLayoutItemModifications<TWidget = IDashboardWidget> = (
    itemBuilder: IDashboardLayoutItemBuilder<TWidget>,
    itemFacade: IDashboardLayoutItemFacade<TWidget>,
) => IDashboardLayoutItemBuilder<TWidget>;

/**
 * Represents a callback to modify the layout.
 *
 * @beta
 * @param layoutBuilder - layout builder on which the transformations will be performed
 * @param layoutFacade - layout facade for convenient work with the layout
 * @returns layout builder with applied transforms
 */
export type DashboardLayoutModifications<TWidget = IDashboardWidget> = (
    layoutBuilder: IDashboardLayoutBuilder<TWidget>,
    layoutFacade: IDashboardLayoutFacade<TWidget>,
) => IDashboardLayoutBuilder<TWidget>;

/**
 * Builder for convenient creation or transformation of any {@link @gooddata/sdk-backend-spi#IDashboardLayoutItem}.
 *
 * @beta
 */
export interface IDashboardLayoutItemBuilder<TWidget = IDashboardWidget> {
    /**
     * Set or update item size.
     *
     * @param valueOrUpdateCallback - item size or update callback
     * @returns this
     */
    size(valueOrTransform: ValueOrUpdateCallback<IDashboardLayoutSizeByScreenSize>): this;

    /**
     * Set or update item widget.
     *
     * @param valueOrUpdateCallback - item widget or update callback
     * @returns this
     */
    widget(valueOrTransform: ValueOrUpdateCallback<TWidget | undefined>): this;

    /**
     * Set or update item as raw data.
     * Use it really carefully, and only when no other method suits your needs.
     *
     * @param valueOrUpdateCallback - raw item data or update callback
     * @returns this
     */
    setItem(valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardLayoutItem<TWidget>>): this;

    /**
     * Get facade for the modified item.
     *
     * @returns item facade
     */
    facade(): IDashboardLayoutItemFacade<TWidget>;

    /**
     * Perform set of the modifications on the item.
     * This is useful, when you want to decouple set of transforms to a single function.
     *
     * @param modifications - callback to modify the item
     * @returns this
     */
    modify(modifications: DashboardLayoutItemModifications<TWidget>): this;

    /**
     * Get raw data of the modified item.
     *
     * @returns raw data of the modified item
     */
    build(): IDashboardLayoutItem<TWidget>;

    /**
     * Create & setup new insight widget for this item.
     *
     * Note: When the layout item already contains some widget, it will be replaced with the created insight widget.
     *
     * @param insight - insight reference
     * @param create - callback to configure the widget
     */
    newInsightWidget(insight: ObjRef, create?: (builder: InsightWidgetBuilder) => InsightWidgetBuilder): this;

    /**
     * Modify existing insight widget in this item.
     *
     * Note: When the item doesn't contain an insight widget, the error is thrown.
     *
     * @param modify - callback to modify the widget
     */
    modifyInsightWidget(modify: (builder: InsightWidgetBuilder) => InsightWidgetBuilder): this;

    /**
     * Create & setup new kpi widget for this item.
     * Note: When the layout item already contains some widget, it will be replaced with the created kpi widget.
     *
     * @param measure - measure reference
     * @param create - callback to configure the widget
     */
    newKpiWidget(measure: ObjRef, create?: (builder: KpiWidgetBuilder) => KpiWidgetBuilder): this;

    /**
     * Modify existing kpi widget in this item.
     *
     * Note: When the item doesn't contain a kpi widget, the error is thrown.
     *
     * @param modify - callback to modify the widget
     */
    modifyKpiWidget(modify: (builder: KpiWidgetBuilder) => KpiWidgetBuilder): this;
}

/**
 * Builder for convenient creation or transformation of any {@link @gooddata/sdk-backend-spi#IDashboardLayoutRow}.
 *
 * @beta
 */
export interface IDashboardLayoutSectionBuilder<TWidget = IDashboardWidget> {
    /**
     * Set or update section header.
     *
     * @param valueOrUpdateCallback - section header or update callback
     * @returns this
     */
    header(valueOrTransform: ValueOrUpdateCallback<IDashboardLayoutSectionHeader | undefined>): this;

    /**
     * Creates a new item and adds it into a section.
     *
     * Note:
     * - This operation is non-invasive, it cannot replace an existing item.
     *   This means that if there is already an existing item on the specified index,
     *   this and all subsequent items will be moved after the added item.
     *   If you want to replace an existing item use .modifyItem() or .modifyItems() method instead.
     *
     * - When no index is provided, item will be added at the end of the section.
     *
     * @param xlSize - size of the item for xl screen
     * @param create - callback to create the item
     * @param index - index where to place the item
     * @returns this
     */
    createItem(
        xlSize: IDashboardLayoutSize,
        create?: (builder: IDashboardLayoutItemBuilder<TWidget>) => IDashboardLayoutItemBuilder<TWidget>,
        index?: number,
    ): this;

    /**
     * Adds the provided item into a section.
     *
     * Note:
     * - This operation is non-invasive, it cannot replace an existing item.
     *   This means that if there is already an existing item on the specified index,
     *   this and all subsequent items will be moved after the added item.
     *   If you want to replace an existing item use .modifyItem() or .modifyItems() method instead.
     *
     * - When no index is provided, item will be added at the end of the section.
     *
     * @param item - item to add
     * @param index - index where to place the item
     */
    addItem(item: IDashboardLayoutItem<TWidget>, index?: number): this;

    /**
     * Perform modifications for the item at a specified index.
     *
     * Note:
     * - If the item at the specified index does not exist, the error is thrown.
     *   Do this only when you are sure about the item index or use .modifyItems() method instead,
     *   which allows you to select the items according to your predicate and does nothing if it is not met.
     *
     * @param index - item index
     * @param modify - callback to modify the item
     * @returns this
     */
    modifyItem(index: number, modify: DashboardLayoutItemModifications<TWidget>): this;

    /**
     * Remove the item at a specified index.
     *
     * Note:
     * - If the item at the specified index does not exist, the error is thrown.
     *   Do this only when you are sure about the item index, or use .removeItems() method instead,
     *   which allows you to select the items according to your predicate and does nothing if it is not met.
     *
     * @param index - the index of the item to remove
     * @returns this
     */
    removeItem(index: number): this;

    /**
     * Move item from a specified index to a target index.
     *
     * Note:
     * - If the item does not exist at the specified index, the error is thrown.
     * - This operation is non-invasive, it cannot replace an existing item.
     *   This means that if there is already an existing item at the target index,
     *   this and all subsequent items will be moved after the added item.
     * - If the target index is greater than the total number of items,
     *   it will be reduced and the item will be moved to the end.
     *
     * @param fromIndex - the index of the item to move
     * @param toIndex - the target index where the item will be moved
     * @returns this
     */
    moveItem(fromIndex: number, toIndex: number): this;

    /**
     * Perform modifications for the selected item(s).
     * This is useful to perform a set of transformations for items selected by any predicate.
     * Usually, you want to use .filter() and or .find() for the selector,
     * but it's really flexible and you can select any subset of the items.
     *
     * Note:
     * - When no selector is provided, all items are selected by default.
     * - Selector can return array, single value, or undefined.
     * - When selector returns undefined and or an empty array, no modifications are performed.
     *
     * @param modify - callback which is called for each of the selected items to modify it
     * @param selector - query to select the target items you want to modify
     * @returns this
     */
    modifyItems(
        modify: DashboardLayoutItemModifications<TWidget>,
        selector?: DashboardLayoutItemsSelector<TWidget>,
    ): this;

    /**
     * Remove selected item(s).
     * This is useful to remove items selected by any predicate.
     * Usually, you want to use .filter() and or .find() for the selector,
     * but it's really flexible and you can select any subset of the items.
     *
     * Note:
     * - When no selector is provided, all items are selected by default (and therefore removed).
     * - Selector can return array, single value, or undefined.
     * - When selector returns undefined and or an empty array, no item is removed.
     *
     * @param selector - query to select the target items you want to remove
     * @returns this
     */
    removeItems(selector?: DashboardLayoutItemsSelector<TWidget>): this;

    /**
     * Remove all empty items.
     *
     * @returns this
     */
    removeEmptyItems(): this;

    /**
     * Set or update section as raw data.
     * Use it really carefully, and only when no other method suits your needs.
     *
     * @param valueOrUpdateCallback - raw section data or update callback
     * @returns this
     */
    setSection(valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardLayoutSection<TWidget>>): this;

    /**
     * Get facade for the modified section.
     *
     * @returns section facade
     */
    facade(): IDashboardLayoutSectionFacade<TWidget>;

    /**
     * Perform set of the modifications on the section.
     * This is useful, when you want to decouple set of transforms to a single function.
     *
     * @param modifications - callback to modify the section
     * @returns this
     */
    modify(modifications: DashboardLayoutSectionModifications<TWidget>): this;

    /**
     * Get raw data of the modified section.
     *
     * @returns raw data of the modified section
     */
    build(): IDashboardLayoutSection<TWidget>;
}

/**
 * Builder for convenient creation or transformation of any {@link @gooddata/sdk-backend-spi#IDashboardLayout}.
 * The provided layout is not touched in any way, all operations performed on the layout are immutable.
 *
 * @beta
 */
export interface IDashboardLayoutBuilder<TWidget = IDashboardWidget> {
    /**
     * Set or update layout size.
     *
     * @param valueOrUpdateCallback - layout size or update callback
     * @returns this
     */
    size(valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardLayoutSize | undefined>): this;

    /**
     * Creates a new section and adds it to a layout.
     *
     * Note:
     * - This operation is non-invasive, it cannot replace an existing section.
     *   This means that if there is already an existing section on the specified index,
     *   this and all subsequent sections will be moved after the added section.
     *   If you want to replace an existing section use .modifySection() or .modifySections() method instead.
     *
     * - When no create callback is provided, an empty section is added
     * - When no index is provided, section will be added at the end of the layout.
     *
     * @param create - callback to create the section
     * @param index - index where to place the section
     * @returns this
     */
    createSection(
        create?: (
            builder: IDashboardLayoutSectionBuilder<TWidget>,
        ) => IDashboardLayoutSectionBuilder<TWidget>,
        index?: number,
    ): this;

    /**
     * Adds a new section to a layout.
     *
     * Note:
     * - This operation is non-invasive, it cannot replace an existing section.
     *   This means that if there is already an existing section on the specified index,
     *   this and all subsequent sections will be moved after the added section.
     *   If you want to replace an existing section use .modifySection() or .modifySections() method instead.
     *
     * - When no index is provided, section will be added at the end of the layout.
     *
     * @param section - section to add
     * @param index - index where to place the section
     * @returns this
     */
    addSection(section: IDashboardLayoutSection<TWidget>, index?: number): this;

    /**
     * Modify section at a specified index.
     *
     * Note:
     * - If the section does not exist at the specified index, the error is thrown.
     *   Do this only when you are sure about the section index, or use .modifySections() method instead,
     *   which allows you to select the sections according to your predicate and does nothing if it is not met.
     *
     * @param index - section index
     * @param modify - callback to modify the section
     * @returns this
     */
    modifySection(index: number, modify: DashboardLayoutSectionModifications<TWidget>): this;

    /**
     * Remove the section at a specified index.
     *
     * Note:
     * - If the section does not exist at the specified index, the error is thrown.
     *   Do this only when you are sure about the section index, or use .removeSections() method instead,
     *   which allows you to select the sections according to your predicate and does nothing if it is not met.
     *
     * @param index - the index of the section to remove
     * @returns this
     */
    removeSection(index: number): this;

    /**
     * Move section from a specified index to a target index.
     *
     * Note:
     * - If the section does not exist at the specified index, the error is thrown.
     * - This operation is non-invasive, it cannot replace an existing section.
     *   This means that if there is already an existing section at the target index,
     *   this and all subsequent sections will be moved after the added section.
     * - If the target index is greater than the total number of sections,
     *   it will be reduced and the section will be moved to the end.
     *
     * @param fromIndex - the index of the section to move
     * @param toIndex - the target index where the section will be moved
     * @returns this
     */
    moveSection(fromIndex: number, toIndex: number): this;

    /**
     * Perform modifications for the selected section(s).
     * This is useful to perform a set of transformations for sections selected by any predicate.
     * Usually, you want to use .filter() and or .find() for the selector,
     * but it's really flexible and you can select any subset of the sections.
     *
     * Note:
     * - When no selector is provided, all sections are selected by default.
     * - Selector can return array, single value, or undefined.
     * - When selector returns undefined and or an empty array, no modifications are performed.
     *
     * @param modify - callback which is called for each of the selected sections to modify it
     * @param selector - query to select the target sections you want to modify
     * @returns this
     */
    modifySections(
        modify: DashboardLayoutSectionModifications<TWidget>,
        selector?: DashboardLayoutSectionsSelector<TWidget>,
    ): this;

    /**
     * Remove selected section(s).
     * This is useful to remove sections selected by any predicate.
     * Usually, you want to use .filter() and or .find() for the selector,
     * but it's really flexible and you can select any subset of the sections.
     *
     * Note:
     * - When no selector is provided, all sections are selected by default (and therefore removed).
     * - Selector can return array, single value, or undefined.
     * - When selector returns undefined and or an empty array, no section is removed.
     *
     * @param selector - query to select the target sections you want to modify
     * @returns this
     */
    removeSections(selector?: DashboardLayoutSectionsSelector<TWidget>): this;

    /**
     * Remove all empty sections.
     *
     * @returns this
     */
    removeEmptySections(): this;

    /**
     * Set or update layout as raw data.
     * Use it really carefully, and only when no other method suits your needs.
     *
     * @param valueOrUpdateCallback - raw layout data or update callback
     * @returns this
     */
    setLayout(valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardLayout<TWidget>>): this;

    /**
     * Get facade for the modified layout.
     *
     * @returns layout facade
     */
    facade(): IDashboardLayoutFacade<TWidget>;

    /**
     * Perform set of the modifications on the layout.
     * This is useful, when you want to decouple set of transforms to a single function.
     *
     * @param modifications - callback to modify the layout
     * @returns this
     */
    modify(modifications: DashboardLayoutModifications<TWidget>): this;

    /**
     * Get raw data of the modified layout.
     *
     * @returns raw data of the modified layout
     */
    build(): IDashboardLayout<TWidget>;
}
