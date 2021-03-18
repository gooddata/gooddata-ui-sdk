// (C) 2021 GoodData Corporation
import { Icon, IIconProps } from "@gooddata/sdk-ui-kit";
import React from "react";
import { storiesOf } from "@storybook/react";
import { UiKit } from "../../../_infra/storyGroups";
import { withScreenshot } from "../../../_infra/backstopWrapper";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";

const IconWrapper: React.FC<IIconProps> = ({ name, color }) => (
    <div className="icon-wrapper">
        <div className="icon-name">{`${name}: `}</div>
        <Icon name={name} color={color} />
    </div>
);

const IconTest: React.FC = () => {
    return (
        <div className="library-component screenshot-target">
            <IconWrapper name="Refresh" color="#f00" />
            <IconWrapper name="DrillDown" color="#0f0" />
            <IconWrapper name="DrillToDashboard" color="#00f" />
            <IconWrapper name="DrillToInsight" color="#f00" />
            <IconWrapper name="Date" color="#0f0" />
            <IconWrapper name="Explore" color="#00f" />
            <IconWrapper name="Logout" color="#f00" />
            <IconWrapper name="Pdf" color="#0f0" />
            <IconWrapper name="ExternalLink" color="#f00" />
            <IconWrapper name="Hyperlink" color="#f00" />
        </div>
    );
};

storiesOf(`${UiKit}/Icon`, module).add("icons-list", () => withScreenshot(<IconTest />));
