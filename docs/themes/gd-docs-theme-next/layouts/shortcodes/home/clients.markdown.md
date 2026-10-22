{{- /* Markdown rendering of a home/clients list: its items (home/client.markdown.md), one per line. */ -}}
{{- trim (replaceRE `\n\s*\n` "\n" (.Inner | string)) " \r\n" -}}
