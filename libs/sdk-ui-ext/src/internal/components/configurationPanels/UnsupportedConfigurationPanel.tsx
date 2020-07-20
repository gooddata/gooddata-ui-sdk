// (C) 2019 GoodData Corporation
import React = require("react");
import omit from "lodash/omit";
import ConfigurationPanelContent from "./ConfigurationPanelContent";
import UnsupportedProperties from "../configurationControls/UnsupportedProperties";

export default class UnsupportedConfigurationPanel extends ConfigurationPanelContent {
    public componentDidMount() {
        this.props.pushData({
            properties: omit(this.props.properties, "controls"),
            references: null,
            ignoreUndoRedo: true,
        });
    }

    protected isControlDisabled() {
        return true;
    }

    protected renderConfigurationPanel() {
        return <UnsupportedProperties />;
    }
}
