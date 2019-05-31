// (C) 2007-2019 GoodData Corporation

import * as React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import "../../../../../styles/internal/css/config_panel.css";
import * as ChartConfiguration from "../../../../../src/interfaces/Config";
import * as MappingHeader from "../../../../../src/interfaces/MappingHeader";
import { IColorItem, IColor } from "@gooddata/gooddata-js";
import { IColoredItem } from "../../../../../src/internal/interfaces/Colors";
import ColoredItemsList, {
    IColoredItemsListOwnProps,
} from "../../../../../src/internal/components/configurationControls/colors/coloredItemsList/ColoredItemsList";
import { SmallScreenDecorator } from "../../../../utils/SmallScreenDecorator";
import { getLargePalette } from "../../../../../src/internal/mocks/testColorHelper";
import { InternalIntlWrapper } from "../../../../../src/internal/utils/internalIntlProvider";

export interface IColoredItem {
    colorItem: IColorItem;
    color: IColor;
    mappingHeader?: MappingHeader.IMappingHeader;
}

const inputItems: IColoredItem[] = [
    {
        colorItem: {
            type: "guid",
            value: "01",
        },
        color: {
            r: 0,
            g: 0,
            b: 255,
        },
        mappingHeader: {
            measureHeaderItem: {
                format: "#,##0.00",
                identifier: "acKjadJIgZUN",
                localIdentifier: "4dc55697704c4847aa814bcb2952d32b",
                name: "# of Activities",
                uri: "/gdc/md/x3k4294x4k00",
            },
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "02",
        },
        color: {
            r: 255,
            g: 0,
            b: 255,
        },
        mappingHeader: {
            measureHeaderItem: {
                format: "#,##0.00",
                identifier: "xxxxx",
                localIdentifier: "102555697704c4847aa814bcb2952d32b",
                name: "# of Opps",
                uri: "/gdc/md/xxx",
            },
        },
    },
];

const longInputItems: IColoredItem[] = [
    {
        colorItem: {
            type: "guid",
            value: "01",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Adam Bradley",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1224",
            },
        },
        color: {
            r: 255,
            g: 0,
            b: 0,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "02",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Alejandro Vabiano",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1227",
            },
        },
        color: {
            r: 0,
            g: 255,
            b: 0,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "03",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Alexsandr Fyodr",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1228",
            },
        },
        color: {
            r: 0,
            g: 0,
            b: 255,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "04",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Cory Owens",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1229",
            },
        },
        color: {
            r: 255,
            g: 255,
            b: 0,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "01",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Dale Perdadtin",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1230",
            },
        },
        color: {
            r: 255,
            g: 0,
            b: 0,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "02",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Dave Bostadt",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1231",
            },
        },
        color: {
            r: 0,
            g: 255,
            b: 0,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "03",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Ellen Jones",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1232",
            },
        },
        color: {
            r: 0,
            g: 0,
            b: 255,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "03",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Huey Jonas",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1233",
            },
        },
        color: {
            r: 255,
            g: 255,
            b: 0,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "01",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Jessica Traven",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1235",
            },
        },
        color: {
            r: 255,
            g: 0,
            b: 0,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "02",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "John Jovi",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1236",
            },
        },
        color: {
            r: 0,
            g: 255,
            b: 0,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "03",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Jon Jons",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1238",
            },
        },
        color: {
            r: 0,
            g: 0,
            b: 255,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "04",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Lea Forbes",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1239",
            },
        },
        color: {
            r: 255,
            g: 255,
            b: 0,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "01",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Monique Babonas",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1240",
            },
        },
        color: {
            r: 255,
            g: 0,
            b: 0,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "02",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Paul Gomez",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1241",
            },
        },
        color: {
            r: 0,
            g: 255,
            b: 0,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "03",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Paul Jacobs",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1242",
            },
        },
        color: {
            r: 0,
            g: 0,
            b: 255,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "04",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Ravi Deetri",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1243",
            },
        },
        color: {
            r: 255,
            g: 255,
            b: 0,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "01",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Thomas Gones",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1244",
            },
        },
        color: {
            r: 255,
            g: 0,
            b: 0,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "02",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Tom Stickler",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1245",
            },
        },
        color: {
            r: 0,
            g: 255,
            b: 0,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "03",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Trevor Deegan",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1246",
            },
        },
        color: {
            r: 0,
            g: 0,
            b: 255,
        },
    },
    {
        colorItem: {
            type: "guid",
            value: "04",
        },
        mappingHeader: {
            attributeHeaderItem: {
                name: "Victor Crushetz",
                uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1025/elements?id=1247",
            },
        },
        color: {
            r: 255,
            g: 255,
            b: 0,
        },
    },
];

interface IColoredItemsListTestState {
    isLoading: boolean;
}

class ColoredItemsListTest extends React.PureComponent<
    IColoredItemsListOwnProps,
    IColoredItemsListTestState
> {
    constructor(props: IColoredItemsListOwnProps) {
        super(props);
        this.state = {
            isLoading: false,
        };

        this.changeLoadingState = this.changeLoadingState.bind(this);
    }
    public render() {
        return (
            <div>
                <button onClick={this.changeLoadingState}>Press me</button>
                <ColoredItemsList {...this.props} isLoading={this.state.isLoading} />
            </div>
        );
    }

    private changeLoadingState() {
        const { isLoading } = this.state;
        this.setState({
            isLoading: !isLoading,
        });
    }
}

storiesOf("Internal/Pluggable visualization/Configuration controls/Colors/ColoredItemsList", module)
    .add("ColoredItemsList with few items", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <ColoredItemsList
                    colorPalette={ChartConfiguration.DEFAULT_COLOR_PALETTE}
                    inputItems={inputItems}
                    onSelect={action("onSelect")}
                />
            </InternalIntlWrapper>,
        ),
    )
    .add("ColoredItemsList with a lot of items and search field", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <ColoredItemsList
                    colorPalette={ChartConfiguration.DEFAULT_COLOR_PALETTE}
                    inputItems={longInputItems}
                    onSelect={action("onSelect")}
                />
            </InternalIntlWrapper>,
        ),
    )
    .add("ColoredItemsList with a lot of items and search field and big pallet", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <ColoredItemsList
                    colorPalette={getLargePalette()}
                    inputItems={longInputItems}
                    onSelect={action("onSelect")}
                />
            </InternalIntlWrapper>,
        ),
    )
    .add("ColoredItemsList with loading", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <ColoredItemsListTest
                    colorPalette={ChartConfiguration.DEFAULT_COLOR_PALETTE}
                    inputItems={inputItems}
                    onSelect={action("onSelect")}
                />
            </InternalIntlWrapper>,
        ),
    );
