// (C) 2007-2020 GoodData Corporation
import React, { PureComponent } from "react";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { EditableLabel } from "@gooddata/sdk-ui-kit";
import { WrappedComponentProps } from "react-intl";

import { UiKit } from "../../../_infra/storyGroups.js";

interface IEditableLabelExamplesState {
    text: string;
}

class EditableLabelExamples extends PureComponent<unknown, IEditableLabelExamplesState> {
    constructor(props: WrappedComponentProps) {
        super(props);

        this.state = {
            text: "Edit me with icon!",
        };
    }

    render() {
        return (
            <div className="library-component screenshot-target">
                <h4>Simple example</h4>
                <EditableLabel
                    onSubmit={(val) => console.log(val)} // eslint-disable-line no-console
                    value={"Edit me!"}
                />

                <h4 id="s-my-editable-label-headers">Example with custom icon</h4>
                <EditableLabel
                    onSubmit={(text) => this.setState({ text })}
                    value={this.state.text}
                    className="s-my-editable-label"
                >
                    {this.state.text}
                    <i className="gd-icon-pencil" style={{ marginLeft: 5 }} />
                </EditableLabel>
            </div>
        );
    }
}

const editLabelClickProps = {
    clickSelector: ".s-my-editable-label",
    postInteractionWait: 200,
};

const screenshotProps = {
    "initial-label": {},
    "edited-label": editLabelClickProps,
};

storiesOf(`${UiKit}/EditableLabel`).add("full-featured", () => <EditableLabelExamples />, {
    screenshots: screenshotProps,
});
