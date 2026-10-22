{{- /* Markdown rendering of a home/links list: its items (home/link.markdown.md), one per line. */ -}}
{{- trim (replaceRE `\n\s*\n` "\n" (.Inner | string)) " \r\n" -}}
