// (C) 2007-2026 GoodData Corporation

import { type MouseEvent, type ReactElement, memo, useCallback, useMemo, useRef } from "react";

import classNames from "classnames";
import { useIntl } from "react-intl";
import { connect } from "react-redux";

import { EditableLabel, ShortenedText } from "@gooddata/sdk-ui-kit";

import {
    setBucketItemTitle,
    setRenamingBucketItemEnded,
    setRenamingBucketItemStarted,
} from "../../actions/buckets_actions.js";
import { getOperandLocalIdentifiers, isArithmeticMeasure, isDerived } from "../../models/bucket_item.js";
import { DecoratedDateFilter } from "../../models/date_filter.js";
import { DecoratedMetricAttributeFilter } from "../../models/decorated_metric_attribute_filter.js";
import { selectMeasureBucketItemHeader } from "../../selectors/measure_bucket_item_header_selector.js";
import { type IAppState } from "../../store/types.js";
import { type IDecoratedBucketItem, type IRawBucketItem } from "../../typings/buckets.js";
import {
    type IDecoratedMetricFilters,
    isDecoratedDateFilter,
    isDecoratedMetricAttributeFilter,
} from "../../typings/measure_filters.js";
import { shortenText } from "../../utils/base.js";

export interface IMeasureBucketItemHeaderOwnProps {
    bucketItem: IDecoratedBucketItem;
    filters: IDecoratedMetricFilters;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    isDraggedItem?: boolean;
    formatLocale?: string;
}

export interface IMeasureBucketItemHeaderStateProps {
    isRenamingBucketItem: boolean;
    measureSequenceNumbers: {
        [key: string]: number;
    };
}

export interface IMeasureBucketItemHeaderDispatchProps {
    onBucketItemRename: (localIdentifier: string, title: string) => void;
    renamingBucketItemStarted: () => void;
    renamingBucketItemEnded: () => void;
}

export interface IMeasureBucketItemHeaderProps
    extends
        IMeasureBucketItemHeaderStateProps,
        IMeasureBucketItemHeaderDispatchProps,
        IMeasureBucketItemHeaderOwnProps {}

