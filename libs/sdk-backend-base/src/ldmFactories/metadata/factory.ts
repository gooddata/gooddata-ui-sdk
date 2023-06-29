// (C) 2019-2022 GoodData Corporation

import { IMetadataObject } from "@gooddata/sdk-model";
import { Builder, IBuilder } from "../builder.js";

/**
 * Metadata object builder interface
 *
 * @beta
 */
export interface IMetadataObjectBuilder<T extends IMetadataObject = IMetadataObject> extends IBuilder<T> {
    /**
     * Set metadata object title
     *
     * @param title - metadata object title
     * @returns this
     */
    title(title: string): this;

    /**
     * Set metadata object description
     *
     * @param description - metadata object description
     * @returns this
     */
    description(description: string): this;

    /**
     * Set metadata object identifier
     *
     * @param id - metadata object identifier
     * @returns this
     */
    id(id: string): this;

    /**
     * Set metadata object uri
     *
     * @param uri - metadata object uri
     * @returns this
     */
    uri(uri: string): this;

    /**
     * Sets metadata object 'unlisted' flag
     *
     * @param value - true if unlisted
     * @returns this
     */
    unlisted(value: boolean): this;

    /**
     * Set metadata object isProduction flag
     *
     * @param isProduction - true if production
     * @returns this
     */
    production(isProduction: boolean): this;

    /**
     * Set metadata object isDeprecated flag
     *
     * @param isDeprecated - true if deprecated
     * @returns this
     */
    deprecated(isDeprecated: boolean): this;
}

/**
 * Metadata object builder
 * See {@link Builder}
 *
 * @beta
 */
export class MetadataObjectBuilder<T extends IMetadataObject = IMetadataObject>
    extends Builder<T>
    implements IMetadataObjectBuilder
{
    public title(title: string): this {
        this.item.title = title;
        return this;
    }

    public description(description: string): this {
        this.item.description = description;
        return this;
    }

    public id(identifier: string): this {
        this.item.id = identifier;
        return this;
    }

    public uri(uri: string): this {
        this.item.uri = uri;
        return this;
    }

    public unlisted(value: boolean): this {
        this.item.unlisted = value;

        return this;
    }

    public production(isProduction: boolean): this {
        this.item.production = isProduction;
        return this;
    }

    public deprecated(isDeprecated: boolean): this {
        this.item.deprecated = isDeprecated;
        return this;
    }
}
