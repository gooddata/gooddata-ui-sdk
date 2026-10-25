// (C) 2025-2026 GoodData Corporation

import { type ReactNode, useCallback, useState } from "react";

import { FormattedMessage, type IntlShape, defineMessage, useIntl } from "react-intl";
import { useDispatch } from "react-redux";
import { createSelector } from "reselect";

import { type IDataTooLargeResponseBodyLimitBreak } from "@gooddata/sdk-backend-spi";
import { Button } from "@gooddata/sdk-ui-kit";

import { type IShowAddMessagePayload, addMessage } from "../../../actions/messages_actions.js";
import { COMPACT_FORMATTING_OPTIONS } from "../../../constants/formats.js";
import { TABLE } from "../../../constants/visualization_types.js";
import { canManageProject as canManageProjectSelector } from "../../../selectors/permissions_selector.js";
import { getExecutionErrorResponseData } from "../../../selectors/report_selector.js";
import { VisualizationPropertiesSelectors } from "../../../selectors/visualization_properties_selector.js";
import { getVisualizationClassTypeFromState } from "../../../services/visualization_class_service.js";
import { toggleFilterDropdown } from "../../../store/filter_bar/filter_bar_actions.js";
import { useAppSelector } from "../../../store/hooks.js";
import { type AppDispatch } from "../../../store/types.js";
import { ErrorRawDataArea } from "../ErrorRawDataArea.js";
import { ReportMessage } from "../ReportMessage.js";
import { TraceIdMessage } from "../TraceIdMessage.js";

import { type CrosstabulationLimitType } from "./types.js";

/**
 * Mapping type that ensures that there is a value for each existing limit type in compile time.
 */
type LimitBreakMapping<TValue> = { [T in CrosstabulationLimitType]: TValue };

/**
 * Bit flags for the individual limit breaks.
 * This allows us to combine multiple limits and represent the combinations efficiently.
 */
const limitBreakTypeFlags: LimitBreakMapping<number> = {
    "xtab-rows": 1 << 2,
    "xtab-columns": 1 << 1,
    "xtab-cells": 1 << 0,
};

/**
 * Bit flags for the individual limit breaks to use when we need to transpose the results.
 * This allows us to combine multiple limits and represent the combinations efficiently.
 */
const transposedLimitBreakTypeFlags: LimitBreakMapping<number> = {
    // notice the rows and columns positions are flipped compared to the limitBreakTypeFlags
    "xtab-rows": limitBreakTypeFlags["xtab-columns"],
    "xtab-columns": limitBreakTypeFlags["xtab-rows"],
    "xtab-cells": limitBreakTypeFlags["xtab-cells"],
};

/**
 * Placeholder names used for the individual types of limits.
 * These correspond to the placeholders used by the description messages as defined in the localization messages.
 */
const limitBreakTypeLocalizationValuesNames: LimitBreakMapping<[limit: string, overflow: string]> = {
    "xtab-rows": ["rowLimit", "rowOverflow"],
    "xtab-columns": ["columnLimit", "columnOverflow"],
    "xtab-cells": ["cellLimit", "cellOverflow"],
};

/**
 * Placeholder names used for the individual types of limits to use when we need to transpose the results.
 * These correspond to the placeholders used by the description messages as defined in the localization messages.
 */
const transposedLimitBreakTypeLocalizationValuesNames: LimitBreakMapping<[limit: string, overflow: string]> =
    {
        // notice the rows and columns values are flipped compared to the limitBreakTypeLocalizationValuesNames
        "xtab-rows": limitBreakTypeLocalizationValuesNames["xtab-columns"],
        "xtab-columns": limitBreakTypeLocalizationValuesNames["xtab-rows"],
        "xtab-cells": limitBreakTypeLocalizationValuesNames["xtab-cells"],
    };

/**
 * Mapping of all the different combinations of limits broken to the correct header message id.
 * The index corresponds to the bit mask of all the limits broken.
 *
 * @see limitBreakTypeFlags
 */
