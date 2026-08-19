// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-model";

import { PermissionsContext } from "../permissions/PermissionsContext.js";

import { SearchCertificationIcon } from "./SearchCertificationIcon.js";

const ICON_SELECTOR = ".gd-semantic-search__certification-icon";

/**
 * Renders the icon with the real feature flag gate driven by an explicit PermissionsContext value.
 *
 * The context is provided per render instead of mocking `./gate.js`, and `@gooddata/sdk-ui-kit` is
 * left un-mocked, so that this file neither depends on nor pollutes the shared module registry when
 * tests run without isolation.
 */
const renderIcon = (children: ReactNode, settings: Partial<IUserWorkspaceSettings> = {}) =>
    render(
        <IntlProvider
            locale="en-US"
            messages={{ "uiKit.certification.tooltip.title": "Certified" }}
            onError={() => {}}
        >
            <PermissionsContext.Provider value={{ loading: false, permissions: {}, settings }}>
                {children}
            </PermissionsContext.Provider>
        </IntlProvider>,
    );

const enabled: Partial<IUserWorkspaceSettings> = { enableCertification: true };

describe("SearchCertificationIcon", () => {
    it("renders nothing when certification is undefined", () => {
        const { container } = renderIcon(<SearchCertificationIcon />, enabled);
        expect(container.querySelector(ICON_SELECTOR)).toBeNull();
    });

    it("renders nothing when certification status is not CERTIFIED (runtime guard)", () => {
        // Simulates a future backend status value not yet modelled in the type
        const unknownStatus = { status: "DEPRECATED" } as never;
        const { container } = renderIcon(<SearchCertificationIcon certification={unknownStatus} />, enabled);
        expect(container.querySelector(ICON_SELECTOR)).toBeNull();
    });

    it("renders icon when certification status is CERTIFIED", () => {
        const { container } = renderIcon(
            <SearchCertificationIcon
                certification={{ status: "CERTIFIED", certificationMessage: "Approved" }}
            />,
            enabled,
        );
        expect(container.querySelector(ICON_SELECTOR)).not.toBeNull();
    });

    it("renders icon with no message when certificationMessage is absent", () => {
        const { container } = renderIcon(
            <SearchCertificationIcon certification={{ status: "CERTIFIED" }} />,
            enabled,
        );
        expect(container.querySelector(ICON_SELECTOR)).not.toBeNull();
    });

    it("renders nothing when enableCertification feature flag is off", () => {
        const { container } = renderIcon(
            <SearchCertificationIcon certification={{ status: "CERTIFIED" }} />,
            { enableCertification: false },
        );
        expect(container.querySelector(ICON_SELECTOR)).toBeNull();
    });
});
