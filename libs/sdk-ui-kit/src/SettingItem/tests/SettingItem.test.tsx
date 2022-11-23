// (C) 2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { withIntl } from "@gooddata/sdk-ui";

import { SettingItem } from "../SettingItem";
import { ISettingItem } from "../typings";

const Wrapped = withIntl(SettingItem);

describe("ReactSettingItem", () => {
    it("should render setting item", () => {
        const props: ISettingItem = {
            title: "Setting Item title",
            value: "Setting Item value",
            actionType: "LinkButton",
            actionValue: "Change",
        };
        const { container } = render(<Wrapped {...props} />);

        expect(screen.getByText(props.title)).toBeInTheDocument();
        expect(screen.getByText(props.value as string)).toBeInTheDocument();
        expect(screen.getByText(props.actionValue as string)).toBeInTheDocument();
        expect(container.getElementsByClassName("gd-button-link-dimmed").length).toBe(1);
    });

    it("should render setting item with Switcher as an action", () => {
        const props: ISettingItem = {
            title: "Setting Item title",
            value: "Setting Item value",
            actionType: "Switcher",
            actionValue: true,
            onAction: jest.fn(),
        };
        const { container } = render(<Wrapped {...props} />);

        expect(container.getElementsByClassName("gd-button-link-dimmed").length).toBe(0);
        expect(container.getElementsByClassName("input-checkbox-toggle").length).toBe(1);
    });

    it("should call click action on setting item", async () => {
        const clickSpy = jest.fn();
        const props: ISettingItem = {
            title: "Setting Item title",
            value: "",
            actionType: "LinkButton",
            actionValue: "Change",
            onAction: clickSpy,
        };

        render(<Wrapped {...props} />);

        await userEvent.click(screen.getByText(props.actionValue as string));

        await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
    });
});
