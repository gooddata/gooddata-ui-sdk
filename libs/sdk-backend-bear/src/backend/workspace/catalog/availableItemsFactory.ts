// (C) 2019-2022 GoodData Corporation
import {
    IWorkspaceCatalogAvailableItemsFactory,
    IWorkspaceCatalogWithAvailableItemsFactoryOptions,
} from "@gooddata/sdk-backend-spi";
import {
    CatalogItemType,
    CatalogItem,
    ICatalogGroup,
    ICatalogDateDataset,
    isCatalogAttribute,
    isCatalogFact,
    isCatalogMeasure,
    IAttributeOrMeasure,
    IInsightDefinition,
    ObjRef,
    insightItems,
    isAttribute,
    isArithmeticMeasure,
    isSimpleMeasure,
    attributeDisplayFormRef,
    isIdentifierRef,
    modifyAttribute,
    uriRef,
    modifySimpleMeasure,
    measureItem,
    attributeLocalId,
    measureLocalId,
    measureMasterIdentifier,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    isMeasure,
    measurePopAttribute,
    modifyPopMeasure,
} from "@gooddata/sdk-model";
import {
    convertItemType,
    convertDateDataset,
    isCompatibleCatalogItemType,
} from "../../../convertors/fromBackend/CatalogConverter.js";
import { convertInsightDefinition } from "../../../convertors/toBackend/InsightConverter.js";
import { GdcVisualizationObject } from "@gooddata/api-model-bear";
import { IUriMappings } from "../../../types/catalog.js";
import { BearWorkspaceCatalogWithAvailableItems } from "./catalogWithAvailableItems.js";
import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import { objRefToIdentifier, objRefsToIdentifiers } from "../../../utils/api.js";
import { InvariantError } from "ts-invariant";

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
            loadGroups: true,
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

    public forItems(items: IAttributeOrMeasure[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ items });
    }

    public forInsight(insight: IInsightDefinition): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ insight });
    }

    public withGroups(loadGroups: boolean): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ loadGroups });
    }

    public async load(): Promise<BearWorkspaceCatalogWithAvailableItems> {
        const tempVisualizationObj = createVisObjectForAvailability(this.options, this.mappings);

        const [availableCatalogItems, availableDateDatasets] = await Promise.all([
            this.loadAvailableCatalogItems(tempVisualizationObj),
            this.loadAvailableDateDatasets(tempVisualizationObj),
        ]);

        const allAvailableCatalogItems = [...availableCatalogItems, ...availableDateDatasets];

        return new BearWorkspaceCatalogWithAvailableItems(
            this.groups,
            this.items,
            allAvailableCatalogItems,
            this.options,
        );
    }

    private loadAvailableCatalogItems = async (
        sanitizedVisualizationObject: GdcVisualizationObject.IVisualizationObject,
    ): Promise<CatalogItem[]> => {
        const { types } = this.options;

        const compatibleBearItemTypes = types.filter(isCompatibleCatalogItemType);
        if (compatibleBearItemTypes.length === 0) {
            return [];
        }

        const bearTypes = compatibleBearItemTypes.map(convertItemType);
        const itemDescriptions = await this.authCall((sdk) =>
            sdk.catalogue.loadItemDescriptionObjects(
                this.workspace,
                sanitizedVisualizationObject.content,
                this.mappings.attributeByDisplayFormUri,
            ),
        );

        const availableItemUris = await this.authCall((sdk) =>
            sdk.catalogue.loadAvailableItemUris(this.workspace, {
                catalogQueryRequest: {
                    bucketItems: itemDescriptions,
                    types: bearTypes,
                },
            }),
        );

        return this.items.filter((item) => availableItemUris.includes(catalogItemUri(item)));
    };

    private loadAvailableDateDatasets = async (
        sanitizedVisualizationObject: GdcVisualizationObject.IVisualizationObject,
    ): Promise<ICatalogDateDataset[]> => {
        const { types, includeTags, excludeTags, dataset, production, includeDateGranularities } =
            this.options;

        const includeDateDatasets = types.includes("dateDataset");
        if (!includeDateDatasets) {
            return [];
        }

        const [includeTagsIds, excludeTagsIds, dataSetIdentifier] = await Promise.all([
            objRefsToIdentifiers(includeTags, this.authCall),
            objRefsToIdentifiers(excludeTags, this.authCall),
            dataset ? objRefToIdentifier(dataset, this.authCall) : Promise.resolve(""),
        ]);

        // only return all the date datasets ignoring production or custom datasets if neither of those were specified by the user
        const shouldReturnAllDateDataSets = !production && !dataSetIdentifier;

        const result = await this.authCall((sdk) =>
            sdk.catalogue.loadDateDataSets(this.workspace, {
                bucketItems: sanitizedVisualizationObject.content,
                includeAvailableDateAttributes: true,
                dataSetIdentifier,
                attributesMap: this.mappings.attributeByDisplayFormUri,
                includeObjectsWithTags: includeTagsIds.length ? includeTagsIds : undefined,
                excludeObjectsWithTags: excludeTagsIds.length ? excludeTagsIds : undefined,
                returnAllDateDataSets: shouldReturnAllDateDataSets,
                includeDateGranularities,
            }),
        );
        return result.dateDataSets.map((dateDataSet) =>
            convertDateDataset(dateDataSet, this.mappings.attributeById),
        );
    };
}

