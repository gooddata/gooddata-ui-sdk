// (C) 2007-2026 GoodData Corporation

import { useCallback } from "react";

import classNames from "classnames";
import { FormattedMessage, defineMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { Bubble, BubbleHoverTrigger, EditableLabel } from "@gooddata/sdk-ui-kit";

import { reportTitleChange } from "../actions/report_actions.js";
import { MAX_TITLE_LENGTH } from "../constants/report.js";
import { reportTitleSelector } from "../selectors/report_title_selector.js";
import { type AppDispatch } from "../store/types.js";

import { InsightAccess } from "./header/share/InsightAccess.js";
import { InsightUsageOnDashboards } from "./InsightUsageOnDashboards.js";
import { ReportDescription } from "./ReportDescription.js";

export function ReportTitle() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();

    const { currentTitle, isTitleDefined, isReportLocked, isEnabledUsages, isSaveDisabled, canEditTitle } =
        useSelector(reportTitleSelector);

    const onTitleChange = useCallback(
        (title: string) => {
            dispatch(reportTitleChange(title));
        },
        [dispatch],
    );

    const getEditableLabelClassNames = () => {
        return classNames({
            "has-defined-title": isTitleDefined,
            "report-title": true,
            "s-report-title": true,
        });
    };

    const renderLockIcon = () => {
        if (isReportLocked) {
            // TODO: TIGER-HACK - inherited insights are locked and cannot be edited; we need to give slightly different tooltip.
            return (
                <BubbleHoverTrigger className="gd-icon-lock-wrapper" showDelay={0} hideDelay={0}>
                    <i className="gd-icon-lock" />
                    <Bubble className="bubble-primary" alignPoints={[{ align: "bc tl" }]}>
                        <FormattedMessage id={defineMessage({ id: "inherited_report" }).id} />
                    </Bubble>
                </BubbleHoverTrigger>
            );
        }

        return null;
    };

    const renderLabel = () => {
        if (!canEditTitle) {
            return <span className="report-title report-title-locked s-report-title">{currentTitle}</span>;
        }

        return (
            <EditableLabel
                textareaInOverlay={false}
                value={currentTitle}
                maxLength={MAX_TITLE_LENGTH}
                maxRows={1}
                onSubmit={onTitleChange}
                className={getEditableLabelClassNames()}
                placeholder={intl.formatMessage({
                    id: "dialogs.savingUntitledReportConfirmation.placeholder",
                })}
                isEditableLabelWidthDynamic
            />
        );
    };

    const renderUnsavedChangesIcon = () => {
        if (!isSaveDisabled) {
            return (
                <BubbleHoverTrigger>
                    <i className="gd-icon-circle unsaved-notification" />
                    <Bubble
                        className="bubble-primary"
                        alignPoints={[{ align: "bc tl", offset: { x: 0, y: 0 } }]}
                    >
                        {intl.formatMessage({ id: "unsaved_changes" })}
                    </Bubble>
                </BubbleHoverTrigger>
            );
        }
        return null;
    };

    const animationClass = isSaveDisabled ? "" : "move-right-animation";
    return (
        <div className="report-title-wrapper">
            {renderLockIcon()}
            {renderUnsavedChangesIcon()}
            <div className={animationClass}>
                {renderLabel()}
                <ReportDescription />
                <InsightAccess />
                {isEnabledUsages ? <InsightUsageOnDashboards /> : null}
            </div>
        </div>
    );
}
