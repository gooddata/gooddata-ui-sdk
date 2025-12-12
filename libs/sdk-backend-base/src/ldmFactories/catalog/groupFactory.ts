// (C) 2019-2025 GoodData Corporation

import { type ICatalogGroup, type IGroupableCatalogItemBase, type ObjRef } from "@gooddata/sdk-model";

import { Builder, type BuilderModifications, type IBuilder, builderFactory } from "../builder.js";

/**
 * Groupable catalog item builder interface
 *
 * @beta
 */
export interface IGroupableCatalogItemBuilder<T extends IGroupableCatalogItemBase = IGroupableCatalogItemBase>
    extends IBuilder<T> {
    groups(tagRefs: ObjRef[]): this;
}

/**
 * Groupable catalog item builder
 * See {@link Builder}
 *
 * @beta
 */
export class GroupableCatalogItemBuilder<T extends IGroupableCatalogItemBase = IGroupableCatalogItemBase>
    extends Builder<T>
    implements IGroupableCatalogItemBuilder<T>
{
    public groups(tagRefs: ObjRef[]): this {
        this.item.groups = tagRefs;
        return this;
    }
}

/**
 * Catalog group builder
 * See {@link Builder}
 *
 * @beta
 */
export class CatalogGroupBuilder<T extends ICatalogGroup = ICatalogGroup> extends Builder<T> {
    public title(title: string): this {
        this.item.title = title;
        return this;
    }

    public tag(tagRef: ObjRef): this {
        this.item.tag = tagRef;
        return this;
    }
}

/**
 * Catalog group factory
 *
 * @param modifications - catalog group builder modifications to perform
 * @returns created catalog group
 * @beta
 */
export const newCatalogGroup = (
    modifications: BuilderModifications<CatalogGroupBuilder> = (v) => v,
): ICatalogGroup => builderFactory(CatalogGroupBuilder, {}, modifications);
