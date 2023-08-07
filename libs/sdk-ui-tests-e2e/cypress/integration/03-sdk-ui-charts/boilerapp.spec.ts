// (C) 2023 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { Headline } from "../../tools/headline";
import { getBackend } from "../../support/constants";

describe("Boiler app Chart", () => {
    beforeEach(() => {
        Navigation.visitBoilerApp();
    });

    it(
        `check boiler app tiger`,
        { tags: ["checklist_integrated_boiler_tiger", "checklist_integrated_boiler_bear"] },
        () => {
            const headline = new Headline(".insight-view-container .headline");
            headline.waitLoaded();
            if (getBackend() === "BEAR") headline.hasValue("$116,625,456.54");
            else headline.hasValue("35,844,132");
        },
    );
});
