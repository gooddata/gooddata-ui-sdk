// (C) 2026 GoodData Corporation

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { defineMessages, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type ShareStatus } from "@gooddata/sdk-model";
import {
    type IObjectShareDraft,
    ObjectShareDialog,
    type ObjectShareLevel,
    useObjectAccessLevel,
} from "@gooddata/sdk-ui-ext";

import {
    insightAccessDraftChanged,
    insightShareDialogClosed,
} from "../../../actions/insight_access_actions.js";
import {
    type IAnalyticalDesignerHeaderContext,
    type IAnalyticalDesignerVisualizationAccessProps,
} from "../../../embedding/editorHeaderSlotTypes.js";
import { getDefaultVisualizationVisibility } from "../../../selectors/feature_flag_selector.js";
import {
    canManageInsightAccess,
    canShareInsight,
    insightAccessTarget,
} from "../../../selectors/insight_access_selector.js";
import { getLastSavedReportIdentifier } from "../../../selectors/report_selector.js";
import { getInsightAccessDraft } from "../../../store/insight_access/insight_access_selectors.js";
import { type AppDispatch } from "../../../store/types.js";

import { InsightAccessChip } from "./InsightAccessChip.js";

const messages = defineMessages({
    untitled: { id: "dialogs.savingUntitledReportConfirmation.placeholder" },
});

// The public props use the model's share status; the sharing internals of sdk-ui-ext have their own names.
const ACCESS_LEVELS: Record<ObjectShareLevel, ShareStatus> = {
    PRIVATE: "private",
    SHARED: "shared",
    WORKSPACE: "public",
};

type InsightAccessSummaryHandler = ReturnType<typeof useObjectAccessLevel>["onSummaryChange"];

/**
 * What the default sharing dialog needs beyond the public props: the staged draft of an unsaved visualization
 * and the summary the dialog reports back. Kept out of the public props because their types are internal.
 */
export interface IInsightAccessDialogContext {
    draft: IObjectShareDraft | undefined;
    defaultGeneralAccess: ReturnType<typeof getDefaultVisualizationVisibility>;
    onDraftChange: (draft: IObjectShareDraft) => void;
    onSummaryChange: InsightAccessSummaryHandler;
    onDialogClosed: () => void;
}

const InsightAccessDialogContext = createContext<IInsightAccessDialogContext | undefined>(undefined);

export const InsightAccessDialogProvider = InsightAccessDialogContext.Provider;

/**
 * Props of the VisualizationAccess slot and the value of {@link InsightAccessDialogProvider} for its default.
 * The access level is read only once a component requests it, so a host's own access control causes no request.
 */
export function useVisualizationAccess(context: IAnalyticalDesignerHeaderContext): {
    props: IAnalyticalDesignerVisualizationAccessProps;
    dialogContext: IInsightAccessDialogContext;
} {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();
    const isDefaultAvailable = useSelector(canManageInsightAccess);
    const canManageAccess = useSelector(canShareInsight);
    const target = useSelector(insightAccessTarget);
    const draft = useSelector(getInsightAccessDraft);
    const identifier = useSelector(getLastSavedReportIdentifier);
    const defaultGeneralAccess = useSelector(getDefaultVisualizationVisibility);
    const [isRequested, setIsRequested] = useState(false);
    const isReading = isRequested && isDefaultAvailable;

    const { level, isLoading, onSummaryChange } = useObjectAccessLevel({
        target,
        enabled: isReading,
        draft,
        initialDraftGeneralAccess: defaultGeneralAccess,
    });

    const onRequestAccessSummary = useCallback(() => {
        if (isDefaultAvailable) {
            setIsRequested(true);
        }
    }, [isDefaultAvailable]);

    const objectTitle = context.title.trim() || intl.formatMessage(messages.untitled);
    const accessLevel = isReading && level ? ACCESS_LEVELS[level] : undefined;
    const isAccessLoading = isReading && isLoading;
    const isAccessError = isReading && !isLoading && level === undefined;

    const props = useMemo(
        (): IAnalyticalDesignerVisualizationAccessProps => ({
            ...context,
            isDefaultAvailable,
            canManageAccess,
            ...(target ? { target } : {}),
            objectTitle,
            ...(accessLevel ? { accessLevel } : {}),
            isAccessLoading,
            isAccessError,
            onRequestAccessSummary,
        }),
        [
            context,
            isDefaultAvailable,
            canManageAccess,
            target,
            objectTitle,
            accessLevel,
            isAccessLoading,
            isAccessError,
            onRequestAccessSummary,
        ],
    );

    const dialogContext = useMemo(
        (): IInsightAccessDialogContext => ({
            draft,
            defaultGeneralAccess,
            onDraftChange: (next) => dispatch(insightAccessDraftChanged(next)),
            onSummaryChange,
            onDialogClosed: () => {
                if (target && identifier) {
                    dispatch(insightShareDialogClosed(identifier));
                }
            },
        }),
        [draft, defaultGeneralAccess, dispatch, onSummaryChange, target, identifier],
    );

    return { props, dialogContext };
}

/**
 * Default of the VisualizationAccess slot: a chip with the access level that opens the sharing dialog. Renders
 * nothing where the built-in sharing is unavailable.
 */
export function DefaultVisualizationAccess(props: IAnalyticalDesignerVisualizationAccessProps) {
    return props.isDefaultAvailable ? <InsightAccessControl {...props} /> : null;
}

function InsightAccessControl({
    target,
    objectTitle,
    accessLevel,
    isAccessError,
    onRequestAccessSummary,
}: IAnalyticalDesignerVisualizationAccessProps) {
    const dialogContext = useContext(InsightAccessDialogContext);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        onRequestAccessSummary();
    }, [onRequestAccessSummary]);

    const onClose = () => {
        setIsOpen(false);
        dialogContext?.onDialogClosed();
    };

    return (
        <span className="insight-access">
            <InsightAccessChip
                level={accessLevel}
                isLoading={accessLevel === undefined && !isAccessError}
                isOpen={isOpen}
                onClick={() => setIsOpen(true)}
            />
            {isOpen ? (
                <ObjectShareDialog
                    isOpen
                    onClose={onClose}
                    objectTitle={objectTitle}
                    target={target}
                    draft={target === undefined}
                    initialDraft={dialogContext?.draft}
                    onDraftChange={dialogContext?.onDraftChange}
                    onSummaryChange={dialogContext?.onSummaryChange}
                    initialDraftGeneralAccess={dialogContext?.defaultGeneralAccess}
                />
            ) : null}
        </span>
    );
}
