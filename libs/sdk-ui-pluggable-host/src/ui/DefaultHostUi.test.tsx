// (C) 2026 GoodData Corporation

import { act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";
import { type IHostUiMountHandle, type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { defaultHostUiModule } from "./DefaultHostUi.js";
import { setHostPricingExtension } from "./useHostChromePricing.js";

vi.mock("../platformContext/backend.js", () => ({
    getBackend: () => ({
        organizations: () => ({
            getCurrentOrganization: () =>
                Promise.resolve({ settings: () => ({ getSettings: () => Promise.resolve({}) }) }),
        }),
    }),
}));

const userSettings = { userId: "jane.doe", locale: "en-US" } as IPlatformContext["userSettings"];
const ctx: IPlatformContext = {
    version: "1.0",
    embeddingMode: "none",
    auth: { type: "contextDeferred" },
    user: { ref: idRef("jane.doe"), login: "jane.doe", fullName: "Jane Doe" },
    userSettings,
    settings: userSettings,
    whiteLabeling: undefined,
    organization: { id: "org1", title: "Acme Corp" },
    preferredLocale: "en-US",
};

describe("defaultHostUiModule", () => {
    const onUpsellButtonClick = vi.fn();
    let handle: IHostUiMountHandle | undefined;

    afterEach(() => {
        act(() => handle?.unmount());
        handle = undefined;
        setHostPricingExtension(undefined);
        onUpsellButtonClick.mockClear();
    });

    function mountWithTrial(isTrial: boolean): IHostUiMountHandle {
        setHostPricingExtension(() => ({ element: null, isTrial, expiredDate: "", onUpsellButtonClick }));
        let mounted: IHostUiMountHandle | undefined;
        act(() => {
            mounted = defaultHostUiModule.mount({
                container: document.createElement("div"),
                ctx,
                resolvedApplications: [],
                pathname: "/organization",
                navigate: () => {},
                replace: () => {},
            });
        });
        if (!mounted) {
            throw new Error("The host UI did not mount.");
        }
        handle = mounted;
        return mounted;
    }

    it.each([
        ["opens the pricing dialog in a trial organization", true, 1],
        ["does nothing outside a trial organization", false, 0],
    ])("%s", (_case, isTrial, expectedCalls) => {
        mountWithTrial(isTrial).openPricingDialog?.();

        expect(onUpsellButtonClick).toHaveBeenCalledTimes(expectedCalls);
    });

    it("ignores a pricing dialog request after unmount", () => {
        const mounted = mountWithTrial(true);
        act(() => mounted.unmount());
        handle = undefined;

        mounted.openPricingDialog?.();

        expect(onUpsellButtonClick).not.toHaveBeenCalled();
    });
});
