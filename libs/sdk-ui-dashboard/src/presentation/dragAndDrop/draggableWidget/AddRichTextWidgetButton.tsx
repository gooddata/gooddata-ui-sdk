// (C) 2022-2024 GoodData Corporation
import { Icon } from "@gooddata/sdk-ui-kit";
import React from "react";
// import { FormattedMessage } from "react-intl";
import cx from "classnames";

export interface AddRichTextPlaceholderProps {
    disabled?: boolean; // TODO RICH-TEXT remove?
}

export const AddRichTextWidgetButton: React.FC<AddRichTextPlaceholderProps> = () => {
    return (
        <div
            className={cx(
                "add-item-placeholder add-item-placeholder-rich-text",
                "add-richText-placeholder",
                "s-add-rich-text",
            )}
        >
            <Icon.RichText />
            Rich Text
            {/* <FormattedMessage id="addPanel.kpi" /> */}
        </div>
    );
};
