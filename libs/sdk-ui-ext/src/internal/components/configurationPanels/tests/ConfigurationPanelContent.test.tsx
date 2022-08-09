// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
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
        return <div>Configuration Panel</div>;
    }
}

describe("ConfigurationPanelContent", () => {
    function createComponent(
        props: IConfigurationPanelContentProps = {
            locale: DefaultLocale,
        },
    ) {
        return render(<DummyConfigurationPanel {...props} />);
    }

    it("should render dummy configuration panel", () => {
        const { getByText } = createComponent();
        expect(getByText("Configuration Panel")).toBeInTheDocument();
    });
});
