// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUsingLoginForm } from "./utils/helpers";

fixture("Execute") // eslint-disable-line no-undef
    .page(config.url)
    .beforeEach(loginUsingLoginForm(`${config.url}/execute`));

test("should display correct result and retry should fail", async t => {
    const kpi = Selector(".s-execute-kpi");
    const attributeValues = Selector(".s-execute-attribute-values");
    const retryButton = Selector(".s-retry-button");

    await t
        .expect(kpi.exists)
        .ok()
        .expect(kpi.textContent)
        .eql("92556577.3");

    await t
        .click(retryButton)
        .expect(Selector(".Error.s-error").exists)
        .ok();

    await t
        .expect(attributeValues.exists)
        .ok()
        .expect(attributeValues.textContent)
        .eql(
            "AlabamaMontgomeryCaliforniaDaly CityHaywardHighland VillageSan Jose - Blossom HillSan Jose - SaratogaFloridaAventuraDeerfield BeachNew YorkManhattan - HarlemTimes SquareTexasDallas - Lemmon AvenueIrving",
        );
});
