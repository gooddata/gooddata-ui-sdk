{{- /* llms-full.txt (content/en/llms-full.md): every guide page of the docs root in sidebar order
(llms-pages.html, the same pages as llms.txt), each as its Markdown version: title, description,
the URL of its own copy, then the body (page-markdown.html). The API reference is left out, as
before: ~3,500 symbol pages would make the file tens of MB, and llms.txt reaches each of them
through its package page.

The docs root is params.homeSlug; see index.llms.txt. */ -}}
{{- $slug := site.Params.homeSlug -}}
{{- $root := site.GetPage (printf "/%s" $slug) -}}
{{- if not $root }}{{ errorf "llms-full.txt: params.homeSlug %q is not a section of this build" $slug }}{{ end -}}
{{- $blocks := slice "# GoodData.UI SDK Documentation (full text)" -}}
{{- $blocks = $blocks | append (printf "> GoodData.UI: %s" ($root.Description | default site.Params.description)) -}}
{{- with site.Home.OutputFormats.Get "LLMS" -}}
  {{- $blocks = $blocks | append (printf "Every guide page of the documentation, in sidebar order, as Markdown. The index of all pages, including the API reference (one Markdown page per package and per symbol), is %s." .Permalink) -}}
{{- end -}}
{{- range sort $root.Sections ".Weight" -}}
  {{- if not (strings.HasSuffix .RelPermalink "/api-reference/") -}}
    {{- range partial "llms-pages.html" . -}}
      {{- $url := .Permalink -}}
      {{- with .OutputFormats.Get "markdown" }}{{ $url = .Permalink }}{{ end -}}
      {{- $page := slice "---" (printf "# %s" .Title) -}}
      {{- with .Description }}{{ $page = $page | append (printf "> %s" .) }}{{ end -}}
      {{- $page = $page | append (printf "Source: %s" $url) -}}
      {{- with partial "page-markdown.html" . }}{{ $page = $page | append . }}{{ end -}}
      {{- $blocks = $blocks | append (delimit $page "\n\n") -}}
    {{- end -}}
  {{- end -}}
{{- end -}}
{{ delimit $blocks "\n\n" }}
