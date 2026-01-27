// (C) 2023-2026 GoodData Corporation

import { Headline } from "../../tools/headline";
import { visitBoilerApp } from "../../tools/navigation";

describe("Boiler app Chart", () => {
    beforeEach(() => {
        visitBoilerApp();
    });

    it(
        `check boiler app tiger`,
        { tags: ["checklist_integrated_boiler_tiger_be", "checklist_integrated_boiler_bear"] },
        () => {
            const headline = new Headline(".insight-view-visualization .headline");
            headline.waitLoaded();
            headline.hasValue("35,844,132");
        },
    );
});
