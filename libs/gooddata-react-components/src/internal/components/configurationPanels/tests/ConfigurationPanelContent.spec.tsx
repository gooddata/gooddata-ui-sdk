// (C) 2019 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import ConfigurationPanelContent, {
    IConfigurationPanelContentProps,
} from "../../configurationPanels/ConfigurationPanelContent";
import { DEFAULT_LOCALE } from "../../../../constants/localization";

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
            locale: DEFAULT_LOCALE,
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
