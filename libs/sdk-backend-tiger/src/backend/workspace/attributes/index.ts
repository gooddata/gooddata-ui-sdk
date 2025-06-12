// (C) 2019-2025 GoodData Corporation
import {
    IAttributeWithReferences,
    IElementsQueryFactory,
    IWorkspaceAttributesService,
    NotSupported,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import {
    areObjRefsEqual,
    isIdentifierRef,
    ObjRef,
    IMetadataObject,
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    IDataSetMetadataObject,
    IdentifierRef,
    objRefToString,
    idRef,
} from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { TigerWorkspaceElements } from "./elements/index.js";
import {
    ITigerClient,
    jsonApiHeaders,
    MetadataUtilities,
    JsonApiDatasetOutWithLinks,
    JsonApiDatasetOutWithLinksTypeEnum,
    EntitiesApiGetAllEntitiesAttributesRequest,
    AfmValidObjectsQuery,
    AttributeItem,
} from "@gooddata/api-client-tiger";
import { invariant } from "ts-invariant";

import {
    convertAttributeLabels,
    convertAttributesWithSideloadedLabels,
    convertAttributeWithSideloadedLabels,
    convertDatasetWithLinks,
    createDataSetMap,
    createLabelMap,
} from "../../../convertors/fromBackend/MetadataConverter.js";
import { DateFormatter } from "../../../convertors/fromBackend/dateFormatting/types.js";
import { getIdOrigin } from "../../../convertors/fromBackend/ObjectInheritance.js";
import { jsonApiIdToObjRef } from "../../../convertors/fromBackend/ObjRefConverter.js";
import { toLabelQualifier } from "../../../convertors/toBackend/ObjRefConverter.js";

export class TigerWorkspaceAttributes implements IWorkspaceAttributesService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
        private readonly dateFormatter: DateFormatter,
    ) {}

    public elements(): IElementsQueryFactory {
        return new TigerWorkspaceElements(this.authCall, this.workspace, this.dateFormatter);
    }

    public getAttributeDisplayForm = async (ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> => {
        return this.authCall(async (client) => loadAttributeDisplayForm(client, this.workspace, ref));
    };

    public getAttribute = async (ref: ObjRef): Promise<IAttributeMetadataObject> => {
        return this.authCall(async (client) => loadAttribute(client, this.workspace, ref));
    };

    public getAttributeDisplayForms(refs: ObjRef[]): Promise<IAttributeDisplayFormMetadataObject[]> {
        if (refs.length === 0) {
            return Promise.resolve([]);
        }

        return this.authCall(async (client) => {
            const filter = refs
                .filter(isIdentifierRef)
                .map((ref) => `id==${ref.identifier}`)
                .join(",");
            const allDisplayForms = await client.entities.getAllEntitiesLabels({
                include: ["attribute"],
                workspaceId: this.workspace,
                origin: "ALL",
                filter,
                size: refs.length,
            });
            const result = allDisplayForms?.data?.data;

            return result?.map((item) => ({
                attribute: {
                    identifier: item.relationships?.attribute?.data?.id || "",
                    type: item.relationships?.attribute?.data?.type || "attribute",
                },
                ref: { identifier: item.id, type: "displayForm" },
                title: item?.attributes?.title || "",
                description: item?.attributes?.description || "",
                tags: item?.attributes?.tags,
                primary: item?.attributes?.primary,
                deprecated: false,
                uri: item.id,
                type: "displayForm", // item.type is "label", set here as displayForm
                production: true,
                unlisted: false,
                id: item.id,
            }));
        });
    }

    public getAttributeByDisplayForm(ref: ObjRef): Promise<IAttributeMetadataObject> {
        return this.authCall(async (client) => loadAttributeByDisplayForm(client, this.workspace, ref));
    }

    public getAttributes(refs: ObjRef[]): Promise<IAttributeMetadataObject[]> {
        return this.authCall(async (client) => {
            const allAttributes = await loadAttributes(client, this.workspace);

            return allAttributes.filter((attr) => refs.find((ref) => areObjRefsEqual(ref, attr.ref)));
        });
    }

    getCommonAttributes(): Promise<ObjRef[]> {
        throw new NotSupported("not supported");
    }

    getCommonAttributesBatch(): Promise<ObjRef[][]> {
        throw new NotSupported("not supported");
    }

    //
    getAttributeDatasetMeta(ref: ObjRef): Promise<IMetadataObject> {
        return this.authCall((client) => {
            return loadAttributeDataset(client, this.workspace, ref);
        });
    }

    getAttributesWithReferences(refs: ObjRef[]): Promise<IAttributeWithReferences[]> {
        return this.authCall(async (client) => {
            const filter = refs
                .filter(isIdentifierRef)
                .map((ref) => `labels.id==${ref.identifier}`)
                .join(",");

            const allAttributes = await client.entities.getAllEntitiesAttributes({
                include: ["labels", "datasets"],
                workspaceId: this.workspace,
                origin: "ALL",
                filter,
                size: refs.length,
            });

            const labelsMap = createLabelMap(allAttributes.data.included);
            const datasetMap = createDataSetMap(allAttributes.data.included);
            return allAttributes.data.data.map((attr): IAttributeWithReferences => {
                const dataset = attr.relationships?.dataset?.data?.id
                    ? datasetMap[attr.relationships?.dataset?.data?.id]
                    : undefined;
                return {
                    attribute: {
                        type: "attribute",
                        id: attr.id,
                        uri: attr.id,
                        ref: idRef(attr.id, "attribute"),
                        title: attr.attributes?.title ?? "",
                        description: attr.attributes?.description ?? "",
                        displayForms: convertAttributeLabels(attr, labelsMap),
                        unlisted: false,
                        deprecated: false,
                        production: true,
                    },
                    dataSet: dataset ? convertDatasetWithLinks(dataset) : undefined,
                };
            });
        });
    }

    public async getConnectedAttributesByDisplayForm(ref: ObjRef): Promise<ObjRef[]> {
        const attributeItem: AttributeItem = {
            localIdentifier: objRefToString(ref),
            label: toLabelQualifier(ref),
        };

        const afmValidObjectsQuery: AfmValidObjectsQuery = {
            types: ["attributes"],
            afm: {
                attributes: [attributeItem],
                measures: [],
                filters: [],
            },
        };

        const connectedItemsResponse = await this.authCall((client) =>
            client.validObjects.computeValidObjects({
                workspaceId: this.workspace,
                afmValidObjectsQuery,
            }),
        );

        return connectedItemsResponse.data.items
            .filter((item) => item.type === "attribute")
            .map(jsonApiIdToObjRef);
    }
}

