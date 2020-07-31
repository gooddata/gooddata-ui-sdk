// (C) 2019 GoodData Corporation
import React from "react";
import omit from "lodash/omit";
import ConfigurationPanelContent from "./ConfigurationPanelContent";
import UnsupportedProperties from "../configurationControls/UnsupportedProperties";

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

    protected renderConfigurationPanel(): React.ReactNode {
        return <UnsupportedProperties />;
    }
}
