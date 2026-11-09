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

The build regenerates two API reports. Commit the ones that change:

- `sdk-model.api.md`, when you added a public `IFeatureFlags` property.
- `sdk-backend-tiger.api.md`, always, because `TigerFeatureDefinitions` is exported.

Creating or changing the flag in FeatureHub is a separate rollout task.

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

### Runtime overrides in the shell

Developers and QA can override flags in a running app without a rebuild. The tool
is off unless `enableFeatureFlagOverrides` is on in FeatureHub or static
configuration (or in `LocalFeatureFlagOverrides`). While it is off, stored
overrides are ignored but kept. Setting the flag in
`window.customWorkspaceSettings` shows the menu item but does not apply the
overrides. Overrides change only what the frontend sees; the backend keeps the
server values, so overriding a flag the backend also checks can cause errors.

With the flag on, open the panel from **Feature flag overrides** in the account
menu, just above Logout. When at least one override applies on the current page,
a badge in the bottom-left corner of the shell shows how many, and clicking it
opens the same panel with only the overridden flags listed. With the header hidden
(for example when embedded) and no override applying, there is no way in.

For each flag the panel shows the server value and an editor. Flags with an
override are listed first. A new override applies everywhere; its **Applies to**
menu moves it to this organization or this workspace (on workspace pages only),
and can limit it to the signed-in user ("Only when signed in as …"), so it
applies only while you are signed in as that user in this browser. Moving an
override replaces one already there. Flags set in `LocalFeatureFlagOverrides`
are marked "Set in code" and can't be edited, because the code value wins
anyway. Their saved overrides that match this page can be removed with the row's
reset button; overrides of the flag for other pages stay.

When several overrides match, a workspace override beats an organization override,
which beats one for everywhere.

Changes take effect after **Apply & reload**. Until then, a changed flag shows
"Not applied yet" and the footer counts the changes. An override that the page
doesn't use, because a backend setting or `window.customWorkspaceSettings` wins,
shows the value the page uses instead. Overrides are stored in the browser's
localStorage under `gdFeatureFlagOverrides`, so they stay in that browser only.
Use **Export JSON** to attach a setup to a ticket and **Import JSON** to load
one. Overrides that no longer fit, for example for a removed flag, are listed as
stale and can be deleted. Overrides for another organization, workspace or user,
for example from an imported file, are listed under "On other pages" with their
organization, workspace and user IDs. They count as changes and are exported,
and each can be deleted on its own.

### Which value wins

Values combine in this order; a later one wins:

1. Server value (FeatureHub or static configuration), or the default.
2. Runtime overrides from the panel.
3. `LocalFeatureFlagOverrides`.
4. Backend settings with the same name.
5. `window.customWorkspaceSettings`.

### Storage format

The stored value is `{ "version": 1, "rules": [...] }`, defined in
[`featureFlagOverrides.ts`](../libs/sdk-backend-tiger/src/backend/featureFlagOverrides.ts).
To change the format, bump the version and convert the previous version in
`parseFeatureFlagOverrides`. A bundle that does not know the stored version
ignores all its overrides, shows a warning in the panel, and replaces the stored
value on the next Apply.

## Configure flags in E2E tests

Use the test framework's `featureFlags` option. It updates both the mocked
FeatureHub response and `window.customWorkspaceSettings` before navigation.
Do not set either manually in a test helper or init script, and do not edit
`LocalFeatureFlagOverrides` for test runs. See the
[E2E test guide](../../e2e/TEST_GUIDELINES.md#feature-flag-mocking).

The shared test baseline in `e2e/e2e-utils/src/featureHub.ts` is independent of
production defaults and includes service flags beyond the Tiger registry.