async function loadAttributeDisplayForm(
    client: ITigerClient,
    workspaceId: string,
    ref: ObjRef,
): Promise<IAttributeDisplayFormMetadataObject> {
    invariant(isIdentifierRef(ref), "tiger backend only supports referencing by identifier");

    const attributeRes = await getAllEntitiesAttributesWithFilter(client, workspaceId, ref, [
        "labels",
        "defaultView",
    ]);

    if (!attributeRes.data.data.length) {
        throw new UnexpectedResponseError(
            `The displayForm with id ${ref.identifier} was not found`,
            404,
            attributeRes,
        );
    }

    const attributes = convertAttributesWithSideloadedLabels(attributeRes.data);
    const matchingLabel = findLabelInAttributes(attributes, ref);
    invariant(matchingLabel, "inconsistent server response, RSQL matched but ref matching did not");
    return matchingLabel;
}

function findLabelInAttributes(
    attributes: IAttributeMetadataObject[],
    ref: IdentifierRef,
): IAttributeDisplayFormMetadataObject | undefined {
    for (const attr of attributes) {
        for (const df of attr.displayForms) {
            if (areObjRefsEqual(df.ref, ref)) {
                return df;
            }
        }
    }
    return undefined;
}

function loadAttribute(
    client: ITigerClient,
    workspaceId: string,
    ref: ObjRef,
): Promise<IAttributeMetadataObject> {
    invariant(isIdentifierRef(ref), "tiger backend only supports referencing by identifier");

    return client.entities
        .getEntityAttributes(
            {
                workspaceId,
                objectId: ref.identifier,
                include: ["labels", "defaultView"],
            },
            {
                headers: jsonApiHeaders,
            },
        )
        .then((res) => convertAttributeWithSideloadedLabels(res.data));
}

function loadAttributeByDisplayForm(
    client: ITigerClient,
    workspaceId: string,
    ref: ObjRef,
): Promise<IAttributeMetadataObject> {
    invariant(isIdentifierRef(ref), "tiger backend only supports referencing by identifier");

    return getAllEntitiesAttributesWithFilter(client, workspaceId, ref, ["labels"]).then((res) => {
        const convertedAttributes = convertAttributesWithSideloadedLabels(res.data);
        const match = convertedAttributes.find((attr) =>
            attr.displayForms.some((df) => df.id === ref.identifier),
        );

        if (!match) {
            throw new UnexpectedResponseError(
                `The displayForm with id ${ref.identifier} was not found`,
                404,
                res,
            );
        }

        return match;
    });
}

function loadAttributes(client: ITigerClient, workspaceId: string): Promise<IAttributeMetadataObject[]> {
    return MetadataUtilities.getAllPagesOfParallel(client, client.entities.getAllEntitiesAttributes, {
        workspaceId,
        include: ["labels"],
    })
        .then(MetadataUtilities.mergeEntitiesResults)
        .then(convertAttributesWithSideloadedLabels);
}

function loadAttributeDataset(
    client: ITigerClient,
    workspace: string,
    ref: ObjRef,
): Promise<IDataSetMetadataObject> {
    invariant(isIdentifierRef(ref), "tiger backend only supports referencing by identifier");

    return client.entities
        .getEntityAttributes(
            {
                workspaceId: workspace,
                objectId: ref.identifier,
                include: ["datasets"],
            },
            {
                headers: jsonApiHeaders,
            },
        )
        .then((res) => {
            // if this happens then its either bad query parameterization or the backend is hosed badly
            invariant(
                res.data.included && res.data.included.length > 0,
                "server returned that attribute does not belong to any dataset",
            );
            const datasets = res.data.included.filter((include): include is JsonApiDatasetOutWithLinks => {
                return include.type === JsonApiDatasetOutWithLinksTypeEnum.DATASET;
            });

            return convertDatasetWithLinks(datasets[0]);
        });
}

function getAllEntitiesAttributesWithFilter(
    client: ITigerClient,
    workspaceId: string,
    ref: ObjRef,
    includes: EntitiesApiGetAllEntitiesAttributesRequest["include"],
) {
    invariant(isIdentifierRef(ref), "tiger backend only supports referencing by identifier");

    return client.entities.getAllEntitiesAttributes(
        {
            workspaceId,
            // to be able to get the defaultView value, we need to load the attribute itself and then find the appropriate label inside it
            // otherwise, we would have to load the label first and then load its attribute to see the defaultView relation thus needing
            // an extra network request
            // tiger RSQL does not support prefixed ids, so we strip the prefix to load matches with or without prefix
            // and then find the prefixed value in the results
            filter: `labels.id==${getIdOrigin(ref.identifier).id}`,
            include: includes,
        },
        {
            headers: jsonApiHeaders,
        },
    );
}
