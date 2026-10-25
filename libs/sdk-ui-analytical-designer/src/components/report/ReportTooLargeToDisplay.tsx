// (C) 2007-2026 GoodData Corporation

import { type ReactNode, useCallback } from "react";

import cx from "classnames";
import { FormattedMessage, defineMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@gooddata/sdk-ui-kit";

import { selectVisualizationType } from "../../actions/buckets_actions.js";
import { TABLE } from "../../constants/visualization_types.js";
import {
    currentVisualizationTypeSelector,
    visualizationClassesSelector,
} from "../../selectors/report_too_large_to_display_selector.js";
import { getTableVisualizationClass } from "../../services/visualization_class_service.js";
import { toggleFilterDropdown } from "../../store/filter_bar/filter_bar_actions.js";
import { type AppDispatch } from "../../store/types.js";
import { findVisualizationClass, isVisualizationClassDeprecated } from "../../utils/visualization_class.js";

import { ReportMessage } from "./ReportMessage.js";

const linkClass = "gd-button-link adi-canvas-link";

export function ReportTooLargeToDisplay() {
    const dispatch = useDispatch<AppDispatch>();
    const visualizationClasses = useSelector(visualizationClassesSelector);
    const currentVisualizationType = useSelector(currentVisualizationTypeSelector);

    const className = "adi-canvas-message-too-many-data-points s-error-too-many-data-points";
    const visualizationClassTable = findVisualizationClass(visualizationClasses, TABLE);
    const isTableDeprecated = isVisualizationClassDeprecated(visualizationClassTable);
    const isTableEnabled = visualizationClassTable !== null;
    const onSwitchToTableClick = useCallback(
        () => dispatch(selectVisualizationType(getTableVisualizationClass(visualizationClasses))),
        [dispatch, visualizationClasses],
    );
    const onToggleFilterDropdownClick = useCallback(() => dispatch(toggleFilterDropdown()), [dispatch]);

    const chunks = {
        br: <br />,
        a1: (chunk: ReactNode[]) => (
            <Button
                value={chunk}
                className={cx(linkClass, "s-canvas-link-switch")}
                onClick={onSwitchToTableClick}
                tagName="a"
            />
        ),
        a2: (chunk: ReactNode[]) => (
            <Button value={chunk} className={linkClass} onClick={onToggleFilterDropdownClick} tagName="a" />
        ),
        switch: (chunk: ReactNode[]) =>
            // if the rest should not be rendered, render an empty fragment, otherwise just render children
            currentVisualizationType === TABLE || !isTableEnabled ? <></> : <>{chunk}</>,
    };

    return (
        <ReportMessage
            headerMessageId={defineMessage({ id: "dashboard.message.too_large_to_display.header" }).id}
            className={cx(className, "s-report-message-type-too_large_to_display")}
        >
            {isTableDeprecated ? null : (
                <FormattedMessage id="dashboard.message.too_large_to_display.description" values={chunks} />
            )}
        </ReportMessage>
    );
}
