{{- /* An API reference symbol's Markdown version (index.md): one file per top-level symbol, the way
Anthropic's API reference puts a whole endpoint on one Markdown page.

- A short list of what the HTML page shows as pills: package, kind, stability, source, and the
  guides that document the symbol, each linked to its Markdown version.
- The symbol's own content, then its folded members in the HTML page's groups
  (api-member-groups.html: `## Property details`, `## Method details`, ...), each member a `###`
  section with its headings two levels down. A member has no Markdown version of its own, so
  links to it point to its section here (md/links.html).

A hand-written reference page (no `source: api-documenter`) has no members and no pills; it reads
as any other page. */ -}}
{{- $page := . -}}
{{- $facts := slice -}}
{{- if eq .Params.source "api-documenter" -}}
  {{- with .CurrentSection -}}
    {{- $url := .Permalink -}}
    {{- with .OutputFormats.Get "markdown" }}{{ $url = .Permalink }}{{ end -}}
    {{- $facts = $facts | append (printf "Package: [%s](%s)" .Title $url) -}}
  {{- end -}}
  {{- with .Params.kind }}{{ $facts = $facts | append (printf "Kind: %s" .) }}{{ end -}}
  {{- with .Params.stability }}{{ $facts = $facts | append (printf "Stability: %s" .) }}{{ end -}}
  {{- if .Params.deprecated }}{{ $facts = $facts | append "Deprecated" }}{{ end -}}
  {{- if and .Params.source_path site.Params.repoURL -}}
    {{- $facts = $facts | append (printf "Source: %s/blob/%s/%s" site.Params.repoURL (partialCached "api-data.html" . .Section).source .Params.source_path) -}}
  {{- end -}}
  {{- $guides := slice -}}
  {{- range .Params.usage_pages -}}
    {{- with site.GetPage .path -}}
      {{- $url := .Permalink -}}
      {{- with .OutputFormats.Get "markdown" }}{{ $url = .Permalink }}{{ end -}}
      {{- $guides = $guides | append (printf "[%s](%s)" .Title $url) -}}
    {{- end -}}
  {{- end -}}
  {{- with $guides }}{{ $facts = $facts | append (printf "Guides: %s" (delimit . ", ")) }}{{ end -}}
{{- end -}}
{{- $blocks := slice (partial "md/header.html" .) -}}
{{- with $facts }}{{ $blocks = $blocks | append (printf "- %s" (delimit . "\n- ")) }}{{ end -}}
{{- $blocks = $blocks | append (partial "page-markdown.html" .) -}}
{{- range partial "api-member-groups.html" . -}}
  {{- $blocks = $blocks | append (printf "## %s" .title) -}}
  {{- range .members -}}
    {{- $body := partial "md/demote-headings.html" (partial "md/demote-headings.html" (partial "page-markdown.html" .)) -}}
    {{- $blocks = $blocks | append (printf "### %s" .Title) $body -}}
  {{- end -}}
{{- end -}}
{{ delimit (complement (slice "") $blocks) "\n\n" }}
