# GoodData.UI docs

When authoring, editing, generating, or syncing any documentation under `content/en/`,
follow the [documentation style guide](./STYLE_GUIDE.md) — it defines the required voice,
tone, terminology, mechanics, and Hugo conventions for these docs.

Run the [Pre-publish checklist](./STYLE_GUIDE.md#pre-publish-checklist) before committing a page.

Files under `content/en/latest/api-reference/` (except `_index.md`),
`data/api_refs.json` and `data/api_props.json` are not in git. Every build generates them from the SDK api
model via `sdk/scripts/build-api-reference.sh`. Never edit them; read
[CONTENT_PIPELINE.md](./CONTENT_PIPELINE.md) for how they are produced and for the
frontmatter fields that drive cross-linking (`api_symbols`, `source_path`, `usage_pages`).
A guide's `## Props` table is `{{% props %}}`, generated at build time; don't write
one by hand for a public symbol.

Skills for docs work live in `.claude/skills/`: `docs-new-page` (add a page: Diátaxis type,
frontmatter, chips, Props, check script) and `docs-changelog-drift` (fix pages after an SDK
release, from the changelog).
