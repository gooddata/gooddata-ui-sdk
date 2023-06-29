// (C) 2020 GoodData Corporation
import { Tabs } from "@gooddata/sdk-ui-kit";
import React from "react";
import { IntlProvider } from "react-intl";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

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

storiesOf(`${UiKit}/Tabs`)
    .add("full-featured", () => <TabsTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<TabsTest />), { screenshot: true });
