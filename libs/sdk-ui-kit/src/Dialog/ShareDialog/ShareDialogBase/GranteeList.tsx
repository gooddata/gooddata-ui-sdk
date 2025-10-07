// (C) 2021-2025 GoodData Corporation

import { useMemo, useRef } from "react";

import { useIntl } from "react-intl";

import { serializeObjRef } from "@gooddata/sdk-model";

import { GranteeItemComponent } from "./GranteeItem.js";
import { GranteeListEmpty } from "./GranteeListEmpty.js";
import { GranteeItem, IGranteesListProps } from "./types.js";
import { ADD_GRANTEE_ID, ADD_GRANTEE_SELECT_ID, sortGranteeList } from "./utils.js";

/**
 * @internal
 */
export function GranteeList({
    grantees,
    mode,
    areGranularPermissionsSupported,
    currentUserPermissions,
    isSharedObjectLocked,
    isGranteeShareLoading,
    onDelete,
    onChange,
}: IGranteesListProps) {
    const intl = useIntl();
    const listRef = useRef(null);

    const sortedGrantees = useMemo(() => {
        return sortGranteeList(grantees, intl);
    }, [grantees, intl]);

    const handleOnDelete = (grantee: GranteeItem) => {
        onDelete(grantee);

        // Programatically return focus to the list after item is removed
        const listElement = listRef.current;
        if (grantees.length > 1) {
            // Set tabindex to make it focusable and add it to tab order temporarily
            listElement.tabIndex = -1;
            listElement.focus();
        } else {
            const elementId = mode === "ShareGrantee" ? ADD_GRANTEE_ID : ADD_GRANTEE_SELECT_ID;
            const element = document.getElementById(elementId);

            element?.focus();
        }
    };

    if (grantees.length === 0) {
        return <GranteeListEmpty />;
    }

    return (
        <div
            onBlur={(e) => e.currentTarget.removeAttribute("tabindex")}
            ref={listRef}
            className="gd-share-dialog-grantee-list"
        >
            {sortedGrantees.map((grantee) => {
                return (
                    <GranteeItemComponent
                        currentUserPermissions={currentUserPermissions}
                        isSharedObjectLocked={isSharedObjectLocked}
                        key={serializeObjRef(grantee.id)}
                        grantee={grantee}
                        mode={mode}
                        areGranularPermissionsSupported={areGranularPermissionsSupported}
                        onDelete={handleOnDelete}
                        onChange={onChange}
                        isGranteeShareLoading={isGranteeShareLoading}
                    />
                );
            })}
        </div>
    );
}
