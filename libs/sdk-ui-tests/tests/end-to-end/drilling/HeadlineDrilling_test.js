// (C) 2007-2020 GoodData Corporation
import { Selector } from "testcafe";
import { navigateToStory } from "../_infra/testcafeUtils";

fixture("Headline drilling");

const headlineValue = Selector(".s-headline .s-headline-value").nth(0);

const lastEvent = Selector(".s-last-event");

const scenarios = [
    [
        "should work with measure identifier predicate",
        "50-stories-for-e2e-tests-drilling--headline-with-identifier-measure-drilling",
    ],
    [
        "should work with measure localId predicate",
        "50-stories-for-e2e-tests-drilling--headline-with-localid-measure-drilling",
    ],
];

scenarios.forEach(([name, path]) =>
    test(name, async (t) => {
        await navigateToStory(path)(t);

        await t.expect(lastEvent.innerText).eql("null");

        await t.expect(headlineValue.exists).ok();
        await t.click(headlineValue);

        await t.expect(lastEvent.innerText).match(/Won/);
    }),
);
