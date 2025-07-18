// (C) 2022-2025 GoodData Corporation
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Intl } from "@gooddata/sdk-ui";
import { describe, it, expect, vi } from "vitest";

import { SettingItem } from "../SettingItem.js";
import { ISettingItem } from "../typings.js";

describe("ReactSettingItem", () => {
    it("should render setting item", () => {
        const props: ISettingItem = {
            title: "Setting Item title",
            value: "Setting Item value",
            actionType: "LinkButton",
            actionValue: "Change",
        };
        const { container } = render(
            <Intl>
                <SettingItem {...props} />
            </Intl>,
        );

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
            onAction: vi.fn(),
        };
        const { container } = render(
            <Intl>
                <SettingItem {...props} />
            </Intl>,
        );

        expect(container.getElementsByClassName("gd-button-link-dimmed").length).toBe(0);
        expect(container.getElementsByClassName("input-checkbox-toggle").length).toBe(1);
    });

    it("should call click action on setting item", async () => {
        const clickSpy = vi.fn();
        const props: ISettingItem = {
            title: "Setting Item title",
            value: "",
            actionType: "LinkButton",
            actionValue: "Change",
            onAction: clickSpy,
        };

        render(
            <Intl>
                <SettingItem {...props} />
            </Intl>,
        );

        await userEvent.click(screen.getByText(props.actionValue as string));

        await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
    });
});
