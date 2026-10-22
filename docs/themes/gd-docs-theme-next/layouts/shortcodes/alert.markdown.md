{{- /* alert in a page's Markdown copy: a blockquote with the alert's title in bold. */ -}}
{{- $color := .Get "color" | default "info" -}}
{{- $title := .Get "title" | default (cond (eq $color "warning") "Warning" (cond (eq $color "danger") "Danger" "Note")) -}}
> **{{ $title }}:**
{{- range split (trim .Inner "\n") "\n" }}
> {{ . }}
{{- end }}
