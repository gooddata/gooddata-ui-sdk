// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { withUiConfig } from "../tests/extended_reference_point_builder.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type IDecoratedBucketItem } from "../typings/buckets.js";

import {
    bucketItemHasShowInPercentEnabled,
    checkboxesSelector,
    getBucketLocalIdentifier,
    isATotalMeasureCheckboxSelector,
} from "./configuration_checkboxes_selector.js";

describe("configurationCheckboxesSelector", () => {
    const defaultProps = {
        bucketItem: {
            original: {
                localIdentifier: "6ej3u8fj",
            },
        } as IDecoratedBucketItem,
        bucketLocalIdentifier: "measures",
    };

    describe("getBucketLocalIdentifier", () => {
        it("should find in props bucketLocalIdentifier", () => {
            const bucketLocalIdentifier = getBucketLocalIdentifier(null, defaultProps);
            expect(bucketLocalIdentifier).toEqual(defaultProps.bucketLocalIdentifier);
        });
    });

    describe("bucketItemHasShowInPercentEnabled", () => {
        it("should return true when showInPercent is enabled on bucket item", () => {
            const props = {
                bucketItem: {
                    showInPercent: true,
                } as IDecoratedBucketItem,
            };

            const hasShowInPercentEnabled = bucketItemHasShowInPercentEnabled(null, props);
            expect(hasShowInPercentEnabled).toEqual(true);
        });

        it("should return false if showInPercent is not present in bucket item", () => {
            const hasShowInPercentEnabled = bucketItemHasShowInPercentEnabled(null, defaultProps);
            expect(hasShowInPercentEnabled).toEqual(false);
        });
    });

    describe("showInPercent flags", () => {
        it("should return default values if ui config is not present", () => {
            const selectedProps = checkboxesSelector(getInitializedState(), defaultProps);

            expect(selectedProps).toEqual({
                isShowInPercentVisible: true,
                isShowInPercentDisabled: true,
                isShowInPercentChecked: false,
                isShowOnSecondaryAxisVisible: false,
                isShowOnSecondaryAxisChecked: false,
                secondaryAxisCheckboxLabel: "dashboard.bucket_item.show_on_right_axis",
            });
        });

        it("should return default values if ui config does not contain expected properties", () => {
            const uiBuckets = {};
            const state = withData(getInitializedState(), {
                extendedReferencePoint: withUiConfig(getInitializedState().data.extendedReferencePoint, {
                    buckets: uiBuckets,
                }),
            });

            const selectedProps = checkboxesSelector(state, defaultProps);

            expect(selectedProps).toEqual({
                isShowInPercentVisible: true,
                isShowInPercentDisabled: true,
                isShowInPercentChecked: false,
                isShowOnSecondaryAxisVisible: false,
                isShowOnSecondaryAxisChecked: false,
                secondaryAxisCheckboxLabel: "dashboard.bucket_item.show_on_right_axis",
            });
        });

        it("should reflect the show in percent flags from ui config", () => {
            const uiBuckets = {
                measures: {
                    isShowInPercentVisible: false,
                    isShowInPercentEnabled: true,
                },
            };
            const state = withData(getInitializedState(), {
                extendedReferencePoint: withUiConfig(getInitializedState().data.extendedReferencePoint, {
                    buckets: uiBuckets,
                }),
            });

            const selectedProps = checkboxesSelector(state, defaultProps);

            expect(selectedProps).toEqual({
                isShowInPercentVisible: false,
                isShowInPercentDisabled: false,
                isShowInPercentChecked: false,
                isShowOnSecondaryAxisVisible: false,
                isShowOnSecondaryAxisChecked: false,
                secondaryAxisCheckboxLabel: "dashboard.bucket_item.show_on_right_axis",
            });
        });

        it("should return isShowInPercentChecked: true if the bucket item has the show in percent flag set", () => {
            const uiBuckets = { measures: {} };
            const state = withData(getInitializedState(), {
                extendedReferencePoint: withUiConfig(getInitializedState().data.extendedReferencePoint, {
                    buckets: uiBuckets,
                }),
            });

            const props = {
                bucketItem: {
                    showInPercent: true,
                    original: {},
                } as IDecoratedBucketItem,
                bucketLocalIdentifier: "measures",
            };

            const selectedProps = checkboxesSelector(state, props);

            expect(selectedProps).toMatchObject({
                isShowInPercentChecked: true,
            });
        });
    });

    describe("showOnSecondaryAxis", () => {
        it("should reflect the show on secondary axis flag from ui config", () => {
            const uiBuckets = {
                measures: {
                    isShowOnSecondaryAxisVisible: true,
                },
            };
            const state = withData(getInitializedState(), {
                extendedReferencePoint: withUiConfig(getInitializedState().data.extendedReferencePoint, {
                    buckets: uiBuckets,
                }),
            });
            const selectedProps = checkboxesSelector(state, defaultProps);

            expect(selectedProps).toMatchObject({
                isShowOnSecondaryAxisVisible: true,
            });
        });

        it("should return isShowOnSecondaryAxisChecked:true if bucket item is set to show on secondary axis", () => {
            const props = {
                bucketItem: {
                    showOnSecondaryAxis: true,
                } as IDecoratedBucketItem,
                bucketLocalIdentifier: "measures",
            };
            const uiBuckets = { measures: {} };
            const state = withData(getInitializedState(), {
                extendedReferencePoint: withUiConfig(getInitializedState().data.extendedReferencePoint, {
                    buckets: uiBuckets,
                }),
            });

            const selectedProps = checkboxesSelector(state, props);

            expect(selectedProps).toMatchObject({
                isShowOnSecondaryAxisChecked: true,
            });
        });
    });

    describe("isATotalMeasureCheckboxSelector", () => {
        it("should reflect the show 'is a total' checkbox from ui config", () => {
            const uiBuckets = {
                measures: {
                    isTotalMeasureVisible: true,
                },
            };
            const state = withData(getInitializedState(), {
                extendedReferencePoint: withUiConfig(getInitializedState().data.extendedReferencePoint, {
                    buckets: uiBuckets,
                }),
            });
            const selectedProps = isATotalMeasureCheckboxSelector(state, defaultProps);

            expect(selectedProps).toMatchObject({
                isTotalMeasureVisible: true,
            });
        });

        it("should return isTotalMeasureChecked:true if bucket item is set a total measure", () => {
            const props = {
                bucketItem: {
                    isTotalMeasure: true,
                } as IDecoratedBucketItem,
                bucketLocalIdentifier: "measures",
            };
            const uiBuckets = {
                measures: {
                    isTotalMeasureVisible: true,
                    isTotalMeasureEnabled: true,
                },
            };
            const state = withData(getInitializedState(), {
                extendedReferencePoint: withUiConfig(getInitializedState().data.extendedReferencePoint, {
                    buckets: uiBuckets,
                }),
            });

            const selectedProps = isATotalMeasureCheckboxSelector(state, props);

            expect(selectedProps).toMatchObject({
                isTotalMeasureChecked: true,
            });
        });
    });
});
