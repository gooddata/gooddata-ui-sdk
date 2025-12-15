// (C) 2022-2025 GoodData Corporation

import { SimpleSettingWidget } from "@gooddata/sdk-ui-kit";

import { type INeobackstopScenarioConfig, type IStoryParameters } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

function SimpleSettingWidgetTest() {
    return (
        <div style={{ maxWidth: "600px" }}>
            <div className="library-component screenshot-target">
                <SimpleSettingWidget
                    onSubmit={() => {}}
                    isLoading={false}
                    title={"White-labeling"}
                    currentSettingStatus={"Disabled"}
                    titleTooltip={"Remove branding elements in the GoodData Portal"}
                    helpLinkText={"What is white-labeled?"}
                    helpLinkUrl="/"
                    actionButtonText={"Enable"}
                    onHelpLinkClick={() => {}}
                />
            </div>
            <div className="library-component screenshot-target">
                <SimpleSettingWidget
                    onSubmit={() => {}}
                    isLoading
                    title={"Component title"}
                    currentSettingStatus={"Status"}
                    titleTooltip={"Tooltip"}
                    helpLinkText={"Documentation"}
                    helpLinkUrl="/"
                    actionButtonText={"Submit"}
                    onHelpLinkClick={() => {}}
                />
            </div>
        </div>
    );
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "12 UI Kit/SimpleSettingWidget",
};

const screenshotConfig: INeobackstopScenarioConfig = {
    readySelector: ".screenshot-target",
    misMatchThreshold: 0.025, // misMatchThreshold needed for loading spinner
};

export function FullFeatured() {
    return <SimpleSettingWidgetTest />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: screenshotConfig } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<SimpleSettingWidgetTest />);
Themed.parameters = { kind: "themed", screenshot: screenshotConfig } satisfies IStoryParameters;
