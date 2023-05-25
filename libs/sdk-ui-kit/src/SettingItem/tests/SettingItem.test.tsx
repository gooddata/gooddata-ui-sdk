// (C) 2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import { withIntl } from "@gooddata/sdk-ui";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";

import { SettingItem } from "../SettingItem.js";
import { ISettingItem } from "../typings.js";

const Wrapped = withIntl(SettingItem);

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

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
            onAction: vi.fn(),
        };
        const { container } = render(<Wrapped {...props} />);

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

        render(<Wrapped {...props} />);

        await userEvent.click(screen.getByText(props.actionValue as string));

        await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
    });
});
