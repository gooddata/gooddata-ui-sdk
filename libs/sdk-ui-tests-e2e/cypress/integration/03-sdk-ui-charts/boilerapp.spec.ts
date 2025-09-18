// (C) 2023-2025 GoodData Corporation

import { Headline } from "../../tools/headline";
import * as Navigation from "../../tools/navigation";

describe("Boiler app Chart", () => {
    beforeEach(() => {
        Navigation.visitBoilerApp();
    });

    it(
        `check boiler app tiger`,
        { tags: ["checklist_integrated_boiler_tiger", "checklist_integrated_boiler_bear"] },
        () => {
            const headline = new Headline(".insight-view-visualization .headline");
            headline.waitLoaded();
            headline.hasValue("35,844,132");
        },
    );
});
