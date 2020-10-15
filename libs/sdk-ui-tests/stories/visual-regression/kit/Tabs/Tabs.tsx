// (C) 2020 GoodData Corporation
import { Tabs } from "@gooddata/sdk-ui-kit";
import React from "react";
import { IntlProvider } from "react-intl";
import { storiesOf } from "@storybook/react";
import { UiKit } from "../../../_infra/storyGroups";
import { withScreenshot } from "../../../_infra/backstopWrapper";

import "@gooddata/sdk-ui-kit/styles/css/main.css";

const tabs = [{ id: "01" }, { id: "02" }, { id: "03" }];

const TabsTest: React.FC = () => {
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
};

storiesOf(`${UiKit}/Tabs`, module).add("full-featured", () => {
    return withScreenshot(<TabsTest />);
});
