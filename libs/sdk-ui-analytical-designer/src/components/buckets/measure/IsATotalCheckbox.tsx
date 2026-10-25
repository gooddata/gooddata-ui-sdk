// (C) 2023-2026 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";
import { connect } from "react-redux";

import { BucketNames } from "@gooddata/sdk-ui";

import { setBucketItemIsTotalMeasure } from "../../../actions/buckets_actions.js";
import { isATotalMeasureCheckboxSelector } from "../../../selectors/configuration_checkboxes_selector.js";
import { getDecoratedMeasures } from "../../../services/decorated_buckets_service.js";
import { type IAppState } from "../../../store/types.js";
import { type IDecoratedBucketItem } from "../../../typings/buckets.js";

import { ConfigurationCheckbox } from "./ConfigurationCheckbox.js";

export interface IIsATotalCheckboxStateProps {
    isTotalMeasureChecked: boolean;
    isTotalMeasureVisible: boolean;
    isTotalMeasureEnabled: boolean;
}

export interface IIsATotalCheckboxDispatchProps {
    onIsATotalMeasureChange: (localIdentifier: string, value: boolean) => void;
}
export interface IIsATotalCheckboxOwnProps {
    localIdentifier: string;
    bucketItem?: IDecoratedBucketItem;
}
export type IIsATotalCheckboxProps = IIsATotalCheckboxOwnProps &
    IIsATotalCheckboxStateProps &
    IIsATotalCheckboxDispatchProps;

const mapStateToProps = (state: IAppState, props: IIsATotalCheckboxOwnProps) => {
    const bucketItem =
        props.bucketItem ||
        getDecoratedMeasures(state).find(
            (measure: IDecoratedBucketItem) => measure.localIdentifier === props.localIdentifier,
        );

    return isATotalMeasureCheckboxSelector(state, {
        ...props,
        bucketItem,
        bucketLocalIdentifier: BucketNames.MEASURES,
    });
};

const mapDispatchToProps: IIsATotalCheckboxDispatchProps = {
    onIsATotalMeasureChange: setBucketItemIsTotalMeasure,
};

export function IsATotalCheckboxBase({
    isTotalMeasureVisible,
    isTotalMeasureEnabled,
    isTotalMeasureChecked,
    localIdentifier,
    onIsATotalMeasureChange,
}: IIsATotalCheckboxProps) {
    const intl = useIntl();

    const onIsATotalMeasureChangeHandler = useCallback(
        (value: boolean) => {
            onIsATotalMeasureChange(localIdentifier, value);
        },
        [onIsATotalMeasureChange, localIdentifier],
    );

    if (!isTotalMeasureVisible) {
        return null;
    }

    return (
        <section className="adi-is-a-total-measure">
            <ConfigurationCheckbox
                disabled={!isTotalMeasureEnabled}
                checked={isTotalMeasureChecked}
                onChange={onIsATotalMeasureChangeHandler}
                label={intl.formatMessage({
                    id: "dashboard.bucket_item.is_a_total",
                })}
                name="is-a-total-measure"
            />
        </section>
    );
}

export const IsATotalCheckbox = connect<
    IIsATotalCheckboxStateProps,
    IIsATotalCheckboxDispatchProps,
    IIsATotalCheckboxOwnProps,
    IAppState
>(
    mapStateToProps,
    mapDispatchToProps,
)(IsATotalCheckboxBase);
