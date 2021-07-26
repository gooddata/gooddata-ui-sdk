import { Selector, t } from "testcafe";

fixture("Header").page(`${process.env.TEST_BACKEND}`);

test("Click on login link should open login form", async () => {
    const loginLink = Selector("nav .s-login-link").nth(0);

    await t.click(loginLink);
    await t.expect(Selector(".s-login-form")).ok();
});
