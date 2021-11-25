// (C) 2021 GoodData Corporation
import React, { useMemo } from "react";
import { serializeObjRef } from "@gooddata/sdk-model";
import { GranteeItemComponent } from "./GranteeItem";
import { IGranteesListProps } from "./types";
import { GranteeListEmpty } from "./GranteeListEmpty";
import { useIntl } from "react-intl";
import { sortGranteeList } from "./utils";

/**
 * @internal
 */
export const GranteeList: React.FC<IGranteesListProps> = (props) => {
    const { grantees, mode, onDelete } = props;

    const intl = useIntl();

    const sortedGrantees = useMemo(() => {
        return sortGranteeList(grantees, intl);
    }, [grantees, intl]);

    if (grantees.length === 0) {
        return <GranteeListEmpty />;
    }

    return (
        <div className="gd-share-dialog-grantee-list">
            {sortedGrantees.map((grantee) => {
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
