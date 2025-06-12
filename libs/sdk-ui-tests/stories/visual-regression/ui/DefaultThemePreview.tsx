// (C) 2020-2024 GoodData Corporation
import React from "react";
import { DefaultThemePreview } from "@gooddata/sdk-ui-theme-provider/internal";

import { storiesOf } from "../../_infra/storyRepository.js";
import { UiStories } from "../../_infra/storyGroups.js";

const DefaultThemeStory: React.FC = () => {
    return (
        <div className="library-component">
            <h1>Default Theme Overview</h1>
            <DefaultThemePreview />
        </div>
    );
};

storiesOf(`${UiStories}/DefaultThemePreview`).add("default theme preview", () => <DefaultThemeStory />);
