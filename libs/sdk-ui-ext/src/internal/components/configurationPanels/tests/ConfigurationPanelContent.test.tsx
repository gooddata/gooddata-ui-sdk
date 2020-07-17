// (C) 2019 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { DefaultLocale } from "@gooddata/sdk-ui";
import ConfigurationPanelContent, {
    IConfigurationPanelContentProps,
} from "../../configurationPanels/ConfigurationPanelContent";

class DummyConfigurationPanel extends ConfigurationPanelContent {
    constructor(props: IConfigurationPanelContentProps) {
        super(props);
        this.supportedPropertiesList = ["example"];
    }

    protected isControlDisabled() {
        return false;
    }

    protected renderConfigurationPanel() {
        return <div className="configuration_panel" />;
    }
}

describe("ConfigurationPanelContent", () => {
    function createComponent(
        props: IConfigurationPanelContentProps = {
            locale: DefaultLocale,
        },
    ) {
        return shallow<IConfigurationPanelContentProps, null>(<DummyConfigurationPanel {...props} />, {
            lifecycleExperimental: true,
        });
    }

    it("should render dummy configuration panel", () => {
        const wrapper = createComponent();
        expect(wrapper.find("div.configuration_panel").length).toBe(1);
    });
});
