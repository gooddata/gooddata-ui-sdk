// (C) 2026 GoodData Corporation

import type { ReactNode } from "react";
import { FormattedMessage, type MessageDescriptor } from "react-intl";

import type { AccessGranularPermission } from "@gooddata/sdk-model";
import { type IObjectAccessSummary, summaryOtherGranteeCount } from "@gooddata/sdk-ui-ext";
import { type IconType, UiIcon } from "@gooddata/sdk-ui-kit";

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
}

const WORKSPACE_MESSAGE: Record<AccessGranularPermission, MessageDescriptor> = {
    EDIT: shareMessages.accessRowWorkspaceEdit,
    SHARE: shareMessages.accessRowWorkspaceShare,
    VIEW: shareMessages.accessRowWorkspaceView,
};

function AccessLine({ icon, testId, children }: { icon: IconType; testId: string; children: ReactNode }) {
    return (
        <li className="gd-analytics-catalog-detail__access-row__line" data-testid={testId}>
            <span className="gd-analytics-catalog-detail__access-row__icon">
                <UiIcon type={icon} size={14} color="complementary-7" />
            </span>
            <span>{children}</span>
        </li>
    );
}

/**
 * Static description of who can reach the object, for the metadata grid. Workspace-wide
 * access and named grantees are independent, so both lines can show at once; neither one
 * showing means nobody but the caller has access.
 *
 * Read-only by design — the header's Share button is the way in to editing access.
 *
 * @internal
 */
export function CatalogDetailAccessRow({ summary }: ICatalogDetailAccessRowProps) {
    const isWorkspaceWide = summary.generalAccess === "WORKSPACE";
    const otherGrantees = summaryOtherGranteeCount(summary);

    return (
        <CatalogDetailContentRow
            alignTop
            title={<FormattedMessage {...shareMessages.accessRowLabel} />}
            content={
                <ul className="gd-analytics-catalog-detail__access-row" data-testid={catalogDetailAccessRow}>
                    {isWorkspaceWide ? (
                        <AccessLine icon="building" testId={catalogDetailAccessRowWorkspace}>
                            <FormattedMessage {...WORKSPACE_MESSAGE[summary.workspaceLevel]} />
                        </AccessLine>
                    ) : null}
                    {otherGrantees > 0 ? (
                        <AccessLine icon="users" testId={catalogDetailAccessRowShared}>
                            <FormattedMessage
                                {...shareMessages.accessRowSharedWith}
                                values={{ count: otherGrantees }}
                            />
                        </AccessLine>
                    ) : null}
                    {!isWorkspaceWide && otherGrantees === 0 ? (
                        <AccessLine icon="invisible" testId={catalogDetailAccessRowPrivate}>
                            <FormattedMessage {...shareMessages.accessRowPrivate} />
                        </AccessLine>
                    ) : null}
                </ul>
            }
        />
    );
}
