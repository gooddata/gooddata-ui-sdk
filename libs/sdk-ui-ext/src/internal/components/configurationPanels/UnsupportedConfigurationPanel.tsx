// (C) 2019-2025 GoodData Corporation
import { ReactNode } from "react";
import omit from "lodash/omit.js";
import ConfigurationPanelContent from "./ConfigurationPanelContent.js";
import UnsupportedProperties from "../configurationControls/UnsupportedProperties.js";

export default class UnsupportedConfigurationPanel extends ConfigurationPanelContent {
    public componentDidMount(): void {
        this.props.pushData({
            properties: omit(this.props.properties, "controls"),
            references: null,
            ignoreUndoRedo: true,
        });
    }

    protected isControlDisabled(): boolean {
        return true;
    }

    protected renderConfigurationPanel(): ReactNode {
        return <UnsupportedProperties />;
    }
}
