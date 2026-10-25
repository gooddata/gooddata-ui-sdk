// (C) 2007-2026 GoodData Corporation

import { defineMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { Bubble, BubbleHoverTrigger, Button } from "@gooddata/sdk-ui-kit";

import { saveReportCheck, saveReportFromKD } from "../../actions/save_actions.js";
import { saveReportSelector } from "../../selectors/save_report_selector.js";
import { type AppDispatch, type IAppState } from "../../store/types.js";

export function SaveReportButton() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();
    const isSaving = useSelector((state: IAppState) => saveReportSelector(state).isSaving);
    const isDisabled = useSelector((state: IAppState) => saveReportSelector(state).isDisabled);
    const displaySaveInsightFromKDDialog = useSelector(
        (state: IAppState) => saveReportSelector(state).displaySaveInsightFromKDDialog,
    );
    const showDisabledTooltip = useSelector(
        (state: IAppState) => saveReportSelector(state).showDisabledTooltip,
    );

    const value = isSaving ? defineMessage({ id: "saving" }).id : defineMessage({ id: "save" }).id;
    const handleSaveButtonClick = () => {
        if (displaySaveInsightFromKDDialog) {
            dispatch(saveReportFromKD());
        } else {
            dispatch(saveReportCheck(false));
        }
    };

    const SaveButton = (
        <Button
            className="s-save-button save-button gd-button-action editor-header-item"
            onClick={handleSaveButtonClick}
            value={intl.formatMessage({ id: value })}
            disabled={isDisabled}
        />
    );

    if (showDisabledTooltip) {
        return (
            <BubbleHoverTrigger>
                {SaveButton}
                <Bubble
                    className="bubble-primary"
                    alignPoints={[{ align: "bc tr", offset: { x: 0, y: 10 } }]}
                >
                    {intl.formatMessage({ id: "save.disabledTooltip.executionTimestamp" })}
                </Bubble>
            </BubbleHoverTrigger>
        );
    }

    return SaveButton;
}
