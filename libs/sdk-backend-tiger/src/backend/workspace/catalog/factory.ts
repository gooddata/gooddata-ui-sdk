// (C) 2019-2020 GoodData Corporation
import {
    IWorkspaceCatalog,
    IWorkspaceCatalogFactory,
    IWorkspaceCatalogFactoryOptions,
} from "@gooddata/sdk-backend-spi";
import { CatalogItem, CatalogItemType, ICatalogFact, ICatalogMeasure, ObjRef } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { convertFact, convertGroup, convertMeasure } from "../../../convertors/fromBackend/CatalogConverter";
import { TigerWorkspaceCatalog } from "./catalog";
import { objRefToIdentifier } from "../../../utils/api";
import { loadAttributesAndDateDatasets } from "./datasetLoader";
import flatten from "lodash/flatten";

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

        const groups = await this.loadGroups();

        return new TigerWorkspaceCatalog(this.authCall, this.workspace, groups, catalogItems, this.options);
    };

    private loadAttributesAndDates = async (): Promise<CatalogItem[]> => {
        const { includeTags = [] } = this.options;
        const tagsIdentifiers = await this.objRefsToIdentifiers(includeTags);

        return this.authCall((sdk) => loadAttributesAndDateDatasets(sdk, tagsIdentifiers));
    };

    private loadMeasures = async (): Promise<ICatalogMeasure[]> => {
        const measures = await this.authCall((sdk) =>
            sdk.metadata.metricsGet({
                contentType: "application/json",
            }),
        );

        return measures.data.data.map(convertMeasure);
    };

    private loadFacts = async (): Promise<ICatalogFact[]> => {
        const { includeTags = [] } = this.options;
        const tagsIdentifiers = await this.objRefsToIdentifiers(includeTags);

        const facts = await this.authCall((sdk) =>
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

    private loadGroups = async () => {
        const groups = await this.authCall((sdk) =>
            sdk.metadata.tagsGet({
                contentType: "application/json",
            }),
        );

        return groups.data.data.map(convertGroup);
    };

    private objRefsToIdentifiers = async (objRefs: ObjRef[]) => {
        return Promise.all(objRefs.map((ref) => objRefToIdentifier(ref, this.authCall)));
    };
}
