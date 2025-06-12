---
title: Limitations
linkTitle: Limitations
copyright: (C) 2007-2021 GoodData Corporation
weight: 10
---

GoodData Cloud and GoodData.CN do not yet implement all capabilities that are specified on the **Analytical Backend** Service Provider Interface (SPI).
If you try to use any capability that is not yet available in GoodData Cloud and GoodData.CN, its implementation of the Analytical Backend will raise a `NotSupported` exception.

GoodData Cloud and GoodData.CN also use a different scheme for identifying entities. This impacts how you have to reference GoodData Cloud or GoodData.CN entities on
input to different components or services:

-  Logical data model (LDM) entities such as datasets, attributes, labels, and facts are always identified using `id` and `type`.
-  Complex MAQL measures are always identified using `id` and `type`.

If you use a component or a service of the **Analytical Backend** that requires an instance of `ObjRef` on input, you have to use the `idRef` factory function to create one and specify both `id` and `type`.

{{% alert color="info" title="export catalog"%}}
We recommend using the [catalog-export](../../../learn/visualize_data/export_catalog/) tool to generate execution model
objects from your GoodData Cloud or GoodData.CN workspace. They will be generated with correct `id` and `type` properties, and you can use the
model objects seamlessly as input to the different visual components.
{{% /alert %}} 

## Unsupported capabilities

The following capabilities are not supported on neither GoodData Cloud nor GoodData.CN:

-  Combining a measure value filter and a ranking filter in a single execution
-  Rollups (native totals)
-  Subtotals
-  Export of execution results
-  Attribute valid element queries with attribute filters or measure filters
-  Dashboard alerts
-  Dashboard exports to PDF and scheduling of dashboard exports

In addition to the items mentioned above, GoodData Cloud currently does not support Dashboard Plugins.

## Limitations

-  The GoodData Cloud and GoodData.CN implementation of the Analytical Backend only supports object referencing by `id` and `type`. Use the `idRef` factory function to create a correct sub-type of `ObjRef`.
-  The GoodData Cloud and GoodData.CN implementation of the Analytical Backend only supports attribute filtering by text values. The `newPositiveAttributeFilter` and `newNegativeAttributeFilter` factory functions will treat inputs as text values by default.
-  Drillable items used to configure drill eventing for the visual components must use `identifier` to identify a drillable entity. Using `uri` to identify drillable items is not supported. Using `uri` for drillable items may lead to undefined behavior.
-  The `uriMatch` drill predicate that can be used to configure drill eventing for visual components is not supported. You can use the `identifierMatch` or `localIdentifierMatch` predicates to match measures or attributes. You can use the `attributeItemNameMatch` predicate to match an attribute element name.
-  The drill events contain `uri` in different parts of an event. Ignore the values in `uri`. We will modify the contents of the `uri` fields in the upcoming releases of GoodData.UI.
