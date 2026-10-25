// (C) 2007-2026 GoodData Corporation

import { type ISeparators, type ObjRef } from "@gooddata/sdk-model";

import { type ICacheItemDisplayForm } from "./state_objects.js";

export interface IOrganizedCatalogGroup {
    name: string;
    id: string;
    items: IOrganizedCatalogItem[];
    isExpanded: boolean;
    tag: ObjRef;
}

export interface IOrganizedCatalogItem {
    type: "date" | "metric" | "fact" | "attribute" | "attributeHierarchy" | "computedAttribute";

    /**
     * Reference to metadata object.
     *
     * Use this when communicating with backend. Treat reference in opaque fashion. Do not rely
     * that it is either uri or identifier reference.
     */
    ref: ObjRef;
    identifier: string;
    uri?: string;

    /**
     * Item name
     */
    title: string;

    /**
     * Item description
     */
    summary?: string;

    /**
     * If metric, contains MAQL expression
     */
    expression?: string;

    isLocationIconVisible?: boolean;

    /**
     * Reference to attribute display form object.
     *
     * Use this when communicating with backend. Treat reference in opaque fashion. Do not rely
     * that it is either uri or identifier reference.
     */
    dfRef?: ObjRef;
    dfUri?: string;
    dfIdentifier?: string;
    displayForms?: ICacheItemDisplayForm[];

    locationDisplayFormRef?: ObjRef;
    locationDisplayFormUri?: string;
    locationDisplayFormIdentifier?: string;
    areaDisplayFormRef?: ObjRef;
    areaDisplayFormUri?: string;
    areaDisplayFormIdentifier?: string;

    available?: boolean;
    hiddenFromKda?: boolean;
}

export interface IExpressionToken {
    title: string;
    id?: string;
    category?: string;
    uri?: string;
}

export type IOrganizedCatalogTooltipDetails =
    | IOrganizedCatalogTooltipDetailsMeasure
    | IOrganizedCatalogTooltipDetailsFact
    | IOrganizedCatalogTooltipDetailsAttribute;

export interface IOrganizedCatalogTooltipDetailsMeasure {
    metricMaql?: ReadonlyArray<IExpressionToken>;
    projectId?: string;
    isRedirectAllowed?: boolean;
}

export interface IOrganizedCatalogTooltipDetailsFact {
    dataset?: {
        title: string;
    };
}

export interface IOrganizedCatalogTooltipDetailsAttribute {
    attrElements?: ReadonlyArray<{
        title: string;
    }>;
    attrElementsTotalCount?: number;
    /**
     * Number format of the element values of a numeric computed attribute; the element titles stay raw.
     */
    attrElementsNumberFormat?: string;
    /**
     * Separators to format the element values with.
     */
    separators?: ISeparators;
    dataset?: {
        title: string;
    };
}
