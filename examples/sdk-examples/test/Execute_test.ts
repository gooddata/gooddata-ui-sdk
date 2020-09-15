// (C) 2007-2020 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUserAndNavigate } from "./utils/helpers";

fixture("Execute").beforeEach(loginUserAndNavigate(`${config.url}/execute`));

test("should display correct result and retry should fail", async (t) => {
    const kpi = Selector(".s-execute-kpi");
    const attributeValues = Selector(".s-execute-attribute-values");
    const retryButton = Selector(".s-retry-button");

    await t
        .expect(kpi.exists)
        .ok()
        .expect(kpi.textContent)
        .match(/\$[0-9,]+/);

    await t.click(retryButton).expect(Selector(".Error.s-error").exists).ok();

    await t
        .expect(attributeValues.exists)
        .ok()
        .expect(attributeValues.textContent)
        .eql(
            "AlabamaMontgomeryCaliforniaDaly CityHaywardHighland VillageSan Jose - Blossom HillSan Jose - SaratogaFloridaAventuraDeerfield BeachNew YorkManhattan - HarlemTimes SquareTexasDallas - Lemmon AvenueIrving",
        );
});
