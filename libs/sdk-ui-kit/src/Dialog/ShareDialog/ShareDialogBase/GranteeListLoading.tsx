// (C) 2021-2025 GoodData Corporation

import { LoadingMask } from "../../../LoadingMask/LoadingMask.js";

/**
 * @internal
 */
export function GranteeListLoading() {
    return (
        <div className="gd-share-dialog-grantee-list-empty-selection">
            <LoadingMask size="large" />
        </div>
    );
}