/**
 * Creates temporary visualization object, whose bucket items can then be used to construct the bucket items
 * used by the catalog resource. The construction of bucket items happens using some serious mojo in bear's api
 * client and requires these types of objects.
 *
 * This function will take all the items, strip arithmetic measures and measures derived from them,
 * transform all identifiers to URIs.
 */
function createVisObjectForAvailability(
    options: IWorkspaceCatalogWithAvailableItemsFactoryOptions,
    mappings: IUriMappings,
) {
    const { items = [], insight } = options;

    if (items.length === 0 && !insight) {
        throw new Error("No items or insight was specified.");
    }

    const itemsToUse = insight ? insightItems(insight) : items;
    const validItems = filterItemsForAvailabilityQuery(itemsToUse);
    const itemsWithUris = validItems.map((item) => translateIdentifiersToUris(item, mappings));

    const tempInsight: IInsightDefinition = {
        insight: {
            title: "",
            filters: [],
            properties: {},
            sorts: [],
            visualizationUrl: "",
            buckets: [
                {
                    items: itemsWithUris,
                },
            ],
        },
    };

    return convertInsightDefinition(tempInsight);
}

/*
 * Availability query must not contain arithmetic measures and measures derived from them.
 */
function filterItemsForAvailabilityQuery(items: IAttributeOrMeasure[]): IAttributeOrMeasure[] {
    const arithmeticMeasuresIds: Set<string> = new Set<string>();
    const otherMeasureIds: Set<string> = new Set<string>();

    items.forEach((measure) => {
        if (isArithmeticMeasure(measure)) {
            arithmeticMeasuresIds.add(measureLocalId(measure));
        } else if (isMeasure(measure)) {
            otherMeasureIds.add(measureLocalId(measure));
        }
    });

    return items.filter((item: IAttributeOrMeasure) => {
        if (isAttribute(item) || isSimpleMeasure(item)) {
            return true;
        } else if (isArithmeticMeasure(item)) {
            return false;
        } else if (isPoPMeasure(item) || isPreviousPeriodMeasure(item)) {
            const masterMeasure = measureMasterIdentifier(item);

            // remove derived measures which are either derived from arithmetic measure or which do
            // not have their master among the items to query
            return !arithmeticMeasuresIds.has(masterMeasure) && otherMeasureIds.has(masterMeasure);
        }

        throw new InvariantError(
            "unexpected type of item encountered while constructing items for availability query",
        );
    });
}

function translateIdentifiersToUris(item: IAttributeOrMeasure, mappings: IUriMappings): IAttributeOrMeasure {
    if (isAttribute(item)) {
        const ref = attributeDisplayFormRef(item);

        if (isIdentifierRef(ref)) {
            const displayForm = mappings.displayFormById[ref.identifier];

            return modifyAttribute(item, (m) =>
                m.displayForm(uriRef(displayForm.meta.uri!)).localId(attributeLocalId(item)),
            );
        }

        return item;
    } else if (isSimpleMeasure(item)) {
        const ref = measureItem(item);

        if (isIdentifierRef(ref)) {
            const metric = mappings.measureById[ref.identifier];
            const fact = mappings.factById[ref.identifier];
            const uri = metric?.uri ?? fact.uri;

            return modifySimpleMeasure(item, (m) => m.measureItem(uriRef(uri)).localId(measureLocalId(item)));
        }

        return item;
    } else if (isPoPMeasure(item)) {
        const ref = measurePopAttribute(item);

        if (isIdentifierRef(ref)) {
            const attribute = mappings.attributeById[ref.identifier];
            const dateAttribute = mappings.dateAttributeById[ref.identifier];
            const uri = attribute?.attribute.meta.uri ?? dateAttribute.attribute.uri;

            return modifyPopMeasure(item, (m) => m.popAttribute(uriRef(uri)).localId(measureLocalId(item)));
        }
    }

    return item;
}
