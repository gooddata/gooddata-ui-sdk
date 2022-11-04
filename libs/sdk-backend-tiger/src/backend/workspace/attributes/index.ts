// (C) 2019-2022 GoodData Corporation
import {
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
} from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { TigerWorkspaceElements } from "./elements";
import {
    ITigerClient,
    jsonApiHeaders,
    MetadataUtilities,
    JsonApiDatasetOutWithLinks,
    JsonApiDatasetOutWithLinksTypeEnum,
} from "@gooddata/api-client-tiger";
import flatMap from "lodash/flatMap";
import last from "lodash/last";
import { invariant } from "ts-invariant";

import {
    convertAttributesWithSideloadedLabels,
    convertAttributeWithSideloadedLabels,
    convertDatasetWithLinks,
} from "../../../convertors/fromBackend/MetadataConverter";

export class TigerWorkspaceAttributes implements IWorkspaceAttributesService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public elements(): IElementsQueryFactory {
        return new TigerWorkspaceElements(this.authCall, this.workspace);
    }

    public getAttributeDisplayForm = async (ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> => {
        return this.authCall(async (client) => loadAttributeDisplayForm(client, this.workspace, ref));
    };

    public getAttribute = async (ref: ObjRef): Promise<IAttributeMetadataObject> => {
        return this.authCall(async (client) => loadAttribute(client, this.workspace, ref));
    };

    public getAttributeDisplayForms(refs: ObjRef[]): Promise<IAttributeDisplayFormMetadataObject[]> {
        return this.authCall(async (client) => {
            const allAttributes = await loadAttributes(client, this.workspace);

            return flatMap(allAttributes, (attr) => attr.displayForms).filter((df) =>
                refs.find((ref) => areObjRefsEqual(ref, df.ref)),
            );
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

    getAttributeDatasetMeta(ref: ObjRef): Promise<IMetadataObject> {
        return this.authCall((client) => {
            return loadAttributeDataset(client, this.workspace, ref);
        });
    }
}

async function loadAttributeDisplayForm(
    client: ITigerClient,
    workspaceId: string,
    ref: ObjRef,
): Promise<IAttributeDisplayFormMetadataObject> {
    invariant(isIdentifierRef(ref), "tiger backend only supports referencing by identifier");

    // to be able to get the defaultView value, we need to load the attribute itself and then find the appropriate label inside of it
    // otherwise, we would have to load the label first and then load its attribute to see the defaultView relation thus needing
    // an extra network request
    // tiger RSQL does not support prefixed ids, so we strip the prefix to load matches with or without prefix
    // and then find the prefixed value in the results
    const idWithoutPrefix = last(ref.identifier.split(":"));
    const attributeRes = await client.entities.getAllEntitiesAttributes(
        {
            workspaceId,
            include: ["labels", "defaultView"],
            filter: `labels.id==${idWithoutPrefix}`, // use RSQL to load the appropriate attribute
        },
        {
            headers: jsonApiHeaders,
        },
    );

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

    // tiger RSQL does not support prefixed ids, so we strip the prefix to load matches with or without prefix
    // and then find the prefixed value in the results
    const idWithoutPrefix = last(ref.identifier.split(":"));

    return client.entities
        .getAllEntitiesAttributes(
            {
                workspaceId,
                filter: `labels.id==${idWithoutPrefix}`,
                include: ["labels"],
            },
            {
                headers: jsonApiHeaders,
            },
        )
        .then((res) => {
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
    return MetadataUtilities.getAllPagesOf(client, client.entities.getAllEntitiesAttributes, {
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
