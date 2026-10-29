# Feature flags

Register Tiger flags in
[`TigerFeatureDefinitions`](../libs/sdk-backend-tiger/src/backend/uiFeatures.ts).
Document public SDK flags in
[`IFeatureFlags`](../libs/sdk-model/src/settings/settings.ts).
The registry supplies backend types, defaults and loading; `IFeatureFlags` defines
what SDK consumers can configure.

## Add a flag

Add a definition in `TigerFeatureDefinitions`:

```ts
enableExample: booleanFeature(false),
```

For a public SDK flag, add its documented property to `IFeatureFlags`:

```ts
/** Enables the example experience. */
enableExample?: boolean;
```

Use `numberFeature()` for numeric settings and `jsonFeature<ConfigType>()` for
structured settings. Their default is `undefined`; pass a value to supply a
fallback. A boolean default must be explicit. FeatureHub or static configuration
wins over the fallback when it supplies a value.

Backend-only flags need no public property. SDK-only settings need no Tiger
registration. Do not add an enum member, loading branch or separate default.

From the repository root, build the backend and its dependencies:

```sh
rush build -t @gooddata/sdk-backend-tiger
```

From `sdk/libs/sdk-backend-tiger`, check the flag behavior and package:

```sh
rushx test-once src/backend/features
rushx validate
```

Include any public API report changes produced by the build. Creating or changing
the flag in FeatureHub is a separate rollout task.

## Retire Early Access and Controlled Feature Rollout values

`earlyAccessValues` on organizations and workspaces also holds values managed
directly through the API, including backend feature targeting. The
`earlyAccessFeatures` and `productionFeatures` JSON configurations list the
settings exposed in the UI; they are not a complete list of valid targeting
values. Absence from these lists must not cause deletion.

To enable cleanup for a retired value, add its exact string to the optional
`retiredEarlyAccessValues` array in either JSON configuration. Do this only after
confirming that no active rollout strategy, including backend service strategies,
still needs the value. For example:

```json
{
    "features": [],
    "retiredEarlyAccessValues": ["example-retired-rollout"]
}
```

On an organization or workspace settings save, Home UI removes values explicitly
retired by either configuration. Values still listed in either active `features`
array take precedence over retirement declarations. Unknown values are preserved.
Bulk workspace saves also clean affected workspaces whose selected state did not
change, but skip writes when both the selection and stored values are unchanged.
Cleanup-only write failures are logged and do not fail the selection save; failed
requested feature changes still fail the save. Workspace descriptors are refreshed
after a successful save, including when cleanup-only writes failed.
Opening settings does not trigger writes.

Existing configurations without retirement declarations preserve all unrelated
values. Deploying the UI alone therefore does not clean historical values: rollout
owners must first identify and declare them in FeatureHub. Keep declarations for
organizations and workspaces that have not yet saved their settings; removing a
declaration stops cleanup for that value. Moving a feature between EA and CFR is
not retirement.

## Override a flag locally

Edit `LocalFeatureFlagOverrides` in `uiFeatures.ts`:

```ts
export const LocalFeatureFlagOverrides: Partial<ITigerFeatureFlags> = {
    enableRadarChart: true,
};
```

This forces the value over FeatureHub and static configuration. The overridden
flag's remote value is ignored before decoding; the bulk request still loads
other flags. Local overrides also apply when the request fails.

Overrides preserve `false`, `0` and an explicitly present `undefined`. Remove a
key to restore remote/default behavior. The cache distinguishes changed and
removed overrides. Rebuild the package and reload the app after editing the
source. Keep this object empty in committed code.

Applications also support `window.customWorkspaceSettings`. Set it in development
bootstrap code before settings are resolved:

```ts
window.customWorkspaceSettings = {
    ...window.customWorkspaceSettings,
    enableRadarChart: true,
};
```

Application wrappers apply these values after backend settings, so they take
precedence over fallbacks, remote values and backend source overrides. They affect
UI settings; backend-side feature gates use their own configuration.

## Configure flags in E2E tests

Use the test framework's `featureFlags` option. It updates both the mocked
FeatureHub response and `window.customWorkspaceSettings` before navigation.
Do not set either manually in a test helper or init script, and do not edit
`LocalFeatureFlagOverrides` for test runs. See the
[E2E test guide](../../e2e/TEST_GUIDELINES.md#feature-flag-mocking).

The shared test baseline in `e2e/e2e-utils/src/featureHub.ts` is independent of
production defaults and includes service flags beyond the Tiger registry.
