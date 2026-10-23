// (C) 2022-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { UiIcon } from "@gooddata/sdk-ui-kit";

export function AddRichTextWidgetButton() {
    return (
        <div className="add-item-placeholder add-panel-item s-add-rich-text">
            <div className="add-item-placeholder__icon">
                <UiIcon type="richText" size={18} layout="block" />
            </div>
            <FormattedMessage id="addPanel.richText" />
        </div>
    );
}
