import { Selector, t } from "testcafe";

fixture("Page").page(`${process.env.TEST_BACKEND}`);

test("Page should render correctly", async () => {
    await t.expect(Selector(".s-page").exists).ok();
});
