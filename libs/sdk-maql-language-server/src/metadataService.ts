// (C) 2021-2026 GoodData Corporation

import {
    DefaultWorkspaceCatalogTypes,
    type IAnalyticalBackend,
    type IElementsQueryOptions,
    type IPagedResource,
    type IWorkspaceCatalog,
} from "@gooddata/sdk-backend-spi";
import {
    type IAttributeElement,
    type IAttributeOrMeasure,
    type IParameterMetadataObject,
} from "@gooddata/sdk-model";

import {
    type ILabelElementsFuncResult,
    type ILdmDataset,
    type ITigerMetadataObjectStub,
    type LabelElementsFunc,
    LdmObjects,
} from "./metadata/model.js";
import { type IMetadataInterface } from "./metadata/types.js";

export interface IMetadataServiceOptions {
    /**
     * Resolved value of the enableComputedAttributes workspace setting. The computed-attributes
     * catalog listing is gated by it on the backend, so when the host knows the setting is off the
     * service does not request the type at all. Leave undefined when the setting is unknown: the
     * service then requests computed attributes and degrades to the default type set on refusal.
     */
    enableComputedAttributes?: boolean;
}

export class MetadataService implements IMetadataInterface {
    private catalog?: IWorkspaceCatalog; // holds the entire unprocessed catalog
    private ldmObjects: Promise<LdmObjects>; // LDM objects holds latest parsed objects to be used further
    private datasets: ILdmDataset[] = [];
    private parameters: IParameterMetadataObject[] = [];

    /**
     * The only construction path: the service runs on the backend injected by the host — the same
     * instance (auth provider, caches and all) every other consumer of the host uses.
     */
    public static withBackend(
        workspaceId: string,
        backend: IAnalyticalBackend,
        options: IMetadataServiceOptions = {},
    ) {
        return new MetadataService(workspaceId, backend, options);
    }

    private constructor(
        readonly workspaceId: string,
        readonly backend: IAnalyticalBackend,
        private readonly options: IMetadataServiceOptions,
    ) {
        this.catalog = undefined;
        this.ldmObjects = this.getWholeCatalog();
        this.sliceModel = this.sliceModel.bind(this);
        this.getLdmObjects = this.getLdmObjects.bind(this);
    }

    /**
     * Gets all objects (facts, metrics, attributes and labels) from the
     * declarative model retrieved from Metadata API.
     */
    public async getLdmObjects(items?: IAttributeOrMeasure[]): Promise<LdmObjects> {
        return items && items.length > 0 ? this.sliceModel(items) : this.ldmObjects;
    }

    /**
     * Makes a new request to Metadata API for an updated declarative model.
     * Refreshes stored objects from the received model.
     */
    public updateModel(): void {
        this.ldmObjects = this.getWholeCatalog();
    }

    /**
     * Makes a request to Catalog API to slice datasets for
     * available items; doesn't update model with fresh data!
     * Only updates ldmObjects.
     */
    public sliceModel(items: IAttributeOrMeasure[]): Promise<LdmObjects> {
        if (!this.catalog || items.length === 0) {
            return this.ldmObjects;
        }
        return this.catalog
            .availableItems()
            .forItems(items)
            .load()
            .then((catalog) => {
                return new LdmObjects(
                    catalog.availableAttributes(),
                    catalog.availableFacts(),
                    catalog.availableMeasures(),
                    this.parameters,
                    catalog.availableDateDatasets(),
                    this.datasets,
                    catalog.availableComputedAttributes().map((item) => item.computedAttribute),
                );
                // TODO: Handling errors (when nothing is found, etc.)
            })
            .catch(() => this.ldmObjects);
    }

