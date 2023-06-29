// (C) 2021 GoodData Corporation
import { Icon } from "@gooddata/sdk-ui-kit";
import React from "react";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";

interface IIconWrapperProps {
    name: string;
    children?: React.ReactNode;
}

const IconWrapper: React.FC<IIconWrapperProps> = ({ name, children }) => {
    return (
        <div className="gd-icon-wrapper">
            <div className="gd-icon-name">{`${name}: `}</div>
            {children}
        </div>
    );
};

const RowWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return <div style={{ display: "flex", flexDirection: "row" }}>{children}</div>;
};

const ColumnWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return <div style={{ display: "flex", flexDirection: "column", paddingRight: "10px" }}>{children}</div>;
};

const InsightIconsTest: React.FC<{ children?: React.ReactNode }> = () => {
    return (
        <div className="library-component screenshot-target">
            <IconWrapper name="ScatterPlot">
                <Icon.ScatterPlot color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Donut">
                <Icon.Donut color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="HeadlineChart">
                <Icon.HeadlineChart color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="TreeMap">
                <Icon.TreeMap color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Combo">
                <Icon.Combo color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="HeatMap">
                <Icon.HeatMap color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Bubble">
                <Icon.Bubble color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Bullet">
                <Icon.Bullet color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Bar">
                <Icon.Bar color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Table">
                <Icon.Table color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="StackedArea">
                <Icon.StackedArea color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Column">
                <Icon.Column color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Line">
                <Icon.Line color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Geo">
                <Icon.Geo color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Pie">
                <Icon.Pie color="#000" width={15} height={15} />
            </IconWrapper>
        </div>
    );
};

const IconsTest: React.FC<{ children?: React.ReactNode }> = () => {
    return (
        <div className="library-component screenshot-target">
            <RowWrapper>
                <ColumnWrapper>
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
                        <Icon.Rows colorPalette={{ normalRow: "#f00", totalRow: "#0f0" }} />
                    </IconWrapper>
                    <IconWrapper name="Columns">
                        <Icon.Columns colorPalette={{ normalColumn: "#f00", totalColumn: "#0f0" }} />
                    </IconWrapper>
                    <IconWrapper name="ArrowDown">
                        <Icon.ArrowDown color="#f00" />
                    </IconWrapper>
                    <IconWrapper name="ArrowUp">
                        <Icon.ArrowUp color="#f00" />
                    </IconWrapper>
                </ColumnWrapper>
                <ColumnWrapper>
                    <IconWrapper name="AttachmentClip">
                        <Icon.AttachmentClip color="#0f0" />
                    </IconWrapper>
                    <IconWrapper name="Attribute">
                        <Icon.Attribute color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="BurgerMenu">
                        <Icon.BurgerMenu color="#0f0" />
                    </IconWrapper>
                    <IconWrapper name="Close">
                        <Icon.Close color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Dashboard">
                        <Icon.Dashboard color="#f00" width={16} height={16} />
                    </IconWrapper>
                    <IconWrapper name="Dataset">
                        <Icon.Dataset color="#f00" />
                    </IconWrapper>
                    <IconWrapper name="Expand">
                        <Icon.Expand color="#f00" />
                    </IconWrapper>
                    <IconWrapper name="Fact">
                        <Icon.Fact color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Function">
                        <Icon.Function color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Insight">
                        <Icon.Insight color="#0f0" />
                    </IconWrapper>
                    <IconWrapper name="Keyword">
                        <Icon.Keyword color="#f00" />
                    </IconWrapper>
                    <IconWrapper name="Label">
                        <Icon.Label color="#f00" />
                    </IconWrapper>
                    <IconWrapper name="LegendMenu">
                        <Icon.LegendMenu color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Many">
                        <Icon.Many color="#00f" width={16} height={16} />
                    </IconWrapper>
                    <IconWrapper name="Metric">
                        <Icon.Metric color="#f00" />
                    </IconWrapper>
                    <IconWrapper name="Minimize">
                        <Icon.Minimize color="#0f0" />
                    </IconWrapper>
                    <IconWrapper name="QuestionMark">
                        <Icon.QuestionMark color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="SettingsGear">
                        <Icon.SettingsGear color="#f00" />
                    </IconWrapper>
                    <IconWrapper name="EmbedCodeIcon">
                        <Icon.EmbedCodeIcon color="#f00" />
                    </IconWrapper>
                    <IconWrapper name="Error">
                        <Icon.Error color="#f00" />
                    </IconWrapper>
                </ColumnWrapper>
                <ColumnWrapper>
                    <IconWrapper name="Aborted">
                        <Icon.Aborted color="#0f0" />
                    </IconWrapper>
                    <IconWrapper name="Progress">
                        <Icon.Progress color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Success">
                        <Icon.Success color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Origin">
                        <Icon.Origin color="#f00" />
                    </IconWrapper>
                    <IconWrapper name="Token">
                        <Icon.Token color="#0f0" />
                    </IconWrapper>
                    <IconWrapper name="Leave">
                        <Icon.Leave color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Invite">
                        <Icon.Invite color="#f00" />
                    </IconWrapper>
                </ColumnWrapper>
            </RowWrapper>
        </div>
    );
};

storiesOf(`${UiKit}/Icon`).add("insight icons", () => <InsightIconsTest />, { screenshot: true });
storiesOf(`${UiKit}/Icon`).add("icons", () => <IconsTest />, { screenshot: true });
