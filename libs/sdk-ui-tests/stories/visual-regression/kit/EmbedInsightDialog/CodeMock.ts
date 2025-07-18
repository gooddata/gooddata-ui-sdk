// (C) 2022-2025 GoodData Corporation

export const code = `//this is sample code
import "@gooddata/sdk-ui-dashboard/styles/css/main.css";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";

const dashboard = idRef("aacJbyLoz5at");

export const EmbeddedDashboard = () => <Dashboard dashboard={dashboard} />;`;