    private async getWholeCatalog(): Promise<LdmObjects> {
        // Origin ALL includes the datasets inherited from parent workspaces. Completion lists the
        // NORMAL and AUXILIARY datasets; date datasets come from the catalog. A backend without the
        // service throws synchronously, and a failed listing removes only the dataset completion.
        const listDatasets = (dataSetType: "NORMAL" | "AUXILIARY") =>
            this.backend
                .workspace(this.workspaceId)
                .datasets()
                .getDatasetsQuery()
                .withOrigin("ALL")
                .withFilter({ dataSetType })
                .withSize(1000)
                .query()
                .then((result) => result.all());
        const datasetsPromise = Promise.resolve()
            .then(() => Promise.all([listDatasets("NORMAL"), listDatasets("AUXILIARY")]))
            .then((lists): ILdmDataset[] => lists.flat())
            .catch((): ILdmDataset[] => []);

        const parametersPromise = this.backend
            .workspace(this.workspaceId)
            .parameters()
            .getParametersQuery()
            .withSize(2000)
            .query()
            .then((result) => result.all())
            .catch(() => []);

        // Computed attributes are opt-in on the catalog, so the default type set must be requested
        // alongside them; the requested types also drive what availableItems() (used by
        // sliceModel) asks the backend to validate. The listing is gated by the
        // enableComputedAttributes setting: when the host resolved it as off, skip the request
        // entirely (the backend would refuse it with a 400 logged to the console). Otherwise a
        // backend can still reject it (setting race, older backend), and a single rejected loader
        // fails the whole catalog load - fall back to the default type set rather than losing
        // completion and validation entirely.
        const catalogFactory = this.backend.workspace(this.workspaceId).catalog();
        const catalogPromise =
            this.options.enableComputedAttributes === false
                ? catalogFactory.load()
                : catalogFactory
                      .forTypes([...DefaultWorkspaceCatalogTypes, "computedAttribute"])
                      .load()
                      .catch(() => catalogFactory.load());

        const [datasets, catalog, parameters] = await Promise.all([
            datasetsPromise,
            catalogPromise,
            parametersPromise,
        ]);

        this.datasets = datasets;
        this.catalog = catalog;
        this.parameters = parameters;

        return new LdmObjects(
            catalog.attributes(),
            catalog.facts(),
            catalog.measures(),
            parameters,
            catalog.dateDatasets(),
            this.datasets,
            catalog.computedAttributes().map((item) => item.computedAttribute),
        );
    }

    /**
     * Returns a function to later retrieve label elements
     */
    public getLabelElementsFunction(): Promise<LabelElementsFunc> {
        const queryFactory = this.backend.workspace(this.workspaceId).attributes().elements();
        return Promise.resolve(
            async <T extends ITigerMetadataObjectStub>(
                labels: T[],
                excluded: string[],
                options: IElementsQueryOptions,
                limit?: number,
                offset?: number,
            ): Promise<ILabelElementsFuncResult<T>> => {
                const settled = await Promise.allSettled(
                    labels.map((label) => {
                        let query = queryFactory.forDisplayForm(label.ref).withOptions(options);
                        if (limit) query = query.withLimit(limit);
                        if (offset) query = query.withOffset(offset);
                        return query.query();
                    }),
                );
                const rejected: T[] = [];
                const rejectionReasons = new Map<T, unknown>();
                const results = settled
                    .map((result, idx) => {
                        if (result.status === "fulfilled") {
                            return result.value;
                        } else if (result.status === "rejected") {
                            rejected.push(labels[idx]);
                            rejectionReasons.set(labels[idx], result.reason);
                        }
                        return null;
                    })
                    .filter((elements): elements is IPagedResource<IAttributeElement> => !!elements);
                const elements = results
                    .map((result) => result.items)
                    .flat()
                    .filter((element) => element.title === null || !excluded.includes(element.title)); // Filter out already typed strings
                const isIncomplete: boolean = results
                    .map((result) => result.offset + result.limit < result.totalCount)
                    .reduce((prev, curr) => prev || curr, false);
                return {
                    list: {
                        elements: elements,
                        isIncomplete: isIncomplete,
                    },
                    rejected: rejected,
                    rejectionReasons: rejectionReasons,
                };
            },
        );
    }
}
