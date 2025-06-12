# GoodData.UI SDK - Developer's Guide for TSDoc

For documentation of the code, [TSDoc](https://tsdoc.org/) is used. Interfaces, types, classes and variables marked as `@public` or `@beta` are processed by the [api-extractor](https://api-extractor.com/)
and [api-documenter](https://api-extractor.com/pages/commands/api-documenter_markdown/) tools. These tools are providing an input for the [docusaurus v1](https://v1.docusaurus.io/), which creates pages
with [api reference](https://sdk.gooddata.com/gooddata-ui-apidocs/vNext/docs/index.html).

To keep the generated API reference simple and readable, follow the rules listed below

1. Keep comment structure aligned with TSDoc recommendation
    1. Summary - short and descriptive text about the feature.
    2. remarks blocks - use `@remarks` and `@privateRemarks` blocks for detailed description of the feature. If the part of the documentation should stay hidden from the public, use `@privateRemarks` tag (e.g. todos), `@remarks` tag otherwise.
       Use **only one** `@remarks` tag and **one** `@privateRemarks` tag.
    3. additional blocks - `@example`, `@param`, `@returns` in this order
    4. modifiers block - `@internal`, `@public`, `@alpha`, `@beta`
    5. inline tags - these tags can appear in any section described above.
2. Summary is short and descriptive, keep this block of text in a single paragraph as the api-extractor tool won't keep paragraphs separated in a summary tables.
3. Blocks of text starting with `NOTE:` or `Note that...` are kept inside `@remarks` tag.

### Known issues

-   TSDoc does not support MD bullet lists as there is no support for `DocSoftBreaks`. See [TSDoc github issue](https://github.com/microsoft/tsdoc/issues/178) and [Rushstack github issue](https://github.com/microsoft/rushstack/issues/1441). The bullet list is resolved as a list with a single value (all bullet list items are squashed into single line). There is no other way to avoid this than to have a empty line between each list item until TSDoc and api-extractor have this feature implemented.


## General Documentation

For the general documentation, [Hugo](../) is used. It is written in simple `.md` with the exception of hugo scripts ([shortcodes](https://gohugo.io/content-management/shortcodes/) and [partials](https://gohugo.io/templates/partials/)), which are written in this notation:

```markdown

{{% shortcode_name param1="param" param2="param %}}
Inner text, usually a note, or something like that.
{{% /shortcode_name %}}
```


### Images

When working with images, use this convention:

```markdown
{{% embedded-image src="gd-ui/<your_awesome_image>.png" title="<Image Title>" width="80%" %}}
```

When using the `embedded-image` shortcode, put the image into the `/docs/static/gd-ui/` directory first.


### Deployment

Documentation is deployed through `netlify-deploy` action. The action is located in `/.github/workflows/netlify-deploy.yaml`. The action also uses a script `generate.sh` that helps generate different versions. This script is located at `/scripts/generate.sh`.

Versioning is done through branches, which are named according to `rel/X.Y` convention, where `X` represents the major and `Y` the minor version. From these branches, only the content is fetched and the whole theming and config is taken from the `master` branch.

When releasing a hotfix, update the according minor documentation, as we are not releasing new version of documentation for each hotfix.

When releasing new version, first create a branch and put all the necessary documentation to it and then run the `netlify-deploy` action. When updating theming or other config, the change has to be propagated to the `master` branch.
