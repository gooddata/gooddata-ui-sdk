// (C) 2026 GoodData Corporation

import { FormattedMessage, type MessageDescriptor, useIntl } from "react-intl";

import type { AccessGranularPermission } from "@gooddata/sdk-model";
import { type IObjectAccessSummary, summaryOtherGranteeCount } from "@gooddata/sdk-ui-ext";
import { type IconType, UiButton, UiIcon } from "@gooddata/sdk-ui-kit";

import {
    catalogDetailAccessRow,
    catalogDetailAccessRowPrivate,
    catalogDetailAccessRowShared,
    catalogDetailAccessRowWorkspace,
} from "../../automation/testIds.js";
import { CatalogDetailContentRow } from "../CatalogDetailContentRow.js";

import { shareMessages } from "./messages.js";

/**
 * @internal
 */
export interface ICatalogDetailAccessRowProps {
    summary: IObjectAccessSummary;
    onOpenShare?: () => void;
}

const WORKSPACE_MESSAGE: Record<AccessGranularPermission, MessageDescriptor> = {
    EDIT: shareMessages.accessRowWorkspaceEdit,
    SHARE: shareMessages.accessRowWorkspaceShare,
    VIEW: shareMessages.accessRowWorkspaceView,
};

function AccessLine({
    icon,
    testId,
    label,
    onOpenShare,
}: {
    icon: IconType;
    testId: string;
    label: string;
    onOpenShare?: () => void;
}) {
    return (
        <li className="gd-analytics-catalog-detail__access-row__line" data-testid={testId}>
            <span className="gd-analytics-catalog-detail__access-row__icon">
                <UiIcon type={icon} size={14} color="complementary-7" />
            </span>
            {onOpenShare ? (
                // A button rather than a link: it opens a dialog in place rather than navigating.
                <UiButton variant="linkDimmed" size="medium" label={label} onClick={onOpenShare} />
            ) : (
                <span>{label}</span>
            )}
        </li>
    );
}

/**
 * Static description of who can reach the object, for the metadata grid. Workspace-wide
 * access and named grantees are independent, so both lines can show at once; neither one
 * showing means nobody but the caller has access.
 *
 * Each line opens the share dialog when `onOpenShare` is given, which is the same way in
 * as the header's Share button and is offered under the same conditions.
 *
 * @internal
 */
export function CatalogDetailAccessRow({ summary, onOpenShare }: ICatalogDetailAccessRowProps) {
    const intl = useIntl();
    const isWorkspaceWide = summary.generalAccess === "WORKSPACE";
    const otherGrantees = summaryOtherGranteeCount(summary);

    return (
        <CatalogDetailContentRow
            alignTop
            title={<FormattedMessage {...shareMessages.accessRowLabel} />}
            content={
                <ul className="gd-analytics-catalog-detail__access-row" data-testid={catalogDetailAccessRow}>
                    {isWorkspaceWide ? (
                        <AccessLine
                            icon="building"
                            testId={catalogDetailAccessRowWorkspace}
                            label={intl.formatMessage(WORKSPACE_MESSAGE[summary.workspaceLevel])}
                            onOpenShare={onOpenShare}
                        />
                    ) : null}
                    {otherGrantees > 0 ? (
                        <AccessLine
                            icon="users"
                            testId={catalogDetailAccessRowShared}
                            label={intl.formatMessage(shareMessages.accessRowSharedWith, {
                                count: otherGrantees,
                            })}
                            onOpenShare={onOpenShare}
                        />
                    ) : null}
                    {!isWorkspaceWide && otherGrantees === 0 ? (
                        <AccessLine
                            icon="invisible"
                            testId={catalogDetailAccessRowPrivate}
                            label={intl.formatMessage(shareMessages.accessRowPrivate)}
                            onOpenShare={onOpenShare}
                        />
                    ) : null}
                </ul>
            }
        />
    );
}
