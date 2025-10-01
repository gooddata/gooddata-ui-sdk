// (C) 2020-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { isFreemiumEdition, shouldEnableNewNavigation, shouldHidePPExperience } from "../featureFlags.js";

describe("featureFlags utils", () => {
    describe("shouldHidePPExperience", () => {
        it("should hide pixel perfect experience if hidePixelPerfectExperience is true", () => {
            const shouldHidePixelperfect = shouldHidePPExperience({
                hidePixelPerfectExperience: true,
            });
            expect(shouldHidePixelperfect).toBe(true);
        });

        it("should hide pixel perfect experience if hidePixelPerfectExperience is false", () => {
            const shouldHidePixelperfect = shouldHidePPExperience({
                hidePixelPerfectExperience: false,
            });
            expect(shouldHidePixelperfect).toBe(true);
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
                    enableNewNavigationForResponsiveUi: true,
                    platformEdition: "growth",
                });
                expect(enableNewNavigation).toBe(true);
            });

            it("should return true if hidePixelPerfectExperience is false", () => {
                const enableNewNavigation = shouldEnableNewNavigation({
                    hidePixelPerfectExperience: false,
                    enableNewNavigationForResponsiveUi: true,
                    platformEdition: "growth",
                });
                expect(enableNewNavigation).toBe(true);
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
                    enableNewNavigationForResponsiveUi: true,
                    platformEdition: "enterprise",
                });
                expect(enableNewNavigation).toBe(true);
            });

            it("should return true if hidePixelPerfectExperience is false", () => {
                const enableNewNavigation = shouldEnableNewNavigation({
                    hidePixelPerfectExperience: false,
                    enableNewNavigationForResponsiveUi: true,
                    platformEdition: "enterprise",
                });
                expect(enableNewNavigation).toBe(true);
            });
        });
    });
});
