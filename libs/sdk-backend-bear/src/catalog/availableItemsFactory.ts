// (C) 2019 GoodData Corporation
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
    IInsightWithoutIdentifier,
} from "@gooddata/sdk-model";
import { AuthenticatedCallGuard } from "../commonTypes";
import {
    convertItemType,
    CompatibleCatalogItemType,
    convertDateDataset,
} from "../toSdkModel/CatalogConverter";
import { convertInsight } from "../fromSdkModel/InsightConverter";
import { GdcVisualizationObject } from "@gooddata/gd-bear-model";
import { IUriMappings } from "./types";
import { BearWorkspaceCatalogWithAvailableItems } from "./catalogWithAvailableItems";

export class BearWorkspaceCatalogAvailableItemsFactory implements IWorkspaceCatalogAvailableItemsFactory {
    constructor(
        private readonly authCall: AuthenticatedCallGuard,
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

    public forDataset(dataset: string): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ dataset });
    }

    public forTypes(types: CatalogItemType[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ types });
    }

    public includeTags(tags: string[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ includeTags: tags });
    }

    public excludeTags(tags: string[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ excludeTags: tags });
    }

    public forItems(items: AttributeOrMeasure[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ items });
    }

    public forInsight(insight: IInsightWithoutIdentifier): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ insight });
    }

    public async load() {
        const { types = this.options.types, items = this.options.items || [], insight } = this.options;
        if (items.length === 0 && !insight) {
            throw new Error("No items or insight was specified!");
        }

        const includeDateDatasets = types.includes("dateDataset");
        const compatibleBearItemTypes = types.filter(
            (type): type is CompatibleCatalogItemType => type !== "dateDataset",
        );
        const bearTypes = compatibleBearItemTypes.map(convertItemType);
        const itemsInsight: IInsightWithoutIdentifier = {
            insight: {
                title: "",
                filters: [],
                properties: {},
                sorts: [],
                visualizationClassUri: "",
                buckets: [
                    {
                        items,
                    },
                ],
            },
        };
        const visualizationObject = convertInsight(insight || itemsInsight);

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
                                        uri: this.mappings.catalogMeasureById[
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

        let dateDatasets: ICatalogDateDataset[] = [];
        if (includeDateDatasets) {
            const result = await this.authCall(sdk =>
                sdk.catalogue.loadDateDataSets(this.workspace, {
                    bucketItems: sanitizedVisualizationObject.content,
                    includeAvailableDateAttributes: true,
                    dataSetIdentifier: this.options.dataset,
                    attributesMap: this.mappings.attributeByDisplayFormUri,
                }),
            );
            dateDatasets = result.dateDataSets.map(convertDateDataset);
        }

        const availableCatalogItems = this.items.filter(item => availableItemUris.includes(item.uri));
        const allAvailableCatalogItems = [...availableCatalogItems, ...dateDatasets];

        return new BearWorkspaceCatalogWithAvailableItems(this.groups, this.items, allAvailableCatalogItems);
    }
}
