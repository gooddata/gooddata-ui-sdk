// (C) 2021-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";

export const MessageListError: React.VFC = () => (
    <div className="gd-message error">
        <FormattedMessage id="gs.list.error" />
    </div>
);
