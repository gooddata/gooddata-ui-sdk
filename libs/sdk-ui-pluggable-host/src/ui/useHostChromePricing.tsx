// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

/**
 * Shape returned by a pricing extension hook. Provides the trial-info derived from
 * entitlements + a dialog element so the host chrome can wire the upsell affordances
 * on `<AppHeader>` without owning the dialog implementation.
 *
 * @alpha
 */
export interface IHostChromePricing {
    /** The pricing dialog React element (or null to skip rendering). */
    element: ReactNode;
    /** Whether the current org is on a trial entitlement (drives upsell button visibility). */
    isTrial: boolean;
    /** ISO date string for the trial contract expiry, derived from entitlements. */
    expiredDate: string;
    /** Open the pricing dialog (wired to the upsell button click). */
    onUpsellButtonClick: () => void;
}

/**
 * A host pricing extension. The `Use` prefix signals that this MUST be a React hook —
 * it is invoked from `HostChrome`'s render and therefore must obey the React Rules of
 * Hooks (stable call order, no conditional hook calls, etc.).
 *
 * @alpha
 */
export type UseHostPricingExtension = (ctx: IPlatformContext, locale: string) => IHostChromePricing;

let registeredPricingExtension: UseHostPricingExtension | undefined;

/**
 * Registers a pricing extension that the default host chrome will consume to render
 * trial-upgrade affordances. Optional — when no extension is registered, the chrome
 * shows no upsell button and no pricing dialog.
 *
 * @remarks
 * This indirection keeps the chrome free of any hard dependency on a specific pricing
 * dialog implementation (e.g. `gdc-pricing-dialog`). The host app supplies
 * the extension at boot; removing the extension is a one-line change.
 *
 * Contract:
 * - MUST be called once before the first render of `<Root>`.
 * - The supplied function MUST obey React Rules of Hooks — it is invoked from
 *   `HostChrome`'s render.
 * - Swapping or unregistering the extension after first render is unsupported and
 *   will violate Rules of Hooks.
 *
 * @alpha
 */
export function setHostPricingExtension(extension: UseHostPricingExtension | undefined): void {
    registeredPricingExtension = extension;
}

const NO_PRICING: IHostChromePricing = {
    element: null,
    isTrial: false,
    expiredDate: "",
    onUpsellButtonClick: () => {},
};

/**
 * Returns the pricing affordances for the current platform context + locale. Falls
 * back to a no-op shape when no pricing extension is registered.
 */
export function useHostChromePricing(ctx: IPlatformContext, locale: string): IHostChromePricing {
    return registeredPricingExtension ? registeredPricingExtension(ctx, locale) : NO_PRICING;
}
