// (C) 2021 GoodData Corporation
import { Icon } from "@gooddata/sdk-ui-kit";
import React from "react";
import { storiesOf } from "../../../_infra/storyRepository";
import { UiKit } from "../../../_infra/storyGroups";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";

interface IIconWrapperProps {
    name: string;
}

const IconWrapper: React.FC<IIconWrapperProps> = ({ name, children }) => {
    return (
        <div className="gd-icon-wrapper">
            <div className="gd-icon-name">{`${name}: `}</div>
            {children}
        </div>
    );
};

const IconTest: React.FC = () => {
    return (
        <div className="library-component screenshot-target">
            <IconWrapper name="Refresh">
                <Icon.Refresh color="#f00" />
            </IconWrapper>
            <IconWrapper name="DrillDown">
                <Icon.DrillDown color="#0f0" />
            </IconWrapper>
            <IconWrapper name="DrillToDashboard">
                <Icon.DrillToDashboard color="#00f" />
            </IconWrapper>
            <IconWrapper name="DrillToInsight">
                <Icon.DrillToInsight color="#f00" />
            </IconWrapper>
            <IconWrapper name="Date">
                <Icon.Date color="#0f0" />
            </IconWrapper>
            <IconWrapper name="Explore">
                <Icon.Explore color="#00f" />
            </IconWrapper>
            <IconWrapper name="Logout">
                <Icon.Logout color="#f00" />
            </IconWrapper>
            <IconWrapper name="Pdf">
                <Icon.Pdf color="#0f0" />
            </IconWrapper>
            <IconWrapper name="ExternalLink">
                <Icon.ExternalLink color="#00f" />
            </IconWrapper>
            <IconWrapper name="Hyperlink">
                <Icon.Hyperlink color="#f00" />
            </IconWrapper>
            <IconWrapper name="Undo">
                <Icon.Undo color="#0f0" />
            </IconWrapper>
            <IconWrapper name="Home">
                <Icon.Home color="#00f" />
            </IconWrapper>
            <IconWrapper name="DragHandle">
                <Icon.DragHandle color="#f00" />
            </IconWrapper>
            <IconWrapper name="AttributeFilter">
                <Icon.AttributeFilter color="#0f0" />
            </IconWrapper>
            <IconWrapper name="Interaction">
                <Icon.Interaction color="#00f" />
            </IconWrapper>
            <IconWrapper name="Book">
                <Icon.Book color="#f00" />
            </IconWrapper>
            <IconWrapper name="Lock">
                <Icon.Lock color="#0f0" />
            </IconWrapper>
            <IconWrapper name="Rows">
                <Icon.Rows colorPalette={{ odd: "#f00", even: "#0f0" }} />
            </IconWrapper>
        </div>
    );
};

storiesOf(`${UiKit}/Icon`).add("icons-list", () => <IconTest />, { screenshot: true });
