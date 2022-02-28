// (C) 2021 GoodData Corporation
import axios from "axios";

export default ((on, _config) => {
    on("task", {
        async resetRecordingsScenarios(mockServerUrl) {
            try {
                const response = await axios.post(`${mockServerUrl}/__admin/scenarios/reset`);
                return response.data;
            } catch (e) {
                if (e.code === "ECONNREFUSED") {
                    throw new Error("Cannot reach the Wiremock server. Make sure it's running");
                }
                throw e;
            }
        },
    });
}) as Cypress.PluginConfig;
