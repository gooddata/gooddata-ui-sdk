// (C) 2020-2022 GoodData Corporation

import { isFreemiumEdition, shouldEnableNewNavigation, shouldHidePPExperience } from "../featureFlags";

describe("featureFlags utils", () => {
    describe("shouldHidePPExperience", () => {
        it("should hide pixel perfect experience if hidePixelPerfectExperience is true", () => {
            const shouldHidePixelperfect = shouldHidePPExperience({
                enablePixelPerfectExperience: false,
                hidePixelPerfectExperience: true,
            });
            expect(shouldHidePixelperfect).toBe(true);
        });

        it("should hide pixel perfect experience if hidePixelPerfectExperience is false and enablePixelPerfectExperience is false", () => {
            const shouldHidePixelperfect = shouldHidePPExperience({
                enablePixelPerfectExperience: false,
                hidePixelPerfectExperience: false,
            });
            expect(shouldHidePixelperfect).toBe(true);
        });

        it("should not hide pixel perfect experience if hidePixelPerfectExperience is false and enablePixelPerfectExperience is true", () => {
            const shouldHidePixelperfect = shouldHidePPExperience({
                enablePixelPerfectExperience: true,
                hidePixelPerfectExperience: false,
            });
            expect(shouldHidePixelperfect).toBe(false);
        });
    });

    describe("isFreemiumEdition", () => {
        it("should return false if user is not free/growth", () => {
            const isFreemiumCustomer = isFreemiumEdition("enterprise");
            expect(isFreemiumCustomer).toBe(false);
        });

        it("should return true if user is growth", () => {
            const isFreemiumCustomer = isFreemiumEdition("growth");
            expect(isFreemiumCustomer).toBe(true);
        });

        it("should return true if user is free", () => {
            const isFreemiumCustomer = isFreemiumEdition("free");
            expect(isFreemiumCustomer).toBe(true);
        });

        it("should return false if user is not defined", () => {
            const isFreemiumCustomer = isFreemiumEdition(undefined);
            expect(isFreemiumCustomer).toBe(false);
        });
    });

    describe("shouldEnableNewNavigation", () => {
        describe("Free user", () => {
            it("should return false if enableNewNavigationForResponsiveUi is false and platformEdition is free", () => {
                const enableNewNavigation = shouldEnableNewNavigation({
                    enableNewNavigationForResponsiveUi: false,
                    platformEdition: "free",
                });
                expect(enableNewNavigation).toBe(false);
            });

            it("should return true if enableNewNavigationForResponsiveUi is true and platformEdition is free", () => {
                const enableNewNavigation = shouldEnableNewNavigation({
                    enableNewNavigationForResponsiveUi: true,
                    platformEdition: "free",
                });
                expect(enableNewNavigation).toBe(true);
            });
        });

        describe("Growth user", () => {
            it("should return false if enableNewNavigationForResponsiveUi is false and platformEdition is growth", () => {
                const enableNewNavigation = shouldEnableNewNavigation({
                    enableNewNavigationForResponsiveUi: false,
                    platformEdition: "growth",
                });
                expect(enableNewNavigation).toBe(false);
            });

            it("should return true if hidePixelPerfectExperience is true", () => {
                const enableNewNavigation = shouldEnableNewNavigation({
                    hidePixelPerfectExperience: true,
                    enablePixelPerfectExperience: false,
                    enableNewNavigationForResponsiveUi: true,
                    platformEdition: "growth",
                });
                expect(enableNewNavigation).toBe(true);
            });

            it("should return true if hidePixelPerfectExperience is false and enablePixelPerfectExperience is false", () => {
                const enableNewNavigation = shouldEnableNewNavigation({
                    hidePixelPerfectExperience: false,
                    enablePixelPerfectExperience: false,
                    enableNewNavigationForResponsiveUi: true,
                    platformEdition: "growth",
                });
                expect(enableNewNavigation).toBe(true);
            });

            it("should return false if hidePixelPerfectExperience is false and enablePixelPerfectExperience is true", () => {
                const enableNewNavigation = shouldEnableNewNavigation({
                    hidePixelPerfectExperience: false,
                    enablePixelPerfectExperience: true,
                    enableNewNavigationForResponsiveUi: true,
                    platformEdition: "growth",
                });
                expect(enableNewNavigation).toBe(false);
            });
        });

        describe("Enterprise user", () => {
            it("should return false if enableNewNavigationForResponsiveUi is false and platformEdition is enterprise", () => {
                const enableNewNavigation = shouldEnableNewNavigation({
                    enableNewNavigationForResponsiveUi: false,
                    platformEdition: "enterprise",
                });
                expect(enableNewNavigation).toBe(false);
            });

            it("should return true if hidePixelPerfectExperience is true", () => {
                const enableNewNavigation = shouldEnableNewNavigation({
                    hidePixelPerfectExperience: true,
                    enablePixelPerfectExperience: false,
                    enableNewNavigationForResponsiveUi: true,
                    platformEdition: "enterprise",
                });
                expect(enableNewNavigation).toBe(true);
            });

            it("should return true if hidePixelPerfectExperience is false and enablePixelPerfectExperience is false", () => {
                const enableNewNavigation = shouldEnableNewNavigation({
                    hidePixelPerfectExperience: false,
                    enablePixelPerfectExperience: false,
                    enableNewNavigationForResponsiveUi: true,
                    platformEdition: "enterprise",
                });
                expect(enableNewNavigation).toBe(true);
            });

            it("should return false if hidePixelPerfectExperience is false and enablePixelPerfectExperience is true", () => {
                const enableNewNavigation = shouldEnableNewNavigation({
                    hidePixelPerfectExperience: false,
                    enablePixelPerfectExperience: true,
                    enableNewNavigationForResponsiveUi: true,
                    platformEdition: "growth",
                });
                expect(enableNewNavigation).toBe(false);
            });
        });
    });
});
