// (C) 2022 GoodData Corporation

import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";

import { GranularPermissions } from "./GranularPermissions";

import { GranteeItem } from "../types";
import { getGranularGranteeClassNameId } from "../utils";

import { DropdownButton } from "../../../../Dropdown";
import { Bubble, BubbleHoverTrigger } from "../../../../Bubble";
import { IAlignPoint } from "../../../../typings/positioning";

const alignPoints: IAlignPoint[] = [{ align: "cr cl" }];

interface IGranularPermissionsDropdownBodyProps {
    grantee: GranteeItem;
    value: string;
    disabledDropdown?: boolean;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

export const GranularPermissionsDropdownBody: React.FC<IGranularPermissionsDropdownBodyProps> = ({
    grantee,
    value,
    disabledDropdown = true,
    onChange,
    onDelete,
}) => {
    const [isShowDropdown, toggleShowDropdown] = React.useState<boolean>(false);
    const toggleDropdown = useCallback(() => toggleShowDropdown(!isShowDropdown), [isShowDropdown]);

    const granularGranteeClassName = getGranularGranteeClassNameId(grantee);

    return (
        <>
            <div className="gd-granular-permissions-dropdown">
                {disabledDropdown ? (
                    <BubbleHoverTrigger>
                        <DropdownButton disabled className={granularGranteeClassName} value={value} />
                        <Bubble alignPoints={alignPoints}>
                            <FormattedMessage id="shareDialog.share.granular.permissions.body.tooltip" />
                        </Bubble>
                    </BubbleHoverTrigger>
                ) : (
                    <>
                        <DropdownButton
                            className={granularGranteeClassName}
                            onClick={toggleDropdown}
                            isOpen={isShowDropdown}
                            value={value}
                        />
                        <GranularPermissions
                            alignTo={granularGranteeClassName}
                            grantee={grantee}
                            toggleDropdown={toggleDropdown}
                            isShowDropdown={isShowDropdown}
                            onChange={onChange}
                            onDelete={onDelete}
                        />
                    </>
                )}
            </div>
        </>
    );
};
