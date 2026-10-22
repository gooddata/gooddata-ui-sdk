---
name: docs-changelog-drift
description: Checks the hand-written GoodData.UI docs pages against the SDK changelog and fixes the pages a release made wrong or incomplete (renamed or removed APIs, changed behavior or defaults, deprecations, new requirements). Use during an SDK release before the cut, after a release when the bot commits "feat: add changelog changes", for a patch release, or when asked to check docs drift against the changelog.
---

# Changelog drift check

The API reference and the Props tables are rebuilt from the SDK on every build, so they
can't drift. The **hand-written pages** in `sdk/docs/content/en/latest/` (everything
except `api-reference/`) can: their prose, examples and claims stay as they were when someone
wrote them. This skill reads the SDK changelog, finds the pages each change touches, and fixes them.

**Core rule: the changelog points you to the code. Check every claim in the SDK source before
you edit a page.** A changelog line is one sentence written by the developer, so it isn't proof.

## When to run

| Moment | Where | Command (from `sdk/docs`) |
| --- | --- | --- |
| During the release, before the cut | `master` | `--pending` (rush change files in `common/changes/@gooddata/sdk-ui-all/`) |
| After a minor release | `master`, once the bot has committed `feat: add changelog changes` | `--version X.Y.0` |
| After a patch release | the `rel/X.Y` branch (its own `CHANGELOG.json`) | `--version X.Y.Z` |
| Catching up | `master` | `--since <last version checked>` |

Find the last version that was checked with
`git log --oneline --grep "changelog drift" -- sdk/docs/content`.

## Workflow

### 1. Scan

```bash
node .claude/skills/docs-changelog-drift/scripts/changelog-scan.mjs --version X.Y.0 > /tmp/drift-X.Y.0.md
```

For each entry, the scan lists the identifiers and terms it found (`getReports`, `Vite`,
`maplibre-gl`), the pages that mention them, pages whose title names the feature, and pages
with `api_symbols` from the same package. It suggests where to look. It doesn't decide. Read
every entry yourself, including the ones with no candidate pages.

### 2. Triage each entry

| Verdict | When | Example |
| --- | --- | --- |
| **No docs impact** | Internal fix, styling of a product app (`gdc-analytical-designer`, `gdc-dashboards-*`), test-only, or an undocumented feature flag | "Name every icon in the collapsed edit-mode left panel with a hover tooltip." |
| **Generated, check prose** | A new or changed public prop or symbol. The reference and Props table update by themselves. Still grep for prose or examples that say the old thing. | "Add `pageSize` support to workspace catalog." |
| **Update page** | A guide states the old behavior, default, requirement or name, or an example uses it | "app-toolkit: scaffold applications with Vite instead of webpack." → `getting-started/quickstart.md` |
| **New page** | A substantial public feature that no page covers | Propose it, then write it with the `docs-new-page` skill once the user agrees |
| **Flag** | You can't confirm it from the code, or the fix is a decision (drop a page, change the nav) | List it in the report and don't edit |

Deprecations, removals, renames and changed defaults are the entries most likely to break a
page. Look at each of them.

### 3. Check the code

For every entry that isn't "No docs impact":

1. Find the change: `git log --oneline -S '<identifier>' -- sdk/libs/<package>/src`, or the
   commit that added the change file (`git log --diff-filter=A -- common/changes/...`).
2. Read the source, and confirm the maturity tag in `sdk/libs/<package>/api/<package>.api.md`
   (`// @public`, `// @beta`, `// @alpha`). Don't present `@alpha` or `@internal` APIs as
   public. If a guide needs them, add a `warning` alert that names the maturity.
3. Run every example you change in your head against the real signature. It must compile.

### 4. Edit

- Make the smallest edit that makes the page true. Follow [STYLE_GUIDE.md](../../../STYLE_GUIDE.md):
  the voice, the terms, and the tone for the page's `diataxis_type`.
- **Deprecated**: add a `warning` alert with the replacement and the version, for example
  "Deprecated in 11.60. Use `X` instead." Move examples to the replacement.
- **Removed or renamed**: fix prose, examples and `api_symbols`. If a whole page is now
  obsolete, flag it and don't delete it. Deleting a page needs redirects and nav changes.
- **New central public symbol**: add it to the page's `api_symbols`. Its chip appears, and the
  page shows up as a Guide: chip on the symbol's reference page.
- **Moved source file**: update `source_files`.
- Never edit `api-reference/**`, `data/api_refs.json` or `data/api_props.json`, and don't
  write Props tables by hand. Those come from the SDK.

### 5. Check the result

From `sdk/docs`:

```bash
node .claude/skills/docs-new-page/scripts/check-page.mjs <every page you changed>
npm test
hugo -e local -d "$(mktemp -d)"     # look for warnings that name your pages
```

### 6. Report and commit

Put this table in the PR description, one row per entry, including the "No docs impact" ones,
so a reviewer can see the whole release was checked:

| Entry | Verdict | Page(s) | What changed / why not |
| --- | --- | --- | --- |
| E1 `app-toolkit: scaffold … Vite` | Update page | `getting-started/quickstart.md` | Project tree and dev server now Vite |

Commit subject: `docs(latest): changelog drift for X.Y.Z`. The step-1 `git log --grep`
finds the last check by this subject. The fixes go to `master`. A version that is already
published is built from its `rel/X.Y` branch, so a fix that must reach it before the next
release also goes to that branch.

## Common mistakes

- Editing a page because the changelog says so, without reading the code.
- Treating "no candidate pages" as "no impact". The scan only finds pages that use the same
  words. Search for the feature by meaning too, for example "date filter" for a period-picker change.
- Writing about an `@alpha` API as if it were stable because the changelog mentions it.
- Skipping `--pending` during the release. Then the docs ship one version late.
