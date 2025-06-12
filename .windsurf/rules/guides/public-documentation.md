---
trigger: model_decision
description: Writing public documentation
globs:
---

# Public Documentation Rules

## Hugo Documentation Structure

-   Public documentation is built using Hugo and deployed to [sdk.gooddata.com/gooddata-ui](mdc:https:/sdk.gooddata.com/gooddata-ui)
-   All documentation files are located in `/docs` directory
-   Content is written in Markdown in `/docs/content/en/latest`
-   Images should be placed in `/docs/static/gd-ui/` directory

## Documentation Versioning

-   Documentation versioning is done through branches named `rel/X.Y` where X is major version and Y is minor version
-   The `master` branch contains the latest documentation and theming
-   When releasing a hotfix, update the corresponding minor documentation version
-   When releasing a new version, create a new branch with appropriate content

## Writing Documentation

### General Guidelines

-   Keep documentation clear, concise, and focused on user needs
-   Ensure examples are accurate and up-to-date with the current SDK version
-   Include links to related documentation when appropriate

### Markdown Format

-   Use standard Markdown syntax for content
-   For special elements like notes, warnings, or embedded images, use Hugo shortcodes:

```markdown
{{% shortcode_name param1="param" param2="param" %}}
Content inside shortcode
{{% /shortcode_name %}}
```

### Images

-   For embedding images, use the embedded-image shortcode:

```markdown
{{% embedded-image src="gd-ui/<your_image>.png" title="<Image Title>" width="80%" %}}
```

-   Place all images in the `/docs/static/gd-ui/` directory

## Documentation Deployment

-   Documentation is deployed through the `doc-netlify-deploy.yaml` GitHub workflow
-   The workflow uses the `generate.sh` script to handle versioning
-   Version generation is managed in `/scripts/generate.sh`
-   Documentation is automatically published to Netlify

## API Reference Documentation

-   API reference documentation is separate from Hugo-based general documentation
-   API reference is built from TSDoc comments in the codebase
-   Ensure all public APIs are properly documented with TSDoc
-   API reference follows the format:
    -   Summary (short, descriptive, single paragraph)
    -   Remarks blocks (@remarks for public details, @privateRemarks for internal notes)
    -   Examples, parameters, and return values
    -   Modifiers (@public, @beta, @alpha, or @internal)
