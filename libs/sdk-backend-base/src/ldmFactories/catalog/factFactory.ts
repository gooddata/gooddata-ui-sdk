// (C) 2019-2025 GoodData Corporation

import { ICatalogFact, IFactMetadataObject, ObjRef, isFactMetadataObject } from "@gooddata/sdk-model";

import { GroupableCatalogItemBuilder } from "./groupFactory.js";
import { BuilderModifications, builderFactory } from "../builder.js";
import { FactMetadataObjectBuilder, newFactMetadataObject } from "../metadata/factFactory.js";

/**
 * Catalog fact builder
 * See {@link Builder}
 *
 * @beta
 */
export class CatalogFactBuilder<
    T extends ICatalogFact = ICatalogFact,
> extends GroupableCatalogItemBuilder<T> {
    public fact(
        factOrRef: IFactMetadataObject | ObjRef,
        modifications?: BuilderModifications<FactMetadataObjectBuilder>,
    ): this {
        if (isFactMetadataObject(factOrRef)) {
            this.item.fact = factOrRef;
        } else {
            this.item.fact = newFactMetadataObject(factOrRef, modifications);
        }
        return this;
    }
}

/**
 * Catalog fact factory
 *
 * @param modifications - catalog fact builder modifications to perform
 * @returns created catalog fact
 * @beta
 */
export const newCatalogFact = (
    modifications: BuilderModifications<CatalogFactBuilder> = (v) => v,
): ICatalogFact => builderFactory(CatalogFactBuilder, { type: "fact" }, modifications);
