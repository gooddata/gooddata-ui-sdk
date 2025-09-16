// (C) 2023-2025 GoodData Corporation

import { ReactNode, useCallback, useMemo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { Dropdown, DropdownButton, IAlignPoint, ItemsWrapper, Overlay } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";
import { QuestionMarkIcon } from "../Workspace/WorkspaceItem/QuestionMarkIcon.js";

const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

export interface IOrganizationMemberDropdownProps {
    isAdmin: boolean;
    isDisabled: boolean;
    onChange: (isAdmin: boolean) => void;
}

export function OrganizationMemberDropdown({
    isAdmin,
    isDisabled,
    onChange,
}: IOrganizationMemberDropdownProps) {
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
                        <div>{intl.formatMessage(messages.userIsAdmin)}</div>
                        <div className="gd-user-management-help-icon-wrapper">
                            <QuestionMarkIcon bubbleTextId={messages.userIsAdminTooltip.id} />
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
                        <div>{intl.formatMessage(messages.userIsRegularUser)}</div>
                        <div className="gd-user-management-help-icon-wrapper">
                            <QuestionMarkIcon bubbleTextId={messages.userIsRegularUserTooltip.id} />
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
                ? intl.formatMessage(messages.userIsAdmin)
                : intl.formatMessage(messages.userIsRegularUser),
        [isAdmin, intl],
    );

    const renderDropdownButton = useCallback(
        ({ openDropdown, isOpen }: { openDropdown: () => void; isOpen: boolean }): ReactNode => (
            <DropdownButton
                value={selectedValue}
                isOpen={isOpen}
                disabled={isDisabled}
                onClick={openDropdown}
                isSmall={false}
                className="gd-user-management-dialog-detail-organization-membership gd-user-management-dialog-detail-input s-user-management-permission-dropdown"
            />
        ),
        [selectedValue, isDisabled],
    );

    return <Dropdown renderBody={renderDropdownBody} renderButton={renderDropdownButton} />;
}
