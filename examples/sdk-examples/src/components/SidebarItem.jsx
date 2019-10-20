// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React, { Component } from "react";
import PropTypes from "prop-types";

export class SidebarItem extends Component {
    static propTypes = {
        label: PropTypes.string.isRequired,
        id: PropTypes.any.isRequired,
        isSelected: PropTypes.bool,
        onClick: PropTypes.func.isRequired,
    };

    static defaultProps = {
        isSelected: false,
    };

    constructor(props) {
        super(props);
        this.onItemClick = this.onItemClick.bind(this);
    }

    onItemClick() {
        this.props.onClick(this.props.id);
    }

    render() {
        const { label, isSelected } = this.props;

        return (
            <li className="list-item-wrap">
                <style jsx>{`
                    li {
                        margin: 0 -20px 0 -10px;
                        position: relative;
                    }
                    button {
                        display: block;
                        text-align: left;
                        width: 100%;
                        background: transparent none;
                        padding: 10px 20px 10px 10px;
                        border: 0;
                        border-right-width: 1px;
                        border-right-style: solid;
                        border-right-color: #dde4eb;
                        color: #6d7680;
                        transition: border-right-color 200ms ease-out, color 200ms ease-out;
                        cursor: pointer;
                    }

                    button:hover {
                        border-right-width: 3px;
                        color: #000000;
                    }

                    button.selected {
                        border-right-color: #14b2e2;
                        border-right-width: 3px;
                        color: #000000;
                    }
                `}</style>
                <button onClick={this.onItemClick} className={`list-item ${isSelected ? "selected" : ""}`}>
                    {label}
                </button>
            </li>
        );
    }
}

export default SidebarItem;
