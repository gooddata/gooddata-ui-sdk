// (C) 2019-2025 GoodData Corporation
import flatMap from "lodash/flatMap.js";
import sortBy from "lodash/sortBy.js";
import uniqBy from "lodash/uniqBy.js";

import { MetadataUtilities, ValidateRelationsHeader } from "@gooddata/api-client-tiger";
import {
    IWorkspaceCatalog,
    IWorkspaceCatalogFactory,
    IWorkspaceCatalogFactoryOptions,
} from "@gooddata/sdk-backend-spi";
import {
    CatalogItem,
    CatalogItemType,
    ICatalogFact,
    ICatalogGroup,
    ICatalogMeasure,
    IGroupableCatalogItemBase,
    IdentifierRef,
    ObjRef,
    isCatalogAttribute,
    isCatalogFact,
    isCatalogMeasure,
} from "@gooddata/sdk-model";

import { TigerWorkspaceCatalog } from "./catalog.js";
import { loadAttributesAndDateDatasetsAndHierarchies } from "./datasetLoader.js";
import { addRsqlFilterToParams, rsqlAnd, searchToRsqlFilter, tagsToRsqlFilter } from "./rsqlFilter.js";
import { convertFact, convertMeasure } from "../../../convertors/fromBackend/CatalogConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class TigerWorkspaceCatalogFactory implements IWorkspaceCatalogFactory {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
        public readonly options: IWorkspaceCatalogFactoryOptions = {
            types: ["attribute", "measure", "fact", "dateDataset", "attributeHierarchy"],
            excludeTags: [],
            includeTags: [],
            loadGroups: true,
        },
        private readonly signal?: AbortSignal,
    ) {}

    public withSignal(signal: AbortSignal): IWorkspaceCatalogFactory {
        return new TigerWorkspaceCatalogFactory(this.authCall, this.workspace, this.options, signal);
    }

    public withOptions = (options: Partial<IWorkspaceCatalogFactoryOptions>): IWorkspaceCatalogFactory => {
        const newOptions = {
            ...this.options,
            ...options,
        };
        return new TigerWorkspaceCatalogFactory(this.authCall, this.workspace, newOptions, this.signal);
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

    public withGroups(loadGroups: boolean): IWorkspaceCatalogFactory {
        return this.withOptions({
            loadGroups,
        });
    }

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
        const includeAttributeHierarchies = this.options.types.includes("attributeHierarchy");
        if (includeAttributes || includeDateDatasets) {
            promises.push(
                this.loadAttributesAndDatesAndHierarchies(
                    includeAttributes,
                    includeDateDatasets,
                    includeAttributeHierarchies,
                ),
            );
        }

        const loadersResults = await Promise.all(promises);

        const catalogItems: CatalogItem[] = sortBy(loadersResults.flat(), (item) =>
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

    private loadAttributesAndDatesAndHierarchies = async (
        loadAttributes: boolean,
        loadDateDataSets: boolean,
        loadAttributeHierarchies: boolean,
    ): Promise<CatalogItem[]> => {
        const rsqlTagFilter = tagsToRsqlFilter(this.options);
        const rsqlSearchFilter = searchToRsqlFilter(this.options);

        return this.authCall((client) =>
            loadAttributesAndDateDatasetsAndHierarchies(
                client,
                this.workspace,
                rsqlAnd(rsqlTagFilter, rsqlSearchFilter),
                loadAttributes,
                loadDateDataSets,
                loadAttributeHierarchies,
                this.signal,
            ),
        );
    };

    private loadMeasures = async (): Promise<ICatalogMeasure[]> => {
        const rsqlTagFilter = tagsToRsqlFilter(this.options);
        const rsqlSearchFilter = searchToRsqlFilter(this.options);
        const params = addRsqlFilterToParams(
            { workspaceId: this.workspace },
            rsqlAnd(rsqlTagFilter, rsqlSearchFilter),
        );

        const measures = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(client, client.entities.getAllEntitiesMetrics, params, {
                headers: ValidateRelationsHeader,
                signal: this.signal,
            })
                .then(MetadataUtilities.mergeEntitiesResults)
                .then(MetadataUtilities.filterValidEntities);
        });

        return measures.data.map((measure) => convertMeasure(measure, measures.included));
    };

    private loadFacts = async (): Promise<ICatalogFact[]> => {
        const rsqlTagFilter = tagsToRsqlFilter(this.options);
        const rsqlSearchFilter = searchToRsqlFilter(this.options);
        const params = addRsqlFilterToParams(
            { workspaceId: this.workspace },
            rsqlAnd(rsqlTagFilter, rsqlSearchFilter),
        );

        const facts = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(client, client.entities.getAllEntitiesFacts, params, {
                signal: this.signal,
            }).then(MetadataUtilities.mergeEntitiesResults);
        });

        return facts.data.map(convertFact);
    };

    // Groups are collected from all catalog entities.
    // There is no separate endpoint for the tags anymore.
    private extractGroups(catalogItems: CatalogItem[]): ICatalogGroup[] {
        const groupableItems = catalogItems.filter(
            (item) => item.type !== "dateDataset" && item.type !== "attributeHierarchy",
        );
        const allTags = flatMap(groupableItems, (item): ICatalogGroup[] => {
            return (item as IGroupableCatalogItemBase).groups.map((tag) => ({
                title: (tag as IdentifierRef).identifier,
                tag: tag,
            }));
        });
        return uniqBy(allTags, (tag) => tag.title);
    }
}
