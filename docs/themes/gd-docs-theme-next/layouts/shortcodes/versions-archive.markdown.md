{{- /* Markdown rendering of the versions archive: the same rows as versions-archive.html, as a
Markdown table. Links are root-relative; page-markdown.html makes them absolute. */ -}}
{{- $rows := partial "versions-archive-rows.html" . -}}
{{- if $rows -}}
| Version | Documentation | Changelog | API reference |
| --- | --- | --- | --- |
{{- range $rows }}
| {{ .version }} | {{ with .url }}[View documentation]({{ . }}){{ end }} | {{ with .changelog }}[View changelog]({{ . }}){{ end }} | {{ with .apiRef }}[View API reference]({{ .RelPermalink }}){{ end }} |
{{- end }}
{{- else -}}
No documentation versions are currently configured.
{{- end -}}
