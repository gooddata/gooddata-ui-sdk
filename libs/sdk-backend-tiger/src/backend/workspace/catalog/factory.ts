// (C) 2019-2020 GoodData Corporation
import {
    IWorkspaceCatalogFactory,
    IWorkspaceCatalogFactoryOptions,
    IWorkspaceCatalog,
} from "@gooddata/sdk-backend-spi";
import { CatalogItemType, ObjRef, CatalogItem } from "@gooddata/sdk-model";
import flatten = require("lodash/flatten");
import { TigerAuthenticatedCallGuard } from "../../../types";
import {
    convertAttribute,
    convertMeasure,
    convertFact,
    convertGroup,
} from "../../../toSdkModel/CatalogConverter";
import { TigerWorkspaceCatalog } from "./catalog";
import { objRefToIdentifier } from "../../../fromObjRef";
import { LabelResourceReference, LabelResourceSchema } from "@gooddata/gd-tiger-client";

export class TigerWorkspaceCatalogFactory implements IWorkspaceCatalogFactory {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
        public readonly options: IWorkspaceCatalogFactoryOptions = {
            types: ["attribute", "measure", "fact", "dateDataset"],
            excludeTags: [],
            includeTags: [],
        },
    ) {}

    public withOptions = (options: Partial<IWorkspaceCatalogFactoryOptions>): IWorkspaceCatalogFactory => {
        const newOptions = {
            ...this.options,
            ...options,
        };
        return new TigerWorkspaceCatalogFactory(this.authCall, this.workspace, newOptions);
    };

    public forDataset = (dataset: ObjRef): IWorkspaceCatalogFactory => {
        return this.withOptions({
            dataset,
        });
    };

    public forTypes = (types: CatalogItemType[]): IWorkspaceCatalogFactory => {
        return this.withOptions({
            types,
        });
    };

    public includeTags = (tags: ObjRef[]): IWorkspaceCatalogFactory => {
        return this.withOptions({
            includeTags: tags,
        });
    };

    public excludeTags = (tags: ObjRef[]): IWorkspaceCatalogFactory => {
        return this.withOptions({
            excludeTags: tags,
        });
    };

    public load = async (): Promise<IWorkspaceCatalog> => {
        const { types } = this.options;
        const loaderByType: { [type in CatalogItemType]: () => Promise<CatalogItem[]> } = {
            attribute: this.loadAttributes,
            measure: this.loadMeasures,
            fact: this.loadFacts,
            dateDataset: this.loadDateDatasets,
        };

        const loadersPromises = types.map(type => loaderByType[type]());
        const loadersResults = await Promise.all(loadersPromises);
        const catalogItems = flatten(loadersResults);

        const groups = await this.loadGroups();

        return new TigerWorkspaceCatalog(this.authCall, this.workspace, groups, catalogItems, this.options);
    };

    private loadAttributes = async () => {
        const { includeTags = [] } = this.options;
        const tagsIdentifiers = await this.objRefsToIdentifiers(includeTags);

        const attributes = await this.authCall(sdk =>
            sdk.metadata.attributesGet(
                {
                    contentType: "application/json",
                    include: "tags,labels",
                },
                {
                    "filter[tags.id]": tagsIdentifiers,
                },
            ),
        );

        const getIncludedItem = (id: string, type: string) =>
            attributes.data.included?.find(item => item.type === type && item.id === id);

        return attributes.data.data.map(attribute => {
            const labelsRefs = (attribute.relationships as any).labels.data as LabelResourceReference[];
            const allLabels: LabelResourceSchema[] = labelsRefs
                .map(ref => {
                    const obj = getIncludedItem(ref.id, ref.type);

                    if (!obj) {
                        return;
                    }

                    return obj as LabelResourceSchema;
                })
                .filter((obj): obj is LabelResourceSchema => obj !== undefined);

            const defaultLabel = allLabels[0];

            /*
             * TODO: this is temporary way to identify labels with geo pushpin; normally this should be done
             *  using some indicator on the metadata object. for sakes of speed & after agreement with tiger team
             *  falling back to use of id convention.
             */
            const geoLabels = allLabels.filter(label => label.id.search(/^.*\.geo__/) > -1);

            return convertAttribute(attribute, defaultLabel, geoLabels);
        });
    };

    private loadMeasures = async () => {
        const measures = await this.authCall(sdk =>
            sdk.metadata.metricsGet({
                contentType: "application/json",
            }),
        );

        return measures.data.data.map(convertMeasure);
    };

    private loadFacts = async () => {
        const { includeTags = [] } = this.options;
        const tagsIdentifiers = await this.objRefsToIdentifiers(includeTags);

        const facts = await this.authCall(sdk =>
            sdk.metadata.factsGet(
                {
                    contentType: "application/json",
                    include: "tags",
                },
                {
                    "filter[tags.id]": tagsIdentifiers,
                },
            ),
        );

        return facts.data.data.map(convertFact);
    };

    private loadDateDatasets = async () => {
        const dataSets = await this.authCall(async () => []);

        return dataSets;
    };

    private loadGroups = async () => {
        const groups = await this.authCall(sdk =>
            sdk.metadata.tagsGet({
                contentType: "application/json",
            }),
        );

        return groups.data.data.map(convertGroup);
    };

    private objRefsToIdentifiers = async (objRefs: ObjRef[]) => {
        return Promise.all(objRefs.map(ref => objRefToIdentifier(ref, this.authCall)));
    };
}
