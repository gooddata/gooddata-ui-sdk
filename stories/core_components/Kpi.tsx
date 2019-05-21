// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";

import { Kpi } from "../../src/components/simple/Kpi";
import { GERMAN_NUMBER_FORMAT } from "../data/numberFormat";

storiesOf("Core components/KPI", module)
    .add("KPI measure 1 with number", () =>
        screenshotWrap(
            <Kpi
                measure={"/gdc/md/storybook/obj/1"}
                projectId={"storybook"}
                format="[<300][red]$#,#.##;[=300][yellow]$#,#.##;[>300][green]$#,#.##"
                LoadingComponent={null}
                ErrorComponent={null}
            />,
        ),
    )
    .add("KPI measure 1 with default format", () =>
        screenshotWrap(
            <Kpi
                measure={"/gdc/md/storybook/obj/2"}
                projectId={"storybook"}
                LoadingComponent={null}
                ErrorComponent={null}
            />,
        ),
    )
    .add("KPI measure 9 with no data", () =>
        screenshotWrap(
            <Kpi
                measure={"/gdc/md/storybook/obj/9"}
                projectId={"storybook"}
                format="[<300][red]$#,#.##;[=Null][backgroundcolor=DDDDDD][red]No Value"
                LoadingComponent={null}
                ErrorComponent={null}
            />,
        ),
    )
    .add("KPI error", () =>
        screenshotWrap(<Kpi measure={"/gdc/md/storybook/obj/9-non-existing"} projectId={"storybook"} />),
    )
    .add("with German number format", () =>
        screenshotWrap(
            <Kpi
                measure={"/gdc/md/storybook/obj/1"}
                projectId={"storybook"}
                separators={GERMAN_NUMBER_FORMAT}
                LoadingComponent={null}
                ErrorComponent={null}
            />,
        ),
    );
