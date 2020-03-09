// (C) 2019-2020 GoodData Corporation
import {
    IWorkspaceCatalogAvailableItemsFactory,
    IWorkspaceCatalogWithAvailableItemsFactoryOptions,
} from "@gooddata/sdk-backend-spi";
import {
    CatalogItemType,
    CatalogItem,
    ICatalogGroup,
    ICatalogDateDataset,
    AttributeOrMeasure,
    IInsightDefinition,
    ObjRef,
    isCatalogAttribute,
    isCatalogMeasure,
    isCatalogFact,
} from "@gooddata/sdk-model";
import {
    convertItemType,
    convertDateDataset,
    isCompatibleCatalogItemType,
} from "../../../toSdkModel/CatalogConverter";
import { convertInsightDefinition } from "../../../fromSdkModel/InsightConverter";
import { GdcVisualizationObject } from "@gooddata/gd-bear-model";
import { IUriMappings } from "./types";
import { BearWorkspaceCatalogWithAvailableItems } from "./catalogWithAvailableItems";
import { BearAuthenticatedCallGuard } from "../../../types";
import { objRefToIdentifier } from "../../../fromObjRef/api";

const catalogItemUri = (catalogItem: CatalogItem): string => {
    if (isCatalogAttribute(catalogItem)) {
        return catalogItem.attribute.uri;
    } else if (isCatalogMeasure(catalogItem)) {
        return catalogItem.measure.uri;
    } else if (isCatalogFact(catalogItem)) {
        return catalogItem.fact.uri;
    }

    return catalogItem.dataSet.uri;
};

