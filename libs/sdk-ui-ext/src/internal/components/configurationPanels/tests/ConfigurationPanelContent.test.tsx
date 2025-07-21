// (C) 2019-2025 GoodData Corporation
import { render, screen } from "@testing-library/react";
import { DefaultLocale } from "@gooddata/sdk-ui";
import { describe, it, expect } from "vitest";

import ConfigurationPanelContent, { IConfigurationPanelContentProps } from "../ConfigurationPanelContent.js";

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
        createComponent();
        expect(screen.getByText("Configuration Panel")).toBeInTheDocument();
    });
});
