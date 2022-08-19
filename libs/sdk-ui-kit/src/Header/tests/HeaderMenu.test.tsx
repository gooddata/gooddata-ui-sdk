// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { withIntl, ITranslations } from "@gooddata/sdk-ui";

import { HeaderMenu } from "../HeaderMenu";
import { IHeaderMenuItem } from "../typings";

const sections: IHeaderMenuItem[][] = [
    [
        { isActive: true, key: "dic", href: "https://example.com" },
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
        render(<Wrapped sections={sections} />);

        expect(screen.getByText(mockTranslation.account)).toBeInTheDocument();
        expect(screen.getByText(mockTranslation.dic)).toBeInTheDocument();
        expect(screen.getByText(mockTranslation.logout)).toBeInTheDocument();

        expect(screen.getByText(mockTranslation.dic).closest("a")).toHaveAttribute(
            "href",
            "https://example.com",
        );
    });

    it("should call click handler on menu item", async () => {
        const clickSpy = jest.fn();
        render(<Wrapped sections={sections} onMenuItemClick={clickSpy} />);

        await userEvent.click(screen.getByText(mockTranslation.dic));

        await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
    });
});
