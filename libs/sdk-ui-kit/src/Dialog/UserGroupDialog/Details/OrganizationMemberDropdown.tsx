// (C) 2023 GoodData Corporation

import React, { useCallback, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";

import { Overlay } from "../../../Overlay/index.js";
import { DropdownButton, Dropdown } from "../../../Dropdown/index.js";
import { IAlignPoint } from "../../../typings/positioning.js";
import { ItemsWrapper } from "../../../List/index.js";

const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

export interface IOrganizationMemberDropdownProps {
    isAdmin: boolean;
    onChange: (isAdmin: boolean) => void;
}

export const OrganizationMemberDropdown: React.FC<IOrganizationMemberDropdownProps> = ({ isAdmin, onChange }) => {
    const intl = useIntl();

    const renderDropdownBody = useCallback(
        ({ closeDropdown }: { closeDropdown: () => void }) => (
            <Overlay
                key="GranularPermissionsSelect"
                alignTo=".gd-user-group-dialog-detail-organization-membership"
                alignPoints={overlayAlignPoints}
                className="s-granular-permissions-overlay"
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
                            "gd-user-group-dialog-detail-input",
                            {
                                "is-selected": isAdmin,
                            }
                        )}
                    >
                        <FormattedMessage id="userGroupDialog.detail.orgPermission.admin" />
                    </div>
                    <div
                        onClick={() => {
                            onChange(false);
                            closeDropdown();
                        }}
                        className={cx(
                            "gd-list-item",
                            "gd-menu-item",
                            "gd-user-group-dialog-detail-input",
                            {
                                "is-selected": !isAdmin,
                            }
                        )}
                    >
                        <FormattedMessage id="userGroupDialog.detail.orgPermission.member" />
                    </div>
                </ItemsWrapper>
            </Overlay>

        ),
        [isAdmin, onChange],
    );

    const selectedValue = useMemo(
        () => isAdmin
            ? intl.formatMessage({ id: "userGroupDialog.detail.orgPermission.admin" })
            : intl.formatMessage({ id: "userGroupDialog.detail.orgPermission.member" }),
        [isAdmin, intl],
    );

    const renderDropdownButton = useCallback(
        ({ openDropdown, isOpen }: { openDropdown: () => void; isOpen: boolean }): React.ReactNode => (
            <DropdownButton
                value={selectedValue}
                isOpen={isOpen}
                onClick={openDropdown}
                isSmall={false}
                className="gd-user-group-dialog-detail-organization-membership gd-user-group-dialog-detail-input"
            />
        ),
        [selectedValue],
    );

    return (
        <Dropdown
            renderBody={renderDropdownBody}
            renderButton={renderDropdownButton}
        />
    );
};
