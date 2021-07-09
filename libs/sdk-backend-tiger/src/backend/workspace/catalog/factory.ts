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
    isCatalogAttribute,
    isCatalogFact,
    isCatalogMeasure,
} from "@gooddata/sdk-backend-spi";
import { IdentifierRef, isUriRef, ObjRef } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { convertFact, convertMeasure } from "../../../convertors/fromBackend/CatalogConverter";
import { TigerWorkspaceCatalog } from "./catalog";
import { loadAttributesAndDateDatasets } from "./datasetLoader";
import flatten from "lodash/flatten";
import flatMap from "lodash/flatMap";
import uniqBy from "lodash/uniqBy";
import sortBy from "lodash/sortBy";
import { MetadataUtilities, ValidateRelationsHeader } from "@gooddata/api-client-tiger";
import invariant from "ts-invariant";

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
        const promises: Promise<CatalogItem[]>[] = [];

        if (this.options.types.includes("measure")) {
            promises.push(this.loadMeasures());
        }
        if (this.options.types.includes("fact")) {
            promises.push(this.loadFacts());
        }

        const includeAttributes = this.options.types.includes("attribute");
        const includeDateDatasets = this.options.types.includes("dateDataset");
        if (includeAttributes || includeDateDatasets) {
            promises.push(this.loadAttributesAndDates(includeAttributes, includeDateDatasets));
        }

        const loadersResults = await Promise.all(promises);

        const catalogItems: CatalogItem[] = sortBy(flatten<CatalogItem>(loadersResults), (item) =>
            this.getCatalogItemSortingKey(item)?.toUpperCase(),
        );

        const groups = this.extractGroups(catalogItems);

        return new TigerWorkspaceCatalog(this.authCall, this.workspace, groups, catalogItems, this.options);
    };

    private getCatalogItemSortingKey = (item: CatalogItem) => {
        if (isCatalogAttribute(item)) {
            return item.attribute.title;
        }
        if (isCatalogFact(item)) {
            return item.fact.title;
        }
        if (isCatalogMeasure(item)) {
            return item.measure.title;
        }
        return undefined;
    };

    private tagsToIdentifiers = (tags: ObjRef[]): string[] => {
        return tags.map((ref) => {
            // Tags cannot be accessed by any separate endpoint, so it doesn't make sense to reference them by uri.
            // We will likely change the tag type signature from ObjRef to plain string in the future.
            invariant(!isUriRef(ref), "Tags cannot be referenced by uri!");
            return ref.identifier;
        });
    };

    private loadAttributesAndDates = async (
        loadAttributes: boolean,
        loadDateDataSets: boolean,
    ): Promise<CatalogItem[]> => {
        const tags = this.tagsToIdentifiers(this.options.includeTags);
        return this.authCall((client) =>
            loadAttributesAndDateDatasets(client, this.workspace, tags, loadAttributes, loadDateDataSets),
        );
    };

    private loadMeasures = async (): Promise<ICatalogMeasure[]> => {
        const tags = this.tagsToIdentifiers(this.options.includeTags);
        const measures = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(
                client,
                client.workspaceObjects.getAllEntitiesMetrics,
                {
                    workspaceId: this.workspace,
                },
                { query: { tags: tags.join(",") }, headers: ValidateRelationsHeader },
            )
                .then(MetadataUtilities.mergeEntitiesResults)
                .then(MetadataUtilities.filterValidEntities);
        });

        return measures.data.map(convertMeasure);
    };

    private loadFacts = async (): Promise<ICatalogFact[]> => {
        const tags = this.tagsToIdentifiers(this.options.includeTags);
        const facts = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(
                client,
                client.workspaceObjects.getAllEntitiesFacts,
                { workspaceId: this.workspace },
                { query: { tags: tags.join(",") } },
            ).then(MetadataUtilities.mergeEntitiesResults);
        });

        return facts.data.map(convertFact);
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
