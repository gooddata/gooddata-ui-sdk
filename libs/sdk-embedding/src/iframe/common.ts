// (C) 2020-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";
import { GdcExecuteAFM } from "@gooddata/api-model-bear";

/**
 * List of products using post events
 *
 * @public
 */
export enum GdcProductName {
    /**
     * AD product name
     */
    ANALYTICAL_DESIGNER = "analyticalDesigner",

    /**
     * KD product name
     */
    KPI_DASHBOARD = "dashboard",
}

/**
 * Common event types in application
 *
 * @public
 */
export enum GdcEventType {
    /**
     * Event to notify outer application that the command is invalid or have errors while processing
     */
    AppCommandFailed = "appCommandFailed",
}

/**
 * Base type for event content
 *
 * @public
 */
export interface IGdcMessage<Product, T, TBody> {
    readonly product: Product;
    readonly event: {
        readonly name: T;
        readonly data?: TBody;
        readonly contextId?: string;
    };
}

/**
 * Base type for gdc event data
 *
 * @public
 */
export interface IGdcMessageEnvelope<Product, T, TBody> {
    readonly gdc: IGdcMessage<Product, T, TBody>;
}

/**
 * Base type for events
 *
 * @public
 */
export interface IGdcMessageEvent<Product, T, TBody> extends MessageEvent {
    readonly data: IGdcMessageEnvelope<Product, T, TBody>;
}

/**
 * Type for event listener
 *
 * @public
 */
export type GdcMessageEventListener = (event: IGdcMessageEvent<string, string, any>) => boolean;

/**
 * Config type use to setup the message event listeners
 *
 * @public
 */
export interface IGdcMessageEventListenerConfig {
    /**
     * The product name where the post messages are sent/received
     */
    product: string;

    /**
     * The list of events is allowed for processing
     */
    validReceivedPostEvents: string[];
}

/**
 * Enumeration of possible types of error messages posted from the apps.
 *
 * @public
 */
export enum GdcErrorType {
    /**
     * The posted command is not recognized.
     */
    InvalidCommand = "error:invalidCommand",

    /**
     * Argument specified in the command body is invalid; it has failed the syntactical
     * or semantic validation.
     */
    InvalidArgument = "error:invalidArgument",

    /**
     * Command was posted when the app is not in a state to process the command. For instance:
     *
     * - trying to do save/save-as on new, empty insight
     * - trying to do save/save-as on insight that is in error
     * - trying to do undo when there is no step-back available
     * - trying to do redo when there is no step-forward available
     */
    InvalidState = "error:invalidState",

    /**
     * The Unexpected Happened.
     */
    RuntimeError = "error:runtime",
}

/**
 * @public
 */
export interface ICommandFailedBody {
    /**
     * Error code indicates category of error that has occurred.
     * The possible types vary between applications.
     */
    errorCode: GdcErrorType;

    /**
     * Error message includes descriptive information about the error.
     * E.g. "Insight title must not contain newline character"
     */
    errorMessage: string;
}

/**
 * Base type for error events sent by application in case command processing comes to an expected
 * or unexpected halt.
 *
 * @public
 */
export type CommandFailed<Product> = IGdcMessageEvent<
    Product,
    GdcEventType.AppCommandFailed,
    ICommandFailedBody
>;

/**
 * Base type for the data of error events sent by application
 * in case command processing comes to an expected or unexpected halt.
 *
 * @public
 */
export type CommandFailedData<Product> = IGdcMessageEnvelope<
    Product,
    GdcEventType.AppCommandFailed,
    ICommandFailedBody
>;

/**
 * Type-guard checking whether an object is an instance of {@link CommandFailedData}
 *
 * @param obj - object to test
 * @public
 */
export function isCommandFailedData<Product>(obj: unknown): obj is CommandFailedData<Product> {
    return isObject(obj) && getEventType(obj) === GdcEventType.AppCommandFailed;
}

/**
 * Minimal meta-information about an object.
 *
 * @public
 */
export interface IObjectMeta {
    /**
     * Unique, user-assignable identifier of the insight. This identifier does not change during LCM operations.
     */
    identifier: string;

    /**
     * URI of the Insight. In context of GoodData platform, the URI is a link to the visualization object
     * where the insight is persisted.
     *
     * NOTE: URI is workspace scoped; same insight distributed across multiple workspaces using LCM will have
     * different URI.
     */
    uri: string;

    /**
     * Insight title - this is what users see in AD top bar (if visible)
     */
    title: string;
}

/**
 * Additional information for action payload. Use for internal reducers, sagas
 *
 * @public
 */
