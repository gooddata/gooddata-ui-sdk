// (C) 2007-2020 GoodData Corporation
import isEmpty from "lodash/fp/isEmpty";
import { Timestamp, MaqlExpression, Uri, NumberAsString, BooleanAsString } from "../aliases";
import { GdcExecuteAFM } from "../executeAfm/GdcExecuteAFM";

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
        category?: ObjectCategory;
        title: string;
        summary: string;
        tags?: string;
        author?: string;
        contributor?: string;
        identifier: string;
        uri: string;
        deprecated?: "0" | "1";
        isProduction?: 1 | 0;
        created?: Timestamp;
        updated?: Timestamp;
        flags?: string[];
        locked?: boolean;
        projectTemplate?: string;
        sharedWithSomeone?: 1 | 0;
        unlisted?: 1 | 0;
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

    export interface IPrompt extends IMetadataObject {
        content:
            | {
                  type: "scalar";
              }
            | {
                  type: "filter";
                  attribute: Uri;
              };
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
        meta: IObjectMeta;
    }

    export interface IDataSet extends IMetadataObject {
        attributes: Uri[];
        dataLoadingColumns: Uri[];
        facts: Uri[];
        mode: string;
    }

    export interface IWrappedAttribute {
        attribute: IAttribute;
    }

    export interface IWrappedMetric {
        metric: IMetric;
    }

    export interface IWrappedFact {
        fact: IFact;
    }

    export interface IWrappedPrompt {
        prompt: IPrompt;
    }

    export interface IWrappedAttributeDisplayForm {
        attributeDisplayForm: IAttributeDisplayForm;
    }

    export interface IWrappedKpiAlert {
        kpiAlert: IKpiAlert;
    }

    export interface IWrappedDataSet {
        dataSet: IDataSet;
    }

    export interface IWrappedAttributeElement {
        element: IAttributeElement;
    }

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

    export type SortDirection = "asc" | "desc";

    /**
     * Request params for POST /gdc/md/\{projectId\}/obj/\{attributeDisplayFormMetadataObjectId\}/validElements\{params\}
     */
    export interface IValidElementsParams {
        limit?: number;
        offset?: number;
        order?: SortDirection;
        filter?: string;
        prompt?: string;
        uris?: string[];
        complement?: boolean;
        includeTotalCountWithoutFilters?: boolean;
        restrictiveDefinition?: string;
        restrictiveDefinitionContent?: object;
        afm?: GdcExecuteAFM.IAfm;
    }
    /**
     * Response for POST /gdc/md/\{projectId\}/obj/\{attributeDisplayFormMetadataObjectId\}/validElements\{params\}
     */
    export interface IValidElementsResponse {
        validElements: {
            items: IWrappedAttributeElement[];
            paging: {
                /**
                 * Total amount of existing elements for a given attributeDisplayForm (which match filter and request uris)
                 */
                total: NumberAsString;
                /**
                 * Amount of returned elements
                 */
                count: number;
                /**
                 * Offset of first item, starts from 0
                 */
                offset: NumberAsString;
            };
            /**
             * Total count of elements (ignoring any filter or request uris)
             * Number represented as a string
             */
            totalCountWithoutFilters?: string;
            elementsMeta: {
                attribute: Uri;
                attributeDisplayForm: Uri;
                /**
                 * we search only for substring of filter ie *filter*
                 */
                filter: string;
                order: SortDirection;
            };
        };
    }

    export interface IObjectLink {
        link: Uri;
        title?: string;
        category?: ObjectCategory;
        summary?: string;
        tags?: string;
        author?: Uri;
        created?: Timestamp;
        contributor?: Uri;
        updated?: Timestamp;
        deprecated?: BooleanAsString;
        projectTemplate?: string;
        help?: Uri;
        identifier?: string;
        locked?: boolean;
        unlisted?: boolean;
        isProduction?: boolean;
        sharedWithSomeone?: boolean;
    }

    export interface IGetObjectUsing {
        entries: IObjectLink[];
    }

    export interface IGetObjectUsedBy {
        entries: IObjectLink[];
    }

    export interface IGetObjectUsingManyEntry {
        uri: Uri;
        entries: IObjectLink[];
    }

    export interface IGetObjectsUsedByManyEntry {
        uri: Uri;
        entries: IObjectLink[];
    }

    export function isAttribute(obj: any): obj is IAttribute {
        return !isEmpty(obj) && (obj as IAttribute).meta.category === "attribute";
    }

    export function isWrappedAttribute(obj: any): obj is IWrappedAttribute {
        return !isEmpty(obj) && obj.hasOwnProperty("attribute");
    }

    export function isWrappedAttributeDisplayForm(obj: any): obj is IWrappedAttributeDisplayForm {
        return !isEmpty(obj) && obj.hasOwnProperty("attributeDisplayForm");
    }

    export function isAttributeDisplayForm(obj: any): obj is IAttributeDisplayForm {
        return !isEmpty(obj) && (obj as IAttributeDisplayForm).meta.category === "attributeDisplayForm";
    }

    export function isWrappedMetric(obj: any): obj is IWrappedMetric {
        return !isEmpty(obj) && obj.hasOwnProperty("metric");
    }

    export function isMetric(obj: any): obj is IMetric {
        return !isEmpty(obj) && (obj as IMetric).meta.category === "metric";
    }

    export function isWrappedFact(obj: any): obj is IWrappedFact {
        return !isEmpty(obj) && obj.hasOwnProperty("fact");
    }

    export function isFact(obj: any): obj is IFact {
        return !isEmpty(obj) && (obj as IFact).meta.category === "fact";
    }

    export function isKpiAlert(obj: any): obj is IKpiAlert {
        return !isEmpty(obj) && (obj as IKpiAlert).meta.category === "kpiAlert";
    }

    export function isWrappedKpiAlert(obj: any): obj is IWrappedKpiAlert {
        return !isEmpty(obj) && obj.hasOwnProperty("kpiAlert");
    }

    export function isDataSet(obj: any): obj is IDataSet {
        return !isEmpty(obj) && (obj as IDataSet).meta.category === "dataSet";
    }

    export function isWrappedDataSet(obj: any): obj is IWrappedDataSet {
        return !isEmpty(obj) && obj.hasOwnProperty("dataSet");
    }

    export function isPrompt(obj: any): obj is IPrompt {
        return !isEmpty(obj) && (obj as IPrompt).meta.category === "prompt";
    }

    export function isWrappedPrompt(obj: any): obj is IWrappedPrompt {
        return !isEmpty(obj) && obj.hasOwnProperty("prompt");
    }
}
