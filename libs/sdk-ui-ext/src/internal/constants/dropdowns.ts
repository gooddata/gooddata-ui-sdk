// (C) 2019-2022 GoodData Corporation
import { IDropdownItem } from "../interfaces/Dropdown.js";
import { messages } from "../../locales.js";

export const pushpinSizeDropdownItems: IDropdownItem[] = [
    { title: messages.autoDefault.id, value: "default" },
    { type: "separator" },
    { title: messages.extraSmall.id, value: "0.5x" },
    { title: messages.small.id, value: "0.75x" },
    { title: messages.normal.id, value: "normal" },
    { title: messages.large.id, value: "1.25x" },
    { title: messages.extraLarge.id, value: "1.5x" },
];

export const pushpinViewportDropdownItems: IDropdownItem[] = [
    { title: messages.areaAutoDefault.id, value: "auto" },
    { title: messages.areaWorld.id, value: "world" },
    { type: "header", title: "properties.viewport.area.continents" },
    { title: messages.areaContinent_af.id, value: "continent_af" },
    { title: messages.areaContinent_na.id, value: "continent_na" },
    { title: messages.areaContinent_sa.id, value: "continent_sa" },
    { title: messages.areaContinent_as.id, value: "continent_as" },
    { title: messages.areaContinent_au.id, value: "continent_au" },
    { title: messages.areaContinent_eu.id, value: "continent_eu" },
];

export const rotationDropdownItems: IDropdownItem[] = [
    { title: messages.autoDefault.id, value: "auto" },
    { type: "separator" },
    { title: messages.rotation0.id, value: "0" },
    { title: messages.rotation30.id, value: "30" },
    { title: messages.rotation60.id, value: "60" },
    { title: messages.rotation90.id, value: "90" },
];

export const formatDropdownItems: IDropdownItem[] = [
    { title: messages.autoDefault.id, value: "auto" },
    { type: "separator" },
    {
        title: messages.formatInherit.id,
        value: "inherit",
        info: messages.formatInfoInherit.id,
    },
];

export const legendPositionDropdownItems: IDropdownItem[] = [
    { title: messages.autoDefault.id, value: "auto" },
    { type: "separator" },
    { title: messages.positionUp.id, value: "top", icon: "gd-dropdown-icon-legend-top" },
    { title: messages.positionDown.id, value: "bottom", icon: "gd-dropdown-icon-legend-bottom" },
    { title: messages.positionRight.id, value: "right", icon: "gd-dropdown-icon-legend-right" },
    { title: messages.positionLeft.id, value: "left", icon: "gd-dropdown-icon-legend-left" },
];

export const dataLabelsDropdownItems: IDropdownItem[] = [
    { title: messages.dataLabelsAuto.id, value: "auto" },
    { type: "separator" },
    { title: messages.dataLabelsShow.id, value: true },
    { title: messages.dataLabelsHide.id, value: false },
];

export const totalLabelsDropdownItems: IDropdownItem[] = [
    { title: messages.totalLabelsAuto.id, value: "auto" },
    { type: "separator" },
    { title: messages.totalLabelsShow.id, value: true },
    { title: messages.totalLabelsHide.id, value: false },
];

export const dataPointsDropdownLabels: IDropdownItem[] = [
    { title: messages.dataPointsAuto.id, value: "auto" },
    { type: "separator" },
    { title: messages.dataPointsShow.id, value: true },
    { title: messages.dataPointsHide.id, value: false },
];

export const xAxisPositionDropdownItems: IDropdownItem[] = [
    { title: messages.autoDefault.id, value: "auto" },
    { type: "separator" },
    {
        title: messages.axisPositionLeft.id,
        value: "left",
        icon: "gd-dropdown-icon-axis-name-position-left",
    },
    {
        title: messages.axisPositionCenter.id,
        value: "center",
        icon: "gd-dropdown-icon-axis-name-position-center",
    },
    {
        title: messages.axisPositionRight.id,
        value: "right",
        icon: "gd-dropdown-icon-axis-name-position-right",
    },
];

export const yAxisPositionDropdownItems: IDropdownItem[] = [
    { title: messages.autoDefault.id, value: "auto" },
    { type: "separator" },
    {
        title: messages.axisPositionTop.id,
        value: "top",
        icon: "gd-dropdown-icon-axis-name-position-top",
    },
    {
        title: messages.axisPositionMiddle.id,
        value: "middle",
        icon: "gd-dropdown-icon-axis-name-position-middle",
    },
    {
        title: messages.axisPositionBottom.id,
        value: "bottom",
        icon: "gd-dropdown-icon-axis-name-position-bottom",
    },
];
