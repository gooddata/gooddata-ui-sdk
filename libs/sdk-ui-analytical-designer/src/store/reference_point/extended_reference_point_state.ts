// (C) 2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";
import {
    type IAvailableSortsGroup,
    type IBucketItem,
    type IExtendedReferencePoint,
} from "@gooddata/sdk-ui-ext/internal";

import { type GeoLabelType } from "../../constants/geo.js";
import { type IStoredVisualizationProperties } from "../../typings/properties.js";
import { type IFilter } from "../filter_bar/filter_bar_types.js";

/**
 * `data.extendedReferencePoint` holds what the pluggable-visualization round trip answered, with
 * TWO AD-side edits applied before it is stored:
 *
 * - `filters` is REPLACED by the filter bar's own filters (`convertFromExtendedRefPointFilters`),
 *   so it is NOT the SDK's `IFilters` bucket — hence the `Omit` below rather than a plain extend;
 * - `buckets` goes through the geo display-form normalization, which reads and writes keys the
 *   SDK's `IBucketItem` does not declare (`displayForm`, the geo ref pair).
 *
 * Everything else is the SDK contract, so the types are DERIVED from it (`uiConfig` is not
 * exported from the internal barrel; indexed access is how the app already reached it — see
 * selectors/ui_config_selector.ts). The value stays `null` in the store until a pluggable
 * visualization reports one back, and reads as `undefined` through the input selector: several
 * readers distinguish "exists" from "does not", so every accessor tolerates the absence and the
 * container is NOT self-initialized.
 */

type SdkUiConfig = NonNullable<IExtendedReferencePoint["uiConfig"]>;
type SdkBucketUiConfig = SdkUiConfig["buckets"][string];

/**
 * The uiConfig types are declared as INTERFACES that extend the SDK's, not as aliases to them.
 * `IUiConfig`/`IBucketsUiConfig`/`IBucketUiConfig` are not on sdk-ui-ext's internal barrel, so an
 * ALIAS to one of them cannot be NAMED by a consumer whose type is inferred — the compiler reaches
 * for the deep `node_modules/@gooddata/sdk-ui-ext/esm/...` path and rejects it as non-portable
 * (TS2742). Extending gives every consumer a nameable declaration in this module.
 */
export interface IExtendedRefPointBucketUiConfig extends SdkBucketUiConfig {
    /** re-declared verbatim: the item types the bucket takes, read by the drag-and-drop rules */
    accepts?: string[];
}

export interface IExtendedRefPointBucketsUiConfig {
    [localIdentifier: string]: IExtendedRefPointBucketUiConfig;
}

export interface IExtendedRefPointUiConfig extends Omit<SdkUiConfig, "buckets" | "supportedLocationIcon"> {
    buckets: IExtendedRefPointBucketsUiConfig;
    /**
     * `type` is the geo label kind AD resolves the location icon from
     * (services/reference_point_service.ts#getActiveGeoLabelType); the SDK declares only
     * `supported`.
     */
    supportedLocationIcon?: { supported?: boolean; type?: GeoLabelType };
}

/** Nameable for the same TS2742 reason as the uiConfig interfaces above. */
export interface IExtendedRefPointCustomError extends NonNullable<SdkUiConfig["customError"]> {
    /** re-declared verbatim: the error heading the empty canvas renders */
    heading: string;
}

/**
 * A display form as the round trip carries it. `IDisplayForm` is not on the internal barrel, so
 * the type is derived from the bucket item that holds it; `isPrimary` is AD's own addition, read
 * by the geo display-form normalization.
 */
export type IExtendedRefPointDisplayForm = NonNullable<IBucketItem["displayForms"]>[number] & {
    isPrimary?: boolean;
};

/**
 * An ERP bucket item. `displayForm` is the resolved display form the round trip echoes back next
 * to `dfRef`; the geo normalization deletes it for geo buckets and rewrites it for text ones.
 */
export interface IExtendedRefPointBucketItem extends Omit<IBucketItem, "displayForms"> {
    displayForm?: ObjRef;
    displayForms?: IExtendedRefPointDisplayForm[];
}

export interface IExtendedRefPointBucket {
    localIdentifier?: string;
    items?: IExtendedRefPointBucketItem[];
    totals?: Array<Record<string, unknown>>;
    chartType?: string;
}

export type IExtendedRefPointBuckets = IExtendedRefPointBucket[];

export interface IExtendedReferencePointState {
    buckets?: IExtendedRefPointBuckets;
    /** the FILTER BAR's filters, not the SDK's `IFilters` bucket (see the module comment) */
    filters?: ReadonlyArray<IFilter>;
    properties?: IStoredVisualizationProperties;
    uiConfig?: IExtendedRefPointUiConfig;
    availableSorts?: IAvailableSortsGroup[];
}