const limitBreakHeaderMessageIdMap = [
    // default to the original non-specific message in case no limits are sent by the backend
    defineMessage({ id: "dashboard.message.too_large_to_compute.header" }).id,
    defineMessage({ id: "dashboard.message.too_large_to_compute.cells_header" }).id,
    defineMessage({ id: "dashboard.message.too_large_to_compute.columns_header" }).id,
    defineMessage({ id: "dashboard.message.too_large_to_compute.columns_cells_header" }).id,
    defineMessage({ id: "dashboard.message.too_large_to_compute.rows_header" }).id,
    defineMessage({ id: "dashboard.message.too_large_to_compute.rows_cells_header" }).id,
    defineMessage({ id: "dashboard.message.too_large_to_compute.rows_columns_header" }).id,
    defineMessage({ id: "dashboard.message.too_large_to_compute.rows_columns_cells_header" }).id,
];

/**
 * Mapping of all the different combinations of limits broken to the correct description message id.
 * The index corresponds to the bit mask of all the limits broken.
 *
 * @see limitBreakTypeFlags
 */
const limitBreakDescriptionMessageIdMap = [
    // default to the original non-specific message in case no limits are sent by the backend
    defineMessage({ id: "dashboard.message.too_large_to_compute.description" }).id,
    defineMessage({ id: "dashboard.message.too_large_to_compute.cells_description" }).id,
    defineMessage({ id: "dashboard.message.too_large_to_compute.columns_description" }).id,
    defineMessage({ id: "dashboard.message.too_large_to_compute.columns_cells_description" }).id,
    defineMessage({ id: "dashboard.message.too_large_to_compute.rows_description" }).id,
    defineMessage({ id: "dashboard.message.too_large_to_compute.rows_cells_description" }).id,
    defineMessage({ id: "dashboard.message.too_large_to_compute.rows_columns_description" }).id,
    defineMessage({ id: "dashboard.message.too_large_to_compute.rows_columns_cells_description" }).id,
];

/**
 * Collects all the limit types that are broken as a bit mask.
 *
 * @param limitBreaks - the descriptions of the individual limits being broken
 * @param shouldTranspose - if true, handle columns as rows and vice versa
 */
function getLimitBreakBitFlags(
    limitBreaks: IDataTooLargeResponseBodyLimitBreak<CrosstabulationLimitType>[],
    shouldTranspose: boolean,
): number {
    const flagCollection = shouldTranspose ? transposedLimitBreakTypeFlags : limitBreakTypeFlags;
    return limitBreaks.reduce((flags, limitBreak) => flags | flagCollection[limitBreak.limitType], 0);
}

/**
 * Formats the number to a human-readable format like 123K and so on. Respects the locale.
 */
function formatNumber(n: number, intl: IntlShape): string {
    return intl.formatNumber(n, COMPACT_FORMATTING_OPTIONS);
}

/**
 * Given an intl object and a list of limit breaks, returns an object with all the necessary placeholder values for
 * a description message.
 *
 * @param intl - the object that can format numbers in a locale-aware manner
 * @param limitBreaks - the descriptions of the individual limits being broken
 * @param shouldTranspose - if true, handle columns as rows and vice versa
 */
function getLimitBreakDescriptionValues(
    intl: IntlShape,
    limitBreaks: IDataTooLargeResponseBodyLimitBreak<CrosstabulationLimitType>[],
    shouldTranspose: boolean,
): Record<string, string> {
    const nameMapping = shouldTranspose
        ? transposedLimitBreakTypeLocalizationValuesNames
        : limitBreakTypeLocalizationValuesNames;

    return limitBreaks.reduce(
        (formattedValues, limitBreak) => {
            const [limitName, overflowName] = nameMapping[limitBreak.limitType];

            formattedValues[limitName] = formatNumber(limitBreak.limit, intl);
            formattedValues[overflowName] = formatNumber(limitBreak.actualValue - limitBreak.limit, intl);

            return formattedValues;
        },
        {} as Record<string, string>,
    );
}

