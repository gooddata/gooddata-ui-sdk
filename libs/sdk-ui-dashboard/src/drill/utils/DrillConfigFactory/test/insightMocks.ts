// (C) 2019-2021 GoodData Corporation
import { newBucket, newMeasure, uriRef } from "@gooddata/sdk-model";

import { newInsight } from "../../../../_staging/insight/insightBuilder";

export const MockColumnChartInsight = newInsight("local:column", (i) =>
    i
        .identifier("my_visualization_b")
        .uri("/gdc/md/mockproject/obj/my_visualization_b")
        .title("My visualization B")
        .buckets([
            newBucket(
                "measures",
                newMeasure(uriRef("/gdc/md/mockproject/obj/metric.amount"), (m) =>
                    m.title("Metric A").localId("m1"),
                ),
                newMeasure(uriRef("/gdc/md/mockproject/obj/metric.account"), (m) =>
                    m.title("Metric B").localId("m2"),
                ),
                newMeasure(uriRef("/gdc/md/mockproject/obj/metric.vendor"), (m) =>
                    m.title("Metric B").localId("m3"),
                ),
            ),
        ])
        .properties({
            controls: {
                dataLabels: { visible: true },
                legend: { enabled: false },
            },
        }),
);

export const MockBarChartInsight = newInsight("local:bar", (i) =>
    i
        .identifier("my_visualization_a")
        .uri("/gdc/md/mockproject/obj/my_visualization_a")
        .title("My visualization A")
        .buckets([
            newBucket(
                "measures",
                newMeasure(uriRef("/gdc/md/mockproject/obj/metric.amount"), (m) =>
                    m.title("Metric A").localId("m1"),
                ),
                newMeasure(uriRef("/gdc/md/mockproject/obj/metric.account"), (m) =>
                    m.title("Metric B").localId("m2"),
                ),
            ),
        ])
        .properties({
            controls: {
                dataLabels: { visible: true },
                legend: { enabled: false },
            },
        }),
);

export const MockBarChartVisClass = {
    visualizationClass: {
        checksum: "local",
        icon: "local:bar",
        iconSelected: "local:bar.selected",
        url: "local:bar",
        identifier: "bar",
        orderIndex: 0,
        title: "Bar",
        uri: "/gdc/md/mockproject/obj/bar",
    },
};
