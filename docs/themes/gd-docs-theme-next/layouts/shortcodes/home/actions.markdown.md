{{- /* Markdown rendering of the docs home call to action: one list item per link. */ -}}
- [{{ .Get "primary" }}]({{ .Get "primaryHref" }})
{{- with .Get "secondary" }}
- [{{ . }}]({{ $.Get "secondaryHref" }})
{{- end }}
