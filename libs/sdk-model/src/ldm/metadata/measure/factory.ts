// (C) 2019-2020 GoodData Corporation
import identity = require("lodash/identity");
import { ObjRef } from "../../../objRef";
import { BuilderModifications, builderFactory } from "../../../base/builder";
import { MetadataObjectBuilder } from "../factory";
import { IMeasureMetadataObject } from ".";

/**
 * @public
 */
export class MeasureMetadataObjectBuilder<
    T extends IMeasureMetadataObject = IMeasureMetadataObject
> extends MetadataObjectBuilder<T> {
    public expression(maql: string): this {
        this.item.expression = maql;
        return this;
    }

    public format(format: string): this {
        this.item.format = format;
        return this;
    }
}

/**
 * @public
 */
export const newMeasureMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<MeasureMetadataObjectBuilder> = identity,
): IMeasureMetadataObject =>
    builderFactory(MeasureMetadataObjectBuilder, { type: "measure", ref }, modifications);
