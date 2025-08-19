// (C) 2019-2025 GoodData Corporation
import identity from "lodash/identity.js";

import {
    ICatalogMeasure,
    IMeasure,
    IMeasureMetadataObject,
    MeasureBuilder,
    MeasureModifications,
    ObjRef,
    isMeasureMetadataObject,
    newMeasure,
} from "@gooddata/sdk-model";

import { GroupableCatalogItemBuilder } from "./groupFactory.js";
import { BuilderModifications, builderFactory } from "../builder.js";
import { MeasureMetadataObjectBuilder, newMeasureMetadataObject } from "../metadata/measureFactory.js";

/**
 * Catalog measure builder
 * See {@link Builder}
 *
 * @beta
 */
export class CatalogMeasureBuilder<
    T extends ICatalogMeasure = ICatalogMeasure,
> extends GroupableCatalogItemBuilder<T> {
    public measure(
        measureOrRef: IMeasureMetadataObject | ObjRef,
        modifications?: BuilderModifications<MeasureMetadataObjectBuilder>,
    ): this {
        if (!isMeasureMetadataObject(measureOrRef)) {
            this.item.measure = newMeasureMetadataObject(measureOrRef, modifications);
        } else {
            this.item.measure = measureOrRef;
        }
        return this;
    }

    public toExecutionModel(modifications: MeasureModifications<MeasureBuilder> = identity): IMeasure {
        if (!this.item.measure) {
            throw new Error("Cannot convert catalog measure to execution model, no measure found!");
        }

        const defaultModifications: MeasureModifications<MeasureBuilder> = (m) =>
            m.alias(this.item.measure?.title).format(this.item.measure?.format);

        return newMeasure(this.item.measure.ref, (m) => modifications(defaultModifications(m)));
    }
}

/**
 * Catalog measure factory
 *
 * @param modifications - catalog measure builder modifications to perform
 * @returns created catalog measure
 * @beta
 */
export const newCatalogMeasure = (
    modifications: BuilderModifications<CatalogMeasureBuilder> = identity,
): ICatalogMeasure => builderFactory(CatalogMeasureBuilder, { type: "measure" }, modifications);