interface IReportTooLargeToCrosstabulateProps {
    limitBreaks: IDataTooLargeResponseBodyLimitBreak<CrosstabulationLimitType>[];
}

/**
 * Returns true if the visualization has the non-default measure placement.
 * This means that we need to flip all the column and row related messages.
 */
const isTransposedSelector = createSelector(
    VisualizationPropertiesSelectors.getExtendedReferencePointPropertiesControls,
    (controls) => controls?.["measureGroupDimension"] === "rows",
);

/**
 * Displays the information about how exactly the report violated (potentially multiple) crosstabulation size limits.
 *
 * The logic is a bit involved because the three different limit types can happen at the same time in any combination,
 * and the UX differs based on that:
 * - some situations can be handled by transposition, some cannot (and the transposition is not always available)
 * - some can be solved by filters, some cannot
 */
export function ReportTooLargeToCrosstabulate({ limitBreaks }: IReportTooLargeToCrosstabulateProps) {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();

    const errorResponseData = useAppSelector(getExecutionErrorResponseData);
    const canManageProject = useAppSelector(canManageProjectSelector);
    const currentVisualizationType = useAppSelector(getVisualizationClassTypeFromState);
    const isTransposed = useAppSelector(isTransposedSelector);

    const onToggleFilterDropdown = useCallback(() => {
        dispatch(toggleFilterDropdown());
    }, [dispatch]);

    const showToastMessage = useCallback(
        (payload: IShowAddMessagePayload) => {
            dispatch(addMessage(payload));
        },
        [dispatch],
    );

    const [shouldShowErrorRawData, setShowErrorRawData] = useState(false);
    const showErrorRawDataArea = useCallback(() => setShowErrorRawData(true), [setShowErrorRawData]);

    const flags = getLimitBreakBitFlags(limitBreaks, isTransposed);

    // the transposition only makes sense if we are in the table visualization
    // and the only limit broken is the smaller dimension, otherwise, transposition would not help.
    // same goes for cell limit: transposition will not make the cell count go down
    const onlySmallerDimensionBroken = isTransposed
        ? flags == limitBreakTypeFlags["xtab-rows"]
        : flags == limitBreakTypeFlags["xtab-columns"];
    const canTranspose = currentVisualizationType == TABLE && onlySmallerDimensionBroken;

    return (
        <ReportMessage
            headerMessageId={limitBreakHeaderMessageIdMap[flags]}
            className="s-error-too-large s-report-message-type-too_large_to_compute"
        >
            <FormattedMessage
                id={limitBreakDescriptionMessageIdMap[flags]}
                values={{
                    br: <br />,
                    a2: (chunk: ReactNode[]) => (
                        <Button
                            value={chunk}
                            className="gd-button-link adi-canvas-link"
                            onClick={onToggleFilterDropdown}
                            tagName="a"
                        />
                    ),
                    ...getLimitBreakDescriptionValues(intl, limitBreaks, isTransposed),
                }}
            />
            <br />
            <FormattedMessage
                id={
                    canTranspose
                        ? defineMessage({
                              id: "dashboard.message.too_large_to_compute.transpose_call_to_action",
                          }).id
                        : defineMessage({
                              id: "dashboard.message.too_large_to_compute.filter_call_to_action",
                          }).id
                }
            />
            {canManageProject && !shouldShowErrorRawData ? (
                <>
                    <br />
                    <Button
                        value={intl.formatMessage(
                            defineMessage({ id: "dashboard.message.too_large_to_compute.see_raw_error" }),
                        )}
                        className="gd-button-link adi-canvas-link s-error-raw-data-link"
                        onClick={showErrorRawDataArea}
                        tagName="a"
                    />
                </>
            ) : null}
            {shouldShowErrorRawData ? <ErrorRawDataArea errorRawData={errorResponseData?.rawData} /> : null}
            {errorResponseData?.traceId ? (
                <TraceIdMessage
                    traceId={errorResponseData.traceId}
                    canManageProject={canManageProject}
                    showToastMessage={showToastMessage}
                />
            ) : null}
        </ReportMessage>
    );
}
