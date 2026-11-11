// (C) 2019-2026 GoodData Corporation

import { type ReactNode } from "react";

import { _omit } from "@gooddata/util";

import { UnsupportedProperties } from "../configurationControls/UnsupportedProperties.js";

import { ConfigurationPanelContent } from "./ConfigurationPanelContent.js";

export class UnsupportedConfigurationPanel extends ConfigurationPanelContent {
    public override componentDidMount(): void {
        this.props.pushData?.({
            properties: _omit(this.props.properties, "controls"),
            references: null,
            ignoreUndoRedo: true,
        });
    }

    protected override isControlDisabled(): boolean {
        return true;
    }

    protected renderConfigurationPanel(): ReactNode {
        return <UnsupportedProperties />;
    }
}
