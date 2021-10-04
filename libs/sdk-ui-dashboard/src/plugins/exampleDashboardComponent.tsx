// (C) 2021 GoodData Corporation

import { Dashboard, useDashboardInsightProps } from "../presentation";
import React from "react";
import { idRef, IInsight, insightTags, insightTitle } from "@gooddata/sdk-model";
import { IInsightWidget } from "@gooddata/sdk-backend-spi";
import includes from "lodash/includes";
import { anyDashboardEventHandler, singleEventTypeHandler } from "../model/eventHandlers/eventHandler";

//
//
//

export const ExampleRenderEmptyDashboard: React.FC = () => {
    return <Dashboard />;
};

//
//
//

export const ExampleRenderExistingDashboard: React.FC = () => {
    return <Dashboard dashboardRef={idRef("some-dashboard-id")} />;
};

//
//
//

/**
 * Shows how it is possible to register to various model events. See DashboardEventType for full list
 * of events.
 *
 * @constructor
 */
export const ExampleGlobalRegisterForEvents: React.FC = () => {
    return (
        <Dashboard
            dashboardRef={idRef("some-dashboard-id")}
            eventHandlers={[
                singleEventTypeHandler("GDC.DASH/EVT.INITIALIZED", (_evt) => {
                    // eslint-disable-next-line no-console
                    console.log("global event handler for initialize");
                }),
                anyDashboardEventHandler((_evt) => {
                    // eslint-disable-next-line no-console
                    console.log("global event handler for all events");
                }),
            ]}
        />
    );
};

//
//
//

const CustomInsightRenderer: React.FC = () => {
    const { insight } = useDashboardInsightProps();
    // Note: we have hooks to drive the computation & get the data.. will add them here later

    return <div>Custom render for {insightTitle(insight)}</div>;
};

/**
 * Shows how it is possible to override rendering of particular insights. Let's say insight that has
 * some tag should be rendered differently.
 *
 * @constructor
 */
export const ExampleOverrideInsightRender: React.FC = () => {
    const customInsightComponentProvider = (insight: IInsight, _widget: IInsightWidget) => {
        if (includes(insightTags(insight), "my-custom-tag")) {
            return CustomInsightRenderer;
        }
    };

    return (
        <Dashboard
            dashboardRef={idRef("some-dashboard-id")}
            InsightComponentProvider={customInsightComponentProvider}
        />
    );
};

const CustomContent: React.FC = () => {
    return (
        <div>
            This custom content is rendered at the very top of the dashboard layout, right under the filter
            bar.
        </div>
    );
};

/**
 * Shows how it is possible to add custom content at the beginning of the dashboard layout. The CustomContent
 * will be under the filter bar and above the beginning of the dashboard layout itself.
 *
 * @constructor
 */
export const ExampleCustomContentAtTopOfTheLayout: React.FC = () => {
    return (
        <Dashboard dashboardRef={idRef("some-dashboard-id")}>
            <CustomContent />
        </Dashboard>
    );
};
