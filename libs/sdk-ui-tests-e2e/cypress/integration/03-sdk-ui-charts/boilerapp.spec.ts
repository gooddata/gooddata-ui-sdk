// (C) 2023-2024 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { Headline } from "../../tools/headline";

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
            headline.hasValue("35,844,132");
        },
    );
});
