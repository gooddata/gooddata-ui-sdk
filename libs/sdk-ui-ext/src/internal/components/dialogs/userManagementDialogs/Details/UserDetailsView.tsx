// (C) 2023-2026 GoodData Corporation

import { useId } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type ILocalizationStatistics, type IUserLocalizationSettings } from "@gooddata/sdk-backend-spi";
import { type IUser } from "@gooddata/sdk-model";
import { Checkbox } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";
import { useTelemetry } from "../TelemetryContext.js";
import { type ListMode } from "../types.js";
import { QuestionMarkIcon } from "../Workspace/WorkspaceItem/QuestionMarkIcon.js";

import { DetailRow } from "./DetailRow.js";
import { OrganizationMemberDropdown } from "./OrganizationMemberDropdown.js";
import { UserLanguagesSection } from "./UserLanguagesSection.js";

export interface IDetailsViewProps {
    isAdmin: boolean;
    isBootstrapUser: boolean;
    user: IUser | undefined;
    mode: ListMode;
    isSystemAccountFilteringEnabled?: boolean;
    isLocalizationEnabled?: boolean;
    languages?: IUserLocalizationSettings;
    isLanguagesError?: boolean;
    statistics?: ILocalizationStatistics;
    onChange?: (user: IUser, isAdmin: boolean) => void;
    onLanguagesChange?: (languages: IUserLocalizationSettings) => void;
}

export function UserDetailsView({
    user,
    isAdmin,
    isBootstrapUser,
    mode,
    isSystemAccountFilteringEnabled = false,
    isLocalizationEnabled = false,
    languages,
    isLanguagesError = false,
    statistics,
    onChange,
    onLanguagesChange,
}: IDetailsViewProps) {
    const intl = useIntl();
    const trackEvent = useTelemetry();
    const systemAccountCheckboxId = useId();

    if (!user) {
        return null;
    }

    // Admins are always treated as system users by the backend, so the checkbox
    // is shown checked and disabled while the role is Admin. The stored
    // systemAccount value is left untouched and is revealed again if the user is
    // demoted to a regular member.
    const isSystemAccountDisplayed = isAdmin || !!user.systemAccount;
    const isSystemAccountDisabled = mode === "VIEW" || isAdmin;
    const idRow = (
        <DetailRow
            labelText={intl.formatMessage(messages.userId)}
            value={user.login}
            mode={mode}
            disabled
            onChange={() => {}}
        />
    );

    return (
        <div
            className={cx("gd-user-management-dialog-detail", "s-user-management-user", {
                "gd-user-management-dialog-detail-localization": isLocalizationEnabled,
            })}
        >
            <DetailRow
                labelText={intl.formatMessage(messages.userFirstName)}
                value={user.firstName}
                mode={mode}
                onChange={(firstName) => onChange?.({ ...user, firstName: String(firstName) }, isAdmin)}
            />
            <DetailRow
                labelText={intl.formatMessage(messages.userLastName)}
                value={user.lastName}
                mode={mode}
                onChange={(lastName) => onChange?.({ ...user, lastName: String(lastName) }, isAdmin)}
            />
            <DetailRow
                labelText={intl.formatMessage(messages.userEmail)}
                value={user.email}
                mode={mode}
                onChange={(email) => onChange?.({ ...user, email: String(email) }, isAdmin)}
            />
            {isLocalizationEnabled ? idRow : null}
            <div className="gd-user-management-dialog-detail-row">
                <div className="gd-user-management-dialog-detail-label">
                    {intl.formatMessage(messages.userMembership)}
                </div>
                <div>
                    {mode === "VIEW" &&
                        (isAdmin
                            ? intl.formatMessage(messages.userIsAdmin)
                            : intl.formatMessage(messages.userIsRegularUser))}
                    {mode === "EDIT" && (
                        <OrganizationMemberDropdown
                            isDisabled={isBootstrapUser}
                            isAdmin={isAdmin}
                            onChange={(isAdminNow) => {
                                onChange?.(user, isAdminNow);
                                trackEvent(
                                    isAdmin ? "user-role-changed-to-admin" : "user-role-changed-to-member",
                                );
                            }}
                        />
                    )}
                </div>
            </div>
            {isSystemAccountFilteringEnabled ? (
                <div
                    className={cx("gd-user-management-dialog-detail-row", {
                        "gd-user-management-dialog-detail-row-checkbox-edit":
                            isLocalizationEnabled && mode === "EDIT",
                    })}
                >
                    <div className="gd-user-management-dialog-detail-label gd-user-management-dialog-detail-label-with-icon">
                        <label htmlFor={systemAccountCheckboxId}>
                            {intl.formatMessage(messages.userSystemAccount)}
                        </label>
                        <QuestionMarkIcon bubbleTextId={messages.userSystemAccountTooltip.id} />
                    </div>
                    <div>
                        <Checkbox
                            id={systemAccountCheckboxId}
                            value={isSystemAccountDisplayed}
                            disabled={isSystemAccountDisabled}
                            onChange={(value) => {
                                onChange?.({ ...user, systemAccount: value }, isAdmin);
                                trackEvent(
                                    value ? "user-marked-system-account" : "user-unmarked-system-account",
                                );
                            }}
                        />
                    </div>
                </div>
            ) : null}
            {isLocalizationEnabled ? null : idRow}
            {isLocalizationEnabled ? (
                <UserLanguagesSection
                    languages={languages}
                    isError={isLanguagesError}
                    mode={mode}
                    statistics={statistics}
                    onChange={onLanguagesChange}
                />
            ) : null}
        </div>
    );
}
