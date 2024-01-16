// (C) 2022-2024 GoodData Corporation
import React from "react";
// import { FormattedMessage } from "react-intl";
import cx from "classnames";

export interface AddRichTextPlaceholderProps {
    disabled?: boolean; // TODO RICH-TEXT remove?
}

export const AddRichTextWidgetButton: React.FC<AddRichTextPlaceholderProps> = () => {
    return (
        <div className={cx("add-item-placeholder", "add-richText-placeholder", "s-add-kpi")}>
            Rich Text
            {/* <FormattedMessage id="addPanel.kpi" /> */}
        </div>
    );
};
