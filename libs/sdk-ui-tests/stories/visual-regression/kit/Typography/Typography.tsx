// (C) 2019-2020 GoodData Corporation
import React from "react";
import { Typography } from "@gooddata/sdk-ui-kit";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";

const TypographyExamples: React.FC = () => {
    return (
        <div className="screenshot-target">
            <Typography tagName="h1">Heading level 1</Typography>

            <hr />

            <Typography tagName="h2">Heading level 2</Typography>

            <hr />

            <Typography tagName="h3">Heading level 3</Typography>

            <hr />

            <Typography tagName="p">
                Paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
                laborum.
            </Typography>

            <hr />
        </div>
    );
};

storiesOf(`${UiKit}/Typography`)
    .add("full-featured", () => <TypographyExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<TypographyExamples />), { screenshot: true });
