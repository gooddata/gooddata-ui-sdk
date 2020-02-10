// (C) 2019 GoodData Corporation

import {
    newCatalogAttribute,
    newAttributeDisplayFormMetadataObject,
    newAttributeMetadataObject,
    idRef,
    newCatalogMeasure,
    newMeasureMetadataObject,
    newCatalogFact,
    newFactMetadataObject,
    newCatalogDateDataset,
} from "../src";
import { newDataSetMetadataObject } from "../src/ldm/metadata/dataSet/factory";

export const catalogAttribute = newCatalogAttribute(catalogA =>
    catalogA
        .attribute(newAttributeMetadataObject(idRef("attr.attr"), attribute => attribute.title("Attribute")))
        .defaultDisplayForm(
            newAttributeDisplayFormMetadataObject(idRef("label.attr"), displayForm =>
                displayForm.title("Attribute display form"),
            ),
        ),
);

export const catalogMeasure = newCatalogMeasure(catalogM =>
    catalogM.measure(
        newMeasureMetadataObject(idRef("measure"), measure =>
            measure
                .title("Measure")
                .expression("SELECT SUM([/attributes/attr])")
                .format("#,##"),
        ),
    ),
);

export const catalogFact = newCatalogFact(catalogF =>
    catalogF.fact(newFactMetadataObject(idRef("fact"), fact => fact.title("Fact"))),
);

export const catalogDateDataset = newCatalogDateDataset(catalogD =>
    catalogD
        .dataSet(newDataSetMetadataObject(idRef("dataSet"), x => x.title("DataSet Date")))
        .dateAttributes([])
        .relevance(0),
);
