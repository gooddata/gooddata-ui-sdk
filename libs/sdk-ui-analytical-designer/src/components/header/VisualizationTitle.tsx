// (C) 2007-2026 GoodData Corporation

import { useMemo } from "react";

import classNames from "classnames";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { EditableLabel } from "@gooddata/sdk-ui-kit";

import { reportTitleChange } from "../../actions/report_actions.js";
import { MAX_TITLE_LENGTH } from "../../constants/report.js";
import {
    type IAnalyticalDesignerHeaderContext,
    type IAnalyticalDesignerVisualizationTitleProps,
} from "../../embedding/editorHeaderSlotTypes.js";
import { reportTitleSelector } from "../../selectors/report_title_selector.js";
import { type AppDispatch, type IAppState } from "../../store/types.js";

import { useGuardedCallback } from "./editorHeaderContext.js";

const canEditTitle = (state: IAppState) => reportTitleSelector(state).canEditTitle;
const runTitleChange = (dispatch: AppDispatch, _state: IAppState, title: string) =>
    dispatch(reportTitleChange(title));

export function useVisualizationTitleProps(
    context: IAnalyticalDesignerHeaderContext,
): IAnalyticalDesignerVisualizationTitleProps {
    const intl = useIntl();
    const { isReportLocked, canEditTitle: isEditable } = useSelector(reportTitleSelector);
    const onTitleChange = useGuardedCallback<[string]>(canEditTitle, runTitleChange);
    const placeholder = intl.formatMessage({ id: "dialogs.savingUntitledReportConfirmation.placeholder" });

    return useMemo(
        () => ({
            ...context,
            placeholder,
            maxLength: MAX_TITLE_LENGTH,
            isEditable,
            isLocked: isReportLocked,
            onTitleChange,
        }),
        [context, placeholder, isEditable, isReportLocked, onTitleChange],
    );
}

/**
 * Default of the VisualizationTitle slot: an editable label, or plain text when the title cannot change.
 */
export function DefaultVisualizationTitle({
    title,
    placeholder,
    maxLength,
    isEditable,
    onTitleChange,
}: IAnalyticalDesignerVisualizationTitleProps) {
    if (!isEditable) {
        return <span className="report-title report-title-locked s-report-title">{title}</span>;
    }

    return (
        <EditableLabel
            textareaInOverlay={false}
            value={title}
            maxLength={maxLength}
            maxRows={1}
            onSubmit={onTitleChange}
            className={classNames("report-title", "s-report-title", { "has-defined-title": title !== "" })}
            placeholder={placeholder}
            isEditableLabelWidthDynamic
        />
    );
}
