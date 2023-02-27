// (C) 2023 GoodData Corporation
import * as Navigation from "../../tools/navigation";

import LocalizationApi from "../../tools/apiRequest/LocalizationApi";
import { DateFilter } from "../../tools/dateFilter";

Cypress.Cookies.defaults({
    preserve: ["GDCAuthTT", "GDCAuthSTT", "_csrfToken"],
});

Cypress.on("uncaught:exception", (error) => {
    console.error("Uncaught exception cause", error);
    return false;
});

Cypress.Cookies.debug(true);

const localizationApi = new LocalizationApi();

const WORKSPACE_LEVEL = "workspaceSetting";
const USER_LEVEL = "userSetting";

describe("Dashboard Component setting via API", { tags: ["checklist_integrated_tiger"] }, () => {
    beforeEach(() => {
        localizationApi.deleteLocaleSettingViaAPI(WORKSPACE_LEVEL);
        localizationApi.deleteLocaleSettingViaAPI(USER_LEVEL);
    });

    it("Locale setting is applied on InsightView", () => {
        localizationApi.localeSettingViaAPI("ru-RU", WORKSPACE_LEVEL);
        cy.login();
        Navigation.visit("dashboard/drag-drop-widgets");

        new DateFilter().getDateButtonTitle().should("have.text", "Диапазон дат");
    });

    afterEach(() => {
        localizationApi.deleteLocaleSettingViaAPI(WORKSPACE_LEVEL);
    });
});
