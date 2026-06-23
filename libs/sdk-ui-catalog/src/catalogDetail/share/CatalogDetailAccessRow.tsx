// (C) 2026 GoodData Corporation

import { FormattedMessage, useIntl } from "react-intl";

import type { IObjectAccessSummary } from "@gooddata/sdk-ui-ext";
import { UiIcon } from "@gooddata/sdk-ui-kit";

import {
    catalogDetailAccessRow,
    catalogDetailAccessRowSharedLink,
    catalogDetailAccessRowState,
} from "../../automation/testIds.js";
import { CatalogDetailContentRow } from "../CatalogDetailContentRow.js";

import { shareMessages } from "./messages.js";

/**
 * @internal
 */
export interface ICatalogDetailAccessRowProps {
    summary: IObjectAccessSummary;
    onOpen: () => void;
}

/**
 * Inline metadata row showing the current access state. Composed of two chips:
 *
 * - State chip: lock (restricted) or earth (workspace-wide), with text describing
 *   the permission level.
 * - Grantee count chip: users icon + "Shared with N" link that opens the dialog.
 *
 * @internal
 */
export function CatalogDetailAccessRow({ summary, onOpen }: ICatalogDetailAccessRowProps) {
    const intl = useIntl();
    const { generalAccess, workspaceLevel, granteeCount } = summary;

    const stateText =
        generalAccess === "RESTRICTED"
            ? intl.formatMessage(shareMessages.accessRowRestricted)
            : workspaceLevel === "SHARE"
              ? intl.formatMessage(shareMessages.accessRowWorkspaceShare)
              : intl.formatMessage(shareMessages.accessRowWorkspaceView);

    const stateIcon = generalAccess === "RESTRICTED" ? "lock" : "building";

    return (
        <CatalogDetailContentRow
            title={<FormattedMessage {...shareMessages.accessRowLabel} />}
            content={
                <div className="gd-analytics-catalog-detail__access-row" data-testid={catalogDetailAccessRow}>
                    <span
                        className="gd-analytics-catalog-detail__access-row__chip"
                        data-testid={catalogDetailAccessRowState}
                    >
                        <span className="gd-analytics-catalog-detail__access-row__chip-icon">
                            <UiIcon type={stateIcon} size={14} color="complementary-7" />
                        </span>
                        <span>{stateText}</span>
                    </span>
                    <button
                        type="button"
                        className="gd-analytics-catalog-detail__access-row__chip gd-analytics-catalog-detail__access-row__shared-link"
                        onClick={onOpen}
                        data-testid={catalogDetailAccessRowSharedLink}
                    >
                        <span className="gd-analytics-catalog-detail__access-row__chip-icon">
                            <UiIcon type="users" size={14} color="complementary-7" />
                        </span>
                        <span>
                            <FormattedMessage
                                {...shareMessages.accessRowSharedWith}
                                values={{ count: granteeCount }}
                            />
                        </span>
                    </button>
                </div>
            }
        />
    );
}
