// (C) 2007-2026 GoodData Corporation

import { defineMessage } from "react-intl";
import { createSelector } from "reselect";

import { LOCAL_BAR } from "../constants/visualization_types.js";
import { getMeasures, getVisualizationType } from "../services/buckets_service.js";
import { type IExtendedRefPointBucketsUiConfig } from "../store/reference_point/extended_reference_point_state.js";
import { type IAppState } from "../store/types.js";
import { type IDecoratedBucketItem, type IRawBucketItems } from "../typings/buckets.js";

import { getReferencePointExtendedBucketsUiConfig } from "./ui_config_selector.js";

// ownProps accessors take only the fields they actually read, so a caller composing just one of
// them is not forced to supply the rest.
export interface IBucketOwnProps {
    bucketLocalIdentifier: string;
}

export interface IBucketItemOwnProps {
    bucketItem: IDecoratedBucketItem;
}

export function getBucketLocalIdentifier(_: IAppState, props: IBucketOwnProps): string {
    return props.bucketLocalIdentifier;
}

export function getBucketItemLocalIdentifier(_: IAppState, props: IBucketItemOwnProps): string {
    return props.bucketItem.localIdentifier;
}

export function bucketItemHasShowInPercentEnabled(_: IAppState, props: IBucketItemOwnProps): boolean {
    return !!props.bucketItem.showInPercent;
}

export function bucketItemHasShowOnSecondaryAxisEnabled(_: IAppState, props: IBucketItemOwnProps): boolean {
    return !!props.bucketItem.showOnSecondaryAxis;
}

export function bucketItemHasThresholdEnabled(_: IAppState, props: IBucketItemOwnProps): boolean {
    return !!props.bucketItem.isThresholdMeasure;
}

export function bucketItemHasIsTotalMeasureEnabled(_: IAppState, props: IBucketItemOwnProps): boolean {
    return !!props.bucketItem.isTotalMeasure;
}

export const isATotalMeasureCheckboxSelector = createSelector(
    getReferencePointExtendedBucketsUiConfig,
    getBucketLocalIdentifier,
    bucketItemHasIsTotalMeasureEnabled,
    (
        bucketsUiConfig: IExtendedRefPointBucketsUiConfig | undefined,
        bucketLocalIdentifier: string,
        isTotalMeasureChecked: boolean,
    ) => {
        const defaultResult = {
            isTotalMeasureChecked: false,
            isTotalMeasureVisible: false,
            isTotalMeasureEnabled: false,
        };
        const uiConfig = bucketsUiConfig?.[bucketLocalIdentifier];

        if (!uiConfig) {
            return defaultResult;
        }

        const isTotalMeasureVisible = !!uiConfig?.isTotalMeasureVisible;
        const isTotalMeasureEnabled = isTotalMeasureVisible && !!uiConfig?.isTotalMeasureEnabled;

        return {
            isTotalMeasureVisible,
            isTotalMeasureEnabled,
            isTotalMeasureChecked: isTotalMeasureEnabled && isTotalMeasureChecked,
        };
    },
);

export const isThresholdMeasureSelector = createSelector(
    getReferencePointExtendedBucketsUiConfig,
    getBucketLocalIdentifier,
    bucketItemHasThresholdEnabled,
    getBucketItemLocalIdentifier,
    getMeasures,
    (
        bucketsUiConfig: IExtendedRefPointBucketsUiConfig | undefined,
        bucketLocalIdentifier: string,
        isThresholdEnabled: boolean,
        bucketItemLocalIdentifier: string,
        measureBucketItems: IRawBucketItems,
    ) => {
        const defaultResult = {
            isThresholdMeasureVisible: false,
            isThresholdMeasureDisabled: false,
            isThresholdMeasureChecked: false,
            measuresCount: 0,
        };

        if (!bucketsUiConfig) {
            return defaultResult;
        }

        const bucketUiConfig = bucketsUiConfig?.[bucketLocalIdentifier];
        if (!bucketUiConfig) {
            return defaultResult;
        }

        const isThresholdMeasureVisible = !!bucketUiConfig?.allowThresholdMeasure;

        const thresholdMeasures: string[] = [...(measureBucketItems ?? [])]
            .filter((bucketItem) => !!bucketItem?.isThresholdMeasure)
            .map((bucketItem) => bucketItem?.localIdentifier as string);

        const isSingleMeasure = (measureBucketItems?.length ?? 0) === 1;
        const thresholdIsDefinedOnOtherBucketItem =
            thresholdMeasures.length > 0 && !thresholdMeasures.includes(bucketItemLocalIdentifier);
        const isThresholdMeasureDisabled = thresholdIsDefinedOnOtherBucketItem || isSingleMeasure;

        return {
            isThresholdMeasureVisible,
            isThresholdMeasureDisabled,
            isThresholdMeasureChecked: isThresholdEnabled && !isThresholdMeasureDisabled,
            measuresCount: measureBucketItems?.length ?? 0,
        };
    },
);

export const checkboxesSelector = createSelector(
    getReferencePointExtendedBucketsUiConfig,
    getBucketLocalIdentifier,
    bucketItemHasShowInPercentEnabled,
    bucketItemHasShowOnSecondaryAxisEnabled,
    getVisualizationType,
    (
        bucketsUiConfig: IExtendedRefPointBucketsUiConfig | undefined,
        bucketLocalIdentifier: string,
        showInPercentEnabled: boolean,
        showOnSecondaryAxisEnabled: boolean,
        visualizationType: string,
    ) => {
        const defaultResult = {
            isShowInPercentDisabled: true,
            isShowInPercentVisible: true,
            isShowInPercentChecked: false,
            isShowOnSecondaryAxisVisible: false,
            isShowOnSecondaryAxisChecked: false,
            secondaryAxisCheckboxLabel: "dashboard.bucket_item.show_on_right_axis",
        };

        if (!bucketsUiConfig) {
            return defaultResult;
        }

        const bucketUiConfig = bucketsUiConfig?.[bucketLocalIdentifier];
        if (!bucketUiConfig) {
            return defaultResult;
        }

        const isShowInPercentEnabled = bucketUiConfig?.isShowInPercentEnabled;
        const isShowInPercentVisible = bucketUiConfig?.isShowInPercentVisible;
        const isShowOnSecondaryAxisVisible = bucketUiConfig?.isShowOnSecondaryAxisVisible;
        const secondaryAxisCheckboxLabel =
            visualizationType === LOCAL_BAR
                ? defineMessage({ id: "dashboard.bucket_item.show_on_top_axis" }).id
                : defineMessage({ id: "dashboard.bucket_item.show_on_right_axis" }).id;

        return {
            isShowInPercentDisabled: !isShowInPercentEnabled,
            isShowInPercentVisible: !!isShowInPercentVisible,
            isShowInPercentChecked: showInPercentEnabled,
            isShowOnSecondaryAxisVisible: !!isShowOnSecondaryAxisVisible,
            isShowOnSecondaryAxisChecked: showOnSecondaryAxisEnabled,
            secondaryAxisCheckboxLabel,
        };
    },
);