export const MeasureBucketItemHeaderBase = memo(function MeasureBucketItemHeaderBase({
    bucketItem,
    isRenamingBucketItem = false,
    isDraggedItem = false,
    measureSequenceNumbers,
    onBucketItemRename,
    renamingBucketItemStarted,
    renamingBucketItemEnded,
    onToggleCollapse,
    formatLocale,
}: IMeasureBucketItemHeaderProps): ReactElement {
    const intl = useIntl();

    const editableLabelRef = useRef<HTMLDivElement>(null);

    const bucketItemFilters = useMemo(() => {
        return bucketItem.filters;
    }, [bucketItem]);

    const filtersText = useMemo((): string => {
        const dateFilterTitle = bucketItemFilters
            .filter(isDecoratedDateFilter)
            .map((filter) => DecoratedDateFilter.getTitle(filter, intl, formatLocale));
        const attributeFiltersTitles = bucketItemFilters
            .filter(isDecoratedMetricAttributeFilter)
            .map((filter) => DecoratedMetricAttributeFilter.getTitle(filter, intl));

        return dateFilterTitle.concat(attributeFiltersTitles).join("; ");
    }, [bucketItemFilters, intl, formatLocale]);

    const localizedMasterMeasureSequenceNumber = useMemo((): string | null => {
        const originalBucketItem: IRawBucketItem = bucketItem.original as IRawBucketItem;

        if (!isDerived(originalBucketItem)) {
            return null;
        }

        const masterMeasureLocalIdentifier = originalBucketItem?.masterLocalIdentifier;
        const masterMeasureSequenceNumber = measureSequenceNumbers[masterMeasureLocalIdentifier];
        if (masterMeasureSequenceNumber === undefined) {
            return null;
        }

        return intl.formatMessage(
            { id: "bucket.subtitle.masterMeasureSequenceNumber" },
            { masterMeasureSequenceNumber },
        );
    }, [bucketItem, measureSequenceNumbers, intl]);

    const localizedOperandsSequenceNumber = useMemo((): string | null => {
        const originalBucketItem: IRawBucketItem = bucketItem.original as IRawBucketItem;

        if (!isArithmeticMeasure(originalBucketItem)) {
            return null;
        }

        const operandSequenceNumbers = getOperandLocalIdentifiers(originalBucketItem)
            .filter((operandLocalIdentifier: string) => operandLocalIdentifier !== null)
            .map((operandLocalIdentifier: string) => measureSequenceNumbers[operandLocalIdentifier]);

        const [firstOperandMeasureSequenceNumber, secondOperandMeasureSequenceNumber] =
            operandSequenceNumbers;

        if (operandSequenceNumbers.length === 1) {
            return intl.formatMessage(
                { id: "bucket.subtitle.singleOperandSequenceNumber" },
                { operandMeasureSequenceNumber: firstOperandMeasureSequenceNumber },
            );
        }

        if (operandSequenceNumbers.length === 2) {
            return intl.formatMessage(
                { id: "bucket.subtitle.twoOperandsSequenceNumber" },
                { firstOperandMeasureSequenceNumber, secondOperandMeasureSequenceNumber },
            );
        }

        return null;
    }, [bucketItem, measureSequenceNumbers, intl]);

    const subtitle = useMemo((): ReactElement | null => {
        const title = bucketItem.measureTitle;
        const alias = bucketItem.alias;

        let subtitleText = "";

        if (localizedMasterMeasureSequenceNumber !== null) {
            subtitleText += `${localizedMasterMeasureSequenceNumber} `;
        }

        if (localizedOperandsSequenceNumber) {
            subtitleText += `${localizedOperandsSequenceNumber} `;
        }

        if (alias) {
            subtitleText += title;
        }

        if (bucketItemFilters.length) {
            if (alias) {
                subtitleText += ": ";
            }

            subtitleText += filtersText;
        }

        if (subtitleText) {
            const subtitleClassNames = classNames("adi-bucket-item-sub-header", "s-bucket-item-sub-header");

            return (
                <div className={subtitleClassNames}>
                    <ShortenedText displayTooltip={!isDraggedItem}>{subtitleText}</ShortenedText>
                </div>
            );
        }

        return null;
    }, [
        bucketItem,
        isDraggedItem,
        bucketItemFilters,
        filtersText,
        localizedMasterMeasureSequenceNumber,
        localizedOperandsSequenceNumber,
    ]);

    const sequenceNumber = useMemo((): ReactElement | null => {
        const measureSequenceNumber = measureSequenceNumbers[bucketItem.localIdentifier];
        if (measureSequenceNumber === undefined) {
            return null;
        }

        const elementClassNames = classNames(
            "adi-bucket-item-sequence-number",
            "s-bucket-item-sequence-number",
        );
        return (
            <div className={elementClassNames}>
                {intl.formatMessage({ id: "bucket.title.measureSequenceNumber" }, { measureSequenceNumber })}
            </div>
        );
    }, [measureSequenceNumbers, bucketItem.localIdentifier, intl]);

    const handleBucketItemRename = useCallback(
        (title: string) => {
            renamingBucketItemEnded();
            onBucketItemRename(bucketItem.localIdentifier, title);

            // when empty title is submitted, app state is not changed,
            // but it is needed to redraw so that original title reappears
            // Note: forceUpdate is not available in functional components
            // The component will re-render through state changes from renamingBucketItemEnded
        },
        [bucketItem, onBucketItemRename, renamingBucketItemEnded],
    );

    const titleElement = useMemo((): ReactElement => {
        const shortenedLabel = shortenText(bucketItem.label, { maxLength: 50 });

        return (
            <EditableLabel
                value={shortenedLabel}
                placeholder={bucketItem.measureTitle}
                maxLength={50}
                maxRows={1}
                className="s-title measure-item-editable-label"
                onSubmit={handleBucketItemRename}
                onEditingStart={renamingBucketItemStarted}
                onCancel={renamingBucketItemEnded}
                ref={editableLabelRef}
            />
        );
    }, [bucketItem, handleBucketItemRename, renamingBucketItemStarted, renamingBucketItemEnded]);

    const headerClassNames = useMemo((): string => {
        const isCollapsed = bucketItem.collapsed;
        const isMasterMeasure = !isDerived(bucketItem.original as IRawBucketItem);

        return classNames("adi-bucket-item-header", "s-bucket-item-header", "s-bucket-measure-item-header", {
            expanded: !isCollapsed && isMasterMeasure,
            collapsed: isCollapsed && isMasterMeasure,
            renaming: isRenamingBucketItem,
        });
    }, [bucketItem, isRenamingBucketItem]);

    const handleHeaderClick = useCallback(
        (e: MouseEvent<HTMLElement>): void => {
            const isMasterMeasure = !isDerived(bucketItem.original as IRawBucketItem);

            // clicking on editable label should not collapse/uncollapse the bucket item
            const isClickedOutsideEditableLabel = !editableLabelRef?.current?.contains(e.target as Node);
            if (isClickedOutsideEditableLabel && isMasterMeasure && !isRenamingBucketItem) {
                onToggleCollapse();
            }
        },
        [bucketItem, onToggleCollapse, isRenamingBucketItem],
    );

    return (
        <div className={headerClassNames} onClick={handleHeaderClick}>
            {sequenceNumber}
            {titleElement}
            {subtitle}
            <div className="adi-bucket-invitation-inner">
                <span>{intl.formatMessage({ id: "dashboard.bucket_item.drop_to_switch" })}</span>
            </div>
        </div>
    );
});

const mapDispatchToProps: IMeasureBucketItemHeaderDispatchProps = {
    onBucketItemRename: setBucketItemTitle,
    renamingBucketItemStarted: setRenamingBucketItemStarted,
    renamingBucketItemEnded: setRenamingBucketItemEnded,
};

export const MeasureBucketItemHeader = connect<
    IMeasureBucketItemHeaderStateProps,
    IMeasureBucketItemHeaderDispatchProps,
    IMeasureBucketItemHeaderOwnProps,
    IAppState
>(
    selectMeasureBucketItemHeader,
    mapDispatchToProps,
)(MeasureBucketItemHeaderBase);