export interface IPostMessageContextPayload {
    postMessageContext?: {
        contextId: string;
    };
}

/**
 * Get event type of event from event data
 * @param obj - the event data object
 * @public
 */
export function getEventType(obj: Record<string, any>): string {
    const { gdc: { event: { name = "" } = {} } = {} } = obj || {};
    return name;
}

//
// Drillable Items command
//

/**
 * Base type of drillable items command body
 *
 * @public
 */
export interface ISimpleDrillableItemsCommandBody {
    /**
     * The array of uris of attributes or measures
     */
    uris?: string[];
    /**
     * The array of identifiers of attributes or measures
     */
    identifiers?: string[];
}

/**
 * The main data type of drillable items command
 *
 * @public
 */
export interface IDrillableItemsCommandBody extends ISimpleDrillableItemsCommandBody {
    /**
     * Master measures items - In-case, a derived measure is composed from a master measure.
     */
    composedFrom?: ISimpleDrillableItemsCommandBody;
}

/**
 * @public
 */
export namespace EmbeddedGdc {
    /*
     * Attribute filters were exposed in the 'old' format that did not match backend and used the
     * textFilter boolean indicator. We have to honor this for the public API.
     */

    export interface IPositiveAttributeFilter {
        positiveAttributeFilter: {
            displayForm: ObjQualifier;
            in: string[];
            textFilter?: boolean;
        };
    }

    export interface INegativeAttributeFilter {
        negativeAttributeFilter: {
            displayForm: ObjQualifier;
            notIn: string[];
            textFilter?: boolean;
        };
    }

    export interface IAbsoluteDateFilter {
        absoluteDateFilter: {
            // dataSet is required in AD only
            dataSet?: ObjQualifier;
            from: string;
            to: string;
        };
    }

    export interface IRelativeDateFilter {
        relativeDateFilter: {
            // dataSet is required in AD only
            dataSet?: ObjQualifier;
            granularity: string;
            from: number;
            to: number;
        };
    }

    export type RankingFilterOperator = "TOP" | "BOTTOM";

    export interface IRankingFilter {
        rankingFilter: {
            measure: ILocalIdentifierQualifier;
            attributes?: ILocalIdentifierQualifier[];
            operator: RankingFilterOperator;
            value: number;
        };
    }

    export type AttributeFilterItem = IPositiveAttributeFilter | INegativeAttributeFilter;
    export type DateFilterItem = IAbsoluteDateFilter | IRelativeDateFilter;
    export type FilterItem = DateFilterItem | AttributeFilterItem | IRankingFilter;
    export type ILocalIdentifierQualifier = GdcExecuteAFM.ILocalIdentifierQualifier;
    export type ObjQualifier = GdcExecuteAFM.ObjQualifier;
    export interface IRemoveDateFilterItem {
        dataSet: ObjQualifier;
    }
    export interface IRemoveAttributeFilterItem {
        displayForm: ObjQualifier;
    }
    export interface IRemoveRankingFilterItem {
        removeRankingFilter: unknown;
    }
    export type RemoveFilterItem =
        | IRemoveDateFilterItem
        | IRemoveAttributeFilterItem
        | IRemoveRankingFilterItem;
    export function isDateFilter(filter: unknown): filter is DateFilterItem {
        return !isEmpty(filter) && (isRelativeDateFilter(filter) || isAbsoluteDateFilter(filter));
    }
    export function isRelativeDateFilter(filter: unknown): filter is IRelativeDateFilter {
        return !isEmpty(filter) && (filter as IRelativeDateFilter).relativeDateFilter !== undefined;
    }
    export function isAbsoluteDateFilter(filter: unknown): filter is IAbsoluteDateFilter {
        return !isEmpty(filter) && (filter as IAbsoluteDateFilter).absoluteDateFilter !== undefined;
    }
    export function isAttributeFilter(filter: unknown): filter is AttributeFilterItem {
        return !isEmpty(filter) && (isPositiveAttributeFilter(filter) || isNegativeAttributeFilter(filter));
    }

    export function isPositiveAttributeFilter(filter: unknown): filter is IPositiveAttributeFilter {
        return !isEmpty(filter) && (filter as IPositiveAttributeFilter).positiveAttributeFilter !== undefined;
    }

    export function isNegativeAttributeFilter(filter: unknown): filter is INegativeAttributeFilter {
        return !isEmpty(filter) && (filter as INegativeAttributeFilter).negativeAttributeFilter !== undefined;
    }
    export const isObjIdentifierQualifier = GdcExecuteAFM.isObjIdentifierQualifier;
    export const isObjectUriQualifier = GdcExecuteAFM.isObjectUriQualifier;

