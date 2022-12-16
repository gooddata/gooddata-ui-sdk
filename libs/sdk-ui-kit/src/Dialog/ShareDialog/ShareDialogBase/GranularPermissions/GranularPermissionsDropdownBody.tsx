// (C) 2022 GoodData Corporation

import React, { useCallback, useState } from "react";
import { IDashboardPermissions } from "@gooddata/sdk-model";
import { useIntl } from "react-intl";
import cx from "classnames";

import { GranularPermissions } from "./GranularPermissions";

import { GranteeItem, IGranularGrantee } from "../types";
import { getGranularGranteeClassNameId, getGranularGranteePermissionId } from "../utils";

import { Bubble, BubbleHoverTrigger } from "../../../../Bubble";
import { IAlignPoint } from "../../../../typings/positioning";

import { granularPermissionMessageLabels } from "../../../../locales";

const alignPoints: IAlignPoint[] = [{ align: "cr cl" }];

interface IGranularPermissionsDropdownBodyProps {
    grantee: IGranularGrantee;
    dashboardPermissions: IDashboardPermissions;
    disabledDropdown?: boolean;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export const GranularPermissionsDropdownBody: React.FC<IGranularPermissionsDropdownBodyProps> = ({
    grantee,
    dashboardPermissions,
    // TODO: update with proper logic
    disabledDropdown = false,
    onChange,
    onDelete,
}) => {
    const intl = useIntl();
    const [isShowDropdown, toggleShowDropdown] = React.useState<boolean>(false);
    const toggleDropdown = useCallback(() => toggleShowDropdown(!isShowDropdown), [isShowDropdown]);

    const [selectedPermissionId, setSelectedPermissionId] = useState<string>(
        getGranularGranteePermissionId(grantee.permissions),
    );

    const handleSetSelectedPermission = (permission: string) => {
        setSelectedPermissionId(permission);
    };

    const granularGranteeClassName = getGranularGranteeClassNameId(grantee);
    const buttonValue = intl.formatMessage({
        id: granularPermissionMessageLabels[selectedPermissionId.toLowerCase()].id,
    });

    return (
        <>
            {disabledDropdown ? (
                <BubbleHoverTrigger className="gd-grantee-granular-permission">
                    {/* TODO: grantee item hover when dropdown is active */}
                    <div
                        className={cx(
                            "s-granular-permission-button",
                            "gd-granular-permission-button",
                            "dropdown-button",
                            granularGranteeClassName,
                            "disabled",
                        )}
                    >
                        <div className="gd-granular-permission-button-content">
                            <div className="s-granular-permisison-button-title gd-granular-permission-button-title">
                                {buttonValue}
                            </div>
                        </div>
                    </div>
                    {/* TODO: Update text */}
                    <Bubble alignPoints={alignPoints}>
                        <div> disabled tooltip </div>
                    </Bubble>
                </BubbleHoverTrigger>
            ) : (
                <>
                    <BubbleHoverTrigger className="gd-grantee-granular-permission">
                        <div
                            className={cx(
                                "s-granular-permission-button",
                                "gd-granular-permission-button",
                                "dropdown-button",
                                "gd-icon-right",
                                granularGranteeClassName,
                                {
                                    "is-active": isShowDropdown,
                                    "gd-icon-navigateup": isShowDropdown,
                                    "gd-icon-navigatedown": !isShowDropdown,
                                },
                            )}
                            onClick={toggleDropdown}
                        >
                            <div className="gd-granular-permission-button-content">
                                <div className="s-granular-permisison-button-title gd-granular-permission-button-title">
                                    {buttonValue}
                                </div>
                            </div>
                        </div>
                    </BubbleHoverTrigger>
                    <GranularPermissions
                        dashboardPermissions={dashboardPermissions}
                        alignTo={granularGranteeClassName}
                        grantee={grantee}
                        toggleDropdown={toggleDropdown}
                        isShowDropdown={isShowDropdown}
                        onChange={onChange}
                        onDelete={onDelete}
                        selectedPermissionId={selectedPermissionId}
                        handleSetSelectedPermission={handleSetSelectedPermission}
                    />
                </>
            )}
        </>
    );
};
