// (C) 2022-2024 GoodData Corporation
import { Icon } from "@gooddata/sdk-ui-kit";
import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";

export const AddRichTextWidgetButton: React.FC = () => {
    return (
        <div
            className={cx(
                "add-item-placeholder add-item-placeholder-rich-text",
                "add-richText-placeholder",
                "s-add-rich-text",
            )}
        >
            <Icon.RichText />
            <FormattedMessage id="addPanel.richText" />
        </div>
    );
};
