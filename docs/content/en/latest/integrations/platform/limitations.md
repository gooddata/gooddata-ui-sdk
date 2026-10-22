---
title: Limitations
description: Capabilities not yet supported by GoodData Cloud and GoodData.CN, and the entity-referencing rules that affect GoodData.UI components.
category: Integrations / Platform
diataxis_type: reference
related_pages:
  - /docs/integrations/platform/architecture-overview
  - /docs/integrations/platform/supported-frameworks
  - /docs/integrations/platform/compatibility
  - /docs/integrations/platform/api-maturity
  - /docs/data-layer/data-model/export-catalog
type: docs
weight: 105
section: Integrations
subsection: Platform
legacy_path: architecture/architecture_overview/limitations
aliases:
  - "../../architecture/architecture_overview/limitations/"
---

GoodData Cloud and GoodData.CN do not yet implement all capabilities that are specified on the **Analytical Backend** Service Provider Interface (SPI). If you try to use any capability that is not yet available in GoodData Cloud and GoodData.CN, its implementation of the Analytical Backend will raise a `NotSupported` exception.

GoodData Cloud and GoodData.CN also use a different scheme for identifying entities. This impacts how you have to reference GoodData Cloud or GoodData.CN entities on input to different components or services:

- Logical data model (LDM) entities such as datasets, attributes, labels, and facts are always identified using `id` and `type`.
- Complex MAQL measures are always identified using `id` and `type`.

If you use a component or a service of the **Analytical Backend** that requires an instance of `ObjRef` on input, you have to use the `idRef` factory function to create one and specify both `id` and `type`.

{{% alert color="info" title="Export catalog" %}}
We recommend using the [catalog-export](../../../data-layer/data-model/export-catalog/) tool to generate execution model objects from your GoodData Cloud or GoodData.CN workspace. The generated objects have the correct `id` and `type` properties, and you can pass them directly to the visual components.
{{% /alert %}}

## Unsupported capabilities

The following capabilities are not supported on either GoodData Cloud or GoodData.CN:

- Combining a measure value filter and a ranking filter in a single execution
- Attribute element queries restricted by measures (`withMeasures` on the elements query). Use `withAvailableElementsOnly` instead
- Sorting or transforming an existing execution result on the server

## Limitations

- The GoodData Cloud and GoodData.CN implementation of the Analytical Backend only supports object referencing by `id` and `type`. Use the `idRef` factory function to create a correct sub-type of `ObjRef`.
- The GoodData Cloud and GoodData.CN implementation of the Analytical Backend only supports attribute filtering by text values. The `newPositiveAttributeFilter` and `newNegativeAttributeFilter` factory functions will treat inputs as text values by default.
- Drillable items used to configure drill eventing for the visual components must use `identifier` to identify a drillable entity. Using `uri` to identify drillable items is not supported and may lead to undefined behavior.
- The `uriMatch` drill predicate that can be used to configure drill eventing for visual components is not supported. You can use the `identifierMatch` or `localIdentifierMatch` predicates to match measures or attributes. You can use the `attributeItemNameMatch` predicate to match an attribute element name.
- The drill events contain `uri` in different parts of an event. Ignore the values in `uri`.
