// (C) 2019-2025 GoodData Corporation
import identity from "lodash/identity.js";

import { IMeasureMetadataObject, IUser, ObjRef } from "@gooddata/sdk-model";

import { MetadataObjectBuilder } from "./factory.js";
import { BuilderModifications, builderFactory } from "../builder.js";

/**
 * Measure metadata object builder
 * See {@link Builder}
 *
 * @beta
 */
export class MeasureMetadataObjectBuilder<
    T extends IMeasureMetadataObject = IMeasureMetadataObject,
> extends MetadataObjectBuilder<T> {
    public expression(maql: string): this {
        this.item.expression = maql;
        return this;
    }

    public format(format: string): this {
        this.item.format = format;
        return this;
    }

    public isLocked(isLocked: boolean): this {
        this.item.isLocked = isLocked;
        return this;
    }

    public tags(tags: string[]): this {
        this.item.tags = tags;
        return this;
    }

    public created(createdAt?: string): this {
        this.item.created = createdAt;
        return this;
    }

    public createdBy(createdBy?: IUser): this {
        this.item.createdBy = createdBy;
        return this;
    }

    public updated(updatedAt?: string): this {
        this.item.updated = updatedAt;
        return this;
    }

    public updatedBy(updatedBy?: IUser): this {
        this.item.updatedBy = updatedBy;
        return this;
    }
}

/**
 * Measure metadata object factory
 *
 * @param ref - measure reference
 * @param modifications - measure builder modifications to perform
 * @returns created measure metadata object
 * @beta
 */
export const newMeasureMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<MeasureMetadataObjectBuilder> = identity,
): IMeasureMetadataObject =>
    builderFactory(MeasureMetadataObjectBuilder, { type: "measure", ref }, modifications);
