// (C) 2021 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { storiesOf } from "../../_infra/storyRepository";
import React, { Component, Fragment } from "react";
import { ReferenceWorkspaceId, StorybookBackend } from "../../_infra/backend";
import { StoriesForEndToEndTests } from "../../_infra/storyGroups";

const backend = StorybookBackend();
const measures = [ReferenceMd.Amount, ReferenceMd.Won];
const attributes = [ReferenceMd.Product.Name, ReferenceMd.Department];
const columns = [ReferenceMd.ForecastCategory, ReferenceMd.Region];

class PivotTableHeight extends Component {
    state = {
        height: 200,
    };
    public render() {
        return (
            <Fragment>
                <div>
                    <button onClick={() => this.setState({ height: 200 })}>Change height to 200</button>
                    <button id="s-height-change" onClick={() => this.setState({ height: 400 })}>
                        Change height to 400
                    </button>
                </div>
                <div
                    style={{
                        width: 1000,
                        height: this.state.height,
                        marginTop: 20,
                        resize: "both",
                        overflow: "auto",
                    }}
                    className="s-pivot-table-height"
                >
                    <PivotTable
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        measures={measures}
                        rows={attributes}
                        columns={columns}
                        config={{
                            maxHeight: this.state.height,
                        }}
                    />
                </div>
            </Fragment>
        );
    }
}

storiesOf(`${StoriesForEndToEndTests}/Pivot Table`).add(
    "complex table with multiple columns and with height change",
    () => <PivotTableHeight />,
);
