// (C) 2019-2020 GoodData Corporation
import identity = require("lodash/identity");
import { BuilderModifications, builderFactory, Builder, IBuilder } from "../../../base/builder";
import { ICatalogGroup, IGroupableCatalogItemBase } from ".";
import { ObjRef } from "../../../objRef";

/**
 * @public
 */
export interface IGroupableCatalogItemBuilder<
    T extends IGroupableCatalogItemBase = IGroupableCatalogItemBase
> extends IBuilder<T> {
    groups(tagRefs: ObjRef[]): this;
}

/**
 * @public
 */
export class GroupableCatalogItemBuilder<T extends IGroupableCatalogItemBase = IGroupableCatalogItemBase>
    extends Builder<T>
    implements IGroupableCatalogItemBuilder<T> {
    public groups(tagRefs: ObjRef[]): this {
        this.item.groups = tagRefs;
        return this;
    }
}

/**
 * @public
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
 * @public
 */
export const newCatalogGroup = (
    modifications: BuilderModifications<CatalogGroupBuilder> = identity,
): ICatalogGroup => builderFactory(CatalogGroupBuilder, {}, modifications);
