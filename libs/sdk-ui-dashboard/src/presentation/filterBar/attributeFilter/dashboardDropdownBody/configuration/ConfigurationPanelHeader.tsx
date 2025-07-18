// (C) 2022-2025 GoodData Corporation
import { Typography } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";

export function ConfigurationPanelHeader() {
    return (
        <div className="configuration-panel-header">
            <Typography tagName="h3" className="configuration-panel-header-title">
                <FormattedMessage id="attributesDropdown.configuration" />
            </Typography>
        </div>
    );
}
