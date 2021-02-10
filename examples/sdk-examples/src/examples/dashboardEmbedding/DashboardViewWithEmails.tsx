// (C) 2007-2018 GoodData Corporation
import React, { useState } from "react";
import { DashboardView } from "@gooddata/sdk-ui-ext/esm/internal";
import { idRef } from "@gooddata/sdk-model";
import { MAPBOX_TOKEN } from "../../constants/fixtures";

const dashboardRef = idRef("aeO5PVgShc0T");
const config = { mapboxToken: MAPBOX_TOKEN };

const DashboardViewWithEmails: React.FC = () => {
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    return (
        <>
            <button onClick={() => setIsEmailDialogOpen(true)}>Open Schedule Email Dialog</button>
            <DashboardView
                dashboard={dashboardRef}
                config={config}
                isScheduledMailDialogVisible={isEmailDialogOpen}
                onScheduledMailDialogCancel={() => setIsEmailDialogOpen(false)}
                onScheduledMailSubmitSuccess={() => {
                    alert("Scheduled email scheduled successfully");
                    setIsEmailDialogOpen(false);
                }}
                onScheduledMailSubmitError={() => {
                    alert("Scheduled email error");
                    setIsEmailDialogOpen(false);
                }}
                isReadOnly
            />
        </>
    );
};

export default DashboardViewWithEmails;
