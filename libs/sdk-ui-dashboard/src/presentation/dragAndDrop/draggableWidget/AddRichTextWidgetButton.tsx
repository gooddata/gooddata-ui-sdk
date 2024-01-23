// (C) 2022-2024 GoodData Corporation
import { Icon } from "@gooddata/sdk-ui-kit";
import React from "react";
import { FormattedMessage } from "react-intl";

export const AddRichTextWidgetButton: React.FC = () => {
    return (
        <div className="add-item-placeholder add-item-placeholder-rich-text s-add-rich-text">
            <Icon.RichText />
            <FormattedMessage id="addPanel.richText" />
        </div>
    );
};
