// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";
import { withIntl, ITranslations } from "@gooddata/sdk-ui";

import { HeaderAccount } from "../HeaderAccount";
import { IHeaderMenuItem } from "../typings";

const menuItems: IHeaderMenuItem[] = [
    { isActive: true, key: "gs.header.account", href: "http://yahoo.com" },
    { isActive: false, key: "gs.header.dic", href: "" },
    { isActive: false, key: "gs.header.logout", href: "" },
];

const mockTranslation: ITranslations = {
    "gs.header.account": "Account",
    "gs.header.dic": "Dictionary",
    "gs.header.logout": "Logout",
};

const Wrapper = withIntl(HeaderAccount, "en-US", mockTranslation);

describe("HeaderAccount", () => {
    it("should render username", () => {
        const headerWrapper = mount(<Wrapper items={menuItems} onMenuItemClick={noop} userName="John Doe" />);

        expect(headerWrapper.find(".gd-header-account-user").text()).toEqual("John Doe");
    });

    it("should open menu on click", () => {
        const clickSpy = jest.fn();
        const headerAccount = mount(<Wrapper items={menuItems} onMenuItemClick={clickSpy} />);

        expect(headerAccount.find(".gd-header-account-dropdown")).toHaveLength(0);
        headerAccount.simulate("click");

        expect(headerAccount.find(".gd-header-account-dropdown")).toHaveLength(1);

        headerAccount.find(".gd-header-account-dropdown a").first().simulate("click");

        expect(clickSpy).toHaveBeenCalledTimes(1);
    });
});
