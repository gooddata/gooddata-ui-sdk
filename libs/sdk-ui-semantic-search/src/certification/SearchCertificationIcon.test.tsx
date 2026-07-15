// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SearchCertificationIcon } from "./SearchCertificationIcon.js";

vi.mock("@gooddata/sdk-ui-kit", () => ({
    UiCertificationIcon: () => <div data-testid="certification-icon" />,
}));

let certificationEnabled = true;
vi.mock("./gate.js", () => ({
    useIsSearchCertificationEnabled: () => certificationEnabled,
}));

describe("SearchCertificationIcon", () => {
    it("renders nothing when certification is undefined", () => {
        const { container } = render(<SearchCertificationIcon />);
        expect(container.firstChild).toBeNull();
    });

    it("renders nothing when certification status is not CERTIFIED (runtime guard)", () => {
        // Simulates a future backend status value not yet modelled in the type
        const unknownStatus = { status: "DEPRECATED" } as never;
        const { container } = render(<SearchCertificationIcon certification={unknownStatus} />);
        expect(container.firstChild).toBeNull();
    });

    it("renders icon when certification status is CERTIFIED", () => {
        const { getByTestId } = render(
            <SearchCertificationIcon
                certification={{ status: "CERTIFIED", certificationMessage: "Approved" }}
            />,
        );
        expect(getByTestId("certification-icon")).toBeTruthy();
    });

    it("renders icon with no message when certificationMessage is absent", () => {
        const { getByTestId } = render(<SearchCertificationIcon certification={{ status: "CERTIFIED" }} />);
        expect(getByTestId("certification-icon")).toBeTruthy();
    });

    it("renders nothing when enableCertification feature flag is off", () => {
        certificationEnabled = false;
        const { container } = render(<SearchCertificationIcon certification={{ status: "CERTIFIED" }} />);
        expect(container.firstChild).toBeNull();
        certificationEnabled = true;
    });
});
