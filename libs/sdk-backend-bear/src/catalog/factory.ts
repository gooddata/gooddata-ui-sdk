// (C) 2019 GoodData Corporation
import { IWorkspaceCatalogFactory, IWorkspaceCatalogFactoryOptions } from "@gooddata/sdk-backend-spi";
import partition from "lodash/partition";
import uniq from "lodash/uniq";
import {
    CatalogItemType,
    ICatalogGroup,
    isCatalogMeasure,
    ICatalogDateDataset,
    CatalogItem,
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
} from "../toSdkModel/CatalogConverter";
import { AuthenticatedCallGuard } from "../commonTypes";
import { IDisplayFormByKey, IAttributeByKey, ICatalogMeasureByKey } from "./types";
import { BearWorkspaceCatalog } from "./catalog";

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
    displayFormById: IDisplayFormByKey;
    displayFormByUri: IDisplayFormByKey;
    attributeByDisplayFormUri: IAttributeByKey;
} => {
    const [attributes, displayForms] = partition(displayFormsAndAttributes, GdcMetadata.isWrappedAttribute);

    const attributeByUri = attributes.reduce(
        (acc: IAttributeByKey, el) => ({
            ...acc,
            [el.attribute.meta.uri]: el,
        }),
        {},
    );

    const displayFormByUri = displayForms.reduce(
        (acc: IDisplayFormByKey, el) => ({
            ...acc,
            [el.attributeDisplayForm.meta.uri]: el.attributeDisplayForm,
        }),
        {},
    );

    const displayFormById = displayForms.reduce(
        (acc: IDisplayFormByKey, el) => ({
            ...acc,
            [el.attributeDisplayForm.meta.identifier]: el.attributeDisplayForm,
        }),
        {},
    );

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
        attributeByDisplayFormUri,
        displayFormById,
        displayFormByUri,
    };
};

export class BearWorkspaceCatalogFactory implements IWorkspaceCatalogFactory {
    constructor(
        private readonly authCall: AuthenticatedCallGuard,
        private readonly workspace: string,
        private readonly options: IWorkspaceCatalogFactoryOptions = {
            types: ["attribute", "measure", "fact", "dateDataset"],
            excludeTags: [],
            includeTags: [],
            production: true,
        },
    ) {}

    public withOptions(options: Partial<IWorkspaceCatalogFactoryOptions>): IWorkspaceCatalogFactory {
        const newOptions = {
            ...this.options,
            ...options,
        };
        return new BearWorkspaceCatalogFactory(this.authCall, this.workspace, newOptions);
    }

    public forDataset(dataset: string): IWorkspaceCatalogFactory {
        return this.withOptions({
            dataset,
        });
    }

    public forTypes(types: CatalogItemType[]): IWorkspaceCatalogFactory {
        return this.withOptions({
            types,
        });
    }

    public includeTags(tags: string[]): IWorkspaceCatalogFactory {
        return this.withOptions({
            includeTags: tags,
        });
    }

    public excludeTags(tags: string[]): IWorkspaceCatalogFactory {
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

        const { attributeByDisplayFormUri, displayFormById, displayFormByUri } = createLookups(
            bearDisplayFormsAndAttributes,
        );

        const catalogItems = bearCatalogItems.map(bearCatalogItemToCatalogItem(displayFormByUri));
        const dateDatasets = await this.loadDateDatasets(attributeByDisplayFormUri);
        const allCatalogItems = [...catalogItems, ...dateDatasets];

        const catalogMeasureById = catalogItems.filter(isCatalogMeasure).reduce(
            (acc: ICatalogMeasureByKey, el) => ({
                ...acc,
                [el.id]: el,
            }),
            {},
        );

        return {
            allCatalogItems,
            mappings: {
                attributeByDisplayFormUri,
                displayFormById,
                catalogMeasureById,
            },
        };
    };

    private loadDateDatasets = async (attributesMap: IAttributeByKey): Promise<ICatalogDateDataset[]> => {
        const { types } = this.options;

        const includeDateDatasets = types.includes("dateDataset");
        if (!includeDateDatasets) {
            return [];
        }

        const result = await this.authCall(sdk =>
            sdk.catalogue.loadDateDataSets(this.workspace, {
                returnAllDateDataSets: true,
                dataSetIdentifier: this.options.dataset,
                attributesMap,
            }),
        );
        return result.dateDataSets.map(convertDateDataset);
    };

    private loadBearCatalogItems = async (): Promise<GdcCatalog.CatalogItem[]> => {
        const { types, includeTags, excludeTags, dataset, production } = this.options;

        const compatibleBearItemTypes = types.filter(isCompatibleCatalogItemType);
        if (compatibleBearItemTypes.length === 0) {
            return [];
        }

        const bearItemTypes = compatibleBearItemTypes.map(convertItemType);
        return this.authCall(sdk =>
            sdk.catalogue.loadAllItems(this.workspace, {
                types: bearItemTypes,
                includeWithTags: includeTags,
                excludeWithTags: excludeTags,
                production: production ? 1 : 0,
                csvDataSets: dataset ? [dataset] : [],
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
        const { includeTags, excludeTags, dataset, production } = this.options;

        const bearCatalogGroups = await this.authCall(sdk =>
            sdk.catalogue.loadGroups(this.workspace, {
                includeWithTags: includeTags,
                excludeWithTags: excludeTags,
                production: production ? 1 : 0,
                csvDataSets: dataset ? [dataset] : [],
            }),
        );

        return bearCatalogGroups.map(convertGroup);
    };
}
