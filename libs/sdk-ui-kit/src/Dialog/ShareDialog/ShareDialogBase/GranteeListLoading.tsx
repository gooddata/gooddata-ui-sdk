// (C) 2021 GoodData Corporation
import React from "react";
import { LoadingMask } from "../../../LoadingMask/index.js";

/**
 * @internal
 */
export const GranteeListLoading: React.FC = () => {
    return (
        <div className="gd-share-dialog-grantee-list-empty-selection">
            <LoadingMask size="large" />
        </div>
    );
};
