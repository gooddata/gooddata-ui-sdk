---
title: Embed an Insight Created in Analytical Designer
linkTitle: Embed an Insight
copyright: (C) 2007-2021 GoodData Corporation
weight: 12
---

To embed an existing dashboard created in KPI Dashboards, use the [Dashboard component](../../../references/dashboard_component/).

**Steps:**

1. Obtain the identifier of the dashboard via [catalog-export](../../visualize_data/export_catalog/).

2. Import the Dashboard component from the `@gooddata/sdk-ui-dashboard` package into your app:

    ```javascript
    import { Dashboard } from "@gooddata/sdk-ui-dashboard";
    ```

3. Create a `Dashboard` component in your app, and provide it with the workspace ID and the visualization identifier that you obtained at Step 1:

    ```jsx
    import { idRef } from "@gooddata/sdk-model";
    import { Dashboard } from "@gooddata/sdk-ui-dashboard";
    import "@gooddata/sdk-ui-dashboard/styles/css/main.css";

    <Dashboard dashboard={idRef("aby3polcaFxy")} />;
    ```

## Edit mode

The Dashboard component itself does not yet support editing of the dashboards. However, you can use the embedded KPI Dashboard application to edit the dashboards and then use the Dashboard component to view them.

**NOTE:** Any customization you may have set will **not** be applied to the embedded KPI Dashboards.

```jsx
import React, { useCallback, useEffect, useState } from "react";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-ui-model";
import { useWorkspace } from "@gooddata/sdk-ui";
import { EmbeddedKpiDashboard } from "@gooddata/sdk-embedding";

const dashboardRef = idRef("<dashboard-id>");
const backendUrl = "<backend-url>";

const containerStyle = {
    width: 1200, // set to at least 1170px, otherwise edit mode of KPI Dashboards will not work properly
    height: 800, // set a fixed height to prevent layout shifts when switching to and from edit mode
};

const DashboardEditExample = () => {
    const [isEditing, setIsEditing] = useState(false);
    const workspace = useWorkspace();

    const listener = useCallback((e) => {
        const type = e.data.gdc?.event.name;

        if (type === EmbeddedKpiDashboard.GdcKdEventType.DashboardSaved) {
            // switch back to view mode
            setIsEditing(false);
        } else if (type === EmbeddedKpiDashboard.GdcKdEventType.SwitchedToView) {
            // this means the user did not save the changes and clicked the "Cancel" button
            // so we just switch back to view mode
            setIsEditing(false);
        }
    }, []);

    useEffect(() => {
        // when switching to edit mode, attach an event listener to detect when the user is done with their edits
        // and we remove the listener when switching back
        if (isEditing) {
            window.addEventListener("message", listener, false);
        } else {
            window.removeEventListener("message", listener, false);
        }

        // clean up when this component is unmounted
        return () => window.removeEventListener("message", listener, false);
    }, [isEditing]);

    return (
        <div style={containerStyle}>
            {isEditing ? (
                {/*
                    - we use an iframe with a special URL constructed from the dashboard data
                      (the "?mode=edit" will make sure the KPI Dashboards will open directly in edit mode)
                    - we make sure it fills the whole parent container by setting the size to 100%

                    - if the FF "enableRenamingProjectToWorkspace" is true, then the iframe's src property
                      supports urls with the word "workspace" or "project".
                      Therefore, both of the urls below can be used to set the src property:
                      - `${backendUrl}/dashboards/embedded/#/workspace/${workspace}/dashboard/${dashboardId}?mode=edit`
                      - `${backendUrl}/dashboards/embedded/#/project/${workspace}/dashboard/${dashboardId}?mode=edit`

                    - if the FF "enableRenamingProjectToWorkspace" is false, then the iframe's src property
                      supports urls with the word "project" only.
                      Therefore, the url in the sample codes below should be changed to:
                      - `${backendUrl}/dashboards/embedded/#/project/${workspace}/dashboard/${dashboardId}?mode=edit`
                */}
                <iframe
                    src={`${backendUrl}/dashboards/embedded/#/workspace/${workspace}/dashboard/${dashboardId}?mode=edit`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                />
            ) : (
                <React.Fragment>
                    <button onClick={() => setIsEditing(true)}>
                        Edit dashboard using embedded KPI Dashboards
                    </button>
                    <Dashboard dashboard={dashboardRef} />
                </React.Fragment>
            )}
        </div>
    );
};
```
