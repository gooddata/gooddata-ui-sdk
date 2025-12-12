// (C) 2024-2025 GoodData Corporation

import { action } from "storybook/actions";

import { AddButton } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

const onClick = () => {
    action("onClick");
};

function AddButtonTest() {
    return (
        <div className="library-component screenshot-target">
            <h4>Default</h4>
            <AddButton title={<>Create</>} onClick={onClick} />

            <h4>Disabled</h4>
            <AddButton title={<>Can&apos;t touch this</>} isDisabled onClick={onClick} />

            <h4>With tooltip</h4>
            <AddButton title={<>Hover</>} tooltip={<>Some information here!</>} onClick={onClick} />
        </div>
    );
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "12 UI Kit/AddButton",
};

export function FullFeatured() {
    return <AddButtonTest />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<AddButtonTest />);
Themed.parameters = { kind: "themed", screenshot: true } satisfies IStoryParameters;
