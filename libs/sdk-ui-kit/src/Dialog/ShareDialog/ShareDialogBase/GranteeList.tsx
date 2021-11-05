// (C) 2021 GoodData Corporation
import React from "react";
import { serializeObjRef } from "@gooddata/sdk-model";
import { GranteeItemComponent } from "./GranteeItem";
import { IGranteesListProps } from "./types";
import { GranteeListEmpty } from "./GranteeListEmpty";

/**
 * @internal
 */
export const GranteeList: React.FC<IGranteesListProps> = (props) => {
    const { grantees, mode, onDelete } = props;

    if (grantees.length === 0) {
        return <GranteeListEmpty />;
    }

    return (
        <div>
            {grantees.map((grantee) => {
                return (
                    <GranteeItemComponent
                        key={serializeObjRef(grantee.id)}
                        grantee={grantee}
                        mode={mode}
                        onDelete={onDelete}
                    />
                );
            })}
        </div>
    );
};
