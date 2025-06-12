// (C) 2019-2022 GoodData Corporation
import identity from "lodash/identity.js";
import { ObjRef, ICatalogFact, IFactMetadataObject, isFactMetadataObject } from "@gooddata/sdk-model";
import { GroupableCatalogItemBuilder } from "./groupFactory.js";
import { builderFactory, BuilderModifications } from "../builder.js";
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
        if (!isFactMetadataObject(factOrRef)) {
            this.item.fact = newFactMetadataObject(factOrRef, modifications);
        } else {
            this.item.fact = factOrRef;
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
    modifications: BuilderModifications<CatalogFactBuilder> = identity,
): ICatalogFact => builderFactory(CatalogFactBuilder, { type: "fact" }, modifications);
