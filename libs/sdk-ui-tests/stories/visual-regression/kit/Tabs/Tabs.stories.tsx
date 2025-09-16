// (C) 2020-2025 GoodData Corporation

import { IntlProvider } from "react-intl";

import { Tabs } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";

const tabs = [{ id: "01" }, { id: "02" }, { id: "03" }];

function TabsTest() {
    return (
        <IntlProvider
            locale="en-US"
            messages={{
                "01": "Tab 01",
                "02": "Tab 02",
                "03": "Tab 03",
            }}
        >
            <div className="library-component screenshot-target gd-datepicker">
                <Tabs tabs={tabs} selectedTabId="02" />
            </div>
        </IntlProvider>
    );
}

export default {
    title: "12 UI Kit/Tabs",
};

export function FullFeatured() {
    return <TabsTest />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<TabsTest />);
Themed.parameters = { kind: "themed", screenshot: true };
