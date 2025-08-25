// (C) 2021-2025 GoodData Corporation
import React from "react";

import { Icon } from "@gooddata/sdk-ui-kit";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";

interface IIconWrapperProps {
    name: string;
    children?: React.ReactNode;
}

function IconWrapper({ name, children }: IIconWrapperProps) {
    return (
        <div className="gd-icon-wrapper">
            <div className="gd-icon-name">{`${name}: `}</div>
            {children}
        </div>
    );
}

function RowWrapper({ children }: { children?: React.ReactNode }) {
    return <div style={{ display: "flex", flexDirection: "row" }}>{children}</div>;
}

function ColumnWrapper({ children }: { children?: React.ReactNode }) {
    return <div style={{ display: "flex", flexDirection: "column", paddingRight: "10px" }}>{children}</div>;
}

function InsightIconsTest(_props: { children?: React.ReactNode }) {
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
            <IconWrapper name="Sankey">
                <Icon.Sankey color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="DependencyWheel">
                <Icon.DependencyWheel color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Waterfall">
                <Icon.Waterfall color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Funnel">
                <Icon.Funnel color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Pyramid">
                <Icon.Pyramid color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Repeater">
                <Icon.Repeater color="#000" width={15} height={15} />
            </IconWrapper>
        </div>
    );
}

function IconsTest(_props: { children?: React.ReactNode }) {
    return (
        <div className="library-component screenshot-target">
            <RowWrapper>
                <ColumnWrapper>
                    <IconWrapper name="Refresh">
                        <Icon.Refresh color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="DrillDown">
                        <Icon.DrillDown color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="DrillToDashboard">
                        <Icon.DrillToDashboard color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="DrillToInsight">
                        <Icon.DrillToInsight color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Date">
                        <Icon.Date color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Explore">
                        <Icon.Explore color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Logout">
                        <Icon.Logout color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Pdf">
                        <Icon.Pdf color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="ExternalLink">
                        <Icon.ExternalLink color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Hyperlink">
                        <Icon.Hyperlink color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Undo">
                        <Icon.Undo color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Home">
                        <Icon.Home color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="DragHandle">
                        <Icon.DragHandle color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="AttributeFilter">
                        <Icon.AttributeFilter color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Interaction">
                        <Icon.Interaction color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Book">
                        <Icon.Book color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Lock">
                        <Icon.Lock color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Rows">
                        <Icon.Rows colorPalette={{ normalRow: "#f00", totalRow: "#00f" }} />
                    </IconWrapper>
                    <IconWrapper name="Columns">
                        <Icon.Columns colorPalette={{ normalColumn: "#f00", totalColumn: "#00f" }} />
                    </IconWrapper>
                    <IconWrapper name="ArrowDown">
                        <Icon.ArrowDown color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="ArrowUp">
                        <Icon.ArrowUp color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Contract">
                        <Icon.Contract color="#00f" />
                    </IconWrapper>
                </ColumnWrapper>
                <ColumnWrapper>
                    <IconWrapper name="AttachmentClip">
                        <Icon.AttachmentClip color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Attribute">
                        <Icon.Attribute color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="BurgerMenu">
                        <Icon.BurgerMenu color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Close">
                        <Icon.Close color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Dashboard">
                        <Icon.Dashboard color="#00f" width={16} height={16} />
                    </IconWrapper>
                    <IconWrapper name="Dataset">
                        <Icon.Dataset color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Expand">
                        <Icon.Expand color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Fact">
                        <Icon.Fact color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Function">
                        <Icon.Function color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Insight">
                        <Icon.Insight color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Keyword">
                        <Icon.Keyword color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Label">
                        <Icon.Label color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="LegendMenu">
                        <Icon.LegendMenu color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Many">
                        <Icon.Many color="#00f" width={16} height={16} />
                    </IconWrapper>
                    <IconWrapper name="Metric">
                        <Icon.Metric color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Minimize">
                        <Icon.Minimize color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="QuestionMark">
                        <Icon.QuestionMark color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="SettingsGear">
                        <Icon.SettingsGear color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="EmbedCodeIcon">
                        <Icon.EmbedCodeIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="BoldHyperlink">
                        <Icon.BoldHyperlink color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Reset">
                        <Icon.Reset color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Error">
                        <Icon.Error color="#00f" width={18} height={18} />
                    </IconWrapper>
                </ColumnWrapper>
                <ColumnWrapper>
                    <IconWrapper name="Aborted">
                        <Icon.Aborted color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Progress">
                        <Icon.Progress color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Success">
                        <Icon.Success color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Origin">
                        <Icon.Origin color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Token">
                        <Icon.Token color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Leave">
                        <Icon.Leave color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Invite">
                        <Icon.Invite color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="RichText">
                        <Icon.RichText color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="VisualizationSwitcher">
                        <Icon.VisualizationSwitcher color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Copy">
                        <Icon.Copy color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Run">
                        <Icon.Run color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="DataSource">
                        <Icon.DataSource color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="User">
                        <Icon.User color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="UserGroup">
                        <Icon.UserGroup color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Image">
                        <Icon.Image color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Hash">
                        <Icon.Hash color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Magic">
                        <Icon.Magic color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Webhook">
                        <Icon.Webhook color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Schedule">
                        <Icon.Schedule color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Website">
                        <Icon.Website color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Widget">
                        <Icon.Widget color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="SimplifiedDashboard">
                        <Icon.SimplifiedDashboard color="#00f" />
                    </IconWrapper>
                </ColumnWrapper>
                <ColumnWrapper>
                    <IconWrapper name="HistoryBack">
                        <Icon.HistoryBack color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Alert">
                        <Icon.Alert color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="AlertPaused">
                        <Icon.AlertPaused color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Ellipsis">
                        <Icon.Ellipsis color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="GenAI">
                        <Icon.GenAI color="#00f" width={22} height={22} />
                    </IconWrapper>
                    <IconWrapper name="Search">
                        <Icon.Search color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="NewVisualization">
                        <Icon.NewVisualization color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="ChatBubble">
                        <Icon.ChatBubble color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="ThumbsUp">
                        <Icon.ThumbsUp color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="ThumbsDown">
                        <Icon.ThumbsDown color="#00f" />
                    </IconWrapper>
                </ColumnWrapper>
            </RowWrapper>
        </div>
    );
}

export default {
    title: "12 UI Kit/Icon",
};

export function InsightIcons() {
    return <InsightIconsTest />;
}
InsightIcons.parameters = { kind: "insight icons", screenshot: true };

export function Icons() {
    return <IconsTest />;
}
Icons.parameters = { kind: "icons", screenshot: true };
