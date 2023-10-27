// (C) 2023 GoodData Corporation

import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

import { Overlay } from "../../../Overlay/index.js";
import { DropdownButton, Dropdown } from "../../../Dropdown/index.js";
import { IAlignPoint } from "../../../typings/positioning.js";
import { ItemsWrapper } from "../../../List/index.js";
import { userManagementMessages } from "../../../locales.js";
import { QuestionMarkIcon } from "../Workspace/WorkspaceItem/QuestionMarkIcon.js";

const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

export interface IOrganizationMemberDropdownProps {
    isAdmin: boolean;
    onChange: (isAdmin: boolean) => void;
}

export const OrganizationMemberDropdown: React.FC<IOrganizationMemberDropdownProps> = ({
    isAdmin,
    onChange,
}) => {
    const intl = useIntl();

    const renderDropdownBody = useCallback(
        ({ closeDropdown }: { closeDropdown: () => void }) => (
            <Overlay
                key="GranularPermissionsSelect"
                alignTo=".gd-user-management-dialog-detail-organization-membership"
                alignPoints={overlayAlignPoints}
                className="s-user-management-user-permissions-overlay"
                closeOnMouseDrag={true}
                closeOnOutsideClick={true}
                closeOnParentScroll={true}
                onClose={closeDropdown}
            >
                <ItemsWrapper smallItemsSpacing={true}>
                    <div
                        onClick={() => {
                            onChange(true);
                            closeDropdown();
                        }}
                        className={cx(
                            "gd-list-item",
                            "gd-menu-item",
                            "gd-user-management-dialog-detail-input",
                            "gd-user-management-permission-item",
                            "s-user-management-permission-admin",
                            {
                                "is-selected": isAdmin,
                            },
                        )}
                    >
                        <div>{intl.formatMessage(userManagementMessages.userIsAdmin)}</div>
                        <div className="gd-user-management-help-icon-wrapper">
                            <QuestionMarkIcon bubbleTextId={userManagementMessages.userIsAdminTooltip.id} />
                        </div>
                    </div>
                    <div
                        onClick={() => {
                            onChange(false);
                            closeDropdown();
                        }}
                        className={cx(
                            "gd-list-item",
                            "gd-menu-item",
                            "gd-user-management-dialog-detail-input",
                            "gd-user-management-permission-item",
                            "s-user-management-permission-non-admin",
                            {
                                "is-selected": !isAdmin,
                            },
                        )}
                    >
                        <div>{intl.formatMessage(userManagementMessages.userIsRegularUser)}</div>
                        <div className="gd-user-management-help-icon-wrapper">
                            <QuestionMarkIcon bubbleTextId={userManagementMessages.userIsRegularUserTooltip.id} />
                        </div>
                    </div>
                </ItemsWrapper>
            </Overlay>
        ),
        [isAdmin, onChange, intl],
    );

    const selectedValue = useMemo(
        () =>
            isAdmin
                ? intl.formatMessage(userManagementMessages.userIsAdmin)
                : intl.formatMessage(userManagementMessages.userIsRegularUser),
        [isAdmin, intl],
    );

    const renderDropdownButton = useCallback(
        ({ openDropdown, isOpen }: { openDropdown: () => void; isOpen: boolean }): React.ReactNode => (
            <DropdownButton
                value={selectedValue}
                isOpen={isOpen}
                onClick={openDropdown}
                isSmall={false}
                className="gd-user-management-dialog-detail-organization-membership gd-user-management-dialog-detail-input s-user-management-permission-dropdown"
            />
        ),
        [selectedValue],
    );

    return <Dropdown renderBody={renderDropdownBody} renderButton={renderDropdownButton} />;
};
