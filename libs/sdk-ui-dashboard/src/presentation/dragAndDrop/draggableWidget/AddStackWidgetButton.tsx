// (C) 2024 GoodData Corporation
import { Icon } from "@gooddata/sdk-ui-kit";
import React from "react";
import { FormattedMessage } from "react-intl";

export const AddStackWidgetButton: React.FC = () => {
    return (
        <div className="add-item-placeholder add-item-placeholder-stack s-add-stack">
            <Icon.RichText />
            <FormattedMessage id="addPanel.stack" />
        </div>
    );
};
