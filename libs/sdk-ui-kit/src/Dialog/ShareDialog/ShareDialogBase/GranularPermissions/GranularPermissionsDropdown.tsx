// (C) 2022-2025 GoodData Corporation

import React, { useState } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { AccessGranularPermission } from "@gooddata/sdk-model";

import { DialogModeType, GranteeItem, IGranteePermissionsPossibilities, IGranularGrantee } from "../types.js";
import { getGranularGranteeClassNameId } from "../utils.js";
import { granularPermissionMessageLabels } from "../../../../locales.js";

import { GranularPermissionsDropdownBody } from "./GranularPermissionsDropdownBody.js";
import { withBubble } from "../../../../Bubble/index.js";
import { IAccessibilityConfigBase } from "../../../../typings/accessibility.js";
import { Dropdown, DropdownButton } from "../../../../Dropdown/index.js";

interface IGranularPermissionsDropdownProps {
    grantee: IGranularGrantee;
    granteePossibilities: IGranteePermissionsPossibilities;
    isDropdownDisabled?: boolean;
    handleToggleDropdown: () => void;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
    className: string;
    mode: DialogModeType;
    accessibilityConfig?: IAccessibilityConfigBase;
}

export const GranularPermissionsDropdown: React.FC<IGranularPermissionsDropdownProps> = ({
    grantee,
    granteePossibilities,
    handleToggleDropdown,
    onChange,
    onDelete,
    className,
    mode,
    accessibilityConfig,
}) => {
    const intl = useIntl();
    const { ariaDescribedBy } = accessibilityConfig ?? {};

    const [selectedPermission, setSelectedPermission] = useState<AccessGranularPermission>(
        granteePossibilities.assign.effective,
    );
    const handleSetSelectedPermission = (permission: AccessGranularPermission) => {
        setSelectedPermission(permission);
    };

    const granularGranteeClassName = getGranularGranteeClassNameId(grantee);
    const buttonValue = intl.formatMessage(granularPermissionMessageLabels[selectedPermission]);
    const buttonClassName = cx(
        "s-granular-permission-button",
        "gd-granular-permission-button",
        "dropdown-button",
        "customizable",
        granularGranteeClassName,
    );

    return (
        <Dropdown
            className={className}
            renderButton={({ isOpen, toggleDropdown, buttonRef, dropdownId }) => (
                <DropdownButton
                    buttonRef={buttonRef}
                    onClick={() => {
                        toggleDropdown();
                        handleToggleDropdown();
                    }}
                    value={buttonValue}
                    isOpen={isOpen}
                    className={buttonClassName}
                    accessibilityConfig={{
                        ariaLabel: intl.formatMessage({
                            id: "shareDialog.share.granular.grantee.permission.label",
                        }),
                        ariaDescribedBy,
                    }}
                    dropdownId={dropdownId}
                />
            )}
            renderBody={({ closeDropdown, ariaAttributes }) => (
                <GranularPermissionsDropdownBody
                    alignTo={granularGranteeClassName}
                    grantee={grantee}
                    granteePossibilities={granteePossibilities}
                    toggleDropdown={closeDropdown}
                    onChange={onChange}
                    onDelete={onDelete}
                    selectedPermission={selectedPermission}
                    handleSetSelectedPermission={handleSetSelectedPermission}
                    mode={mode}
                    id={ariaAttributes?.id}
                />
            )}
        />
    );
};

export const GranularPermissionsDropdownWithBubble = withBubble(GranularPermissionsDropdown);
