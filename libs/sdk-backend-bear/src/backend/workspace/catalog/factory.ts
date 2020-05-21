// (C) 2019-2020 GoodData Corporation
import { IWorkspaceCatalogFactory, IWorkspaceCatalogFactoryOptions } from "@gooddata/sdk-backend-spi";
import partition from "lodash/partition";
import uniq from "lodash/uniq";
import {
    CatalogItemType,
    ICatalogGroup,
    isCatalogMeasure,
    ICatalogDateDataset,
    CatalogItem,
    ObjRef,
    Identifier,
    isCatalogFact,
} from "@gooddata/sdk-model";
import { GdcMetadata, GdcCatalog } from "@gooddata/gd-bear-model";
import {
    convertItemType,
    convertDateDataset,
    convertAttribute,
    convertMeasure,
    convertFact,
    convertGroup,
    isCompatibleCatalogItemType,
} from "../../../toSdkModel/CatalogConverter";
import { BearAuthenticatedCallGuard } from "../../../types";
import { IDisplayFormByKey, IAttributeByKey, IMeasureByKey, IFactByKey } from "./types";
import { BearWorkspaceCatalog } from "./catalog";
import { objRefToIdentifier, objRefsToIdentifiers } from "../../../fromObjRef/api";
import keyBy = require("lodash/keyBy");
import flatMap = require("lodash/flatMap");

type BearDisplayFormOrAttribute = GdcMetadata.IWrappedAttributeDisplayForm | GdcMetadata.IWrappedAttribute;

const bearCatalogItemToCatalogItem = (displayForms: IDisplayFormByKey) => (
    item: GdcCatalog.CatalogItem,
): CatalogItem => {
    if (GdcCatalog.isCatalogAttribute(item)) {
        return convertAttribute(item, displayForms[item.links.defaultDisplayForm]);
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
    const unwrappedDisplayForms = displayForms.map(df => df.attributeDisplayForm);

    const attributeByUri: IAttributeByKey = keyBy(attributes, item => item.attribute.meta.uri);
    const attributeById: IAttributeByKey = keyBy(attributes, item => item.attribute.meta.identifier);
    const displayFormByUri: IDisplayFormByKey = keyBy(unwrappedDisplayForms, item => item.meta.uri);
    const displayFormById: IDisplayFormByKey = keyBy(unwrappedDisplayForms, item => item.meta.identifier);

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

    public async load() {
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
        const bearCatalogItems = await this.loadBearCatalogItems();

        const bearDisplayFormsAndAttributes = await this.loadBearDisplayFormsAndAttributes(bearCatalogItems);

        const { attributeByDisplayFormUri, displayFormById, displayFormByUri, attributeById } = createLookups(
            bearDisplayFormsAndAttributes,
        );

        const catalogItems = bearCatalogItems.map(bearCatalogItemToCatalogItem(displayFormByUri));
        const dateDatasets = await this.loadDateDatasets(attributeByDisplayFormUri);
        const allCatalogItems = [...catalogItems, ...dateDatasets];

        const measureById: IMeasureByKey = keyBy(
            catalogItems.filter(isCatalogMeasure).map(el => el.measure),
            el => el.id,
        );
        const factById: IFactByKey = keyBy(
            catalogItems.filter(isCatalogFact).map(el => el.fact),
            el => el.id,
        );

        const dateAttributeById = keyBy(
            flatMap(dateDatasets, dd => dd.dateAttributes),
            attr => attr.attribute.id,
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

    private loadDateDatasets = async (attributesMap: IAttributeByKey): Promise<ICatalogDateDataset[]> => {
        const { types } = this.options;

        const includeDateDatasets = types.includes("dateDataset");
        if (!includeDateDatasets) {
            return [];
        }

        const { includeTagsIds, excludeTagsIds, dataSetId } = await this.getTagsAndDatasetIds();

        const result = await this.authCall(sdk =>
            sdk.catalogue.loadDateDataSets(this.workspace, {
                returnAllDateDataSets: true,
                dataSetIdentifier: dataSetId,
                attributesMap,
                excludeObjectsWithTags: excludeTagsIds.length ? excludeTagsIds : undefined,
                includeObjectsWithTags: includeTagsIds.length ? includeTagsIds : undefined,
            }),
        );
        return result.dateDataSets.map(convertDateDataset);
    };

    private loadBearCatalogItems = async (): Promise<GdcCatalog.CatalogItem[]> => {
        const { types, dataset } = this.options;

        const compatibleBearItemTypes = types.filter(isCompatibleCatalogItemType);
        if (compatibleBearItemTypes.length === 0) {
            return [];
        }

        const { includeTagsIds, excludeTagsIds, dataSetId } = await this.getTagsAndDatasetIds();

        const bearItemTypes = compatibleBearItemTypes.map(convertItemType);
        return this.authCall(sdk =>
            sdk.catalogue.loadAllItems(this.workspace, {
                types: bearItemTypes,
                includeWithTags: includeTagsIds.length ? includeTagsIds : undefined,
                excludeWithTags: excludeTagsIds.length ? excludeTagsIds : undefined,
                production: getProductionFlag(this.options),
                csvDataSets: dataset ? [dataSetId] : [],
            }),
        );
    };

    private loadBearDisplayFormsAndAttributes = async (
        bearCatalogItems: GdcCatalog.CatalogItem[],
    ): Promise<BearDisplayFormOrAttribute[]> => {
        const bearCatalogAttributes = bearCatalogItems.filter(GdcCatalog.isCatalogAttribute);
        const attributeUris = bearCatalogAttributes.map(attr => attr.links.self);
        const displayFormUris = bearCatalogAttributes.map(attr => attr.links.defaultDisplayForm);

        return this.authCall(sdk =>
            sdk.md.getObjects<BearDisplayFormOrAttribute>(
                this.workspace,
                uniq([...attributeUris, ...displayFormUris]),
            ),
        );
    };

    private loadCatalogGroups = async (): Promise<ICatalogGroup[]> => {
        const { dataset } = this.options;

        const { includeTagsIds, excludeTagsIds, dataSetId } = await this.getTagsAndDatasetIds();

        const bearCatalogGroups = await this.authCall(sdk =>
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
