// (C) 2021 GoodData Corporation
import {
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    ICatalogAttribute,
    ICatalogDateAttribute,
    ICatalogDateDataset,
    IMetadataObject,
} from "@gooddata/sdk-backend-spi";
import { Identifier, isIdentifierRef, ObjectType, ObjRef } from "@gooddata/sdk-model";

/**
 * Configuration for the ObjRefMap.
 *
 * @internal
 */
export type ObjRefMapConfig<T> = {
    /**
     * Function that extracts `ref` from object
     */
    readonly refExtract: (obj: T) => ObjRef;

    /**
     * Function that extracts `id` from object
     */
    readonly idExtract: (obj: T) => Identifier;

    /**
     * Function that extracts `uri` from object
     */
    readonly uriExtract: (obj: T) => string;

    /**
     * Indicates whether strict idRef type-checking is desired. Some backends (e.g. tiger) have identifier
     * refs use combination of `id` and `type` and have type-level `id` uniqueness constraints. On those backends,
     * strict type checks are essential to correctly match objects.
     *
     * On other backends, the `type` information coming in the idRef is superfluous and should not be influencing
     * anything.
     */
    readonly strictTypeCheck: boolean;

    /**
     * Type of object stored in the map.
     */
    readonly type: ObjectType;
};

/**
 * Utility class that assists with type-agnostic mapping of metadata objects by ObjRef.
 *
 * Problem
 * =======
 *
 * The challenges with ObjRef's start in context of backend that supports both uri and id ref (e.g. bear) and the client.
 *
 * Backend according to contract creates one type of ref - uri ref - so that is fine. However when instances of `ref` are created
 * by the client code and are passed in through the public API (as is the case with the dashboard component) - problems start.
 *
 * For clients it is often more convenient to use ID refs.. because they are transferable across workspaces and because
 * they appear in the catalog export.
 *
 * Doing strict ref-to-ref matching between user input and the data stored in state will result in no matches because
 * the types of ref's do not match.
 *
 * ---
 *
 * This class addresses the problem by having the `get` method check the type of ObjRef first and then perform
 * lookups into either id to item or uri to item mapping.
 *
 * @internal
 */
export class ObjRefMap<T> {
    public readonly [Symbol.toStringTag]: string = "ObjRefMap";
    public size: number = 0;

    private items: Array<[ObjRef, T]> = [];
    private itemsByIdentifier: Record<Identifier, T> = {};
    private itemsByUri: Record<string, T> = {};

    constructor(private readonly config: ObjRefMapConfig<T>) {}

    private idRefToKey(identifier: string, type?: ObjectType): string {
        return !this.config.strictTypeCheck || !type ? identifier : `${identifier}#${type}`;
    }

    public fromItems(items: ReadonlyArray<T>): ObjRefMap<T> {
        const { refExtract, uriExtract, idExtract } = this.config;

        items.forEach((i) => {
            const uri = uriExtract(i);

            if (this.itemsByUri[uri]) {
                return;
            }

            this.itemsByUri[uri] = i;
            this.itemsByIdentifier[`${this.idRefToKey(idExtract(i), this.config.type)}`] = i;
            this.items.push([refExtract(i), i]);
            this.size++;
        });

        return this;
    }

    public [Symbol.iterator](): IterableIterator<[ObjRef, T]> {
        return this.items[Symbol.iterator]();
    }

    public entries(): IterableIterator<[ObjRef, T]> {
        return this.items[Symbol.iterator]();
    }

    public get(key: ObjRef): T | undefined {
        if (isIdentifierRef(key)) {
            const strictMatch = this.itemsByIdentifier[this.idRefToKey(key.identifier, key.type)];

            if (!strictMatch && !key.type && this.config.strictTypeCheck) {
                // eslint-disable-next-line no-console
                console.warn(
                    "You are working with an analytical backend which can only match entities by idRefs that contain both identifier and type. However, while trying to find match an object by ref your code supplied just the identifier without type.",
                );
            }

            return strictMatch;
        }

        return this.itemsByUri[key.uri];
    }

    public keys(): IterableIterator<ObjRef> {
        return this.items.map((i) => i[0])[Symbol.iterator]();
    }

    public values(): IterableIterator<T> {
        return this.items.map((i) => i[1])[Symbol.iterator]();
    }
}

const metadataObjectExtractors = {
    idExtract: (i: IMetadataObject) => i.id,
    uriExtract: (i: IMetadataObject) => i.uri,
    refExtract: (i: IMetadataObject) => i.ref,
};

/**
 * Creates {@link ObjRefMap} for catalog date datasets. Either normal attributes or catalog date attributes.
 *
 * @param items - items to add into mapping
 * @param strictTypeCheck - whether to do strict type checking when getting by identifierRef
 */
export function newCatalogDateDatasetMap(
    items: ReadonlyArray<ICatalogDateDataset>,
    strictTypeCheck: boolean = false,
): ObjRefMap<ICatalogDateDataset> {
    const map = new ObjRefMap<ICatalogDateDataset>({
        type: "attribute",
        strictTypeCheck,
        idExtract: (i) => i.dataSet.id,
        uriExtract: (i) => i.dataSet.uri,
        refExtract: (i) => i.dataSet.ref,
    });

    return map.fromItems(items);
}

/**
 * Creates {@link ObjRefMap} for catalog attribute items. Either normal attributes or catalog date attributes.
 *
 * @param items - items to add into mapping
 * @param strictTypeCheck - whether to do strict type checking when getting by identifierRef
 */
export function newCatalogAttributeMap(
    items: ReadonlyArray<ICatalogAttribute | ICatalogDateAttribute>,
    strictTypeCheck: boolean = false,
): ObjRefMap<ICatalogAttribute | ICatalogDateAttribute> {
    const map = new ObjRefMap<ICatalogAttribute | ICatalogDateAttribute>({
        type: "attribute",
        strictTypeCheck,
        idExtract: (i) => i.attribute.id,
        uriExtract: (i) => i.attribute.uri,
        refExtract: (i) => i.attribute.ref,
    });

    return map.fromItems(items);
}

/**
 * Creates {@link ObjRefMap} for attribute display form metadata objects.
 *
 * @param items - items to add into map
 * @param strictTypeCheck - whether to do strict type checking when getting by identifierRef
 */
export function newDisplayFormMap(
    items: ReadonlyArray<IAttributeDisplayFormMetadataObject>,
    strictTypeCheck: boolean = false,
): ObjRefMap<IAttributeDisplayFormMetadataObject> {
    const map = new ObjRefMap<IAttributeDisplayFormMetadataObject>({
        type: "displayForm",
        strictTypeCheck,
        ...metadataObjectExtractors,
    });

    return map.fromItems(items);
}

/**
 * Creates {@link ObjRefMap} for attribute metadata objects.
 *
 * @param items - items to add into map
 * @param strictTypeCheck - whether to do strict type checking when getting by identifierRef
 */
export function newAttributeMap(
    items: IAttributeMetadataObject[],
    strictTypeCheck: boolean = false,
): ObjRefMap<IAttributeMetadataObject> {
    const map = new ObjRefMap<IAttributeMetadataObject>({
        type: "attribute",
        strictTypeCheck,
        ...metadataObjectExtractors,
    });

    return map.fromItems(items);
}
