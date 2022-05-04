// (C) 2022 GoodData Corporation

import React from "react";

import { LoadingMask } from "../../LoadingMask";

export const DialogListLoading: React.VFC = () => {
    return (
        <div className="gd-dialog-list-loading s-dialog-list-loading">
            <LoadingMask size="large" />
        </div>
    );
};
