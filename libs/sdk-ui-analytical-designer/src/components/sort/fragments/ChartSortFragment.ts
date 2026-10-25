// (C) 2022-2026 GoodData Corporation

import { fireEvent } from "@testing-library/react";

class ButtonFragment {
    public container: HTMLElement;
    public button: HTMLButtonElement;

    constructor(container: HTMLElement, button: HTMLButtonElement) {
        this.container = container;
        this.button = button;
    }

    public isEnabled() {
        return !this.button.classList.contains("disabled");
    }

    public getText() {
        return this.button.textContent;
    }

    public click() {
        fireEvent.click(this.button);
    }

    public hasBubble() {
        return !!this.container.querySelector(".s-chart-sort-button-bubble");
    }

    public hasIcon(iconClassName: string) {
        return !!this.button.querySelector(`.${iconClassName}`);
    }
}

class DialogFragment {
    public dialog: HTMLElement;

    constructor(dialog: HTMLElement) {
        this.dialog = dialog;
    }

    public isOpen() {
        return !!this.dialog;
    }
}

export class ChartSortFragment {
    public container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    public exists() {
        return !!this.container.querySelector(".s-chart-sort");
    }

    public getButton() {
        return new ButtonFragment(this.container, this.container.querySelector(".s-chart-sort-button"));
    }

    public getDialog() {
        return new DialogFragment(document.querySelector(".s-sort-charting-dropdown"));
    }
}
