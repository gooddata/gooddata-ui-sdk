// (C) 2020 GoodData Corporation
import { Button } from "@gooddata/sdk-ui-kit";
import React from "react";
import { v4 as uuid } from "uuid";

import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-kit/styles/css/button.css";
import "./styles.scss";

const types = [
    {
        title: "Apply",
        className: "gd-button-primary",
    },
    {
        title: "Run",
        className: "gd-button-secondary",
    },
    {
        title: "Edit",
        className: "gd-button-link",
    },
    {
        title: "Edit",
        className: "gd-button-link-dimmed",
    },
    {
        title: "Activate weapons",
        className: "gd-button-link",
        iconLeft: "gd-icon-cloud-upload",
    },
    {
        title: "Deploy process",
        className: "gd-button-link-dimmed",
        iconLeft: "gd-icon-cloud-upload",
    },
    {
        title: "",
        className: "gd-button-link gd-button-icon-only",
        iconLeft: "gd-icon-save",
    },
    {
        title: "Save",
        className: "gd-button-action",
    },
    {
        title: "Delete",
        className: "gd-button-negative",
    },
    {
        title: "New Schedule",
        className: "gd-button-action",
        iconLeft: "gd-icon-timer",
    },
    {
        title: "New Schedule",
        className: "gd-button-action gd-icon-timer",
    },
    {
        title: "Add Report",
        className: "gd-button-primary",
        iconLeft: "gd-icon-add",
    },
    {
        title: "Add Report",
        className: "gd-button-primary gd-icon-add",
    },
    {
        title: "Create Report",
        className: "gd-button-action gd-button-important",
    },
    {
        title: "Delete Account",
        className: "gd-button-negative gd-button-important",
    },
    {
        title: "Save",
        className: "gd-button-primary gd-button-small",
    },
    {
        title: "Cancel",
        className: "gd-button-secondary gd-button-small",
    },
    {
        title: "Add Tab",
        className: "gd-button-secondary gd-button-small",
        iconRight: "gd-icon-add",
    },
    {
        title: "Add Tab",
        className: "gd-button-secondary gd-button-small gd-icon-add gd-icon-right",
    },
    {
        title: "Add Tab",
        className: "gd-button-secondary gd-button-small",
        iconLeft: "gd-icon-add",
    },
    {
        title: "Add Tab",
        className: "gd-button-secondary gd-button-small gd-icon-add",
    },
    {
        title: "",
        className: "gd-button-primary gd-button-icon-only gd-icon-add",
    },
    {
        title: "",
        className: "gd-button-primary",
        iconLeft: "gd-icon-add",
    },
    {
        title: "",
        className: "gd-button-primary gd-button-icon-only gd-icon-config",
    },
    {
        title: "",
        className: "gd-button-primary",
        iconLeft: "gd-icon-config",
    },
    {
        title: "",
        className: "gd-button-primary gd-button-icon-only gd-icon-printer",
    },
    {
        title: "",
        className: "gd-button-primary",
        iconLeft: "gd-icon-printer",
    },
    {
        title: "",
        className: "gd-button-primary gd-button-icon-only gd-icon-pencil",
    },
    {
        title: "",
        className: "gd-button-primary",
        iconLeft: "gd-icon-pencil",
    },
    {
        title: "",
        className: "gd-button-primary gd-button-icon-only gd-icon-cross",
    },
    {
        title: "",
        className: "gd-button-primary",
        iconLeft: "gd-icon-cross",
    },
];

const icons = [
    "trend-down",
    "trend-up",
    "user",
    "ghost",
    "redo",
    "undo",
    "pause",
    "users",
    "rain",
    "calendar",
    "circle-exclamation",
    "circle-question",
    "dropright",
    "dropdown",
    "question",
    "number",
    "navigateleft",
    "navigateright",
    "navigatedown",
    "navigateup",
    "pencil",
    "magic",
    "upload",
    "lock",
    "unlock",
    "settings",
    "trash",
    "at-sign",
    "envelope",
    "visible",
    "invisible",
    "save",
    "printer",
    "file",
    "folder",
    "enter",
    "earth",
    "bell",
    "horn",
    "sync",
    "clock",
    "timer",
    "download",
    "magnifier",
    "checkmark",
    "cross",
    "chevron-up",
    "chevron-down",
    "chevron-left",
    "chevron-right",
    "arrow-up",
    "arrow-down",
    "arrow-left",
    "arrow-right",
    "tab",
    "warning",
    "circle-checkmark",
    "circle-cross",
    "circle-plus",
    "circle-minus",
    "filter",
    "sharp",
    "money",
    "percent",
    "plus",
    "A",
    "copyright",
    "all",
    "greater-than",
    "greater-than-equal-to",
    "less-than",
    "less-than-equal-to",
    "between",
    "not-between",
    "equal-to",
    "not-equal-to",
    "label",
    "hyperlink",
    "fact",
    "attribute",
    "date",
];

const getButtons = () => {
    return types.map((item) => {
        return (
            <tr key={`button-${uuid()}`}>
                <td>
                    <Button
                        value={item.title}
                        className={item.className}
                        iconLeft={item.iconLeft}
                        iconRight={item.iconRight}
                    />
                    <Button
                        value={item.title}
                        className={item.className}
                        iconLeft={item.iconLeft}
                        iconRight={item.iconRight}
                        disabled
                    />
                </td>
                <td className="example-buttons-button-class">
                    <code>{item.className}</code>
                    {item.iconLeft ? (
                        <div>
                            <code>{item.iconLeft}</code>
                        </div>
                    ) : null}
                    {item.iconRight ? (
                        <div>
                            <code>{item.iconRight}</code>
                        </div>
                    ) : null}
                </td>
            </tr>
        );
    });
};

const getGroupButtons = () => (
    <tr key={`button-${uuid()}`}>
        <td>
            <div className="gd-button-group">
                <Button className="gd-button-secondary" value="1" />
                <Button className="gd-button-secondary" value="2" />
                <Button className="gd-button-secondary" value="3" />
            </div>
        </td>
        <td className="example-buttons-button-class">
            <code>gd-button-group</code>
        </td>
    </tr>
);

const getIcons = () => {
    return icons.map((item) => {
        return <Button key={`button-${uuid()}`} value={item} className={`gd-button-link gd-icon-${item}`} />;
    });
};

const ButtonTest: React.FC = () => (
    <div className="library-component screenshot-target">
        <Button className="gd-button-link gd-icon-uploadcloud" value="Deploy process" tagName="a" />
        <h4>Links</h4>
        Use <code>a</code> as a tagName.
        <Button className="gd-button-link gd-icon-uploadcloud" value="Deploy process" tagName="a" />
        <h4>Buttons</h4>
        <table className="example-table">
            <tbody>
                <tr key="header">
                    <th>Example</th>
                    <th>ClassNames</th>
                </tr>
                {getButtons()}
                {getGroupButtons()}
            </tbody>
        </table>
        <h4>Icons</h4>
        <div className="icons-list">{getIcons()}</div>
    </div>
);

storiesOf(`${UiKit}/Button`)
    .add("full-featured button", () => <ButtonTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<ButtonTest />), { screenshot: true });
