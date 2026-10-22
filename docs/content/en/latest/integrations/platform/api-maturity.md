---
legacy_path: architecture/architecture_overview/api_maturity
title: API maturity
category: Integrations / Platform
diataxis_type: reference
related_pages:
  - /docs/integrations/platform/compatibility
  - /docs/getting-started/platform-compatibility
  - /docs/integrations/platform/architecture-overview
description: Understand @alpha, @beta, @public, and @internal API stability annotations used across GoodData.UI packages.
ai_generated_description: true
type: docs
weight: 104
section: Integrations
subsection: Platform
aliases:
  - "../../architecture/architecture_overview/api_maturity/"
---

All APIs exported by the GoodData.UI packages come with documentation that also includes API Maturity annotations. These
annotations are important to follow: they indicate to you, the consumer, what the stability guarantees of the different
APIs are.

The API Maturity annotations are as follows:

-  **@alpha**: initial API; highly likely to change outside of the SemVer specification
-  **@beta**: mostly stable API; details may change outside of the SemVer specification
-  **@public**: stable API; follows the SemVer specification
-  **@internal**: internal API; may change or disappear at any time

All this documentation is included in the published packages so that you can conveniently access it in an IDE of your choice.

The [API reference](../../../api-reference/) on this site lists the **@public**, **@beta**, and **@alpha** APIs. A **Beta**
or **Alpha** badge marks beta and alpha APIs on their reference pages, and a _(Beta)_ or _(Alpha)_ note marks beta and alpha
props in the Props tables. A package whose API is all **@alpha** is not listed. **@internal** APIs are not listed.

## Recommendation

Use only the exported APIs annotated as **@public**. Then upgrades to the latest minor
or patch versions don't break your code.

Also keep all GoodData.UI packages on the same version.

## TypeScript type considerations

The TypeScript types provided with the GoodData.UI packages require the TypeScript version listed in [Platform compatibility](../../../getting-started/platform-compatibility/).

The types marked as `@public` adhere to the SemVer specification except for the types of the React props of all the components
in the `@gooddata/sdk-ui-*` packages. These types are backward-compatible with respect to versions (that is, creating objects of those types will work across minor versions); however, they can be extended in minor releases. This lets GoodData.UI add new features and extend existing ones without a major release.

Here is an example of such change:

```tsx
// in an older version
export interface IExampleProps {
    sampleProp: number;
}

// in a newer version
export interface IExampleProps {
    sampleProp: number | string;
    addedProp?: boolean;
}

// calling the component is OK in both versions
<Example
    sampleProp={42}
/>

// however, your custom functions using the type can break
function getSampleProp(props: IExampleProps): number {
    return props.sampleProp; // breaks with newer version as this is now (number | string)
}

// to avoid this, consider creating an explicit copy of the type or type the function like this:
function getSampleProp(props: { sampleProp: number }): number {
    return props.sampleProp; // works with both versions
}

```

This is not going to be an issue for most of the common use cases. It may become an issue if you, for example, use these types in your own functions as shown earlier in the `getSampleProp` example.
