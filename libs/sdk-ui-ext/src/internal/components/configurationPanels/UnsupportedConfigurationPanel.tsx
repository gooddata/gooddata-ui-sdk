// (C) 2019-2026 GoodData Corporation

import { type ReactNode } from "react";

import { omit } from "lodash-es";

import { UnsupportedProperties } from "../configurationControls/UnsupportedProperties.js";
import { ConfigurationPanelContent } from "./ConfigurationPanelContent.js";

export class UnsupportedConfigurationPanel extends ConfigurationPanelContent {
    public override componentDidMount(): void {
        this.props.pushData?.({
            properties: omit(this.props.properties, "controls"),
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
