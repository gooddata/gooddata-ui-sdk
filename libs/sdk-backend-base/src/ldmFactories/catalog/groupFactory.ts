// (C) 2019-2022 GoodData Corporation
import identity from "lodash/identity.js";
import { ObjRef, ICatalogGroup, IGroupableCatalogItemBase } from "@gooddata/sdk-model";
import { Builder, builderFactory, BuilderModifications, IBuilder } from "../builder.js";

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
    modifications: BuilderModifications<CatalogGroupBuilder> = identity,
): ICatalogGroup => builderFactory(CatalogGroupBuilder, {}, modifications);
