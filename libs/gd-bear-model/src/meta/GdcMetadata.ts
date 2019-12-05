// (C) 2007-2019 GoodData Corporation
import values from "lodash/fp/values";
import first from "lodash/first";
import flow from "lodash/flow";
import { Timestamp, MaqlExpression, Uri, NumberAsString } from "../aliases";

/**
 * @public
 */
export namespace GdcMetadata {
    export type ObjectCategory =
        | "analyticalDashboard"
        | "attribute"
        | "attributeDisplayForm"
        | "column"
        | "dataLoadingColumn"
        | "dataSet"
        | "dateFilterConfig"
        | "dimension"
        | "domain"
        | "elementMasking"
        | "etlFile"
        | "executionContext"
        | "fact"
        | "filterContext"
        | "filter"
        | "folder"
        | "kpi"
        | "kpiAlert"
        | "metric"
        | "projectDashboard"
        | "prompt"
        | "reportDefinition"
        | "report"
        | "scheduledMail"
        | "tableDataload"
        | "table"
        | "userFilter"
        | "visualizationClass"
        | "visualizationObject"
        | "visualizationWidget";

    export interface IObjectMeta {
        category: ObjectCategory;
        title: string;
        summary: string;
        tags: string;
        author: string;
        contributor: string;
        identifier: string;
        uri: string;
        deprecated: "0" | "1";
        isProduction: 1 | 0;
        created: Timestamp;
        updated: Timestamp;
        flags?: string[];
        locked?: boolean;
        projectTemplate?: string;
        sharedWithSomeone?: boolean;
        unlisted?: boolean;
    }

    export interface IMetadataObject {
        meta: IObjectMeta;
    }

    export interface IAttribute extends IMetadataObject {
        content: {
            displayForms: IAttributeDisplayForm[];
        };
    }

    export interface IMetric extends IMetadataObject {
        content: {
            expression: MaqlExpression;
            // TODO
        };
    }

    export interface IFact extends IMetadataObject {
        content: any; // TODO
    }

    export interface IAttributeDisplayForm extends IMetadataObject {
        content: {
            expression: MaqlExpression;
            formOf: Uri;
            ldmexpression?: string;
            type?: string;
            default?: number;
        };

        links: {
            elements: string;
        };
    }

    export type IObject = IAttribute | IMetric | IFact | IAttributeDisplayForm;

    export interface IWrappedAttribute {
        attribute: IAttribute;
    }

    export interface IWrappedMetric {
        metric: IMetric;
    }

    export interface IWrappedFact {
        fact: IFact;
    }

    export interface IWrappedAttributeDisplayForm {
        attributeDisplayForm: IAttributeDisplayForm;
    }

    export type WrappedObject =
        | IWrappedAttribute
        | IWrappedMetric
        | IWrappedFact
        | IWrappedAttributeDisplayForm;

    export interface IAttributeElement {
        uri: string;
        title: string;
    }

    export interface IWrappedAttributeElements {
        attributeElements: {
            elementsMeta: {
                count: number;
                mode: "includeuris"; // TODO remaining modes
                filter: string;
                records: NumberAsString;
                prompt: string;
                attribute: Uri;
                order: "asc" | "desc";
                attributeDisplayForm: Uri;
                offset: NumberAsString;
            };
            elements: IAttributeElement[];
            paging: {
                next: null | string;
                count: number;
                total: NumberAsString;
                offset: NumberAsString;
            };
        };
    }

    export function isWrappedAttribute(object: WrappedObject): object is IWrappedAttribute {
        return object.hasOwnProperty("attribute");
    }

    export function isWrappedAttributeDisplayForm(
        object: WrappedObject,
    ): object is IWrappedAttributeDisplayForm {
        return object.hasOwnProperty("attributeDisplayForm");
    }

    export function isWrappedMetric(object: WrappedObject): object is IWrappedMetric {
        return object.hasOwnProperty("metric");
    }

    export function isWrappedFact(object: WrappedObject): object is IWrappedFact {
        return object.hasOwnProperty("fact");
    }

    export function unwrapMetadataObject(object: WrappedObject): IObject {
        const unwrappedObject: IObject = flow(
            values,
            first,
        )(object);

        return unwrappedObject;
    }
}
