// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { IMeasureValueFilter } from "@gooddata/sdk-model";

import { DropdownAfmWrapper } from "../../src/filters/MeasureValueFilter/DropdownAfmWrapper";
import "../../styles/scss/main.scss";

storiesOf("Helper components/Measure value filter", module).add("Measure value filter", () => {
    class MeasureValueFilterWithButton extends React.Component {
        public render() {
            return (
                <React.Fragment>
                    <DropdownAfmWrapper
                        measureTitle={"Measure"}
                        measureIdentifier={"localIdentifier"}
                        onApply={this.onApply}
                    />
                </React.Fragment>
            );
        }

        private onApply = (filter: IMeasureValueFilter, measureIdentifier: string) => {
            action("apply")(filter, measureIdentifier);
        };
    }

    return <MeasureValueFilterWithButton />;
});
