// (C) 2026 GoodData Corporation

/**
 * Clears the caches shared by the GoodData web components on this page.
 *
 * @remarks
 * The web components bundle carries its own copy of the GoodData.UI runtime, so calling
 * `clearInsightViewCaches()` from a host application's own `@gooddata/sdk-ui-ext`
 * dependency clears a different set of caches and has no effect here. Use this function
 * instead — for example after an insight has been edited elsewhere, or when switching
 * users.
 *
 * The cache is cleared asynchronously. You must `await` the returned promise
 * **before** rendering or re-mounting any GoodData web component. Calling this without
 * awaiting it and immediately navigating to (or mounting) a component can let that
 * component read the stale cache first, reproducing the original stale-insight bug with
 * the documented API in hand.
 *
 * The returned promise can reject, for example if the dynamic `@gooddata/sdk-ui-ext`
 * chunk fails to load. Wrap the `await` in `try/catch` if your host needs to handle that.
 *
 * This delegates to `clearInsightViewCaches()`, which does not currently reset the
 * workspace-permissions cache (tracked separately as EB-896) - do not expect stale
 * permissions to be cleared by this call.
 *
 * @public
 */
export const clearCaches = async (): Promise<void> => {
    // Imported dynamically to keep `sdk-ui-ext` out of the bundle's entry chunk, mirroring
    // the rationale for `LOAD_COMPONENT` in InsightEmbed.tsx.
    const { clearInsightViewCaches } = await import("@gooddata/sdk-ui-ext");
    clearInsightViewCaches();
};