    export function isRankingFilter(filter: unknown): filter is IRankingFilter {
        return !isEmpty(filter) && (filter as IRankingFilter).rankingFilter !== undefined;
    }

    /**
     * The filter context content that is used to exchange the filter context
     * between AD, KD embedded page and parent application
     */
    export interface IFilterContextContent {
        // array of date or attribute filter items
        filters: FilterItem[];
    }

    /**
     * The remove filter context content that is used to exchange the filter context
     * between AD, KD embedded page and parent application
     */
    export interface IRemoveFilterContextContent {
        // array of date or attribute filter items
        filters: RemoveFilterItem[];
    }

    export function isRemoveDateFilter(filter: unknown): filter is EmbeddedGdc.IRemoveDateFilterItem {
        return !isEmpty(filter) && (filter as EmbeddedGdc.IRemoveDateFilterItem).dataSet !== undefined;
    }

    export function isRemoveAttributeFilter(
        filter: unknown,
    ): filter is EmbeddedGdc.IRemoveAttributeFilterItem {
        return (
            !isEmpty(filter) && (filter as EmbeddedGdc.IRemoveAttributeFilterItem).displayForm !== undefined
        );
    }

    export function isRemoveRankingFilter(filter: unknown): filter is EmbeddedGdc.IRemoveRankingFilterItem {
        return (
            !isEmpty(filter) &&
            (filter as EmbeddedGdc.IRemoveRankingFilterItem).removeRankingFilter !== undefined
        );
    }

    export type AllTimeType = "allTime";
    export type AbsoluteType = "absolute";
    export type RelativeType = "relative";

    export type DateString = string;
    export type DateFilterGranularity =
        | "GDC.time.minute"
        | "GDC.time.hour"
        | "GDC.time.date"
        | "GDC.time.week_us"
        | "GDC.time.month"
        | "GDC.time.quarter"
        | "GDC.time.year";

    export interface IDashboardAllTimeDateFilter {
        dateFilter: { type: AllTimeType };
    }

    export interface IDashboardAbsoluteDateFilter {
        dateFilter: {
            type: AbsoluteType;
            granularity: DateFilterGranularity;
            from: DateString;
            to: DateString;
        };
    }

    export interface IDashboardRelativeDateFilter {
        dateFilter: {
            type: RelativeType;
            granularity: DateFilterGranularity;
            from: number;
            to: number;
        };
    }

    export type DashboardDateFilter =
        | IDashboardAllTimeDateFilter
        | IDashboardAbsoluteDateFilter
        | IDashboardRelativeDateFilter;

    export function isDashboardDateFilter(filter: unknown): filter is DashboardDateFilter {
        return !isEmpty(filter) && (filter as DashboardDateFilter).dateFilter !== undefined;
    }
    export function isDashboardAllTimeDateFilter(filter: unknown): filter is IDashboardAllTimeDateFilter {
        return !isEmpty(filter) && (filter as IDashboardAllTimeDateFilter).dateFilter?.type === "allTime";
    }
    export function isDashboardAbsoluteDateFilter(filter: unknown): filter is IDashboardAbsoluteDateFilter {
        return !isEmpty(filter) && (filter as IDashboardAbsoluteDateFilter).dateFilter?.type === "absolute";
    }
    export function isDashboardRelativeDateFilter(filter: unknown): filter is IDashboardRelativeDateFilter {
        return !isEmpty(filter) && (filter as IDashboardRelativeDateFilter).dateFilter?.type === "relative";
    }

    export interface IDashboardAttributeFilter {
        attributeFilter: {
            displayForm: string;
            negativeSelection: boolean;
            attributeElements: string[];
        };
    }

    export function isDashboardAttributeFilter(filter: unknown): filter is IDashboardAttributeFilter {
        return !isEmpty(filter) && (filter as IDashboardAttributeFilter).attributeFilter !== undefined;
    }

    export interface IResolvedAttributeFilterValues {
        [elementRef: string]: string | undefined; // restricted elements values cant be resolved
    }

    export interface IResolvedDateFilterValue {
        from: string;
        to: string;
    }

    export type ResolvedDateFilterValues = IResolvedDateFilterValue[];

    /**
     * Resolved values for all resolvable filters
     */
    export interface IResolvedFilterValues {
        dateFilters: ResolvedDateFilterValues;
        attributeFilters: {
            [filterStringRef: string]: IResolvedAttributeFilterValues;
        };
    }
}
