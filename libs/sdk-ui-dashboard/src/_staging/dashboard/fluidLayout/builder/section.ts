// (C) 2019-2022 GoodData Corporation
import { invariant } from "ts-invariant";
import identity from "lodash/identity.js";
import isArray from "lodash/isArray.js";
import difference from "lodash/difference.js";
import {
    IDashboardLayout,
    IDashboardLayoutSection,
    IDashboardLayoutSectionHeader,
    IDashboardLayoutSize,
    IDashboardLayoutItem,
    isDashboardLayoutSection,
} from "@gooddata/sdk-model";
import { resolveValueOrUpdateCallback, ValueOrUpdateCallback } from "@gooddata/sdk-backend-base";
import {
    DashboardLayoutItemModifications,
    DashboardLayoutItemsSelector,
    DashboardLayoutSectionModifications,
    IDashboardLayoutBuilder,
    IDashboardLayoutItemBuilder,
    IDashboardLayoutSectionBuilder,
} from "./interfaces.js";
import { IDashboardLayoutSectionFacade } from "../facade/interfaces.js";
import { DashboardLayoutItemBuilder } from "./item.js";

/**
 * @alpha
 */
export class DashboardLayoutSectionBuilder<TContent> implements IDashboardLayoutSectionBuilder<TContent> {
    protected constructor(
        protected sectionIndex: number,
        protected getSectionFacade: () => IDashboardLayoutSectionFacade<TContent>,
        protected setLayout: (
            valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardLayout<TContent>>,
        ) => void,
    ) {}

    /**
     * Creates an instance of DashboardLayoutSectionBuilder for particular layout item.
     */
    public static for<TContent>(
        layoutBuilder: IDashboardLayoutBuilder<TContent>,
        sectionIndex: number,
    ): IDashboardLayoutSectionBuilder<TContent> {
        invariant(
            isDashboardLayoutSection(layoutBuilder.facade().sections().section(sectionIndex)?.raw()),
            `Provided data must be IDashboardLayoutSection.`,
        );

        const sectionBuilder: IDashboardLayoutSectionBuilder<TContent> = new DashboardLayoutSectionBuilder(
            sectionIndex,
            () => layoutBuilder.facade().section(sectionIndex)!,
            (layout) => layoutBuilder.setLayout(layout),
        );

        return sectionBuilder;
    }

    public header(
        valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardLayoutSectionHeader | undefined>,
    ): this {
        return this.setSection((section) => ({
            ...section,
            header: resolveValueOrUpdateCallback(valueOrUpdateCallback, section.header),
        }));
    }

    public createItem(
        xlSize: IDashboardLayoutSize,
        create: (
            builder: IDashboardLayoutItemBuilder<TContent>,
        ) => IDashboardLayoutItemBuilder<TContent> = identity,
        index: number = this.facade().items().count(),
    ): this {
        const emptyItem: IDashboardLayoutItem<TContent> = {
            type: "IDashboardLayoutItem",
            size: {
                xl: xlSize,
            },
        };
        this.setSection((section) => {
            const updatedItems = [...section.items];
            updatedItems.splice(index, 0, emptyItem);
            return {
                ...section,
                items: updatedItems,
            };
        });
        DashboardLayoutItemBuilder.for(this, index).modify(create);
        return this;
    }

    public addItem(
        item: IDashboardLayoutItem<TContent>,
        index: number = this.facade().items().count(),
    ): this {
        this.setSection((section) => {
            const updatedItems = [...section.items];
            updatedItems.splice(index, 0, item);
            return {
                ...section,
                items: updatedItems,
            };
        });

        return this;
    }

    public modifyItem(index: number, modify: DashboardLayoutItemModifications<TContent>): this {
        const itemFacade = this.facade().items().item(index);
        invariant(itemFacade, `Cannot modify the item - item at index ${index} does not exist.`);

        DashboardLayoutItemBuilder.for(this, index).modify(modify);
        return this;
    }

    public removeItem(index: number): this {
        const itemFacade = this.facade().items().item(index);
        invariant(itemFacade, `Cannot remove the item - item at index ${index} does not exist.`);

        return this.setSection((section) => {
            const updatedItems = [...section.items];
            updatedItems.splice(index, 1);
            return {
                ...section,
                items: updatedItems,
            };
        });
    }

    public moveItem(fromIndex: number, toIndex: number): this {
        const itemFacade = this.facade().item(fromIndex);
        invariant(itemFacade, `Cannot move the item - item at index ${fromIndex} does not exist.`);

        const maxToIndex = Math.min(toIndex, this.facade().items().count() - 1);

        this.removeItem(fromIndex);
        this.createItem(itemFacade.sizeForScreen("xl")!, (c) => c.setItem(itemFacade.raw()), maxToIndex);
        return this;
    }

    public removeItems(selector: DashboardLayoutItemsSelector<TContent> = (items) => items.all()): this {
        const itemsToRemove = selector(this.facade().items());
        if (isArray(itemsToRemove)) {
            this.setSection((section) => {
                const updatedItems = difference(
                    section.items,
                    itemsToRemove.map((r) => r.raw()),
                );
                return {
                    ...section,
                    items: updatedItems,
                };
            });
        } else if (itemsToRemove) {
            this.removeItem(itemsToRemove.index());
        }
        return this;
    }

    public removeEmptyItems = (): this => {
        return this.removeItems((items) => items.filter((item) => item.isEmpty()));
    };

    public modifyItems(
        modify: DashboardLayoutItemModifications<TContent>,
        selector: DashboardLayoutItemsSelector<TContent> = (items) => items.all(),
    ): this {
        const itemsToModify = selector(this.facade().items());
        if (isArray(itemsToModify)) {
            itemsToModify.forEach((item) => {
                this.modifyItem(item.index(), modify);
            });
        } else if (itemsToModify) {
            this.modifyItem(itemsToModify.index(), modify);
        }
        return this;
    }

    public setSection(valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardLayoutSection<TContent>>): this {
        this.setLayout((layout) => {
            const updatedRows = [...layout.sections];
            updatedRows[this.sectionIndex] = resolveValueOrUpdateCallback(
                valueOrUpdateCallback,
                this.build(),
            );
            return {
                ...layout,
                sections: updatedRows,
            };
        });
        return this;
    }

    public facade(): IDashboardLayoutSectionFacade<TContent> {
        return this.getSectionFacade();
    }

    public modify(modifications: DashboardLayoutSectionModifications<TContent>): this {
        modifications(this, this.facade());
        return this;
    }

    public build(): IDashboardLayoutSection<TContent> {
        return this.facade().raw();
    }
}
