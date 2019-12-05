// (C) 2019 GoodData Corporation
import { IWorkspaceCatalogFactory, IWorkspaceCatalogFactoryOptions } from "@gooddata/sdk-backend-spi";
import flow from "lodash/fp/flow";
import uniq from "lodash/fp/uniq";
import map from "lodash/fp/map";
import { CatalogItemType, ICatalogGroup, isCatalogMeasure, ICatalogDateDataset } from "@gooddata/sdk-model";
import { GdcMetadata, GdcCatalog } from "@gooddata/gd-bear-model";
import {
    convertItemType,
    CompatibleCatalogItemType,
    convertDateDataset,
    convertAttribute,
    convertMeasure,
    convertFact,
    convertGroup,
} from "../toSdkModel/CatalogConverter";
import { AuthenticatedCallGuard } from "../commonTypes";
import { IDisplayFormByKey, IAttributeByKey, ICatalogMeasureByKey } from "./types";
import { BearWorkspaceCatalog } from "./catalog";

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
        const { types, includeTags, excludeTags, dataset, production } = this.options;
        const includeDateDatasets = types.includes("dateDataset");
        const compatibleBearItemTypes = types.filter(
            (type): type is CompatibleCatalogItemType => type !== "dateDataset",
        );
        const bearItemTypes = compatibleBearItemTypes.map(convertItemType);
        const bearCatalogItems = await this.authCall(sdk =>
            sdk.catalogue.loadAllItems(this.workspace, {
                types: bearItemTypes,
                includeWithTags: includeTags,
                excludeWithTags: excludeTags,
                production: production ? 1 : 0,
                csvDataSets: dataset ? [dataset] : [],
            }),
        );
        const bearCatalogAttributes = bearCatalogItems.filter(GdcCatalog.isCatalogAttribute);

        const attributeUris = flow(
            map((attr: GdcCatalog.ICatalogAttribute) => attr.links.self),
            uniq,
        )(bearCatalogAttributes);
        const displayFormUris = flow(
            map((attr: GdcCatalog.ICatalogAttribute) => attr.links.defaultDisplayForm),
            uniq,
        )(bearCatalogAttributes);

        const displayFormsAndAttributes = await this.authCall(sdk =>
            sdk.md.getObjects<GdcMetadata.IWrappedAttributeDisplayForm | GdcMetadata.IWrappedAttribute>(
                this.workspace,
                [...attributeUris, ...displayFormUris],
            ),
        );

        const { displayFormByUri, displayFormById, attributeByUri } = displayFormsAndAttributes.reduce(
            (
                acc: {
                    displayFormById: IDisplayFormByKey;
                    displayFormByUri: IDisplayFormByKey;
                    attributeByUri: IAttributeByKey;
                },
                el,
            ) => {
                if (GdcMetadata.isWrappedAttribute(el)) {
                    return {
                        ...acc,
                        attributeByUri: {
                            ...acc.attributeByUri,
                            [el.attribute.meta.uri]: el.attribute,
                        },
                    };
                }
                return {
                    ...acc,
                    displayFormByUri: {
                        ...acc.displayFormByUri,
                        [el.attributeDisplayForm.meta.uri]: el.attributeDisplayForm,
                    },
                    displayFormById: {
                        ...acc.displayFormById,
                        [el.attributeDisplayForm.meta.identifier]: el.attributeDisplayForm,
                    },
                };
            },
            {
                displayFormById: {},
                displayFormByUri: {},
                attributeByUri: {},
            },
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

        let dateDatasets: ICatalogDateDataset[] = [];
        if (includeDateDatasets) {
            const result = await this.authCall(sdk =>
                sdk.catalogue.loadDateDataSets(this.workspace, {
                    returnAllDateDataSets: true,
                    dataSetIdentifier: this.options.dataset,
                    attributesMap: attributeByDisplayFormUri,
                }),
            );
            dateDatasets = result.dateDataSets.map(convertDateDataset);
        }

        const catalogItems = bearCatalogItems.map(item => {
            if (GdcCatalog.isCatalogAttribute(item)) {
                return convertAttribute(item, displayFormByUri[item.links.defaultDisplayForm]);
            } else if (GdcCatalog.isCatalogMetric(item)) {
                return convertMeasure(item);
            }
            return convertFact(item);
        });

        const catalogMeasureById = catalogItems
            .filter(isCatalogMeasure)
            .reduce((acc: ICatalogMeasureByKey, el) => {
                return {
                    ...acc,
                    [el.id]: el,
                };
            }, {});

        const allCatalogItems = [...catalogItems, ...dateDatasets];

        const bearCatalogGroups = await this.authCall(sdk =>
            sdk.catalogue.loadGroups(this.workspace, {
                includeWithTags: includeTags,
                excludeWithTags: excludeTags,
                production: production ? 1 : 0,
                csvDataSets: dataset ? [dataset] : [],
            }),
        );

        const catalogGroups: ICatalogGroup[] = bearCatalogGroups.map(convertGroup);

        return new BearWorkspaceCatalog(
            this.authCall,
            this.workspace,
            catalogGroups,
            allCatalogItems,
            this.options,
            {
                attributeByDisplayFormUri,
                displayFormById,
                catalogMeasureById,
            },
        );
    }
}
