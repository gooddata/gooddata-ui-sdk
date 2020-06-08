// (C) 2019-2020 GoodData Corporation
import identity = require("lodash/identity");
import { builderFactory, BuilderModifications } from "../../../base/builder";
import { IFactMetadataObject, isFactMetadataObject } from "../../metadata/fact";
import { GroupableCatalogItemBuilder } from "../group/factory";
import { ICatalogFact } from ".";
import { ObjRef } from "../../../objRef";
import { FactMetadataObjectBuilder, newFactMetadataObject } from "../../metadata";

/**
 * Catalog fact builder
 * See {@link Builder}
 *
 * @public
 */
export class CatalogFactBuilder<T extends ICatalogFact = ICatalogFact> extends GroupableCatalogItemBuilder<
    T
> {
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
 * @public
 */
export const newCatalogFact = (
    modifications: BuilderModifications<CatalogFactBuilder> = identity,
): ICatalogFact => builderFactory(CatalogFactBuilder, { type: "fact" }, modifications);
