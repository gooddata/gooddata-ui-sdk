// (C) 2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";

fixture("Registration").page(`${config.url}/registration`);

test("should show registration page", async t => {
    const registrationTitleElement = Selector("div").withText("Registration");
    const labelElements = {
        firstNameElement: Selector("div").withText("First name"),
        lastNameElement: Selector("div").withText("Last name"),
        companyElement: Selector("div").withText("Company"),
        emailElement: Selector("div").withText("E-mail"),
        passwordElement: Selector("div").withText("Password"),
        termsOfUseElement: Selector("div").withText("I agree with the GoodData"),
    };

    const inputElements = {
        firstNameElement: labelElements.firstNameElement.find("input").withAttribute("id", "firstName"),
        lastNameElement: labelElements.lastNameElement.find("input").withAttribute("id", "lastName"),
        companyElement: labelElements.companyElement.find("input").withAttribute("id", "company"),
        emailElement: labelElements.emailElement.find("input").withAttribute("id", "email"),
        passwordElement: labelElements.emailElement.find("input").withAttribute("id", "password"),
        termsOfUseElement: labelElements.termsOfUseElement.find("input").withAttribute("id", "termsOfUse"),
    };

    const captchaElement = Selector("iframe").withAttribute("src", /recaptcha/);

    await t.expect(registrationTitleElement.exists).ok();
    await t.expect(captchaElement.exists).ok();

    const labelPromises = Object.keys(labelElements).map(async key => {
        await t.expect(labelElements[key].exists).ok();
    });

    const inputPromises = Object.keys(inputElements).map(async key => {
        await t.expect(inputElements[key].exists).ok();
    });

    await Promise.all([...labelPromises, ...inputPromises]);
});
