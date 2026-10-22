{{- /* A section's Markdown copy (index.md): like a page's (_default/single.markdown.md), since a
landing page such as Getting started carries content of its own, then its child pages, each
linked to its Markdown copy, so an agent can walk the tree without HTML. A folded API member is a
section of its parent's page, not a child. */ -}}
{{- $blocks := slice (partial "md/header.html" .) (partial "page-markdown.html" .) -}}
{{- $pages := slice -}}
{{- range where .Pages "Params.folded" "!=" true -}}
  {{- $url := .Permalink -}}
  {{- with .OutputFormats.Get "markdown" }}{{ $url = .Permalink }}{{ end -}}
  {{- $pages = $pages | append (printf "- [%s](%s)%s" .LinkTitle $url (cond (ne .Description "") (printf ": %s" .Description) "")) -}}
{{- end -}}
{{- with $pages }}{{ $blocks = $blocks | append (printf "## Pages\n\n%s" (delimit . "\n")) }}{{ end -}}
{{ delimit (complement (slice "") $blocks) "\n\n" }}
