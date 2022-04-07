// (C) 2007-2019 GoodData Corporation
import { ClientFunction, Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUsingLoginForm } from "./utils/helpers";

fixture("Login").page(config.url);

test("should show login overlay and log in successfully", async (t) => {
    const getLocation = ClientFunction(() => document.location.pathname);
    const isLoggedInElement = Selector(".s-isLoggedIn");
    await loginUsingLoginForm()(t);
    await t.expect(getLocation()).eql("/");
    await t.expect(isLoggedInElement.exists).ok();
});
