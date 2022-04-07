// (C) 2019-2022 GoodData Corporation
import { IWorkspaceCatalogFactory, IWorkspaceCatalogFactoryOptions } from "@gooddata/sdk-backend-spi";
import partition from "lodash/partition";
import uniq from "lodash/uniq";
import flatMap from "lodash/flatMap";
import keyBy from "lodash/keyBy";
import {
    Identifier,
    ObjRef,
    CatalogItemType,
    CatalogItem,
    ICatalogGroup,
    ICatalogMeasure,
    isCatalogFact,
    isCatalogMeasure,
} from "@gooddata/sdk-model";
import { GdcCatalog, GdcDateDataSets, GdcMetadata } from "@gooddata/api-model-bear";
import {
    convertAttribute,
    convertDateDataset,
    convertFact,
    convertGroup,
    convertItemType,
    convertMeasure,
    convertMetric,
    isCompatibleCatalogItemType,
} from "../../../convertors/fromBackend/CatalogConverter";
import { BearAuthenticatedCallGuard } from "../../../types/auth";
import { IAttributeByKey, IDisplayFormByKey, IFactByKey, IMeasureByKey } from "../../../types/catalog";
import { BearWorkspaceCatalog } from "./catalog";
import { objRefsToIdentifiers, objRefToIdentifier } from "../../../utils/api";
import { IGetObjectsByQueryOptions } from "@gooddata/api-client-bear";
import { isApiResponseError } from "../../../utils/errorHandling";
import IDateDataSet = GdcDateDataSets.IDateDataSet;
import IDateDataSetAttribute = GdcDateDataSets.IDateDataSetAttribute;

type BearDisplayFormOrAttribute = GdcMetadata.IWrappedAttributeDisplayForm | GdcMetadata.IWrappedAttribute;

const bearCatalogItemToCatalogItem =
    (displayForms: IDisplayFormByKey, attributes: IAttributeByKey) =>
    (item: GdcCatalog.CatalogItem): CatalogItem => {
        if (GdcCatalog.isCatalogAttribute(item)) {
            return convertAttribute(item, displayForms, attributes);
        } else if (GdcCatalog.isCatalogMetric(item)) {
            return convertMeasure(item);
        }
        return convertFact(item);
    };

const createLookups = (
    displayFormsAndAttributes: BearDisplayFormOrAttribute[],
): {
    attributeById: IAttributeByKey;
    displayFormById: IDisplayFormByKey;
    displayFormByUri: IDisplayFormByKey;
    attributeByDisplayFormUri: IAttributeByKey;
} => {
    const [attributes, displayForms] = partition(displayFormsAndAttributes, GdcMetadata.isWrappedAttribute);
    const unwrappedDisplayForms = displayForms.map((df) => df.attributeDisplayForm);

    const attributeByUri: IAttributeByKey = keyBy(attributes, (item) => item.attribute.meta.uri!);
    const attributeById: IAttributeByKey = keyBy(attributes, (item) => item.attribute.meta.identifier!);
    const displayFormByUri: IDisplayFormByKey = keyBy(unwrappedDisplayForms, (item) => item.meta.uri!);
    const displayFormById: IDisplayFormByKey = keyBy(unwrappedDisplayForms, (item) => item.meta.identifier!);

    const attributeByDisplayFormUri = Object.keys(displayFormByUri).reduce(
        (acc: IAttributeByKey, displayFormUri) => {
            const displayForm = displayFormByUri[displayFormUri];
            const attributeUri = displayForm.content.formOf;
            const attribute = attributeByUri[attributeUri];
            return {
                ...acc,
                [displayFormUri]: attribute,
            };
        },
        {},
    );

    return {
        attributeById,
        attributeByDisplayFormUri,
        displayFormById,
        displayFormByUri,
    };
};

const getProductionFlag = ({
    production,
    dataset,
}: IWorkspaceCatalogFactoryOptions): GdcCatalog.ILoadCatalogItemsParams["production"] => {
    // if production is undefined, leave it as is - it has meaning
    if (production === undefined) {
        return production;
    }
    // if a dataset is specified, production must be false
    const sanitizedProduction = !dataset && production;
    return sanitizedProduction ? 1 : 0;
};

type TagsAndDataSetIds = {
    includeTagsIds: Identifier[];
    excludeTagsIds: Identifier[];
    dataSetId: Identifier;
};

const groupableCatalogItemTypes: CatalogItemType[] = ["attribute", "measure", "fact"];
const isGroupableCatalogItemType = (type: CatalogItemType) => groupableCatalogItemTypes.includes(type);

