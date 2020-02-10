// (C) 2019-2020 GoodData Corporation
import { IMetadataObject } from "./types";
import { Builder, IBuilder } from "../../base/builder";

/**
 * @public
 */
export interface IMetadataObjectBuilder<T extends IMetadataObject = IMetadataObject> extends IBuilder<T> {
    title(title: string): this;
    description(description: string): this;
    id(id: string): this;
    uri(uri: string): this;
    production(isProduction: boolean): this;
}

/**
 * @public
 */
export class MetadataObjectBuilder<T extends IMetadataObject = IMetadataObject> extends Builder<T>
    implements IMetadataObjectBuilder {
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

    public production(isProduction: boolean): this {
        this.item.production = isProduction;
        return this;
    }
}
