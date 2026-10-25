// (C) 2007-2026 GoodData Corporation

import { useCallback } from "react";

import { defineMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@gooddata/sdk-ui-kit";

import { saveReportCheck } from "../../actions/save_actions.js";
import { isSaveAsNewDisabledSelector, isSavingAsNewSelector } from "../../selectors/save_report_selector.js";
import { type AppDispatch } from "../../store/types.js";

export function SaveAsNewReportButton() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();
    const isSaving = useSelector(isSavingAsNewSelector);
    const isDisabled = useSelector(isSaveAsNewDisabledSelector);

    const onClick = useCallback(() => {
        dispatch(saveReportCheck(true));
    }, [dispatch]);

    const value = isSaving ? defineMessage({ id: "saving" }).id : defineMessage({ id: "save_as_new" }).id;
    return (
        <Button
            className="s-save-as-new-button save-as-new-button gd-button-secondary editor-header-item"
            onClick={onClick}
            value={intl.formatMessage({ id: value })}
            disabled={isDisabled}
        />
    );
}
