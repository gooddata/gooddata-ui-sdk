---
trigger: glob
description: Translation Context Rule for ensuring clear and accurate context in translation strings
globs: libs/**/en-US.json
---

# Translation Context Rule

Ensures all translation strings in JSON files have clear and accurate context to aid AI translation tools in providing more accurate translations.

## Purpose

This rule helps maintain high-quality translations by ensuring that every translation string has proper context information that helps translators understand:

-   Where the string is used
-   How it's displayed to users
-   What purpose it serves in the UI

## Rule Application

This rule applies to:

-   All `en-US.json` files in the `libs/` directories
-   Translation bundle files containing localizable strings

## Instructions

When working with translation files, follow these steps:

1. **Review code usage** - Understand where and how the string is used in the codebase
2. **Analyze string identifier** - Look for contextual clues in the key name (e.g., namespacing)
3. **Examine surrounding strings** - Understand relationships between related translations
4. **Combine insights** - Create a clear, concise comment that provides proper context
5. **Clean up comments** - Remove any translation-specific notes about ICU placeholders, '…' character, HTML tags, or other redundant information
6. **Provide ICU examples** - For fields containing ICU syntax, provide example output showing how the string will be rendered
7. **Ensure completeness** - Make sure the comment is never empty
8. **Update existing content** - Review and update existing comments as needed
9. **Apply changes** - Update the JSON file with the proper context

## Examples of Good Context

### Simple Label

```json
{
    "gs.header.search": {
        "value": "Search",
        "context": "Global header: Label for the search button in the application's global header, used to open the search menu."
    }
}
```

### Time Expression

```json
{
    "gs.date.at": {
        "value": "at",
        "context": "Date and time expression: Used to indicate a specific time, e.g., 'Meeting at 3 PM'."
    }
}
```

### ICU Pluralization

```json
{
    "gs.items.count": {
        "value": "{count, plural, one {# item} other {# items}}",
        "context": "Indicates the number of items. Example for ICU pluralization: if count is 1, output is '1 item'; if count is 5, output is '5 items'."
    }
}
```

## Best Practices

-   **Be specific**: Context should clearly explain where and how the string appears
-   **Include examples**: For complex strings (ICU, formatting), show example outputs
-   **Avoid redundancy**: Don't repeat translation-specific implementation details
-   **Consider the audience**: Write context that helps human translators understand the string's purpose
-   **Maintain consistency**: Use similar formatting and style across all context comments

## Tags

-   `i18n`
-   `translations`
-   `documentation`
