// (C) 2026 GoodData Corporation

import { useState } from "react";

import { defineMessages, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type IObjectShareDraft, ObjectShareDialog, useObjectAccessLevel } from "@gooddata/sdk-ui-ext";

import {
    insightAccessDraftChanged,
    insightShareDialogClosed,
} from "../../../actions/insight_access_actions.js";
import { getDefaultVisualizationVisibility } from "../../../selectors/feature_flag_selector.js";
import { canManageInsightAccess, insightAccessTarget } from "../../../selectors/insight_access_selector.js";
import { getLastSavedReportIdentifier } from "../../../selectors/report_selector.js";
import { currentReportTitle } from "../../../selectors/report_title_selector.js";
import { getInsightAccessDraft } from "../../../store/insight_access/insight_access_selectors.js";
import { type AppDispatch } from "../../../store/types.js";

import { InsightAccessChip } from "./InsightAccessChip.js";

const messages = defineMessages({
    untitled: { id: "dialogs.savingUntitledReportConfirmation.placeholder" },
});

export function InsightAccess() {
    const canManage = useSelector(canManageInsightAccess);
    return canManage ? <InsightAccessControl /> : null;
}

function InsightAccessControl() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();
    const target = useSelector(insightAccessTarget);
    const draft = useSelector(getInsightAccessDraft);
    const title = useSelector(currentReportTitle);
    const identifier = useSelector(getLastSavedReportIdentifier);
    const defaultVisualizationVisibility = useSelector(getDefaultVisualizationVisibility);
    const [isOpen, setIsOpen] = useState(false);

    const { level, isLoading, onSummaryChange } = useObjectAccessLevel({
        target,
        draft,
        initialDraftGeneralAccess: defaultVisualizationVisibility,
    });

    const onClose = () => {
        setIsOpen(false);
        if (target && identifier) {
            dispatch(insightShareDialogClosed(identifier));
        }
    };

    const onDraftChange = (next: IObjectShareDraft) => dispatch(insightAccessDraftChanged(next));

    return (
        <span className="insight-access">
            <InsightAccessChip
                level={level}
                isLoading={isLoading}
                isOpen={isOpen}
                onClick={() => setIsOpen(true)}
            />
            {isOpen ? (
                <ObjectShareDialog
                    isOpen
                    onClose={onClose}
                    objectTitle={title.trim() || intl.formatMessage(messages.untitled)}
                    target={target}
                    draft={target === undefined}
                    initialDraft={draft}
                    onDraftChange={onDraftChange}
                    onSummaryChange={onSummaryChange}
                    initialDraftGeneralAccess={defaultVisualizationVisibility}
                />
            ) : null}
        </span>
    );
}
