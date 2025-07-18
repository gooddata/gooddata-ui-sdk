// (C) 2020-2025 GoodData Corporation
import { DefaultThemePreview } from "@gooddata/sdk-ui-theme-provider/internal";

function DefaultThemeStory() {
    return (
        <div className="library-component">
            <h1>Default Theme Overview</h1>
            <DefaultThemePreview />
        </div>
    );
}

export default {
    title: "15 Ui/DefaultThemePreview",
};

export const DefaultThemePreviewStory = () => <DefaultThemeStory />;
DefaultThemePreviewStory.parameters = { kind: "default theme preview" };
