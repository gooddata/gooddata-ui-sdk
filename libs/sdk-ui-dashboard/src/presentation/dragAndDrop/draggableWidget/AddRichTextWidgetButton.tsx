// (C) 2022-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { Icon } from "@gooddata/sdk-ui-kit";

const { RichText } = Icon;

export function AddRichTextWidgetButton() {
    return (
        <div className="add-item-placeholder add-panel-item s-add-rich-text">
            <RichText />
            <FormattedMessage id="addPanel.richText" />
        </div>
    );
}
