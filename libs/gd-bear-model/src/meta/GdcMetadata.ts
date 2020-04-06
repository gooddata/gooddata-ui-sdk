// (C) 2007-2020 GoodData Corporation
import isEmpty from "lodash/fp/isEmpty";
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
            dimension?: string;
            displayForms: IAttributeDisplayForm[];
            type?: string;
        };
    }

    export interface IMaqlAstPosition {
        line: number;
        column: number;
    }

    export interface IMaqlTree {
        type: string;
        value?: string | Date | number;
        position: IMaqlAstPosition;
        content?: IMaqlTree;
    }

    export interface IMetric extends IMetadataObject {
        content: {
            expression: MaqlExpression;
            tree?: IMaqlTree;
            format?: string;
            folders?: string[];
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
            self: string;
            elements: string;
        };
    }

    export interface IKpiAlert extends IMetadataObject {
        content: {
            kpi: Uri;
            /**
             * KPI can be on more dashboards - we need to distinguish
             * which dashboard can be used as link in dashboard alerting email
             */
            dashboard: Uri;
            threshold: number;
            isTriggered: boolean;
            whenTriggered: "underThreshold" | "aboveThreshold";
            filterContext?: Uri;
        };
    }

    export type IObject = IAttribute | IMetric | IFact | IAttributeDisplayForm | IKpiAlert;

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

    export interface IWrappedKpiAlert {
        kpiAlert: IKpiAlert;
    }

    export type WrappedObject =
        | IWrappedAttribute
        | IWrappedMetric
        | IWrappedFact
        | IWrappedAttributeDisplayForm
        | IWrappedKpiAlert;

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

    /**
     * XREF entry is returned by using2 and usedBy2 resources. These contain limited subset of
     * fields.
     */
    export interface IObjectXrefEntry {
        /*
         * Type of object
         */
        category: string;

        /**
         * Link to profile of user who created the object
         */
        author: string;

        /**
         * Link to profile of user who last updated the object
         */
        contributor: string;

        /**
         * Date and time of creation (YYYY-MM-DD H:M:S)
         */
        created: string;

        /**
         * Deprecation indicator.
         *
         * String value containing 0 or 1.
         */
        deprecated: string;

        /**
         * Metadata object identifier
         */
        identifier: string;

        /**
         * Link to metadata object - objects URI
         */
        link: string;

        /**
         * Lock indicator. 0 if not locked, 1 if locked
         */
        locked: 0 | 1;

        /**
         * Metadata object description. May be empty string if no description
         */
        summary: string;

        /**
         * Metadata object title - human readable name.
         */
        title: string;

        /**
         * Indicates whether object is publicly listed or not.
         */
        unlisted: 0 | 1;

        /**
         * Date and time of last update (YYYY-MM-DD H:M:S)
         */
        updated: string;
    }

    export function isAttribute(obj: any): obj is IAttribute {
        return !isEmpty(obj) && (obj as IAttribute).meta.category === "attribute";
    }

    export function isWrappedAttribute(object: WrappedObject): object is IWrappedAttribute {
        return object.hasOwnProperty("attribute");
    }

    export function isWrappedAttributeDisplayForm(
        object: WrappedObject,
    ): object is IWrappedAttributeDisplayForm {
        return object.hasOwnProperty("attributeDisplayForm");
    }

    export function isAttributeDisplayForm(obj: any): obj is IAttributeDisplayForm {
        return !isEmpty(obj) && (obj as IAttributeDisplayForm).meta.category === "attributeDisplayForm";
    }

    export function isWrappedMetric(object: WrappedObject): object is IWrappedMetric {
        return object.hasOwnProperty("metric");
    }

    export function isMetric(obj: any): obj is IMetric {
        return !isEmpty(obj) && (obj as IMetric).meta.category === "metric";
    }

    export function isWrappedFact(object: WrappedObject): object is IWrappedFact {
        return object.hasOwnProperty("fact");
    }

    export function isFact(obj: any): obj is IFact {
        return !isEmpty(obj) && (obj as IFact).meta.category === "fact";
    }

    export function isKpiAlert(obj: any): obj is IKpiAlert {
        return !isEmpty(obj) && (obj as IAttribute).meta.category === "kpiAlert";
    }

    export function isWrappedKpiAlert(object: WrappedObject): object is IWrappedKpiAlert {
        return object.hasOwnProperty("kpiAlert");
    }

    export function unwrapMetadataObject(object: WrappedObject): IObject {
        const unwrappedObject: IObject = flow(values, first)(object);

        return unwrappedObject;
    }
}
