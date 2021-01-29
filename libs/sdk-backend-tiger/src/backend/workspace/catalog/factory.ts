// (C) 2019-2021 GoodData Corporation
import {
    IWorkspaceCatalog,
    IWorkspaceCatalogFactory,
    IWorkspaceCatalogFactoryOptions,
    CatalogItem,
    CatalogItemType,
    ICatalogFact,
    ICatalogGroup,
    ICatalogMeasure,
    IGroupableCatalogItemBase,
} from "@gooddata/sdk-backend-spi";
import { IdentifierRef, ObjRef } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { convertFact, convertMeasure } from "../../../convertors/fromBackend/CatalogConverter";
import { TigerWorkspaceCatalog } from "./catalog";
import { loadAttributesAndDateDatasets } from "./datasetLoader";
import flatten from "lodash/flatten";
import flatMap from "lodash/flatMap";
import uniqBy from "lodash/uniqBy";

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
        const loadersResults = await Promise.all([
            this.loadMeasures(),
            this.loadFacts(),
            this.loadAttributesAndDates(),
        ]);

        const catalogItems: CatalogItem[] = flatten<CatalogItem>(loadersResults);

        const groups = this.extractGroups(catalogItems);

        return new TigerWorkspaceCatalog(this.authCall, this.workspace, groups, catalogItems, this.options);
    };

    private loadAttributesAndDates = async (): Promise<CatalogItem[]> => {
        // TODO convert objRef[] to tags (string[])
        //const { includeTags = [] } = this.options;
        const includeTags: string[] = [];
        return this.authCall((sdk) => loadAttributesAndDateDatasets(sdk, this.workspace, includeTags));
    };

    private loadMeasures = async (): Promise<ICatalogMeasure[]> => {
        const measures = await this.authCall((sdk) =>
            sdk.workspaceModel.getEntitiesMetrics(
                {
                    workspaceId: this.workspace,
                },
                {
                    headers: { Accept: "application/vnd.gooddata.api+json" },
                },
            ),
        );

        return measures.data.data.map(convertMeasure);
    };

    private loadFacts = async (): Promise<ICatalogFact[]> => {
        const { includeTags = [] } = this.options;
        const facts = await this.authCall((sdk) =>
            sdk.workspaceModel.getEntitiesFacts(
                {
                    workspaceId: this.workspace,
                },
                {
                    query: { tags: includeTags.join(",") },
                    headers: { Accept: "application/vnd.gooddata.api+json" },
                },
            ),
        );
        return facts.data.data.map(convertFact);
    };

    // Groups are collected from all catalog entities.
    // There is no separate endpoint for the tags anymore.
    private extractGroups(catalogItems: CatalogItem[]): ICatalogGroup[] {
        const groupableItems = catalogItems.filter((item) => item.type !== "dateDataset");
        const allTags = flatMap(groupableItems, (item): ICatalogGroup[] => {
            return (item as IGroupableCatalogItemBase).groups.map((tag) => ({
                title: (tag as IdentifierRef).identifier,
                tag: tag,
            }));
        });
        return uniqBy(allTags, (tag) => tag.title);
    }
}
