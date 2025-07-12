// (C) 2022-2025 GoodData Corporation
import { Icon } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";

export function AddRichTextWidgetButton() {
    return (
        <div className="add-item-placeholder add-panel-item s-add-rich-text">
            <Icon.RichText />
            <FormattedMessage id="addPanel.richText" />
        </div>
    );
}
