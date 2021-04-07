// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { withIntl, ITranslations } from "@gooddata/sdk-ui";

import { HeaderMenu } from "../HeaderMenu";
import { IHeaderMenuItem } from "../typings";

const sections: IHeaderMenuItem[][] = [
    [
        { isActive: true, key: "dic", href: "http://yahoo.com" },
        { isActive: false, key: "account", href: "" },
        { isActive: false, key: "logout", href: "" },
    ],
];

const mockTranslation: ITranslations = {
    account: "Account",
    dic: "Dictionary",
    logout: "Logout",
};

const Wrapped = withIntl(HeaderMenu, "en-US", mockTranslation);

describe("ReactHeaderMenu", () => {
    it("should render menu items", () => {
        const headerMenu = mount(<Wrapped sections={sections} />);

        expect(headerMenu.find("li")).toHaveLength(3);
        expect(headerMenu.find(".active").prop("href")).toEqual("http://yahoo.com");
    });

    it("should call click handler on menu item", () => {
        const clickSpy = jest.fn();
        const headerMenu = mount(<Wrapped sections={sections} onMenuItemClick={clickSpy} />);
        headerMenu.find("li a").first().simulate("click");

        expect(clickSpy).toHaveBeenCalledTimes(1);
    });
});