export class BearWorkspaceCatalogAvailableItemsFactory implements IWorkspaceCatalogAvailableItemsFactory {
    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        private readonly workspace: string,
        private readonly groups: ICatalogGroup[],
        private readonly items: CatalogItem[],
        private readonly options: IWorkspaceCatalogWithAvailableItemsFactoryOptions = {
            types: ["attribute", "measure", "fact", "dateDataset"],
            excludeTags: [],
            includeTags: [],
            production: true,
        },
        private readonly mappings: IUriMappings,
    ) {}

    public withOptions(
        options: Partial<IWorkspaceCatalogWithAvailableItemsFactoryOptions>,
    ): IWorkspaceCatalogAvailableItemsFactory {
        const newOptions = {
            ...this.options,
            ...options,
        };
        return new BearWorkspaceCatalogAvailableItemsFactory(
            this.authCall,
            this.workspace,
            this.groups,
            this.items,
            newOptions,
            this.mappings,
        );
    }

    public forDataset(dataset: ObjRef): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ dataset });
    }

    public forTypes(types: CatalogItemType[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ types });
    }

    public includeTags(tags: ObjRef[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ includeTags: tags });
    }

    public excludeTags(tags: ObjRef[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ excludeTags: tags });
    }

    public forItems(items: AttributeOrMeasure[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ items });
    }

    public forInsight(insight: IInsightDefinition): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ insight });
    }

    public async load() {
        const { items = [], insight } = this.options;
        if (items.length === 0 && !insight) {
            throw new Error("No items or insight was specified!");
        }

        const itemsInsight: IInsightDefinition = {
            insight: {
                title: "",
                filters: [],
                properties: {},
                sorts: [],
                visualizationUrl: "",
                buckets: [
                    {
                        items,
                    },
                ],
            },
        };
        const visualizationObject = convertInsightDefinition(insight || itemsInsight);

        // loadItemDescriptionObjects + loadDateDataSets consumes only visualizationObject with specified uris
        // so map identifiers to uris
        const visualizationObjectBucketsWithUris = visualizationObject.content.buckets.map(bucket => {
            const sanitizedItems = bucket.items.map(bucketItem => {
                if (
                    GdcVisualizationObject.isAttribute(bucketItem) &&
                    !GdcVisualizationObject.isObjUriQualifier(bucketItem.visualizationAttribute.displayForm)
                ) {
                    const attributeWithUri: GdcVisualizationObject.IAttribute = {
                        visualizationAttribute: {
                            ...bucketItem.visualizationAttribute,
                            displayForm: {
                                uri: this.mappings.displayFormById[
                                    bucketItem.visualizationAttribute.displayForm.identifier
                                ].meta.uri,
                            },
                        },
                    };
                    return attributeWithUri;
                } else if (
                    GdcVisualizationObject.isMeasure(bucketItem) &&
                    GdcVisualizationObject.isMeasureDefinition(bucketItem.measure.definition) &&
                    !GdcVisualizationObject.isObjUriQualifier(
                        bucketItem.measure.definition.measureDefinition.item,
                    )
                ) {
                    const measureWithUri: GdcVisualizationObject.IMeasure = {
                        measure: {
                            ...bucketItem.measure,
                            definition: {
                                measureDefinition: {
                                    ...bucketItem.measure.definition.measureDefinition,
                                    item: {
                                        uri: this.mappings.measureById[
                                            bucketItem.measure.definition.measureDefinition.item.identifier
                                        ].uri,
                                    },
                                },
                            },
                        },
                    };
                    return measureWithUri;
                }

                return bucketItem;
            });

            const updatedBucket: GdcVisualizationObject.IBucket = {
                ...bucket,
                items: sanitizedItems,
            };

            return updatedBucket;
        });

        const sanitizedVisualizationObject: GdcVisualizationObject.IVisualizationObject = {
            ...visualizationObject,
            content: {
                ...visualizationObject.content,
                buckets: visualizationObjectBucketsWithUris,
            },
        };

        const [availableCatalogItems, availableDateDatasets] = await Promise.all([
            this.loadAvailableCatalogItems(sanitizedVisualizationObject),
            this.loadAvailableDateDatasets(sanitizedVisualizationObject),
        ]);

        const allAvailableCatalogItems = [...availableCatalogItems, ...availableDateDatasets];

        return new BearWorkspaceCatalogWithAvailableItems(this.groups, this.items, allAvailableCatalogItems);
    }

    private loadAvailableCatalogItems = async (
        sanitizedVisualizationObject: GdcVisualizationObject.IVisualizationObject,
    ): Promise<CatalogItem[]> => {
        const { types } = this.options;

        const compatibleBearItemTypes = types.filter(isCompatibleCatalogItemType);

        const bearTypes = compatibleBearItemTypes.map(convertItemType);
        const itemDescriptions = await this.authCall(sdk =>
            sdk.catalogue.loadItemDescriptionObjects(
                this.workspace,
                sanitizedVisualizationObject.content,
                this.mappings.attributeByDisplayFormUri,
            ),
        );

        const availableItemUris = await this.authCall(sdk =>
            sdk.catalogue.loadAvailableItemUris(this.workspace, {
                catalogQueryRequest: {
                    bucketItems: itemDescriptions,
                    types: bearTypes,
                },
            }),
        );

        return this.items.filter(item => availableItemUris.includes(catalogItemUri(item)));
    };

    private loadAvailableDateDatasets = async (
        sanitizedVisualizationObject: GdcVisualizationObject.IVisualizationObject,
    ): Promise<ICatalogDateDataset[]> => {
        const { types, dataset } = this.options;

        const includeDateDatasets = types.includes("dateDataset");
        if (!includeDateDatasets) {
            return [];
        }

        let dataSetIdentifier: string;
        if (dataset) {
            dataSetIdentifier = await objRefToIdentifier(dataset, this.authCall);
        }

        const result = await this.authCall(sdk =>
            sdk.catalogue.loadDateDataSets(this.workspace, {
                bucketItems: sanitizedVisualizationObject.content,
                includeAvailableDateAttributes: true,
                dataSetIdentifier,
                attributesMap: this.mappings.attributeByDisplayFormUri,
            }),
        );
        return result.dateDataSets.map(convertDateDataset);
    };
}
