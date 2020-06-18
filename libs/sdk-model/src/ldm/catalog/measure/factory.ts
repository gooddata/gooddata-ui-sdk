// (C) 2019-2020 GoodData Corporation
import identity = require("lodash/identity");
import { builderFactory, BuilderModifications } from "../../../base/builder";
import { ICatalogMeasure } from ".";
import { IMeasureMetadataObject, isMeasureMetadataObject } from "../../metadata/measure";
import { GroupableCatalogItemBuilder } from "../group/factory";
import { ObjRef } from "../../../objRef";
import { MeasureMetadataObjectBuilder, newMeasureMetadataObject } from "../../metadata";
import { IMeasure } from "../../../execution/measure";
import { MeasureBuilder, MeasureModifications, newMeasure } from "../../../execution/measure/factory";

/**
 * Catalog measure builder
 * See {@link Builder}
 *
 * @public
 */
export class CatalogMeasureBuilder<
    T extends ICatalogMeasure = ICatalogMeasure
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
            m.alias(this.item.measure?.title!).format(this.item.measure?.format!);

        return newMeasure(this.item.measure.ref, (m) => modifications(defaultModifications(m)));
    }
}

/**
 * Catalog measure factory
 *
 * @param modifications - catalog measure builder modifications to perform
 * @returns created catalog measure
 * @public
 */
export const newCatalogMeasure = (
    modifications: BuilderModifications<CatalogMeasureBuilder> = identity,
): ICatalogMeasure => builderFactory(CatalogMeasureBuilder, { type: "measure" }, modifications);

/**
 * Converts catalog measure to execution measure
 *
 * @param catalogMeasure - catalog measure to convert
 * @param modifications - catalog measure builder modifications to perform before conversion
 * @returns measure converted to the execution model
 * @public
 */
export const catalogMeasureToExecutionMeasure = (
    catalogMeasure: ICatalogMeasure,
    modifications: BuilderModifications<CatalogMeasureBuilder> = identity,
): IMeasure => new CatalogMeasureBuilder(catalogMeasure).modify(modifications).toExecutionModel();