export class BearWorkspaceCatalogFactory implements IWorkspaceCatalogFactory {
    private tagsAndDatasetIdsPromise: Promise<TagsAndDataSetIds> | null = null;

    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        public readonly workspace: string,
        public readonly options: IWorkspaceCatalogFactoryOptions = {
            types: ["attribute", "measure", "fact", "dateDataset"],
            excludeTags: [],
            includeTags: [],
        },
    ) {}

    public withOptions(options: Partial<IWorkspaceCatalogFactoryOptions>): IWorkspaceCatalogFactory {
        const newOptions = {
            ...this.options,
            ...options,
        };
        return new BearWorkspaceCatalogFactory(this.authCall, this.workspace, newOptions);
    }

    public forDataset(dataset: ObjRef): IWorkspaceCatalogFactory {
        return this.withOptions({
            dataset,
        });
    }

    public forTypes(types: CatalogItemType[]): IWorkspaceCatalogFactory {
        return this.withOptions({
            types,
        });
    }

    public includeTags(tags: ObjRef[]): IWorkspaceCatalogFactory {
        return this.withOptions({
            includeTags: tags,
        });
    }

    public excludeTags(tags: ObjRef[]): IWorkspaceCatalogFactory {
        return this.withOptions({
            excludeTags: tags,
        });
    }

    public async load(): Promise<BearWorkspaceCatalog> {
        const [{ allCatalogItems, mappings }, catalogGroups] = await Promise.all([
            this.loadAllCatalogItemsAndMappings(),
            this.loadCatalogGroups(),
        ]);

        return new BearWorkspaceCatalog(
            this.authCall,
            this.workspace,
            catalogGroups,
            allCatalogItems,
            this.options,
            mappings,
        );
    }

    private loadAllCatalogItemsAndMappings = async () => {
        const [bearCatalogItems, bearUnlistedMetrics, bearDateDatasets] = await Promise.all([
            this.loadBearCatalogItems(),
            this.loadBearUnlistedMetrics(),
            this.loadDateDatasets(),
        ]);

        const bearDisplayFormsAndAttributes = await this.loadBearDisplayFormsAndAttributes(
            bearCatalogItems,
            flatMap(bearDateDatasets, (dd) => dd.availableDateAttributes ?? []),
        );

        const { attributeByDisplayFormUri, displayFormById, displayFormByUri, attributeById } = createLookups(
            bearDisplayFormsAndAttributes,
        );

        const catalogItems = bearCatalogItems.map(
            bearCatalogItemToCatalogItem(displayFormByUri, attributeById),
        );

        // the catalog API does not return the unlisted flag value so we need to ask another API for it
        // and update the catalog response appropriately
        const catalogWithUnlisted = this.withUpdatedUnlistedFlag(catalogItems, bearUnlistedMetrics);
        const dateDatasets = bearDateDatasets.map((dd) => convertDateDataset(dd, attributeById));

        const allCatalogItems = catalogWithUnlisted.concat(dateDatasets);

        const measureById: IMeasureByKey = keyBy(
            catalogWithUnlisted.filter(isCatalogMeasure).map((el) => el.measure),
            (el) => el.id,
        );
        const factById: IFactByKey = keyBy(
            catalogItems.filter(isCatalogFact).map((el) => el.fact),
            (el) => el.id,
        );

        const dateAttributeById = keyBy(
            flatMap(dateDatasets, (dd) => dd.dateAttributes),
            (attr) => attr.attribute.id,
        );

        return {
            allCatalogItems,
            mappings: {
                attributeById,
                attributeByDisplayFormUri,
                displayFormById,
                measureById,
                factById,
                dateAttributeById,
            },
        };
    };

    private loadDateDatasets = async (): Promise<IDateDataSet[]> => {
        const { types, production, includeDateGranularities } = this.options;

        const includeDateDatasets = types.includes("dateDataset");
        if (!includeDateDatasets) {
            return [];
        }

        const { includeTagsIds, excludeTagsIds, dataSetId } = await this.getTagsAndDatasetIds();

        // only return all the date datasets ignoring production or custom datasets if neither of those were specified by the user
        const shouldReturnAllDateDataSets = !production && !dataSetId;

        const result = await this.authCall((sdk) =>
            sdk.catalogue.loadDateDataSets(this.workspace, {
                returnAllDateDataSets: shouldReturnAllDateDataSets,
                dataSetIdentifier: dataSetId,
                excludeObjectsWithTags: excludeTagsIds.length ? excludeTagsIds : undefined,
                includeObjectsWithTags: includeTagsIds.length ? includeTagsIds : undefined,
                includeDateGranularities,
            }),
        );
        return result.dateDataSets;
    };

    private loadBearCatalogItems = async (): Promise<GdcCatalog.CatalogItem[]> => {
        const { types, dataset } = this.options;

        const compatibleBearItemTypes = types.filter(isCompatibleCatalogItemType);
        if (compatibleBearItemTypes.length === 0) {
            return [];
        }

        const { includeTagsIds, excludeTagsIds, dataSetId } = await this.getTagsAndDatasetIds();

        const bearItemTypes = compatibleBearItemTypes.map(convertItemType);
        return this.authCall((sdk) =>
            sdk.catalogue.loadAllItems(this.workspace, {
                types: bearItemTypes,
                includeWithTags: includeTagsIds.length ? includeTagsIds : undefined,
                excludeWithTags: excludeTagsIds.length ? excludeTagsIds : undefined,
                production: getProductionFlag(this.options),
                csvDataSets: dataset ? [dataSetId] : [],
            }),
        );
    };

    /**
     * Loads unlisted metrics using /query resource. This is a shortcoming of the current
     * catalog items implementation. The unlisted items do not come back in /items resource - however,
     * they are needed to augment existing insights with metadata measures that MAY be unlisted.
     *
     * Previously, AD used to ignore catalog items when augmenting insights with bucket item metadata - instead
     * it was fetching the items as it found them. Now we try to position catalog as a single source of truth
     * and use just the catalog items for everything.
     */
    private loadBearUnlistedMetrics = async (): Promise<ICatalogMeasure[]> => {
        const { types } = this.options;

        const compatibleBearItemTypes = types.filter((item) => item === "measure");
        if (compatibleBearItemTypes.length === 0) {
            return [];
        }

        const queryOptions: IGetObjectsByQueryOptions = {
            category: "metric",
            limit: 50,
        };

        return this.authCall((sdk) =>
            sdk.md
                .getObjectsByQuery<GdcMetadata.IWrappedMetric>(this.workspace, queryOptions)
                .then((metrics) => {
                    return metrics.filter((metric) => metric.metric.meta.unlisted).map(convertMetric);
                })
                .catch((err) => {
                    if (isApiResponseError(err) && err.response.status === 404) {
                        /*
                         * Mock-server (mock-js) for GD platform does not support the md query resource.
                         * Instead of enhancing the mock-js, code here opts to fallback to empty list
                         * in case the query resource does not exist.
                         */

                        return [];
                    }

                    throw err;
                }),
        );
    };

    private loadBearDisplayFormsAndAttributes = async (
        bearCatalogItems: GdcCatalog.CatalogItem[],
        dateDatasetAttributes: IDateDataSetAttribute[],
    ): Promise<BearDisplayFormOrAttribute[]> => {
        const { types } = this.options;
        const shouldLoadAttributes = types.some((type) => type === "attribute" || type === "dateDataset");
        if (!shouldLoadAttributes) {
            return [];
        }

        const bearCatalogAttributes = bearCatalogItems.filter(GdcCatalog.isCatalogAttribute);
        const attributeUris = bearCatalogAttributes.map((attr) => attr.links.self);
        const displayFormUris = flatMap(bearCatalogAttributes, (attr) => {
            const geoPins = attr.links.geoPinDisplayForms ?? [];

            return [attr.links.defaultDisplayForm, ...geoPins];
        });
        const dateAttributeUris = dateDatasetAttributes.map((attr) => attr.attributeMeta.uri!);

        return this.authCall((sdk) =>
            sdk.md.getObjects<BearDisplayFormOrAttribute>(
                this.workspace,
                uniq([...attributeUris, ...displayFormUris, ...dateAttributeUris]),
            ),
        );
    };

    private loadCatalogGroups = async (): Promise<ICatalogGroup[]> => {
        const { types } = this.options;
        const shouldLoadGroups = types.some(isGroupableCatalogItemType);
        if (!shouldLoadGroups) {
            return [];
        }

        const { dataset } = this.options;

        const { includeTagsIds, excludeTagsIds, dataSetId } = await this.getTagsAndDatasetIds();

        const bearCatalogGroups = await this.authCall((sdk) =>
            sdk.catalogue.loadGroups(this.workspace, {
                includeWithTags: includeTagsIds.length ? includeTagsIds : undefined,
                excludeWithTags: excludeTagsIds.length ? excludeTagsIds : undefined,
                production: getProductionFlag(this.options),
                csvDataSets: dataset ? [dataSetId] : [],
            }),
        );

        return bearCatalogGroups.map(convertGroup);
    };

    private getTagsAndDatasetIds = async (): Promise<TagsAndDataSetIds> => {
        if (!this.tagsAndDatasetIdsPromise) {
            const { dataset, includeTags, excludeTags } = this.options;

            this.tagsAndDatasetIdsPromise = Promise.all([
                objRefsToIdentifiers(includeTags, this.authCall),
                objRefsToIdentifiers(excludeTags, this.authCall),
                dataset ? objRefToIdentifier(dataset, this.authCall) : Promise.resolve(""),
            ]).then(([includeTagsIds, excludeTagsIds, dataSetId]) => ({
                dataSetId,
                excludeTagsIds,
                includeTagsIds,
            }));
        }

        return this.tagsAndDatasetIdsPromise;
    };

    private withUpdatedUnlistedFlag = (
        catalogItems: CatalogItem[],
        bearUnlistedMetrics: ICatalogMeasure[],
    ): CatalogItem[] => {
        const catalogWithUnlisted = [...catalogItems];

        bearUnlistedMetrics.forEach((metric) => {
            const existingMeasure = catalogItems.find(
                (item) => isCatalogMeasure(item) && item.measure.uri === metric.measure.uri,
            ) as ICatalogMeasure;

            if (existingMeasure) {
                existingMeasure.measure.unlisted = true;
            }
        });

        return catalogWithUnlisted;
    };
}
