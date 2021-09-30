// (C) 2007-2021 GoodData Corporation
import isEmpty from "lodash/fp/isEmpty";
import has from "lodash/has";
import {
    Timestamp,
    MaqlExpression,
    Uri,
    NumberAsString,
    BooleanAsString,
    ThemeColor,
    ThemeFontUri,
} from "../aliases";
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
        | "visualizationWidget"
        | "theme";

    export interface IObjectMeta {
        category?: ObjectCategory;
        title: string;
        summary?: string;
        tags?: string;
        author?: string;
        contributor?: string;
        identifier?: string;
        uri?: string;
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
            drillDownStepAttributeDF?: Uri;
            linkAttributeDF?: Uri;
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
    }

    export interface IThemeColorFamily {
        base: ThemeColor;
        light?: ThemeColor;
        dark?: ThemeColor;
        contrast?: ThemeColor;
    }

    export interface IThemeComplementaryPalette {
        c0: ThemeColor;
        c1?: ThemeColor;
        c2?: ThemeColor;
        c3?: ThemeColor;
        c4?: ThemeColor;
        c5?: ThemeColor;
        c6?: ThemeColor;
        c7?: ThemeColor;
        c8?: ThemeColor;
        c9: ThemeColor;
    }

    export interface IThemePalette {
        primary?: IThemeColorFamily;
        error?: IThemeColorFamily;
        warning?: IThemeColorFamily;
        success?: IThemeColorFamily;
        info?: IThemeColorFamily;
        complementary?: IThemeComplementaryPalette;
    }

    export interface ITheme extends IMetadataObject {
        content: {
            typography?: {
                font?: ThemeFontUri;
                fontBold?: ThemeFontUri;
            };
            palette?: IThemePalette;
            button?: {
                borderRadius?: string;
                dropShadow?: boolean;
                textCapitalization?: boolean;
            };
            tooltip?: {
                backgroundColor?: ThemeColor;
                color?: ThemeColor;
            };
            modal?: {
                title?: {
                    color?: ThemeColor;
                    lineColor?: ThemeColor;
                };
                outsideBackgroundColor?: ThemeColor;
                dropShadow?: boolean;
                borderWidth?: string;
                borderColor?: ThemeColor;
                borderRadius?: string;
            };
            dashboards?: {
                title?: {
                    color?: ThemeColor;
                    backgroundColor?: ThemeColor;
                    borderColor?: ThemeColor;
                };
                section?: {
                    title?: {
                        color?: ThemeColor;
                        lineColor?: ThemeColor;
                    };
                    description?: {
                        color?: ThemeColor;
                    };
                };
                filterBar?: {
                    backgroundColor?: ThemeColor;
                    borderColor?: ThemeColor;
                    filterButton?: {
                        backgroundColor?: ThemeColor;
                    };
                };
                content?: {
                    backgroundColor?: ThemeColor;
                    widget?: {
                        title?: {
                            color?: ThemeColor;
                            textAlign?: string;
                        };
                        backgroundColor?: ThemeColor;
                        borderColor?: ThemeColor;
                        borderWidth?: string;
                        borderRadius?: string;
                        dropShadow?: boolean;
                    };
                    kpiWidget?: {
                        title?: {
                            color?: ThemeColor;
                            textAlign?: string;
                        };
                        backgroundColor?: ThemeColor;
                        borderColor?: ThemeColor;
                        borderWidth?: string;
                        borderRadius?: string;
                        dropShadow?: boolean;
                        kpi?: {
                            value?: {
                                textAlign?: string;
                                positiveColor?: ThemeColor;
                                negativeColor?: ThemeColor;
                            };
                            primaryMeasureColor?: ThemeColor;
                            secondaryInfoColor?: ThemeColor;
                        };
                    };
                };
                navigation?: {
                    backgroundColor?: ThemeColor;
                    borderColor?: ThemeColor;
                    header?: {
                        color?: ThemeColor;
                    };
                    item?: {
                        color?: ThemeColor;
                        hoverColor?: ThemeColor;
                        selectedColor?: ThemeColor;
                        selectedBackgroundColor?: ThemeColor;
                    };
                };
                editPanel?: {
                    backgroundColor?: ThemeColor;
                };
            };
            analyticalDesigner?: {
                title?: {
                    color?: ThemeColor;
                };
            };
        };
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

    export interface IWrappedTheme {
        theme: ITheme;
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

    export function isAttribute(obj: unknown): obj is IAttribute {
        return !isEmpty(obj) && (obj as IAttribute).meta.category === "attribute";
    }

    export function isWrappedAttribute(obj: unknown): obj is IWrappedAttribute {
        // eslint-disable-next-line no-prototype-builtins
        return !isEmpty(obj) && has(obj, "attribute");
    }

    export function isWrappedAttributeDisplayForm(obj: unknown): obj is IWrappedAttributeDisplayForm {
        // eslint-disable-next-line no-prototype-builtins
        return !isEmpty(obj) && has(obj, "attributeDisplayForm");
    }

    export function isAttributeDisplayForm(obj: unknown): obj is IAttributeDisplayForm {
        return !isEmpty(obj) && (obj as IAttributeDisplayForm).meta.category === "attributeDisplayForm";
    }

    export function isWrappedMetric(obj: unknown): obj is IWrappedMetric {
        // eslint-disable-next-line no-prototype-builtins
        return !isEmpty(obj) && has(obj, "metric");
    }

    export function isMetric(obj: unknown): obj is IMetric {
        return !isEmpty(obj) && (obj as IMetric).meta.category === "metric";
    }

    export function isWrappedFact(obj: unknown): obj is IWrappedFact {
        // eslint-disable-next-line no-prototype-builtins
        return !isEmpty(obj) && has(obj, "fact");
    }

    export function isFact(obj: unknown): obj is IFact {
        return !isEmpty(obj) && (obj as IFact).meta.category === "fact";
    }

    export function isKpiAlert(obj: unknown): obj is IKpiAlert {
        return !isEmpty(obj) && (obj as IKpiAlert).meta.category === "kpiAlert";
    }

    export function isWrappedKpiAlert(obj: unknown): obj is IWrappedKpiAlert {
        // eslint-disable-next-line no-prototype-builtins
        return !isEmpty(obj) && has(obj, "kpiAlert");
    }

    export function isDataSet(obj: unknown): obj is IDataSet {
        return !isEmpty(obj) && (obj as IDataSet).meta.category === "dataSet";
    }

    export function isWrappedDataSet(obj: unknown): obj is IWrappedDataSet {
        // eslint-disable-next-line no-prototype-builtins
        return !isEmpty(obj) && has(obj, "dataSet");
    }

    export function isPrompt(obj: unknown): obj is IPrompt {
        return !isEmpty(obj) && (obj as IPrompt).meta.category === "prompt";
    }

    export function isWrappedPrompt(obj: unknown): obj is IWrappedPrompt {
        // eslint-disable-next-line no-prototype-builtins
        return !isEmpty(obj) && has(obj, "prompt");
    }

    export function isTheme(obj: unknown): obj is ITheme {
        return !isEmpty(obj) && (obj as IPrompt).meta.category === "theme";
    }

    export function isWrappedTheme(obj: unknown): obj is IWrappedTheme {
        // eslint-disable-next-line no-prototype-builtins
        return !isEmpty(obj) && has(obj, "theme");
    }
}
