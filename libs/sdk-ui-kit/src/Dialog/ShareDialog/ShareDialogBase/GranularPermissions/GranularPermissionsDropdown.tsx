// (C) 2022-2025 GoodData Corporation

import React, { useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { AccessGranularPermission } from "@gooddata/sdk-model";

import { GranularPermissionsDropdownBody } from "./GranularPermissionsDropdownBody.js";
import { withBubble } from "../../../../Bubble/index.js";
import { Dropdown } from "../../../../Dropdown/index.js";
import { granularPermissionMessageLabels } from "../../../../locales.js";
import { IAccessibilityConfigBase } from "../../../../typings/accessibility.js";
import { DialogModeType, GranteeItem, IGranteePermissionsPossibilities, IGranularGrantee } from "../types.js";
import { getGranularGranteeClassNameId } from "../utils.js";

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
    isDropdownDisabled,
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

    return (
        <Dropdown
            className={className}
            renderButton={({ isOpen, toggleDropdown, buttonRef, dropdownId }) => (
                <button
                    className={cx(
                        "s-granular-permission-button",
                        "gd-granular-permission-button",
                        "dropdown-button",
                        granularGranteeClassName,
                        {
                            "is-active": isOpen,
                            "gd-icon-navigateup": !isDropdownDisabled && isOpen,
                            "gd-icon-navigatedown": !isDropdownDisabled && !isOpen,
                            disabled: isDropdownDisabled,
                            "gd-icon-right": !isDropdownDisabled,
                        },
                    )}
                    onClick={() => {
                        if (!isDropdownDisabled) {
                            toggleDropdown();
                            handleToggleDropdown();
                        }
                    }}
                    aria-label={intl.formatMessage({
                        id: "shareDialog.share.granular.grantee.permission.label",
                    })}
                    ref={buttonRef as any}
                    aria-haspopup
                    aria-expanded={!!isOpen}
                    aria-controls={isOpen ? dropdownId : undefined}
                    aria-describedby={ariaDescribedBy}
                >
                    <div className="s-granular-permission-button-title gd-granular-permission-button-title">
                        {buttonValue}
                    </div>
                </button>
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
