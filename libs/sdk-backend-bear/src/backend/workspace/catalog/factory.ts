// (C) 2019-2022 GoodData Corporation
import { IWorkspaceCatalogFactory, IWorkspaceCatalogFactoryOptions } from "@gooddata/sdk-backend-spi";
import partition from "lodash/partition.js";
import uniq from "lodash/uniq.js";
import flatMap from "lodash/flatMap.js";
import keyBy from "lodash/keyBy.js";
import {
    Identifier,
    ObjRef,
    CatalogItemType,
    CatalogItem,
    ICatalogGroup,
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
    isCompatibleCatalogItemType,
} from "../../../convertors/fromBackend/CatalogConverter.js";
import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import { IAttributeByKey, IDisplayFormByKey, IFactByKey, IMeasureByKey } from "../../../types/catalog.js";
import { BearWorkspaceCatalog } from "./catalog.js";
import { objRefsToIdentifiers, objRefToIdentifier } from "../../../utils/api.js";
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
            acc[displayFormUri] = attribute;
            return acc;
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
            loadGroups: true,
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

    public withGroups(loadGroups: boolean): IWorkspaceCatalogFactory {
        return this.withOptions({
            loadGroups,
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
        const [bearCatalogItems, bearDateDatasets] = await Promise.all([
            this.loadBearCatalogItems(),
            this.loadDateDatasets(),
        ]);

        const bearAttributes = await this.loadBearAttributes(
            bearCatalogItems,
            flatMap(bearDateDatasets, (dd) => dd.availableDateAttributes ?? []),
        );

        const bearDisplayFormsAndAttributes = extractDisplayFormsFromBearAttributes(bearAttributes);

        const { attributeByDisplayFormUri, displayFormById, displayFormByUri, attributeById } = createLookups(
            bearDisplayFormsAndAttributes,
        );

        const catalogItems = bearCatalogItems.map(
            bearCatalogItemToCatalogItem(displayFormByUri, attributeById),
        );

        const dateDatasets = bearDateDatasets.map((dd) => convertDateDataset(dd, attributeById));

        const allCatalogItems = catalogItems.concat(dateDatasets);

        const measureById: IMeasureByKey = keyBy(
            catalogItems.filter(isCatalogMeasure).map((el) => el.measure),
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

    private loadBearAttributes = async (
        bearCatalogItems: GdcCatalog.CatalogItem[],
        dateDatasetAttributes: IDateDataSetAttribute[],
    ): Promise<GdcMetadata.IWrappedAttribute[]> => {
        const { types } = this.options;
        const shouldLoadAttributes = types.some((type) => type === "attribute" || type === "dateDataset");
        if (!shouldLoadAttributes) {
            return [];
        }

        const bearCatalogAttributes = bearCatalogItems.filter(GdcCatalog.isCatalogAttribute);
        const attributeUris = bearCatalogAttributes.map((attr) => attr.links.self);

        const dateAttributeUris = dateDatasetAttributes.map((attr) => attr.attributeMeta.uri!);

        return this.authCall((sdk) =>
            sdk.md.getObjects<GdcMetadata.IWrappedAttribute>(
                this.workspace,
                uniq([...attributeUris, ...dateAttributeUris]),
            ),
        );
    };

    private loadCatalogGroups = async (): Promise<ICatalogGroup[]> => {
        const { types, loadGroups } = this.options;
        const shouldLoadGroups = loadGroups && types.some(isGroupableCatalogItemType);
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
}

function extractDisplayFormsFromBearAttributes(
    attributes: GdcMetadata.IWrappedAttribute[],
): BearDisplayFormOrAttribute[] {
    return flatMap(attributes, (attribute) => [
        attribute,
        ...attribute.attribute.content.displayForms.map(
            (df): GdcMetadata.IWrappedAttributeDisplayForm => ({ attributeDisplayForm: df }),
        ),
    ]);
}
