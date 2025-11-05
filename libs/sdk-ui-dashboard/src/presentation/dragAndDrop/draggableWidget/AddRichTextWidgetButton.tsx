// (C) 2022-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { IconRichText } from "@gooddata/sdk-ui-kit";

export function AddRichTextWidgetButton() {
    return (
        <div className="add-item-placeholder add-panel-item s-add-rich-text">
            <IconRichText />
            <FormattedMessage id="addPanel.richText" />
        </div>
    );
}
