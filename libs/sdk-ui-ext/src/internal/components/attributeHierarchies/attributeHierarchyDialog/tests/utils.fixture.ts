// (C) 2023 GoodData Corporation

export const attributesData: any = [
    {
        type: "attribute",
        ref: {
            identifier: "attr.f_account.account",
            type: "attribute",
        },
        title: "Account",
        icon: "gd-icon-attribute",
        completed: true,
    },
    {
        type: "dateAttribute",
        ref: {
            identifier: "dt_oppcreated_timestamp.year",
            type: "attribute",
        },
        title: "Created - Year",
        icon: "gd-icon-date",
        completed: true,
    },
    {
        type: "attribute",
        ref: {
            identifier: "attr.f_opportunity.opportunity",
            type: "attribute",
        },
        title: "Opportunity",
        icon: "gd-icon-attribute",
        completed: true,
    },
    {
        type: "dateAttribute",
        ref: {
            identifier: "dt_oppcreated_timestamp.hourOfDay",
            type: "attribute",
        },
        title: "Created - Hour of Day",
        icon: "gd-icon-date",
        completed: true,
    },
];
export const catalogAttributes: any = [
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "attr.f_account.account",
                type: "attribute",
            },
            id: "attr.f_account.account",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/attr.f_account.account",
            title: "Account",
            description: "Account",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "label.f_account.account.name",
                        type: "displayForm",
                    },
                    id: "label.f_account.account.name",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_account.account.name",
                    title: "Name",
                    description: "",
                    attribute: {
                        identifier: "attr.f_account.account",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier: "attr.f_account.account",
                        type: "displayForm",
                    },
                    id: "attr.f_account.account",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_account.account",
                    title: "Account",
                    description: "Account",
                    attribute: {
                        identifier: "attr.f_account.account",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "label.f_account.account.name",
                type: "displayForm",
            },
            id: "label.f_account.account.name",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_account.account.name",
            title: "Name",
            description: "",
            attribute: {
                identifier: "attr.f_account.account",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "label.f_account.account.name",
                    type: "displayForm",
                },
                id: "label.f_account.account.name",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_account.account.name",
                title: "Name",
                description: "",
                attribute: {
                    identifier: "attr.f_account.account",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "attr.f_account.account",
                    type: "displayForm",
                },
                id: "attr.f_account.account",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_account.account",
                title: "Account",
                description: "Account",
                attribute: {
                    identifier: "attr.f_account.account",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Account",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_account.id",
                type: "attribute",
            },
            id: "f_account.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_account.id",
            title: "Account Id",
            description: "Account",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_account.id",
                        type: "displayForm",
                    },
                    id: "f_account.id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_account.id",
                    title: "Account Id",
                    description: "Account",
                    attribute: {
                        identifier: "f_account.id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_account.id",
                type: "displayForm",
            },
            id: "f_account.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_account.id",
            title: "Account Id",
            description: "Account",
            attribute: {
                identifier: "f_account.id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_account.id",
                    type: "displayForm",
                },
                id: "f_account.id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_account.id",
                title: "Account Id",
                description: "Account",
                attribute: {
                    identifier: "f_account.id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Account",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "attr.f_activity.activity",
                type: "attribute",
            },
            id: "attr.f_activity.activity",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/attr.f_activity.activity",
            title: "Activity",
            description: "Activity",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "attr.f_activity.activity",
                        type: "displayForm",
                    },
                    id: "attr.f_activity.activity",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_activity.activity",
                    title: "Activity",
                    description: "Activity",
                    attribute: {
                        identifier: "attr.f_activity.activity",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier: "label.f_activity.subject",
                        type: "displayForm",
                    },
                    id: "label.f_activity.subject",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_activity.subject",
                    title: "Subject",
                    description: "",
                    attribute: {
                        identifier: "attr.f_activity.activity",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "label.f_activity.subject",
                type: "displayForm",
            },
            id: "label.f_activity.subject",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_activity.subject",
            title: "Subject",
            description: "",
            attribute: {
                identifier: "attr.f_activity.activity",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "attr.f_activity.activity",
                    type: "displayForm",
                },
                id: "attr.f_activity.activity",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_activity.activity",
                title: "Activity",
                description: "Activity",
                attribute: {
                    identifier: "attr.f_activity.activity",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "label.f_activity.subject",
                    type: "displayForm",
                },
                id: "label.f_activity.subject",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_activity.subject",
                title: "Subject",
                description: "",
                attribute: {
                    identifier: "attr.f_activity.activity",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Activity",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_activity.id",
                type: "attribute",
            },
            id: "f_activity.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_activity.id",
            title: "Activity Id",
            description: "Activity Id",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_activity.id",
                        type: "displayForm",
                    },
                    id: "f_activity.id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.id",
                    title: "Activity Id",
                    description: "Activity Id",
                    attribute: {
                        identifier: "f_activity.id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_activity.id",
                type: "displayForm",
            },
            id: "f_activity.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.id",
            title: "Activity Id",
            description: "Activity Id",
            attribute: {
                identifier: "f_activity.id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_activity.id",
                    type: "displayForm",
                },
                id: "f_activity.id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.id",
                title: "Activity Id",
                description: "Activity Id",
                attribute: {
                    identifier: "f_activity.id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Activity",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_activity.activitytype_id",
                type: "attribute",
            },
            id: "f_activity.activitytype_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_activity.activitytype_id",
            title: "Activity Type",
            description: "Activity Type",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_activity.activitytype_id",
                        type: "displayForm",
                    },
                    id: "f_activity.activitytype_id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.activitytype_id",
                    title: "Activity Type",
                    description: "Activity Type",
                    attribute: {
                        identifier: "f_activity.activitytype_id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_activity.activitytype_id",
                type: "displayForm",
            },
            id: "f_activity.activitytype_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.activitytype_id",
            title: "Activity Type",
            description: "Activity Type",
            attribute: {
                identifier: "f_activity.activitytype_id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_activity.activitytype_id",
                    type: "displayForm",
                },
                id: "f_activity.activitytype_id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.activitytype_id",
                title: "Activity Type",
                description: "Activity Type",
                attribute: {
                    identifier: "f_activity.activitytype_id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Activity",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_city.id",
                type: "attribute",
            },
            id: "f_city.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_city.id",
            title: "City",
            description: "Id",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_city.id.longitude",
                        type: "displayForm",
                    },
                    id: "f_city.id.longitude",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_city.id.longitude",
                    title: "Longitude",
                    description: "",
                    displayFormType: "GDC.geo.pin_longitude",
                    attribute: {
                        identifier: "f_city.id",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_city.id.cityshortname",
                        type: "displayForm",
                    },
                    id: "f_city.id.cityshortname",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_city.id.cityshortname",
                    title: "City short name",
                    description: "",
                    attribute: {
                        identifier: "f_city.id",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_city.id.latitude",
                        type: "displayForm",
                    },
                    id: "f_city.id.latitude",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_city.id.latitude",
                    title: "Latitude",
                    description: "",
                    displayFormType: "GDC.geo.pin_latitude",
                    attribute: {
                        identifier: "f_city.id",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_city.id.cityname",
                        type: "displayForm",
                    },
                    id: "f_city.id.cityname",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_city.id.cityname",
                    title: "City name",
                    description: "",
                    attribute: {
                        identifier: "f_city.id",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_city.id.location",
                        type: "displayForm",
                    },
                    id: "f_city.id.location",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_city.id.location",
                    title: "Location",
                    description: "",
                    attribute: {
                        identifier: "f_city.id",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_city.id.cityasciiname",
                        type: "displayForm",
                    },
                    id: "f_city.id.cityasciiname",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_city.id.cityasciiname",
                    title: "City ascii name",
                    description: "",
                    attribute: {
                        identifier: "f_city.id",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_city.id",
                        type: "displayForm",
                    },
                    id: "f_city.id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_city.id",
                    title: "City",
                    description: "Id",
                    attribute: {
                        identifier: "f_city.id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_city.id.cityname",
                type: "displayForm",
            },
            id: "f_city.id.cityname",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_city.id.cityname",
            title: "City name",
            description: "",
            attribute: {
                identifier: "f_city.id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_city.id.longitude",
                    type: "displayForm",
                },
                id: "f_city.id.longitude",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_city.id.longitude",
                title: "Longitude",
                description: "",
                displayFormType: "GDC.geo.pin_longitude",
                attribute: {
                    identifier: "f_city.id",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "f_city.id.latitude",
                    type: "displayForm",
                },
                id: "f_city.id.latitude",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_city.id.latitude",
                title: "Latitude",
                description: "",
                displayFormType: "GDC.geo.pin_latitude",
                attribute: {
                    identifier: "f_city.id",
                    type: "attribute",
                },
            },
        ],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_city.id.longitude",
                    type: "displayForm",
                },
                id: "f_city.id.longitude",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_city.id.longitude",
                title: "Longitude",
                description: "",
                displayFormType: "GDC.geo.pin_longitude",
                attribute: {
                    identifier: "f_city.id",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "f_city.id.cityshortname",
                    type: "displayForm",
                },
                id: "f_city.id.cityshortname",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_city.id.cityshortname",
                title: "City short name",
                description: "",
                attribute: {
                    identifier: "f_city.id",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "f_city.id.latitude",
                    type: "displayForm",
                },
                id: "f_city.id.latitude",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_city.id.latitude",
                title: "Latitude",
                description: "",
                displayFormType: "GDC.geo.pin_latitude",
                attribute: {
                    identifier: "f_city.id",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "f_city.id.cityname",
                    type: "displayForm",
                },
                id: "f_city.id.cityname",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_city.id.cityname",
                title: "City name",
                description: "",
                attribute: {
                    identifier: "f_city.id",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "f_city.id.location",
                    type: "displayForm",
                },
                id: "f_city.id.location",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_city.id.location",
                title: "Location",
                description: "",
                attribute: {
                    identifier: "f_city.id",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "f_city.id.cityasciiname",
                    type: "displayForm",
                },
                id: "f_city.id.cityasciiname",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_city.id.cityasciiname",
                title: "City ascii name",
                description: "",
                attribute: {
                    identifier: "f_city.id",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "f_city.id",
                    type: "displayForm",
                },
                id: "f_city.id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_city.id",
                title: "City",
                description: "Id",
                attribute: {
                    identifier: "f_city.id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "City",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "county_name",
                type: "attribute",
            },
            id: "county_name",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/county_name",
            title: "County name",
            description: "County name",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "county_name",
                        type: "displayForm",
                    },
                    id: "county_name",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/county_name",
                    title: "County name",
                    description: "County name",
                    attribute: {
                        identifier: "county_name",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "county_name",
                type: "displayForm",
            },
            id: "county_name",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/county_name",
            title: "County name",
            description: "County name",
            attribute: {
                identifier: "county_name",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "county_name",
                    type: "displayForm",
                },
                id: "county_name",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/county_name",
                title: "County name",
                description: "County name",
                attribute: {
                    identifier: "county_name",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "City",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_owner.department_id",
                type: "attribute",
            },
            id: "f_owner.department_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_owner.department_id",
            title: "Department",
            description: "Department",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_owner.department_id",
                        type: "displayForm",
                    },
                    id: "f_owner.department_id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_owner.department_id",
                    title: "Department",
                    description: "Department",
                    attribute: {
                        identifier: "f_owner.department_id",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_owner.department_id.departmenthyperlink",
                        type: "displayForm",
                    },
                    id: "f_owner.department_id.departmenthyperlink",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_owner.department_id.departmenthyperlink",
                    title: "Department hyperlink",
                    description: "",
                    displayFormType: "GDC.link",
                    attribute: {
                        identifier: "f_owner.department_id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_owner.department_id",
                type: "displayForm",
            },
            id: "f_owner.department_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_owner.department_id",
            title: "Department",
            description: "Department",
            attribute: {
                identifier: "f_owner.department_id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_owner.department_id",
                    type: "displayForm",
                },
                id: "f_owner.department_id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_owner.department_id",
                title: "Department",
                description: "Department",
                attribute: {
                    identifier: "f_owner.department_id",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "f_owner.department_id.departmenthyperlink",
                    type: "displayForm",
                },
                id: "f_owner.department_id.departmenthyperlink",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_owner.department_id.departmenthyperlink",
                title: "Department hyperlink",
                description: "",
                displayFormType: "GDC.link",
                attribute: {
                    identifier: "f_owner.department_id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "owner",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_opportunitysnapshot.forecastcategory_id",
                type: "attribute",
            },
            id: "f_opportunitysnapshot.forecastcategory_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_opportunitysnapshot.forecastcategory_id",
            title: "Forecast Category",
            description: "Forecast Category",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_opportunitysnapshot.forecastcategory_id",
                        type: "displayForm",
                    },
                    id: "f_opportunitysnapshot.forecastcategory_id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_opportunitysnapshot.forecastcategory_id",
                    title: "Forecast Category",
                    description: "Forecast Category",
                    attribute: {
                        identifier: "f_opportunitysnapshot.forecastcategory_id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_opportunitysnapshot.forecastcategory_id",
                type: "displayForm",
            },
            id: "f_opportunitysnapshot.forecastcategory_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_opportunitysnapshot.forecastcategory_id",
            title: "Forecast Category",
            description: "Forecast Category",
            attribute: {
                identifier: "f_opportunitysnapshot.forecastcategory_id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_opportunitysnapshot.forecastcategory_id",
                    type: "displayForm",
                },
                id: "f_opportunitysnapshot.forecastcategory_id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_opportunitysnapshot.forecastcategory_id",
                title: "Forecast Category",
                description: "Forecast Category",
                attribute: {
                    identifier: "f_opportunitysnapshot.forecastcategory_id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "OpportunitySnapshot",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_stage.isactive_id",
                type: "attribute",
            },
            id: "f_stage.isactive_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_stage.isactive_id",
            title: "Is Active?",
            description: "Is Active?",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_stage.isactive_id",
                        type: "displayForm",
                    },
                    id: "f_stage.isactive_id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stage.isactive_id",
                    title: "Is Active?",
                    description: "Is Active?",
                    attribute: {
                        identifier: "f_stage.isactive_id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_stage.isactive_id",
                type: "displayForm",
            },
            id: "f_stage.isactive_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stage.isactive_id",
            title: "Is Active?",
            description: "Is Active?",
            attribute: {
                identifier: "f_stage.isactive_id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_stage.isactive_id",
                    type: "displayForm",
                },
                id: "f_stage.isactive_id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stage.isactive_id",
                title: "Is Active?",
                description: "Is Active?",
                attribute: {
                    identifier: "f_stage.isactive_id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Stage",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_activity.isclosed_id",
                type: "attribute",
            },
            id: "f_activity.isclosed_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_activity.isclosed_id",
            title: "Is Closed?",
            description: "Is Closed?",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_activity.isclosed_id",
                        type: "displayForm",
                    },
                    id: "f_activity.isclosed_id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.isclosed_id",
                    title: "Is Closed?",
                    description: "Is Closed?",
                    attribute: {
                        identifier: "f_activity.isclosed_id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_activity.isclosed_id",
                type: "displayForm",
            },
            id: "f_activity.isclosed_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.isclosed_id",
            title: "Is Closed?",
            description: "Is Closed?",
            attribute: {
                identifier: "f_activity.isclosed_id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_activity.isclosed_id",
                    type: "displayForm",
                },
                id: "f_activity.isclosed_id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.isclosed_id",
                title: "Is Closed?",
                description: "Is Closed?",
                attribute: {
                    identifier: "f_activity.isclosed_id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Activity",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_stage.isclosed_id",
                type: "attribute",
            },
            id: "f_stage.isclosed_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_stage.isclosed_id",
            title: "Is Closed?",
            description: "Is Closed?",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_stage.isclosed_id",
                        type: "displayForm",
                    },
                    id: "f_stage.isclosed_id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stage.isclosed_id",
                    title: "Is Closed?",
                    description: "Is Closed?",
                    attribute: {
                        identifier: "f_stage.isclosed_id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_stage.isclosed_id",
                type: "displayForm",
            },
            id: "f_stage.isclosed_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stage.isclosed_id",
            title: "Is Closed?",
            description: "Is Closed?",
            attribute: {
                identifier: "f_stage.isclosed_id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_stage.isclosed_id",
                    type: "displayForm",
                },
                id: "f_stage.isclosed_id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stage.isclosed_id",
                title: "Is Closed?",
                description: "Is Closed?",
                attribute: {
                    identifier: "f_stage.isclosed_id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Stage",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_activity.istask_id",
                type: "attribute",
            },
            id: "f_activity.istask_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_activity.istask_id",
            title: "Is Task?",
            description: "Is Task?",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_activity.istask_id",
                        type: "displayForm",
                    },
                    id: "f_activity.istask_id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.istask_id",
                    title: "Is Task?",
                    description: "Is Task?",
                    attribute: {
                        identifier: "f_activity.istask_id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_activity.istask_id",
                type: "displayForm",
            },
            id: "f_activity.istask_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.istask_id",
            title: "Is Task?",
            description: "Is Task?",
            attribute: {
                identifier: "f_activity.istask_id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_activity.istask_id",
                    type: "displayForm",
                },
                id: "f_activity.istask_id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.istask_id",
                title: "Is Task?",
                description: "Is Task?",
                attribute: {
                    identifier: "f_activity.istask_id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Activity",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_stage.iswon_id",
                type: "attribute",
            },
            id: "f_stage.iswon_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_stage.iswon_id",
            title: "Is Won?",
            description: "Is Won?",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_stage.iswon_id",
                        type: "displayForm",
                    },
                    id: "f_stage.iswon_id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stage.iswon_id",
                    title: "Is Won?",
                    description: "Is Won?",
                    attribute: {
                        identifier: "f_stage.iswon_id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_stage.iswon_id",
                type: "displayForm",
            },
            id: "f_stage.iswon_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stage.iswon_id",
            title: "Is Won?",
            description: "Is Won?",
            attribute: {
                identifier: "f_stage.iswon_id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_stage.iswon_id",
                    type: "displayForm",
                },
                id: "f_stage.iswon_id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stage.iswon_id",
                title: "Is Won?",
                description: "Is Won?",
                attribute: {
                    identifier: "f_stage.iswon_id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Stage",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "attr.f_opportunitysnapshot.oppsnapshot",
                type: "attribute",
            },
            id: "attr.f_opportunitysnapshot.oppsnapshot",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/attr.f_opportunitysnapshot.oppsnapshot",
            title: "Opp. Snapshot",
            description: "Opp. Snapshot",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "attr.f_opportunitysnapshot.oppsnapshot",
                        type: "displayForm",
                    },
                    id: "attr.f_opportunitysnapshot.oppsnapshot",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_opportunitysnapshot.oppsnapshot",
                    title: "Opp. Snapshot",
                    description: "Opp. Snapshot",
                    attribute: {
                        identifier: "attr.f_opportunitysnapshot.oppsnapshot",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "attr.f_opportunitysnapshot.oppsnapshot",
                type: "displayForm",
            },
            id: "attr.f_opportunitysnapshot.oppsnapshot",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_opportunitysnapshot.oppsnapshot",
            title: "Opp. Snapshot",
            description: "Opp. Snapshot",
            attribute: {
                identifier: "attr.f_opportunitysnapshot.oppsnapshot",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "attr.f_opportunitysnapshot.oppsnapshot",
                    type: "displayForm",
                },
                id: "attr.f_opportunitysnapshot.oppsnapshot",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_opportunitysnapshot.oppsnapshot",
                title: "Opp. Snapshot",
                description: "Opp. Snapshot",
                attribute: {
                    identifier: "attr.f_opportunitysnapshot.oppsnapshot",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "OpportunitySnapshot",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_opportunitysnapshot.id",
                type: "attribute",
            },
            id: "f_opportunitysnapshot.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_opportunitysnapshot.id",
            title: "Opp. Snapshot Id",
            description: "Opp. Snapshot Id",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_opportunitysnapshot.id",
                        type: "displayForm",
                    },
                    id: "f_opportunitysnapshot.id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_opportunitysnapshot.id",
                    title: "Opp. Snapshot Id",
                    description: "Opp. Snapshot Id",
                    attribute: {
                        identifier: "f_opportunitysnapshot.id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_opportunitysnapshot.id",
                type: "displayForm",
            },
            id: "f_opportunitysnapshot.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_opportunitysnapshot.id",
            title: "Opp. Snapshot Id",
            description: "Opp. Snapshot Id",
            attribute: {
                identifier: "f_opportunitysnapshot.id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_opportunitysnapshot.id",
                    type: "displayForm",
                },
                id: "f_opportunitysnapshot.id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_opportunitysnapshot.id",
                title: "Opp. Snapshot Id",
                description: "Opp. Snapshot Id",
                attribute: {
                    identifier: "f_opportunitysnapshot.id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "OpportunitySnapshot",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "attr.f_opportunity.opportunity",
                type: "attribute",
            },
            id: "attr.f_opportunity.opportunity",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/attr.f_opportunity.opportunity",
            title: "Opportunity",
            description: "Opportunity",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "label.f_opportunity.opportunity.name",
                        type: "displayForm",
                    },
                    id: "label.f_opportunity.opportunity.name",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_opportunity.opportunity.name",
                    title: "Opportunity Name",
                    description: "",
                    attribute: {
                        identifier: "attr.f_opportunity.opportunity",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier: "attr.f_opportunity.opportunity",
                        type: "displayForm",
                    },
                    id: "attr.f_opportunity.opportunity",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_opportunity.opportunity",
                    title: "Opportunity",
                    description: "Opportunity",
                    attribute: {
                        identifier: "attr.f_opportunity.opportunity",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier: "label.f_opportunity.opportunity.sfdcurl",
                        type: "displayForm",
                    },
                    id: "label.f_opportunity.opportunity.sfdcurl",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_opportunity.opportunity.sfdcurl",
                    title: "SFDC URL",
                    description: "",
                    displayFormType: "GDC.link",
                    attribute: {
                        identifier: "attr.f_opportunity.opportunity",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "label.f_opportunity.opportunity.name",
                type: "displayForm",
            },
            id: "label.f_opportunity.opportunity.name",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_opportunity.opportunity.name",
            title: "Opportunity Name",
            description: "",
            attribute: {
                identifier: "attr.f_opportunity.opportunity",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "label.f_opportunity.opportunity.name",
                    type: "displayForm",
                },
                id: "label.f_opportunity.opportunity.name",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_opportunity.opportunity.name",
                title: "Opportunity Name",
                description: "",
                attribute: {
                    identifier: "attr.f_opportunity.opportunity",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "attr.f_opportunity.opportunity",
                    type: "displayForm",
                },
                id: "attr.f_opportunity.opportunity",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_opportunity.opportunity",
                title: "Opportunity",
                description: "Opportunity",
                attribute: {
                    identifier: "attr.f_opportunity.opportunity",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "label.f_opportunity.opportunity.sfdcurl",
                    type: "displayForm",
                },
                id: "label.f_opportunity.opportunity.sfdcurl",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_opportunity.opportunity.sfdcurl",
                title: "SFDC URL",
                description: "",
                displayFormType: "GDC.link",
                attribute: {
                    identifier: "attr.f_opportunity.opportunity",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Opportunity",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_opportunity.id",
                type: "attribute",
            },
            id: "f_opportunity.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_opportunity.id",
            title: "Opportunity Id",
            description: "Opportunity Id",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_opportunity.id",
                        type: "displayForm",
                    },
                    id: "f_opportunity.id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_opportunity.id",
                    title: "Opportunity Id",
                    description: "Opportunity Id",
                    attribute: {
                        identifier: "f_opportunity.id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_opportunity.id",
                type: "displayForm",
            },
            id: "f_opportunity.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_opportunity.id",
            title: "Opportunity Id",
            description: "Opportunity Id",
            attribute: {
                identifier: "f_opportunity.id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_opportunity.id",
                    type: "displayForm",
                },
                id: "f_opportunity.id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_opportunity.id",
                title: "Opportunity Id",
                description: "Opportunity Id",
                attribute: {
                    identifier: "f_opportunity.id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Opportunity",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_owner.id",
                type: "attribute",
            },
            id: "f_owner.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_owner.id",
            title: "Owner Id",
            description: "Id",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_owner.id",
                        type: "displayForm",
                    },
                    id: "f_owner.id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_owner.id",
                    title: "Owner Id",
                    description: "Id",
                    attribute: {
                        identifier: "f_owner.id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_owner.id",
                type: "displayForm",
            },
            id: "f_owner.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_owner.id",
            title: "Owner Id",
            description: "Id",
            attribute: {
                identifier: "f_owner.id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_owner.id",
                    type: "displayForm",
                },
                id: "f_owner.id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_owner.id",
                title: "Owner Id",
                description: "Id",
                attribute: {
                    identifier: "f_owner.id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "owner",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_activity.priority_id",
                type: "attribute",
            },
            id: "f_activity.priority_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_activity.priority_id",
            title: "Priority",
            description: "Priority",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_activity.priority_id",
                        type: "displayForm",
                    },
                    id: "f_activity.priority_id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.priority_id",
                    title: "Priority",
                    description: "Priority",
                    attribute: {
                        identifier: "f_activity.priority_id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_activity.priority_id",
                type: "displayForm",
            },
            id: "f_activity.priority_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.priority_id",
            title: "Priority",
            description: "Priority",
            attribute: {
                identifier: "f_activity.priority_id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_activity.priority_id",
                    type: "displayForm",
                },
                id: "f_activity.priority_id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.priority_id",
                title: "Priority",
                description: "Priority",
                attribute: {
                    identifier: "f_activity.priority_id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Activity",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "attr.f_product.product",
                type: "attribute",
            },
            id: "attr.f_product.product",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/attr.f_product.product",
            title: "Product",
            description: "Product",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "attr.f_product.product",
                        type: "displayForm",
                    },
                    id: "attr.f_product.product",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_product.product",
                    title: "Product",
                    description: "Product",
                    attribute: {
                        identifier: "attr.f_product.product",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier: "label.f_product.product.name",
                        type: "displayForm",
                    },
                    id: "label.f_product.product.name",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_product.product.name",
                    title: "Product Name",
                    description: "",
                    attribute: {
                        identifier: "attr.f_product.product",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "label.f_product.product.name",
                type: "displayForm",
            },
            id: "label.f_product.product.name",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_product.product.name",
            title: "Product Name",
            description: "",
            attribute: {
                identifier: "attr.f_product.product",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "attr.f_product.product",
                    type: "displayForm",
                },
                id: "attr.f_product.product",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_product.product",
                title: "Product",
                description: "Product",
                attribute: {
                    identifier: "attr.f_product.product",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "label.f_product.product.name",
                    type: "displayForm",
                },
                id: "label.f_product.product.name",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_product.product.name",
                title: "Product Name",
                description: "",
                attribute: {
                    identifier: "attr.f_product.product",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "product",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_product.id",
                type: "attribute",
            },
            id: "f_product.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_product.id",
            title: "Product Id",
            description: "Product",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_product.id",
                        type: "displayForm",
                    },
                    id: "f_product.id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_product.id",
                    title: "Product Id",
                    description: "Product",
                    attribute: {
                        identifier: "f_product.id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_product.id",
                type: "displayForm",
            },
            id: "f_product.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_product.id",
            title: "Product Id",
            description: "Product",
            attribute: {
                identifier: "f_product.id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_product.id",
                    type: "displayForm",
                },
                id: "f_product.id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_product.id",
                title: "Product Id",
                description: "Product",
                attribute: {
                    identifier: "f_product.id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "product",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "productthatisrenamedtotestthelongattributename",
                type: "attribute",
            },
            id: "productthatisrenamedtotestthelongattributename",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/productthatisrenamedtotestthelongattributename",
            title: "Product that is renamed to test the long attribute name",
            description: "",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "productthatisrenamedtotestthelongattributename",
                        type: "displayForm",
                    },
                    id: "productthatisrenamedtotestthelongattributename",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/productthatisrenamedtotestthelongattributename",
                    title: "Product that is renamed to test the long attribute name",
                    description: "",
                    attribute: {
                        identifier: "productthatisrenamedtotestthelongattributename",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier:
                            "productthatisrenamedtotestthelongattributename.productthatisrenamedtotestthelongattributenamehyperlink",
                        type: "displayForm",
                    },
                    id: "productthatisrenamedtotestthelongattributename.productthatisrenamedtotestthelongattributenamehyperlink",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/productthatisrenamedtotestthelongattributename.productthatisrenamedtotestthelongattributenamehyperlink",
                    title: "Product that is renamed to test the long attribute name hyperlink",
                    description: "",
                    displayFormType: "GDC.link",
                    attribute: {
                        identifier: "productthatisrenamedtotestthelongattributename",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "productthatisrenamedtotestthelongattributename",
                type: "displayForm",
            },
            id: "productthatisrenamedtotestthelongattributename",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/productthatisrenamedtotestthelongattributename",
            title: "Product that is renamed to test the long attribute name",
            description: "",
            attribute: {
                identifier: "productthatisrenamedtotestthelongattributename",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "productthatisrenamedtotestthelongattributename",
                    type: "displayForm",
                },
                id: "productthatisrenamedtotestthelongattributename",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/productthatisrenamedtotestthelongattributename",
                title: "Product that is renamed to test the long attribute name",
                description: "",
                attribute: {
                    identifier: "productthatisrenamedtotestthelongattributename",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier:
                        "productthatisrenamedtotestthelongattributename.productthatisrenamedtotestthelongattributenamehyperlink",
                    type: "displayForm",
                },
                id: "productthatisrenamedtotestthelongattributename.productthatisrenamedtotestthelongattributenamehyperlink",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/productthatisrenamedtotestthelongattributename.productthatisrenamedtotestthelongattributenamehyperlink",
                title: "Product that is renamed to test the long attribute name hyperlink",
                description: "",
                displayFormType: "GDC.link",
                attribute: {
                    identifier: "productthatisrenamedtotestthelongattributename",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "product",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_owner.region_id",
                type: "attribute",
            },
            id: "f_owner.region_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_owner.region_id",
            title: "Region",
            description: "Region",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_owner.region_id.regionhyperlink",
                        type: "displayForm",
                    },
                    id: "f_owner.region_id.regionhyperlink",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_owner.region_id.regionhyperlink",
                    title: "Region hyperlink",
                    description: "",
                    displayFormType: "GDC.link",
                    attribute: {
                        identifier: "f_owner.region_id",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_owner.region_id",
                        type: "displayForm",
                    },
                    id: "f_owner.region_id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_owner.region_id",
                    title: "Region",
                    description: "Region",
                    attribute: {
                        identifier: "f_owner.region_id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_owner.region_id",
                type: "displayForm",
            },
            id: "f_owner.region_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_owner.region_id",
            title: "Region",
            description: "Region",
            attribute: {
                identifier: "f_owner.region_id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_owner.region_id.regionhyperlink",
                    type: "displayForm",
                },
                id: "f_owner.region_id.regionhyperlink",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_owner.region_id.regionhyperlink",
                title: "Region hyperlink",
                description: "",
                displayFormType: "GDC.link",
                attribute: {
                    identifier: "f_owner.region_id",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "f_owner.region_id",
                    type: "displayForm",
                },
                id: "f_owner.region_id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_owner.region_id",
                title: "Region",
                description: "Region",
                attribute: {
                    identifier: "f_owner.region_id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "owner",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "attr.f_owner.salesrep",
                type: "attribute",
            },
            id: "attr.f_owner.salesrep",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/attr.f_owner.salesrep",
            title: "Sales Rep",
            description: "",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "attr.f_owner.salesrep",
                        type: "displayForm",
                    },
                    id: "attr.f_owner.salesrep",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_owner.salesrep",
                    title: "Sales Rep",
                    description: "",
                    attribute: {
                        identifier: "attr.f_owner.salesrep",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier: "label.f_owner.salesrep.ownername",
                        type: "displayForm",
                    },
                    id: "label.f_owner.salesrep.ownername",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_owner.salesrep.ownername",
                    title: "Owner Name",
                    description: "",
                    attribute: {
                        identifier: "attr.f_owner.salesrep",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "label.f_owner.salesrep.ownername",
                type: "displayForm",
            },
            id: "label.f_owner.salesrep.ownername",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_owner.salesrep.ownername",
            title: "Owner Name",
            description: "",
            attribute: {
                identifier: "attr.f_owner.salesrep",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "attr.f_owner.salesrep",
                    type: "displayForm",
                },
                id: "attr.f_owner.salesrep",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_owner.salesrep",
                title: "Sales Rep",
                description: "",
                attribute: {
                    identifier: "attr.f_owner.salesrep",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "label.f_owner.salesrep.ownername",
                    type: "displayForm",
                },
                id: "label.f_owner.salesrep.ownername",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_owner.salesrep.ownername",
                title: "Owner Name",
                description: "",
                attribute: {
                    identifier: "attr.f_owner.salesrep",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "owner",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "attr.f_stagehistory.stagehistory",
                type: "attribute",
            },
            id: "attr.f_stagehistory.stagehistory",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/attr.f_stagehistory.stagehistory",
            title: "Stage History",
            description: "Stage History",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "attr.f_stagehistory.stagehistory",
                        type: "displayForm",
                    },
                    id: "attr.f_stagehistory.stagehistory",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_stagehistory.stagehistory",
                    title: "Stage History",
                    description: "Stage History",
                    attribute: {
                        identifier: "attr.f_stagehistory.stagehistory",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "attr.f_stagehistory.stagehistory",
                type: "displayForm",
            },
            id: "attr.f_stagehistory.stagehistory",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_stagehistory.stagehistory",
            title: "Stage History",
            description: "Stage History",
            attribute: {
                identifier: "attr.f_stagehistory.stagehistory",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "attr.f_stagehistory.stagehistory",
                    type: "displayForm",
                },
                id: "attr.f_stagehistory.stagehistory",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_stagehistory.stagehistory",
                title: "Stage History",
                description: "Stage History",
                attribute: {
                    identifier: "attr.f_stagehistory.stagehistory",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "stagehistory",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_stagehistory.id",
                type: "attribute",
            },
            id: "f_stagehistory.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_stagehistory.id",
            title: "Stage History Id",
            description: "Stage History Id",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_stagehistory.id",
                        type: "displayForm",
                    },
                    id: "f_stagehistory.id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stagehistory.id",
                    title: "Stage History Id",
                    description: "Stage History Id",
                    attribute: {
                        identifier: "f_stagehistory.id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_stagehistory.id",
                type: "displayForm",
            },
            id: "f_stagehistory.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stagehistory.id",
            title: "Stage History Id",
            description: "Stage History Id",
            attribute: {
                identifier: "f_stagehistory.id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_stagehistory.id",
                    type: "displayForm",
                },
                id: "f_stagehistory.id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stagehistory.id",
                title: "Stage History Id",
                description: "Stage History Id",
                attribute: {
                    identifier: "f_stagehistory.id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "stagehistory",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_stage.id",
                type: "attribute",
            },
            id: "f_stage.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_stage.id",
            title: "Stage Id",
            description: "Stage Id",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_stage.id",
                        type: "displayForm",
                    },
                    id: "f_stage.id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stage.id",
                    title: "Stage Id",
                    description: "Stage Id",
                    attribute: {
                        identifier: "f_stage.id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_stage.id",
                type: "displayForm",
            },
            id: "f_stage.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stage.id",
            title: "Stage Id",
            description: "Stage Id",
            attribute: {
                identifier: "f_stage.id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_stage.id",
                    type: "displayForm",
                },
                id: "f_stage.id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stage.id",
                title: "Stage Id",
                description: "Stage Id",
                attribute: {
                    identifier: "f_stage.id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Stage",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "attr.f_stage.stagename",
                type: "attribute",
            },
            id: "attr.f_stage.stagename",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/attr.f_stage.stagename",
            title: "Stage Name",
            description: "Stage Name",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "label.f_stage.stagename.order",
                        type: "displayForm",
                    },
                    id: "label.f_stage.stagename.order",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_stage.stagename.order",
                    title: "Order",
                    description: "",
                    attribute: {
                        identifier: "attr.f_stage.stagename",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier: "attr.f_stage.stagename",
                        type: "displayForm",
                    },
                    id: "attr.f_stage.stagename",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_stage.stagename",
                    title: "Stage Name",
                    description: "Stage Name",
                    attribute: {
                        identifier: "attr.f_stage.stagename",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier: "label.f_stage.stagename.stagename",
                        type: "displayForm",
                    },
                    id: "label.f_stage.stagename.stagename",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_stage.stagename.stagename",
                    title: "Stage Name",
                    description: "",
                    attribute: {
                        identifier: "attr.f_stage.stagename",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "attr.f_stage.stagename",
                type: "displayForm",
            },
            id: "attr.f_stage.stagename",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_stage.stagename",
            title: "Stage Name",
            description: "Stage Name",
            attribute: {
                identifier: "attr.f_stage.stagename",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "label.f_stage.stagename.order",
                    type: "displayForm",
                },
                id: "label.f_stage.stagename.order",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_stage.stagename.order",
                title: "Order",
                description: "",
                attribute: {
                    identifier: "attr.f_stage.stagename",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "attr.f_stage.stagename",
                    type: "displayForm",
                },
                id: "attr.f_stage.stagename",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/attr.f_stage.stagename",
                title: "Stage Name",
                description: "Stage Name",
                attribute: {
                    identifier: "attr.f_stage.stagename",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "label.f_stage.stagename.stagename",
                    type: "displayForm",
                },
                id: "label.f_stage.stagename.stagename",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/label.f_stage.stagename.stagename",
                title: "Stage Name",
                description: "",
                attribute: {
                    identifier: "attr.f_stage.stagename",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Stage",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "state_id",
                type: "attribute",
            },
            id: "state_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/state_id",
            title: "State",
            description: "State id",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "state_id.statename",
                        type: "displayForm",
                    },
                    id: "state_id.statename",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/state_id.statename",
                    title: "State name",
                    description: "",
                    attribute: {
                        identifier: "state_id",
                        type: "attribute",
                    },
                },
                {
                    type: "displayForm",
                    ref: {
                        identifier: "state_id",
                        type: "displayForm",
                    },
                    id: "state_id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/state_id",
                    title: "State",
                    description: "State id",
                    attribute: {
                        identifier: "state_id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "state_id.statename",
                type: "displayForm",
            },
            id: "state_id.statename",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/state_id.statename",
            title: "State name",
            description: "",
            attribute: {
                identifier: "state_id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "state_id.statename",
                    type: "displayForm",
                },
                id: "state_id.statename",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/state_id.statename",
                title: "State name",
                description: "",
                attribute: {
                    identifier: "state_id",
                    type: "attribute",
                },
            },
            {
                type: "displayForm",
                ref: {
                    identifier: "state_id",
                    type: "displayForm",
                },
                id: "state_id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/state_id",
                title: "State",
                description: "State id",
                attribute: {
                    identifier: "state_id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "City",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_activity.status_id",
                type: "attribute",
            },
            id: "f_activity.status_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_activity.status_id",
            title: "Status",
            description: "Status",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_activity.status_id",
                        type: "displayForm",
                    },
                    id: "f_activity.status_id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.status_id",
                    title: "Status",
                    description: "Status",
                    attribute: {
                        identifier: "f_activity.status_id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_activity.status_id",
                type: "displayForm",
            },
            id: "f_activity.status_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.status_id",
            title: "Status",
            description: "Status",
            attribute: {
                identifier: "f_activity.status_id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_activity.status_id",
                    type: "displayForm",
                },
                id: "f_activity.status_id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_activity.status_id",
                title: "Status",
                description: "Status",
                attribute: {
                    identifier: "f_activity.status_id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Activity",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_stage.status_id",
                type: "attribute",
            },
            id: "f_stage.status_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_stage.status_id",
            title: "Status",
            description: "Status",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_stage.status_id",
                        type: "displayForm",
                    },
                    id: "f_stage.status_id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stage.status_id",
                    title: "Status",
                    description: "Status",
                    attribute: {
                        identifier: "f_stage.status_id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_stage.status_id",
                type: "displayForm",
            },
            id: "f_stage.status_id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stage.status_id",
            title: "Status",
            description: "Status",
            attribute: {
                identifier: "f_stage.status_id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_stage.status_id",
                    type: "displayForm",
                },
                id: "f_stage.status_id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_stage.status_id",
                title: "Status",
                description: "Status",
                attribute: {
                    identifier: "f_stage.status_id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Stage",
                type: "tag",
            },
        ],
    },
    {
        type: "attribute",
        attribute: {
            type: "attribute",
            ref: {
                identifier: "f_timeline.id",
                type: "attribute",
            },
            id: "f_timeline.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/f_timeline.id",
            title: "Timeline",
            description: "Timeline",
            displayForms: [
                {
                    type: "displayForm",
                    ref: {
                        identifier: "f_timeline.id",
                        type: "displayForm",
                    },
                    id: "f_timeline.id",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_timeline.id",
                    title: "Timeline",
                    description: "Timeline",
                    attribute: {
                        identifier: "f_timeline.id",
                        type: "attribute",
                    },
                },
            ],
        },
        defaultDisplayForm: {
            type: "displayForm",
            ref: {
                identifier: "f_timeline.id",
                type: "displayForm",
            },
            id: "f_timeline.id",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_timeline.id",
            title: "Timeline",
            description: "Timeline",
            attribute: {
                identifier: "f_timeline.id",
                type: "attribute",
            },
        },
        geoPinDisplayForms: [],
        displayForms: [
            {
                type: "displayForm",
                ref: {
                    identifier: "f_timeline.id",
                    type: "displayForm",
                },
                id: "f_timeline.id",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/f_timeline.id",
                title: "Timeline",
                description: "Timeline",
                attribute: {
                    identifier: "f_timeline.id",
                    type: "attribute",
                },
            },
        ],
        groups: [
            {
                identifier: "Timeline",
                type: "tag",
            },
        ],
    },
];
export const catalogDateDatasets: any = [
    {
        type: "dateDataset",
        relevance: 0,
        dataSet: {
            type: "dataSet",
            ref: {
                identifier: "dt_activity_timestamp",
                type: "dataSet",
            },
            id: "dt_activity_timestamp",
            title: "Activity",
            description: "",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/datasets/dt_activity_timestamp",
            production: true,
            unlisted: false,
        },
        dateAttributes: [
            {
                granularity: "GDC.time.date",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_activity_timestamp.day",
                        type: "attribute",
                    },
                    id: "dt_activity_timestamp.day",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_activity_timestamp.day",
                    title: "Activity - Date",
                    description: "Date",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_activity_timestamp.day",
                                type: "displayForm",
                            },
                            id: "dt_activity_timestamp.day",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.day",
                            title: "Activity - Date",
                            description: "Date",
                            attribute: {
                                identifier: "dt_activity_timestamp.day",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_activity_timestamp.day",
                        type: "displayForm",
                    },
                    id: "dt_activity_timestamp.day",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.day",
                    title: "Activity - Date",
                    description: "Date",
                    attribute: {
                        identifier: "dt_activity_timestamp.day",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.day_in_month",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_activity_timestamp.dayOfMonth",
                        type: "attribute",
                    },
                    id: "dt_activity_timestamp.dayOfMonth",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_activity_timestamp.dayOfMonth",
                    title: "Activity - Day of Month",
                    description: "Generic Day of the Month (D1-D31)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_activity_timestamp.dayOfMonth",
                                type: "displayForm",
                            },
                            id: "dt_activity_timestamp.dayOfMonth",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.dayOfMonth",
                            title: "Activity - Day of Month",
                            description: "Generic Day of the Month (D1-D31)",
                            attribute: {
                                identifier: "dt_activity_timestamp.dayOfMonth",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_activity_timestamp.dayOfMonth",
                        type: "displayForm",
                    },
                    id: "dt_activity_timestamp.dayOfMonth",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.dayOfMonth",
                    title: "Activity - Day of Month",
                    description: "Generic Day of the Month (D1-D31)",
                    attribute: {
                        identifier: "dt_activity_timestamp.dayOfMonth",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.day_in_week",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_activity_timestamp.dayOfWeek",
                        type: "attribute",
                    },
                    id: "dt_activity_timestamp.dayOfWeek",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_activity_timestamp.dayOfWeek",
                    title: "Activity - Day of Week",
                    description: "Generic Day of the Week (D1-D7)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_activity_timestamp.dayOfWeek",
                                type: "displayForm",
                            },
                            id: "dt_activity_timestamp.dayOfWeek",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.dayOfWeek",
                            title: "Activity - Day of Week",
                            description: "Generic Day of the Week (D1-D7)",
                            attribute: {
                                identifier: "dt_activity_timestamp.dayOfWeek",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_activity_timestamp.dayOfWeek",
                        type: "displayForm",
                    },
                    id: "dt_activity_timestamp.dayOfWeek",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.dayOfWeek",
                    title: "Activity - Day of Week",
                    description: "Generic Day of the Week (D1-D7)",
                    attribute: {
                        identifier: "dt_activity_timestamp.dayOfWeek",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.day_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_activity_timestamp.dayOfYear",
                        type: "attribute",
                    },
                    id: "dt_activity_timestamp.dayOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_activity_timestamp.dayOfYear",
                    title: "Activity - Day of Year",
                    description: "Generic Day of the Year (D1-D366)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_activity_timestamp.dayOfYear",
                                type: "displayForm",
                            },
                            id: "dt_activity_timestamp.dayOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.dayOfYear",
                            title: "Activity - Day of Year",
                            description: "Generic Day of the Year (D1-D366)",
                            attribute: {
                                identifier: "dt_activity_timestamp.dayOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_activity_timestamp.dayOfYear",
                        type: "displayForm",
                    },
                    id: "dt_activity_timestamp.dayOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.dayOfYear",
                    title: "Activity - Day of Year",
                    description: "Generic Day of the Year (D1-D366)",
                    attribute: {
                        identifier: "dt_activity_timestamp.dayOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.hour",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_activity_timestamp.hour",
                        type: "attribute",
                    },
                    id: "dt_activity_timestamp.hour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_activity_timestamp.hour",
                    title: "Activity - Hour",
                    description: "Hour",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_activity_timestamp.hour",
                                type: "displayForm",
                            },
                            id: "dt_activity_timestamp.hour",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.hour",
                            title: "Activity - Hour",
                            description: "Hour",
                            attribute: {
                                identifier: "dt_activity_timestamp.hour",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_activity_timestamp.hour",
                        type: "displayForm",
                    },
                    id: "dt_activity_timestamp.hour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.hour",
                    title: "Activity - Hour",
                    description: "Hour",
                    attribute: {
                        identifier: "dt_activity_timestamp.hour",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.hour_in_day",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_activity_timestamp.hourOfDay",
                        type: "attribute",
                    },
                    id: "dt_activity_timestamp.hourOfDay",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_activity_timestamp.hourOfDay",
                    title: "Activity - Hour of Day",
                    description: "Generic Hour of the Day(H1-H24)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_activity_timestamp.hourOfDay",
                                type: "displayForm",
                            },
                            id: "dt_activity_timestamp.hourOfDay",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.hourOfDay",
                            title: "Activity - Hour of Day",
                            description: "Generic Hour of the Day(H1-H24)",
                            attribute: {
                                identifier: "dt_activity_timestamp.hourOfDay",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_activity_timestamp.hourOfDay",
                        type: "displayForm",
                    },
                    id: "dt_activity_timestamp.hourOfDay",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.hourOfDay",
                    title: "Activity - Hour of Day",
                    description: "Generic Hour of the Day(H1-H24)",
                    attribute: {
                        identifier: "dt_activity_timestamp.hourOfDay",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.minute",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_activity_timestamp.minute",
                        type: "attribute",
                    },
                    id: "dt_activity_timestamp.minute",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_activity_timestamp.minute",
                    title: "Activity - Minute",
                    description: "Minute",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_activity_timestamp.minute",
                                type: "displayForm",
                            },
                            id: "dt_activity_timestamp.minute",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.minute",
                            title: "Activity - Minute",
                            description: "Minute",
                            attribute: {
                                identifier: "dt_activity_timestamp.minute",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_activity_timestamp.minute",
                        type: "displayForm",
                    },
                    id: "dt_activity_timestamp.minute",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.minute",
                    title: "Activity - Minute",
                    description: "Minute",
                    attribute: {
                        identifier: "dt_activity_timestamp.minute",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.minute_in_hour",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_activity_timestamp.minuteOfHour",
                        type: "attribute",
                    },
                    id: "dt_activity_timestamp.minuteOfHour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_activity_timestamp.minuteOfHour",
                    title: "Activity - Minute of Hour",
                    description: "Generic Minute of the Hour(MI1-MI60)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_activity_timestamp.minuteOfHour",
                                type: "displayForm",
                            },
                            id: "dt_activity_timestamp.minuteOfHour",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.minuteOfHour",
                            title: "Activity - Minute of Hour",
                            description: "Generic Minute of the Hour(MI1-MI60)",
                            attribute: {
                                identifier: "dt_activity_timestamp.minuteOfHour",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_activity_timestamp.minuteOfHour",
                        type: "displayForm",
                    },
                    id: "dt_activity_timestamp.minuteOfHour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.minuteOfHour",
                    title: "Activity - Minute of Hour",
                    description: "Generic Minute of the Hour(MI1-MI60)",
                    attribute: {
                        identifier: "dt_activity_timestamp.minuteOfHour",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.month",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_activity_timestamp.month",
                        type: "attribute",
                    },
                    id: "dt_activity_timestamp.month",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_activity_timestamp.month",
                    title: "Activity - Month/Year",
                    description: "Month and Year (12/2020)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_activity_timestamp.month",
                                type: "displayForm",
                            },
                            id: "dt_activity_timestamp.month",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.month",
                            title: "Activity - Month/Year",
                            description: "Month and Year (12/2020)",
                            attribute: {
                                identifier: "dt_activity_timestamp.month",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_activity_timestamp.month",
                        type: "displayForm",
                    },
                    id: "dt_activity_timestamp.month",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.month",
                    title: "Activity - Month/Year",
                    description: "Month and Year (12/2020)",
                    attribute: {
                        identifier: "dt_activity_timestamp.month",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.month_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_activity_timestamp.monthOfYear",
                        type: "attribute",
                    },
                    id: "dt_activity_timestamp.monthOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_activity_timestamp.monthOfYear",
                    title: "Activity - Month of Year",
                    description: "Generic Month (M1-M12)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_activity_timestamp.monthOfYear",
                                type: "displayForm",
                            },
                            id: "dt_activity_timestamp.monthOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.monthOfYear",
                            title: "Activity - Month of Year",
                            description: "Generic Month (M1-M12)",
                            attribute: {
                                identifier: "dt_activity_timestamp.monthOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_activity_timestamp.monthOfYear",
                        type: "displayForm",
                    },
                    id: "dt_activity_timestamp.monthOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.monthOfYear",
                    title: "Activity - Month of Year",
                    description: "Generic Month (M1-M12)",
                    attribute: {
                        identifier: "dt_activity_timestamp.monthOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.quarter",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_activity_timestamp.quarter",
                        type: "attribute",
                    },
                    id: "dt_activity_timestamp.quarter",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_activity_timestamp.quarter",
                    title: "Activity - Quarter/Year",
                    description: "Quarter and Year (Q1/2020)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_activity_timestamp.quarter",
                                type: "displayForm",
                            },
                            id: "dt_activity_timestamp.quarter",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.quarter",
                            title: "Activity - Quarter/Year",
                            description: "Quarter and Year (Q1/2020)",
                            attribute: {
                                identifier: "dt_activity_timestamp.quarter",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_activity_timestamp.quarter",
                        type: "displayForm",
                    },
                    id: "dt_activity_timestamp.quarter",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.quarter",
                    title: "Activity - Quarter/Year",
                    description: "Quarter and Year (Q1/2020)",
                    attribute: {
                        identifier: "dt_activity_timestamp.quarter",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.quarter_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_activity_timestamp.quarterOfYear",
                        type: "attribute",
                    },
                    id: "dt_activity_timestamp.quarterOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_activity_timestamp.quarterOfYear",
                    title: "Activity - Quarter of Year",
                    description: "Generic Quarter (Q1-Q4)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_activity_timestamp.quarterOfYear",
                                type: "displayForm",
                            },
                            id: "dt_activity_timestamp.quarterOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.quarterOfYear",
                            title: "Activity - Quarter of Year",
                            description: "Generic Quarter (Q1-Q4)",
                            attribute: {
                                identifier: "dt_activity_timestamp.quarterOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_activity_timestamp.quarterOfYear",
                        type: "displayForm",
                    },
                    id: "dt_activity_timestamp.quarterOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.quarterOfYear",
                    title: "Activity - Quarter of Year",
                    description: "Generic Quarter (Q1-Q4)",
                    attribute: {
                        identifier: "dt_activity_timestamp.quarterOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.week_us",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_activity_timestamp.week",
                        type: "attribute",
                    },
                    id: "dt_activity_timestamp.week",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_activity_timestamp.week",
                    title: "Activity - Week/Year",
                    description: "Week and Year (W52/2020)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_activity_timestamp.week",
                                type: "displayForm",
                            },
                            id: "dt_activity_timestamp.week",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.week",
                            title: "Activity - Week/Year",
                            description: "Week and Year (W52/2020)",
                            attribute: {
                                identifier: "dt_activity_timestamp.week",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_activity_timestamp.week",
                        type: "displayForm",
                    },
                    id: "dt_activity_timestamp.week",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.week",
                    title: "Activity - Week/Year",
                    description: "Week and Year (W52/2020)",
                    attribute: {
                        identifier: "dt_activity_timestamp.week",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.week_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_activity_timestamp.weekOfYear",
                        type: "attribute",
                    },
                    id: "dt_activity_timestamp.weekOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_activity_timestamp.weekOfYear",
                    title: "Activity - Week of Year",
                    description: "Generic Week (W1-W53)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_activity_timestamp.weekOfYear",
                                type: "displayForm",
                            },
                            id: "dt_activity_timestamp.weekOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.weekOfYear",
                            title: "Activity - Week of Year",
                            description: "Generic Week (W1-W53)",
                            attribute: {
                                identifier: "dt_activity_timestamp.weekOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_activity_timestamp.weekOfYear",
                        type: "displayForm",
                    },
                    id: "dt_activity_timestamp.weekOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.weekOfYear",
                    title: "Activity - Week of Year",
                    description: "Generic Week (W1-W53)",
                    attribute: {
                        identifier: "dt_activity_timestamp.weekOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_activity_timestamp.year",
                        type: "attribute",
                    },
                    id: "dt_activity_timestamp.year",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_activity_timestamp.year",
                    title: "Activity - Year",
                    description: "Year",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_activity_timestamp.year",
                                type: "displayForm",
                            },
                            id: "dt_activity_timestamp.year",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.year",
                            title: "Activity - Year",
                            description: "Year",
                            attribute: {
                                identifier: "dt_activity_timestamp.year",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_activity_timestamp.year",
                        type: "displayForm",
                    },
                    id: "dt_activity_timestamp.year",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_activity_timestamp.year",
                    title: "Activity - Year",
                    description: "Year",
                    attribute: {
                        identifier: "dt_activity_timestamp.year",
                        type: "attribute",
                    },
                },
            },
        ],
    },
    {
        type: "dateDataset",
        relevance: 0,
        dataSet: {
            type: "dataSet",
            ref: {
                identifier: "dt_closedate_timestamp",
                type: "dataSet",
            },
            id: "dt_closedate_timestamp",
            title: "Closed",
            description: "",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/datasets/dt_closedate_timestamp",
            production: true,
            unlisted: false,
        },
        dateAttributes: [
            {
                granularity: "GDC.time.date",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_closedate_timestamp.day",
                        type: "attribute",
                    },
                    id: "dt_closedate_timestamp.day",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_closedate_timestamp.day",
                    title: "Closed - Date",
                    description: "Date",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_closedate_timestamp.day",
                                type: "displayForm",
                            },
                            id: "dt_closedate_timestamp.day",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.day",
                            title: "Closed - Date",
                            description: "Date",
                            attribute: {
                                identifier: "dt_closedate_timestamp.day",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_closedate_timestamp.day",
                        type: "displayForm",
                    },
                    id: "dt_closedate_timestamp.day",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.day",
                    title: "Closed - Date",
                    description: "Date",
                    attribute: {
                        identifier: "dt_closedate_timestamp.day",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.day_in_month",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_closedate_timestamp.dayOfMonth",
                        type: "attribute",
                    },
                    id: "dt_closedate_timestamp.dayOfMonth",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_closedate_timestamp.dayOfMonth",
                    title: "Closed - Day of Month",
                    description: "Generic Day of the Month (D1-D31)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_closedate_timestamp.dayOfMonth",
                                type: "displayForm",
                            },
                            id: "dt_closedate_timestamp.dayOfMonth",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.dayOfMonth",
                            title: "Closed - Day of Month",
                            description: "Generic Day of the Month (D1-D31)",
                            attribute: {
                                identifier: "dt_closedate_timestamp.dayOfMonth",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_closedate_timestamp.dayOfMonth",
                        type: "displayForm",
                    },
                    id: "dt_closedate_timestamp.dayOfMonth",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.dayOfMonth",
                    title: "Closed - Day of Month",
                    description: "Generic Day of the Month (D1-D31)",
                    attribute: {
                        identifier: "dt_closedate_timestamp.dayOfMonth",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.day_in_week",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_closedate_timestamp.dayOfWeek",
                        type: "attribute",
                    },
                    id: "dt_closedate_timestamp.dayOfWeek",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_closedate_timestamp.dayOfWeek",
                    title: "Closed - Day of Week",
                    description: "Generic Day of the Week (D1-D7)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_closedate_timestamp.dayOfWeek",
                                type: "displayForm",
                            },
                            id: "dt_closedate_timestamp.dayOfWeek",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.dayOfWeek",
                            title: "Closed - Day of Week",
                            description: "Generic Day of the Week (D1-D7)",
                            attribute: {
                                identifier: "dt_closedate_timestamp.dayOfWeek",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_closedate_timestamp.dayOfWeek",
                        type: "displayForm",
                    },
                    id: "dt_closedate_timestamp.dayOfWeek",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.dayOfWeek",
                    title: "Closed - Day of Week",
                    description: "Generic Day of the Week (D1-D7)",
                    attribute: {
                        identifier: "dt_closedate_timestamp.dayOfWeek",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.day_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_closedate_timestamp.dayOfYear",
                        type: "attribute",
                    },
                    id: "dt_closedate_timestamp.dayOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_closedate_timestamp.dayOfYear",
                    title: "Closed - Day of Year",
                    description: "Generic Day of the Year (D1-D366)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_closedate_timestamp.dayOfYear",
                                type: "displayForm",
                            },
                            id: "dt_closedate_timestamp.dayOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.dayOfYear",
                            title: "Closed - Day of Year",
                            description: "Generic Day of the Year (D1-D366)",
                            attribute: {
                                identifier: "dt_closedate_timestamp.dayOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_closedate_timestamp.dayOfYear",
                        type: "displayForm",
                    },
                    id: "dt_closedate_timestamp.dayOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.dayOfYear",
                    title: "Closed - Day of Year",
                    description: "Generic Day of the Year (D1-D366)",
                    attribute: {
                        identifier: "dt_closedate_timestamp.dayOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.hour",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_closedate_timestamp.hour",
                        type: "attribute",
                    },
                    id: "dt_closedate_timestamp.hour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_closedate_timestamp.hour",
                    title: "Closed - Hour",
                    description: "Hour",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_closedate_timestamp.hour",
                                type: "displayForm",
                            },
                            id: "dt_closedate_timestamp.hour",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.hour",
                            title: "Closed - Hour",
                            description: "Hour",
                            attribute: {
                                identifier: "dt_closedate_timestamp.hour",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_closedate_timestamp.hour",
                        type: "displayForm",
                    },
                    id: "dt_closedate_timestamp.hour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.hour",
                    title: "Closed - Hour",
                    description: "Hour",
                    attribute: {
                        identifier: "dt_closedate_timestamp.hour",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.hour_in_day",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_closedate_timestamp.hourOfDay",
                        type: "attribute",
                    },
                    id: "dt_closedate_timestamp.hourOfDay",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_closedate_timestamp.hourOfDay",
                    title: "Closed - Hour of Day",
                    description: "Generic Hour of the Day(H1-H24)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_closedate_timestamp.hourOfDay",
                                type: "displayForm",
                            },
                            id: "dt_closedate_timestamp.hourOfDay",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.hourOfDay",
                            title: "Closed - Hour of Day",
                            description: "Generic Hour of the Day(H1-H24)",
                            attribute: {
                                identifier: "dt_closedate_timestamp.hourOfDay",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_closedate_timestamp.hourOfDay",
                        type: "displayForm",
                    },
                    id: "dt_closedate_timestamp.hourOfDay",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.hourOfDay",
                    title: "Closed - Hour of Day",
                    description: "Generic Hour of the Day(H1-H24)",
                    attribute: {
                        identifier: "dt_closedate_timestamp.hourOfDay",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.minute",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_closedate_timestamp.minute",
                        type: "attribute",
                    },
                    id: "dt_closedate_timestamp.minute",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_closedate_timestamp.minute",
                    title: "Closed - Minute",
                    description: "Minute",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_closedate_timestamp.minute",
                                type: "displayForm",
                            },
                            id: "dt_closedate_timestamp.minute",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.minute",
                            title: "Closed - Minute",
                            description: "Minute",
                            attribute: {
                                identifier: "dt_closedate_timestamp.minute",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_closedate_timestamp.minute",
                        type: "displayForm",
                    },
                    id: "dt_closedate_timestamp.minute",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.minute",
                    title: "Closed - Minute",
                    description: "Minute",
                    attribute: {
                        identifier: "dt_closedate_timestamp.minute",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.minute_in_hour",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_closedate_timestamp.minuteOfHour",
                        type: "attribute",
                    },
                    id: "dt_closedate_timestamp.minuteOfHour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_closedate_timestamp.minuteOfHour",
                    title: "Closed - Minute of Hour",
                    description: "Generic Minute of the Hour(MI1-MI60)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_closedate_timestamp.minuteOfHour",
                                type: "displayForm",
                            },
                            id: "dt_closedate_timestamp.minuteOfHour",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.minuteOfHour",
                            title: "Closed - Minute of Hour",
                            description: "Generic Minute of the Hour(MI1-MI60)",
                            attribute: {
                                identifier: "dt_closedate_timestamp.minuteOfHour",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_closedate_timestamp.minuteOfHour",
                        type: "displayForm",
                    },
                    id: "dt_closedate_timestamp.minuteOfHour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.minuteOfHour",
                    title: "Closed - Minute of Hour",
                    description: "Generic Minute of the Hour(MI1-MI60)",
                    attribute: {
                        identifier: "dt_closedate_timestamp.minuteOfHour",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.month",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_closedate_timestamp.month",
                        type: "attribute",
                    },
                    id: "dt_closedate_timestamp.month",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_closedate_timestamp.month",
                    title: "Closed - Month/Year",
                    description: "Month and Year (12/2020)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_closedate_timestamp.month",
                                type: "displayForm",
                            },
                            id: "dt_closedate_timestamp.month",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.month",
                            title: "Closed - Month/Year",
                            description: "Month and Year (12/2020)",
                            attribute: {
                                identifier: "dt_closedate_timestamp.month",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_closedate_timestamp.month",
                        type: "displayForm",
                    },
                    id: "dt_closedate_timestamp.month",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.month",
                    title: "Closed - Month/Year",
                    description: "Month and Year (12/2020)",
                    attribute: {
                        identifier: "dt_closedate_timestamp.month",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.month_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_closedate_timestamp.monthOfYear",
                        type: "attribute",
                    },
                    id: "dt_closedate_timestamp.monthOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_closedate_timestamp.monthOfYear",
                    title: "Closed - Month of Year",
                    description: "Generic Month (M1-M12)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_closedate_timestamp.monthOfYear",
                                type: "displayForm",
                            },
                            id: "dt_closedate_timestamp.monthOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.monthOfYear",
                            title: "Closed - Month of Year",
                            description: "Generic Month (M1-M12)",
                            attribute: {
                                identifier: "dt_closedate_timestamp.monthOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_closedate_timestamp.monthOfYear",
                        type: "displayForm",
                    },
                    id: "dt_closedate_timestamp.monthOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.monthOfYear",
                    title: "Closed - Month of Year",
                    description: "Generic Month (M1-M12)",
                    attribute: {
                        identifier: "dt_closedate_timestamp.monthOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.quarter",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_closedate_timestamp.quarter",
                        type: "attribute",
                    },
                    id: "dt_closedate_timestamp.quarter",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_closedate_timestamp.quarter",
                    title: "Closed - Quarter/Year",
                    description: "Quarter and Year (Q1/2020)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_closedate_timestamp.quarter",
                                type: "displayForm",
                            },
                            id: "dt_closedate_timestamp.quarter",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.quarter",
                            title: "Closed - Quarter/Year",
                            description: "Quarter and Year (Q1/2020)",
                            attribute: {
                                identifier: "dt_closedate_timestamp.quarter",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_closedate_timestamp.quarter",
                        type: "displayForm",
                    },
                    id: "dt_closedate_timestamp.quarter",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.quarter",
                    title: "Closed - Quarter/Year",
                    description: "Quarter and Year (Q1/2020)",
                    attribute: {
                        identifier: "dt_closedate_timestamp.quarter",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.quarter_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_closedate_timestamp.quarterOfYear",
                        type: "attribute",
                    },
                    id: "dt_closedate_timestamp.quarterOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_closedate_timestamp.quarterOfYear",
                    title: "Closed - Quarter of Year",
                    description: "Generic Quarter (Q1-Q4)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_closedate_timestamp.quarterOfYear",
                                type: "displayForm",
                            },
                            id: "dt_closedate_timestamp.quarterOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.quarterOfYear",
                            title: "Closed - Quarter of Year",
                            description: "Generic Quarter (Q1-Q4)",
                            attribute: {
                                identifier: "dt_closedate_timestamp.quarterOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_closedate_timestamp.quarterOfYear",
                        type: "displayForm",
                    },
                    id: "dt_closedate_timestamp.quarterOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.quarterOfYear",
                    title: "Closed - Quarter of Year",
                    description: "Generic Quarter (Q1-Q4)",
                    attribute: {
                        identifier: "dt_closedate_timestamp.quarterOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.week_us",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_closedate_timestamp.week",
                        type: "attribute",
                    },
                    id: "dt_closedate_timestamp.week",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_closedate_timestamp.week",
                    title: "Closed - Week/Year",
                    description: "Week and Year (W52/2020)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_closedate_timestamp.week",
                                type: "displayForm",
                            },
                            id: "dt_closedate_timestamp.week",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.week",
                            title: "Closed - Week/Year",
                            description: "Week and Year (W52/2020)",
                            attribute: {
                                identifier: "dt_closedate_timestamp.week",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_closedate_timestamp.week",
                        type: "displayForm",
                    },
                    id: "dt_closedate_timestamp.week",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.week",
                    title: "Closed - Week/Year",
                    description: "Week and Year (W52/2020)",
                    attribute: {
                        identifier: "dt_closedate_timestamp.week",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.week_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_closedate_timestamp.weekOfYear",
                        type: "attribute",
                    },
                    id: "dt_closedate_timestamp.weekOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_closedate_timestamp.weekOfYear",
                    title: "Closed - Week of Year",
                    description: "Generic Week (W1-W53)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_closedate_timestamp.weekOfYear",
                                type: "displayForm",
                            },
                            id: "dt_closedate_timestamp.weekOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.weekOfYear",
                            title: "Closed - Week of Year",
                            description: "Generic Week (W1-W53)",
                            attribute: {
                                identifier: "dt_closedate_timestamp.weekOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_closedate_timestamp.weekOfYear",
                        type: "displayForm",
                    },
                    id: "dt_closedate_timestamp.weekOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.weekOfYear",
                    title: "Closed - Week of Year",
                    description: "Generic Week (W1-W53)",
                    attribute: {
                        identifier: "dt_closedate_timestamp.weekOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_closedate_timestamp.year",
                        type: "attribute",
                    },
                    id: "dt_closedate_timestamp.year",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_closedate_timestamp.year",
                    title: "Closed - Year",
                    description: "Year",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_closedate_timestamp.year",
                                type: "displayForm",
                            },
                            id: "dt_closedate_timestamp.year",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.year",
                            title: "Closed - Year",
                            description: "Year",
                            attribute: {
                                identifier: "dt_closedate_timestamp.year",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_closedate_timestamp.year",
                        type: "displayForm",
                    },
                    id: "dt_closedate_timestamp.year",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_closedate_timestamp.year",
                    title: "Closed - Year",
                    description: "Year",
                    attribute: {
                        identifier: "dt_closedate_timestamp.year",
                        type: "attribute",
                    },
                },
            },
        ],
    },
    {
        type: "dateDataset",
        relevance: 0,
        dataSet: {
            type: "dataSet",
            ref: {
                identifier: "dt_oppcreated_timestamp",
                type: "dataSet",
            },
            id: "dt_oppcreated_timestamp",
            title: "Created",
            description: "",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/datasets/dt_oppcreated_timestamp",
            production: true,
            unlisted: false,
        },
        dateAttributes: [
            {
                granularity: "GDC.time.date",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.day",
                        type: "attribute",
                    },
                    id: "dt_oppcreated_timestamp.day",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_oppcreated_timestamp.day",
                    title: "Created - Date",
                    description: "Date",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_oppcreated_timestamp.day",
                                type: "displayForm",
                            },
                            id: "dt_oppcreated_timestamp.day",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.day",
                            title: "Created - Date",
                            description: "Date",
                            attribute: {
                                identifier: "dt_oppcreated_timestamp.day",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.day",
                        type: "displayForm",
                    },
                    id: "dt_oppcreated_timestamp.day",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.day",
                    title: "Created - Date",
                    description: "Date",
                    attribute: {
                        identifier: "dt_oppcreated_timestamp.day",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.day_in_month",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.dayOfMonth",
                        type: "attribute",
                    },
                    id: "dt_oppcreated_timestamp.dayOfMonth",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_oppcreated_timestamp.dayOfMonth",
                    title: "Created - Day of Month",
                    description: "Generic Day of the Month (D1-D31)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_oppcreated_timestamp.dayOfMonth",
                                type: "displayForm",
                            },
                            id: "dt_oppcreated_timestamp.dayOfMonth",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.dayOfMonth",
                            title: "Created - Day of Month",
                            description: "Generic Day of the Month (D1-D31)",
                            attribute: {
                                identifier: "dt_oppcreated_timestamp.dayOfMonth",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.dayOfMonth",
                        type: "displayForm",
                    },
                    id: "dt_oppcreated_timestamp.dayOfMonth",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.dayOfMonth",
                    title: "Created - Day of Month",
                    description: "Generic Day of the Month (D1-D31)",
                    attribute: {
                        identifier: "dt_oppcreated_timestamp.dayOfMonth",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.day_in_week",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.dayOfWeek",
                        type: "attribute",
                    },
                    id: "dt_oppcreated_timestamp.dayOfWeek",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_oppcreated_timestamp.dayOfWeek",
                    title: "Created - Day of Week",
                    description: "Generic Day of the Week (D1-D7)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_oppcreated_timestamp.dayOfWeek",
                                type: "displayForm",
                            },
                            id: "dt_oppcreated_timestamp.dayOfWeek",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.dayOfWeek",
                            title: "Created - Day of Week",
                            description: "Generic Day of the Week (D1-D7)",
                            attribute: {
                                identifier: "dt_oppcreated_timestamp.dayOfWeek",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.dayOfWeek",
                        type: "displayForm",
                    },
                    id: "dt_oppcreated_timestamp.dayOfWeek",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.dayOfWeek",
                    title: "Created - Day of Week",
                    description: "Generic Day of the Week (D1-D7)",
                    attribute: {
                        identifier: "dt_oppcreated_timestamp.dayOfWeek",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.day_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.dayOfYear",
                        type: "attribute",
                    },
                    id: "dt_oppcreated_timestamp.dayOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_oppcreated_timestamp.dayOfYear",
                    title: "Created - Day of Year",
                    description: "Generic Day of the Year (D1-D366)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_oppcreated_timestamp.dayOfYear",
                                type: "displayForm",
                            },
                            id: "dt_oppcreated_timestamp.dayOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.dayOfYear",
                            title: "Created - Day of Year",
                            description: "Generic Day of the Year (D1-D366)",
                            attribute: {
                                identifier: "dt_oppcreated_timestamp.dayOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.dayOfYear",
                        type: "displayForm",
                    },
                    id: "dt_oppcreated_timestamp.dayOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.dayOfYear",
                    title: "Created - Day of Year",
                    description: "Generic Day of the Year (D1-D366)",
                    attribute: {
                        identifier: "dt_oppcreated_timestamp.dayOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.hour",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.hour",
                        type: "attribute",
                    },
                    id: "dt_oppcreated_timestamp.hour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_oppcreated_timestamp.hour",
                    title: "Created - Hour",
                    description: "Hour",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_oppcreated_timestamp.hour",
                                type: "displayForm",
                            },
                            id: "dt_oppcreated_timestamp.hour",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.hour",
                            title: "Created - Hour",
                            description: "Hour",
                            attribute: {
                                identifier: "dt_oppcreated_timestamp.hour",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.hour",
                        type: "displayForm",
                    },
                    id: "dt_oppcreated_timestamp.hour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.hour",
                    title: "Created - Hour",
                    description: "Hour",
                    attribute: {
                        identifier: "dt_oppcreated_timestamp.hour",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.hour_in_day",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.hourOfDay",
                        type: "attribute",
                    },
                    id: "dt_oppcreated_timestamp.hourOfDay",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_oppcreated_timestamp.hourOfDay",
                    title: "Created - Hour of Day",
                    description: "Generic Hour of the Day(H1-H24)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_oppcreated_timestamp.hourOfDay",
                                type: "displayForm",
                            },
                            id: "dt_oppcreated_timestamp.hourOfDay",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.hourOfDay",
                            title: "Created - Hour of Day",
                            description: "Generic Hour of the Day(H1-H24)",
                            attribute: {
                                identifier: "dt_oppcreated_timestamp.hourOfDay",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.hourOfDay",
                        type: "displayForm",
                    },
                    id: "dt_oppcreated_timestamp.hourOfDay",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.hourOfDay",
                    title: "Created - Hour of Day",
                    description: "Generic Hour of the Day(H1-H24)",
                    attribute: {
                        identifier: "dt_oppcreated_timestamp.hourOfDay",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.minute",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.minute",
                        type: "attribute",
                    },
                    id: "dt_oppcreated_timestamp.minute",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_oppcreated_timestamp.minute",
                    title: "Created - Minute",
                    description: "Minute",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_oppcreated_timestamp.minute",
                                type: "displayForm",
                            },
                            id: "dt_oppcreated_timestamp.minute",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.minute",
                            title: "Created - Minute",
                            description: "Minute",
                            attribute: {
                                identifier: "dt_oppcreated_timestamp.minute",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.minute",
                        type: "displayForm",
                    },
                    id: "dt_oppcreated_timestamp.minute",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.minute",
                    title: "Created - Minute",
                    description: "Minute",
                    attribute: {
                        identifier: "dt_oppcreated_timestamp.minute",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.minute_in_hour",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.minuteOfHour",
                        type: "attribute",
                    },
                    id: "dt_oppcreated_timestamp.minuteOfHour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_oppcreated_timestamp.minuteOfHour",
                    title: "Created - Minute of Hour",
                    description: "Generic Minute of the Hour(MI1-MI60)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_oppcreated_timestamp.minuteOfHour",
                                type: "displayForm",
                            },
                            id: "dt_oppcreated_timestamp.minuteOfHour",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.minuteOfHour",
                            title: "Created - Minute of Hour",
                            description: "Generic Minute of the Hour(MI1-MI60)",
                            attribute: {
                                identifier: "dt_oppcreated_timestamp.minuteOfHour",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.minuteOfHour",
                        type: "displayForm",
                    },
                    id: "dt_oppcreated_timestamp.minuteOfHour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.minuteOfHour",
                    title: "Created - Minute of Hour",
                    description: "Generic Minute of the Hour(MI1-MI60)",
                    attribute: {
                        identifier: "dt_oppcreated_timestamp.minuteOfHour",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.month",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.month",
                        type: "attribute",
                    },
                    id: "dt_oppcreated_timestamp.month",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_oppcreated_timestamp.month",
                    title: "Created - Month/Year",
                    description: "Month and Year (12/2020)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_oppcreated_timestamp.month",
                                type: "displayForm",
                            },
                            id: "dt_oppcreated_timestamp.month",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.month",
                            title: "Created - Month/Year",
                            description: "Month and Year (12/2020)",
                            attribute: {
                                identifier: "dt_oppcreated_timestamp.month",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.month",
                        type: "displayForm",
                    },
                    id: "dt_oppcreated_timestamp.month",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.month",
                    title: "Created - Month/Year",
                    description: "Month and Year (12/2020)",
                    attribute: {
                        identifier: "dt_oppcreated_timestamp.month",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.month_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.monthOfYear",
                        type: "attribute",
                    },
                    id: "dt_oppcreated_timestamp.monthOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_oppcreated_timestamp.monthOfYear",
                    title: "Created - Month of Year",
                    description: "Generic Month (M1-M12)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_oppcreated_timestamp.monthOfYear",
                                type: "displayForm",
                            },
                            id: "dt_oppcreated_timestamp.monthOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.monthOfYear",
                            title: "Created - Month of Year",
                            description: "Generic Month (M1-M12)",
                            attribute: {
                                identifier: "dt_oppcreated_timestamp.monthOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.monthOfYear",
                        type: "displayForm",
                    },
                    id: "dt_oppcreated_timestamp.monthOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.monthOfYear",
                    title: "Created - Month of Year",
                    description: "Generic Month (M1-M12)",
                    attribute: {
                        identifier: "dt_oppcreated_timestamp.monthOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.quarter",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.quarter",
                        type: "attribute",
                    },
                    id: "dt_oppcreated_timestamp.quarter",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_oppcreated_timestamp.quarter",
                    title: "Created - Quarter/Year",
                    description: "Quarter and Year (Q1/2020)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_oppcreated_timestamp.quarter",
                                type: "displayForm",
                            },
                            id: "dt_oppcreated_timestamp.quarter",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.quarter",
                            title: "Created - Quarter/Year",
                            description: "Quarter and Year (Q1/2020)",
                            attribute: {
                                identifier: "dt_oppcreated_timestamp.quarter",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.quarter",
                        type: "displayForm",
                    },
                    id: "dt_oppcreated_timestamp.quarter",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.quarter",
                    title: "Created - Quarter/Year",
                    description: "Quarter and Year (Q1/2020)",
                    attribute: {
                        identifier: "dt_oppcreated_timestamp.quarter",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.quarter_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.quarterOfYear",
                        type: "attribute",
                    },
                    id: "dt_oppcreated_timestamp.quarterOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_oppcreated_timestamp.quarterOfYear",
                    title: "Created - Quarter of Year",
                    description: "Generic Quarter (Q1-Q4)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_oppcreated_timestamp.quarterOfYear",
                                type: "displayForm",
                            },
                            id: "dt_oppcreated_timestamp.quarterOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.quarterOfYear",
                            title: "Created - Quarter of Year",
                            description: "Generic Quarter (Q1-Q4)",
                            attribute: {
                                identifier: "dt_oppcreated_timestamp.quarterOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.quarterOfYear",
                        type: "displayForm",
                    },
                    id: "dt_oppcreated_timestamp.quarterOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.quarterOfYear",
                    title: "Created - Quarter of Year",
                    description: "Generic Quarter (Q1-Q4)",
                    attribute: {
                        identifier: "dt_oppcreated_timestamp.quarterOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.week_us",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.week",
                        type: "attribute",
                    },
                    id: "dt_oppcreated_timestamp.week",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_oppcreated_timestamp.week",
                    title: "Created - Week/Year",
                    description: "Week and Year (W52/2020)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_oppcreated_timestamp.week",
                                type: "displayForm",
                            },
                            id: "dt_oppcreated_timestamp.week",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.week",
                            title: "Created - Week/Year",
                            description: "Week and Year (W52/2020)",
                            attribute: {
                                identifier: "dt_oppcreated_timestamp.week",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.week",
                        type: "displayForm",
                    },
                    id: "dt_oppcreated_timestamp.week",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.week",
                    title: "Created - Week/Year",
                    description: "Week and Year (W52/2020)",
                    attribute: {
                        identifier: "dt_oppcreated_timestamp.week",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.week_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.weekOfYear",
                        type: "attribute",
                    },
                    id: "dt_oppcreated_timestamp.weekOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_oppcreated_timestamp.weekOfYear",
                    title: "Created - Week of Year",
                    description: "Generic Week (W1-W53)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_oppcreated_timestamp.weekOfYear",
                                type: "displayForm",
                            },
                            id: "dt_oppcreated_timestamp.weekOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.weekOfYear",
                            title: "Created - Week of Year",
                            description: "Generic Week (W1-W53)",
                            attribute: {
                                identifier: "dt_oppcreated_timestamp.weekOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.weekOfYear",
                        type: "displayForm",
                    },
                    id: "dt_oppcreated_timestamp.weekOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.weekOfYear",
                    title: "Created - Week of Year",
                    description: "Generic Week (W1-W53)",
                    attribute: {
                        identifier: "dt_oppcreated_timestamp.weekOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.year",
                        type: "attribute",
                    },
                    id: "dt_oppcreated_timestamp.year",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_oppcreated_timestamp.year",
                    title: "Created - Year",
                    description: "Year",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_oppcreated_timestamp.year",
                                type: "displayForm",
                            },
                            id: "dt_oppcreated_timestamp.year",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.year",
                            title: "Created - Year",
                            description: "Year",
                            attribute: {
                                identifier: "dt_oppcreated_timestamp.year",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_oppcreated_timestamp.year",
                        type: "displayForm",
                    },
                    id: "dt_oppcreated_timestamp.year",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_oppcreated_timestamp.year",
                    title: "Created - Year",
                    description: "Year",
                    attribute: {
                        identifier: "dt_oppcreated_timestamp.year",
                        type: "attribute",
                    },
                },
            },
        ],
    },
    {
        type: "dateDataset",
        relevance: 0,
        dataSet: {
            type: "dataSet",
            ref: {
                identifier: "dt_snapshotdate_timestamp",
                type: "dataSet",
            },
            id: "dt_snapshotdate_timestamp",
            title: "Snapshot",
            description: "",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/datasets/dt_snapshotdate_timestamp",
            production: true,
            unlisted: false,
        },
        dateAttributes: [
            {
                granularity: "GDC.time.date",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.day",
                        type: "attribute",
                    },
                    id: "dt_snapshotdate_timestamp.day",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_snapshotdate_timestamp.day",
                    title: "Snapshot - Date",
                    description: "Date",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_snapshotdate_timestamp.day",
                                type: "displayForm",
                            },
                            id: "dt_snapshotdate_timestamp.day",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.day",
                            title: "Snapshot - Date",
                            description: "Date",
                            attribute: {
                                identifier: "dt_snapshotdate_timestamp.day",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.day",
                        type: "displayForm",
                    },
                    id: "dt_snapshotdate_timestamp.day",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.day",
                    title: "Snapshot - Date",
                    description: "Date",
                    attribute: {
                        identifier: "dt_snapshotdate_timestamp.day",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.day_in_month",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.dayOfMonth",
                        type: "attribute",
                    },
                    id: "dt_snapshotdate_timestamp.dayOfMonth",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_snapshotdate_timestamp.dayOfMonth",
                    title: "Snapshot - Day of Month",
                    description: "Generic Day of the Month (D1-D31)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_snapshotdate_timestamp.dayOfMonth",
                                type: "displayForm",
                            },
                            id: "dt_snapshotdate_timestamp.dayOfMonth",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.dayOfMonth",
                            title: "Snapshot - Day of Month",
                            description: "Generic Day of the Month (D1-D31)",
                            attribute: {
                                identifier: "dt_snapshotdate_timestamp.dayOfMonth",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.dayOfMonth",
                        type: "displayForm",
                    },
                    id: "dt_snapshotdate_timestamp.dayOfMonth",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.dayOfMonth",
                    title: "Snapshot - Day of Month",
                    description: "Generic Day of the Month (D1-D31)",
                    attribute: {
                        identifier: "dt_snapshotdate_timestamp.dayOfMonth",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.day_in_week",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.dayOfWeek",
                        type: "attribute",
                    },
                    id: "dt_snapshotdate_timestamp.dayOfWeek",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_snapshotdate_timestamp.dayOfWeek",
                    title: "Snapshot - Day of Week",
                    description: "Generic Day of the Week (D1-D7)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_snapshotdate_timestamp.dayOfWeek",
                                type: "displayForm",
                            },
                            id: "dt_snapshotdate_timestamp.dayOfWeek",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.dayOfWeek",
                            title: "Snapshot - Day of Week",
                            description: "Generic Day of the Week (D1-D7)",
                            attribute: {
                                identifier: "dt_snapshotdate_timestamp.dayOfWeek",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.dayOfWeek",
                        type: "displayForm",
                    },
                    id: "dt_snapshotdate_timestamp.dayOfWeek",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.dayOfWeek",
                    title: "Snapshot - Day of Week",
                    description: "Generic Day of the Week (D1-D7)",
                    attribute: {
                        identifier: "dt_snapshotdate_timestamp.dayOfWeek",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.day_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.dayOfYear",
                        type: "attribute",
                    },
                    id: "dt_snapshotdate_timestamp.dayOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_snapshotdate_timestamp.dayOfYear",
                    title: "Snapshot - Day of Year",
                    description: "Generic Day of the Year (D1-D366)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_snapshotdate_timestamp.dayOfYear",
                                type: "displayForm",
                            },
                            id: "dt_snapshotdate_timestamp.dayOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.dayOfYear",
                            title: "Snapshot - Day of Year",
                            description: "Generic Day of the Year (D1-D366)",
                            attribute: {
                                identifier: "dt_snapshotdate_timestamp.dayOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.dayOfYear",
                        type: "displayForm",
                    },
                    id: "dt_snapshotdate_timestamp.dayOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.dayOfYear",
                    title: "Snapshot - Day of Year",
                    description: "Generic Day of the Year (D1-D366)",
                    attribute: {
                        identifier: "dt_snapshotdate_timestamp.dayOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.hour",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.hour",
                        type: "attribute",
                    },
                    id: "dt_snapshotdate_timestamp.hour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_snapshotdate_timestamp.hour",
                    title: "Snapshot - Hour",
                    description: "Hour",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_snapshotdate_timestamp.hour",
                                type: "displayForm",
                            },
                            id: "dt_snapshotdate_timestamp.hour",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.hour",
                            title: "Snapshot - Hour",
                            description: "Hour",
                            attribute: {
                                identifier: "dt_snapshotdate_timestamp.hour",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.hour",
                        type: "displayForm",
                    },
                    id: "dt_snapshotdate_timestamp.hour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.hour",
                    title: "Snapshot - Hour",
                    description: "Hour",
                    attribute: {
                        identifier: "dt_snapshotdate_timestamp.hour",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.hour_in_day",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.hourOfDay",
                        type: "attribute",
                    },
                    id: "dt_snapshotdate_timestamp.hourOfDay",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_snapshotdate_timestamp.hourOfDay",
                    title: "Snapshot - Hour of Day",
                    description: "Generic Hour of the Day(H1-H24)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_snapshotdate_timestamp.hourOfDay",
                                type: "displayForm",
                            },
                            id: "dt_snapshotdate_timestamp.hourOfDay",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.hourOfDay",
                            title: "Snapshot - Hour of Day",
                            description: "Generic Hour of the Day(H1-H24)",
                            attribute: {
                                identifier: "dt_snapshotdate_timestamp.hourOfDay",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.hourOfDay",
                        type: "displayForm",
                    },
                    id: "dt_snapshotdate_timestamp.hourOfDay",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.hourOfDay",
                    title: "Snapshot - Hour of Day",
                    description: "Generic Hour of the Day(H1-H24)",
                    attribute: {
                        identifier: "dt_snapshotdate_timestamp.hourOfDay",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.minute",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.minute",
                        type: "attribute",
                    },
                    id: "dt_snapshotdate_timestamp.minute",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_snapshotdate_timestamp.minute",
                    title: "Snapshot - Minute",
                    description: "Minute",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_snapshotdate_timestamp.minute",
                                type: "displayForm",
                            },
                            id: "dt_snapshotdate_timestamp.minute",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.minute",
                            title: "Snapshot - Minute",
                            description: "Minute",
                            attribute: {
                                identifier: "dt_snapshotdate_timestamp.minute",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.minute",
                        type: "displayForm",
                    },
                    id: "dt_snapshotdate_timestamp.minute",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.minute",
                    title: "Snapshot - Minute",
                    description: "Minute",
                    attribute: {
                        identifier: "dt_snapshotdate_timestamp.minute",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.minute_in_hour",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.minuteOfHour",
                        type: "attribute",
                    },
                    id: "dt_snapshotdate_timestamp.minuteOfHour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_snapshotdate_timestamp.minuteOfHour",
                    title: "Snapshot - Minute of Hour",
                    description: "Generic Minute of the Hour(MI1-MI60)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_snapshotdate_timestamp.minuteOfHour",
                                type: "displayForm",
                            },
                            id: "dt_snapshotdate_timestamp.minuteOfHour",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.minuteOfHour",
                            title: "Snapshot - Minute of Hour",
                            description: "Generic Minute of the Hour(MI1-MI60)",
                            attribute: {
                                identifier: "dt_snapshotdate_timestamp.minuteOfHour",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.minuteOfHour",
                        type: "displayForm",
                    },
                    id: "dt_snapshotdate_timestamp.minuteOfHour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.minuteOfHour",
                    title: "Snapshot - Minute of Hour",
                    description: "Generic Minute of the Hour(MI1-MI60)",
                    attribute: {
                        identifier: "dt_snapshotdate_timestamp.minuteOfHour",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.month",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.month",
                        type: "attribute",
                    },
                    id: "dt_snapshotdate_timestamp.month",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_snapshotdate_timestamp.month",
                    title: "Snapshot - Month/Year",
                    description: "Month and Year (12/2020)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_snapshotdate_timestamp.month",
                                type: "displayForm",
                            },
                            id: "dt_snapshotdate_timestamp.month",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.month",
                            title: "Snapshot - Month/Year",
                            description: "Month and Year (12/2020)",
                            attribute: {
                                identifier: "dt_snapshotdate_timestamp.month",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.month",
                        type: "displayForm",
                    },
                    id: "dt_snapshotdate_timestamp.month",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.month",
                    title: "Snapshot - Month/Year",
                    description: "Month and Year (12/2020)",
                    attribute: {
                        identifier: "dt_snapshotdate_timestamp.month",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.month_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.monthOfYear",
                        type: "attribute",
                    },
                    id: "dt_snapshotdate_timestamp.monthOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_snapshotdate_timestamp.monthOfYear",
                    title: "Snapshot - Month of Year",
                    description: "Generic Month (M1-M12)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_snapshotdate_timestamp.monthOfYear",
                                type: "displayForm",
                            },
                            id: "dt_snapshotdate_timestamp.monthOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.monthOfYear",
                            title: "Snapshot - Month of Year",
                            description: "Generic Month (M1-M12)",
                            attribute: {
                                identifier: "dt_snapshotdate_timestamp.monthOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.monthOfYear",
                        type: "displayForm",
                    },
                    id: "dt_snapshotdate_timestamp.monthOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.monthOfYear",
                    title: "Snapshot - Month of Year",
                    description: "Generic Month (M1-M12)",
                    attribute: {
                        identifier: "dt_snapshotdate_timestamp.monthOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.quarter",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.quarter",
                        type: "attribute",
                    },
                    id: "dt_snapshotdate_timestamp.quarter",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_snapshotdate_timestamp.quarter",
                    title: "Snapshot - Quarter/Year",
                    description: "Quarter and Year (Q1/2020)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_snapshotdate_timestamp.quarter",
                                type: "displayForm",
                            },
                            id: "dt_snapshotdate_timestamp.quarter",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.quarter",
                            title: "Snapshot - Quarter/Year",
                            description: "Quarter and Year (Q1/2020)",
                            attribute: {
                                identifier: "dt_snapshotdate_timestamp.quarter",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.quarter",
                        type: "displayForm",
                    },
                    id: "dt_snapshotdate_timestamp.quarter",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.quarter",
                    title: "Snapshot - Quarter/Year",
                    description: "Quarter and Year (Q1/2020)",
                    attribute: {
                        identifier: "dt_snapshotdate_timestamp.quarter",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.quarter_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.quarterOfYear",
                        type: "attribute",
                    },
                    id: "dt_snapshotdate_timestamp.quarterOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_snapshotdate_timestamp.quarterOfYear",
                    title: "Snapshot - Quarter of Year",
                    description: "Generic Quarter (Q1-Q4)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_snapshotdate_timestamp.quarterOfYear",
                                type: "displayForm",
                            },
                            id: "dt_snapshotdate_timestamp.quarterOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.quarterOfYear",
                            title: "Snapshot - Quarter of Year",
                            description: "Generic Quarter (Q1-Q4)",
                            attribute: {
                                identifier: "dt_snapshotdate_timestamp.quarterOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.quarterOfYear",
                        type: "displayForm",
                    },
                    id: "dt_snapshotdate_timestamp.quarterOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.quarterOfYear",
                    title: "Snapshot - Quarter of Year",
                    description: "Generic Quarter (Q1-Q4)",
                    attribute: {
                        identifier: "dt_snapshotdate_timestamp.quarterOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.week_us",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.week",
                        type: "attribute",
                    },
                    id: "dt_snapshotdate_timestamp.week",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_snapshotdate_timestamp.week",
                    title: "Snapshot - Week/Year",
                    description: "Week and Year (W52/2020)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_snapshotdate_timestamp.week",
                                type: "displayForm",
                            },
                            id: "dt_snapshotdate_timestamp.week",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.week",
                            title: "Snapshot - Week/Year",
                            description: "Week and Year (W52/2020)",
                            attribute: {
                                identifier: "dt_snapshotdate_timestamp.week",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.week",
                        type: "displayForm",
                    },
                    id: "dt_snapshotdate_timestamp.week",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.week",
                    title: "Snapshot - Week/Year",
                    description: "Week and Year (W52/2020)",
                    attribute: {
                        identifier: "dt_snapshotdate_timestamp.week",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.week_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.weekOfYear",
                        type: "attribute",
                    },
                    id: "dt_snapshotdate_timestamp.weekOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_snapshotdate_timestamp.weekOfYear",
                    title: "Snapshot - Week of Year",
                    description: "Generic Week (W1-W53)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_snapshotdate_timestamp.weekOfYear",
                                type: "displayForm",
                            },
                            id: "dt_snapshotdate_timestamp.weekOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.weekOfYear",
                            title: "Snapshot - Week of Year",
                            description: "Generic Week (W1-W53)",
                            attribute: {
                                identifier: "dt_snapshotdate_timestamp.weekOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.weekOfYear",
                        type: "displayForm",
                    },
                    id: "dt_snapshotdate_timestamp.weekOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.weekOfYear",
                    title: "Snapshot - Week of Year",
                    description: "Generic Week (W1-W53)",
                    attribute: {
                        identifier: "dt_snapshotdate_timestamp.weekOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.year",
                        type: "attribute",
                    },
                    id: "dt_snapshotdate_timestamp.year",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_snapshotdate_timestamp.year",
                    title: "Snapshot - Year",
                    description: "Year",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_snapshotdate_timestamp.year",
                                type: "displayForm",
                            },
                            id: "dt_snapshotdate_timestamp.year",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.year",
                            title: "Snapshot - Year",
                            description: "Year",
                            attribute: {
                                identifier: "dt_snapshotdate_timestamp.year",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_snapshotdate_timestamp.year",
                        type: "displayForm",
                    },
                    id: "dt_snapshotdate_timestamp.year",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_snapshotdate_timestamp.year",
                    title: "Snapshot - Year",
                    description: "Year",
                    attribute: {
                        identifier: "dt_snapshotdate_timestamp.year",
                        type: "attribute",
                    },
                },
            },
        ],
    },
    {
        type: "dateDataset",
        relevance: 0,
        dataSet: {
            type: "dataSet",
            ref: {
                identifier: "dt_timeline_timestamp",
                type: "dataSet",
            },
            id: "dt_timeline_timestamp",
            title: "Timeline",
            description: "",
            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/datasets/dt_timeline_timestamp",
            production: true,
            unlisted: false,
        },
        dateAttributes: [
            {
                granularity: "GDC.time.date",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_timeline_timestamp.day",
                        type: "attribute",
                    },
                    id: "dt_timeline_timestamp.day",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_timeline_timestamp.day",
                    title: "Timeline - Date",
                    description: "Date",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_timeline_timestamp.day",
                                type: "displayForm",
                            },
                            id: "dt_timeline_timestamp.day",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.day",
                            title: "Timeline - Date",
                            description: "Date",
                            attribute: {
                                identifier: "dt_timeline_timestamp.day",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_timeline_timestamp.day",
                        type: "displayForm",
                    },
                    id: "dt_timeline_timestamp.day",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.day",
                    title: "Timeline - Date",
                    description: "Date",
                    attribute: {
                        identifier: "dt_timeline_timestamp.day",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.day_in_month",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_timeline_timestamp.dayOfMonth",
                        type: "attribute",
                    },
                    id: "dt_timeline_timestamp.dayOfMonth",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_timeline_timestamp.dayOfMonth",
                    title: "Timeline - Day of Month",
                    description: "Generic Day of the Month (D1-D31)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_timeline_timestamp.dayOfMonth",
                                type: "displayForm",
                            },
                            id: "dt_timeline_timestamp.dayOfMonth",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.dayOfMonth",
                            title: "Timeline - Day of Month",
                            description: "Generic Day of the Month (D1-D31)",
                            attribute: {
                                identifier: "dt_timeline_timestamp.dayOfMonth",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_timeline_timestamp.dayOfMonth",
                        type: "displayForm",
                    },
                    id: "dt_timeline_timestamp.dayOfMonth",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.dayOfMonth",
                    title: "Timeline - Day of Month",
                    description: "Generic Day of the Month (D1-D31)",
                    attribute: {
                        identifier: "dt_timeline_timestamp.dayOfMonth",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.day_in_week",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_timeline_timestamp.dayOfWeek",
                        type: "attribute",
                    },
                    id: "dt_timeline_timestamp.dayOfWeek",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_timeline_timestamp.dayOfWeek",
                    title: "Timeline - Day of Week",
                    description: "Generic Day of the Week (D1-D7)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_timeline_timestamp.dayOfWeek",
                                type: "displayForm",
                            },
                            id: "dt_timeline_timestamp.dayOfWeek",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.dayOfWeek",
                            title: "Timeline - Day of Week",
                            description: "Generic Day of the Week (D1-D7)",
                            attribute: {
                                identifier: "dt_timeline_timestamp.dayOfWeek",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_timeline_timestamp.dayOfWeek",
                        type: "displayForm",
                    },
                    id: "dt_timeline_timestamp.dayOfWeek",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.dayOfWeek",
                    title: "Timeline - Day of Week",
                    description: "Generic Day of the Week (D1-D7)",
                    attribute: {
                        identifier: "dt_timeline_timestamp.dayOfWeek",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.day_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_timeline_timestamp.dayOfYear",
                        type: "attribute",
                    },
                    id: "dt_timeline_timestamp.dayOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_timeline_timestamp.dayOfYear",
                    title: "Timeline - Day of Year",
                    description: "Generic Day of the Year (D1-D366)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_timeline_timestamp.dayOfYear",
                                type: "displayForm",
                            },
                            id: "dt_timeline_timestamp.dayOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.dayOfYear",
                            title: "Timeline - Day of Year",
                            description: "Generic Day of the Year (D1-D366)",
                            attribute: {
                                identifier: "dt_timeline_timestamp.dayOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_timeline_timestamp.dayOfYear",
                        type: "displayForm",
                    },
                    id: "dt_timeline_timestamp.dayOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.dayOfYear",
                    title: "Timeline - Day of Year",
                    description: "Generic Day of the Year (D1-D366)",
                    attribute: {
                        identifier: "dt_timeline_timestamp.dayOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.hour",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_timeline_timestamp.hour",
                        type: "attribute",
                    },
                    id: "dt_timeline_timestamp.hour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_timeline_timestamp.hour",
                    title: "Timeline - Hour",
                    description: "Hour",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_timeline_timestamp.hour",
                                type: "displayForm",
                            },
                            id: "dt_timeline_timestamp.hour",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.hour",
                            title: "Timeline - Hour",
                            description: "Hour",
                            attribute: {
                                identifier: "dt_timeline_timestamp.hour",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_timeline_timestamp.hour",
                        type: "displayForm",
                    },
                    id: "dt_timeline_timestamp.hour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.hour",
                    title: "Timeline - Hour",
                    description: "Hour",
                    attribute: {
                        identifier: "dt_timeline_timestamp.hour",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.hour_in_day",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_timeline_timestamp.hourOfDay",
                        type: "attribute",
                    },
                    id: "dt_timeline_timestamp.hourOfDay",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_timeline_timestamp.hourOfDay",
                    title: "Timeline - Hour of Day",
                    description: "Generic Hour of the Day(H1-H24)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_timeline_timestamp.hourOfDay",
                                type: "displayForm",
                            },
                            id: "dt_timeline_timestamp.hourOfDay",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.hourOfDay",
                            title: "Timeline - Hour of Day",
                            description: "Generic Hour of the Day(H1-H24)",
                            attribute: {
                                identifier: "dt_timeline_timestamp.hourOfDay",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_timeline_timestamp.hourOfDay",
                        type: "displayForm",
                    },
                    id: "dt_timeline_timestamp.hourOfDay",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.hourOfDay",
                    title: "Timeline - Hour of Day",
                    description: "Generic Hour of the Day(H1-H24)",
                    attribute: {
                        identifier: "dt_timeline_timestamp.hourOfDay",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.minute",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_timeline_timestamp.minute",
                        type: "attribute",
                    },
                    id: "dt_timeline_timestamp.minute",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_timeline_timestamp.minute",
                    title: "Timeline - Minute",
                    description: "Minute",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_timeline_timestamp.minute",
                                type: "displayForm",
                            },
                            id: "dt_timeline_timestamp.minute",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.minute",
                            title: "Timeline - Minute",
                            description: "Minute",
                            attribute: {
                                identifier: "dt_timeline_timestamp.minute",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_timeline_timestamp.minute",
                        type: "displayForm",
                    },
                    id: "dt_timeline_timestamp.minute",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.minute",
                    title: "Timeline - Minute",
                    description: "Minute",
                    attribute: {
                        identifier: "dt_timeline_timestamp.minute",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.minute_in_hour",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_timeline_timestamp.minuteOfHour",
                        type: "attribute",
                    },
                    id: "dt_timeline_timestamp.minuteOfHour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_timeline_timestamp.minuteOfHour",
                    title: "Timeline - Minute of Hour",
                    description: "Generic Minute of the Hour(MI1-MI60)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_timeline_timestamp.minuteOfHour",
                                type: "displayForm",
                            },
                            id: "dt_timeline_timestamp.minuteOfHour",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.minuteOfHour",
                            title: "Timeline - Minute of Hour",
                            description: "Generic Minute of the Hour(MI1-MI60)",
                            attribute: {
                                identifier: "dt_timeline_timestamp.minuteOfHour",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_timeline_timestamp.minuteOfHour",
                        type: "displayForm",
                    },
                    id: "dt_timeline_timestamp.minuteOfHour",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.minuteOfHour",
                    title: "Timeline - Minute of Hour",
                    description: "Generic Minute of the Hour(MI1-MI60)",
                    attribute: {
                        identifier: "dt_timeline_timestamp.minuteOfHour",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.month",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_timeline_timestamp.month",
                        type: "attribute",
                    },
                    id: "dt_timeline_timestamp.month",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_timeline_timestamp.month",
                    title: "Timeline - Month/Year",
                    description: "Month and Year (12/2020)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_timeline_timestamp.month",
                                type: "displayForm",
                            },
                            id: "dt_timeline_timestamp.month",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.month",
                            title: "Timeline - Month/Year",
                            description: "Month and Year (12/2020)",
                            attribute: {
                                identifier: "dt_timeline_timestamp.month",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_timeline_timestamp.month",
                        type: "displayForm",
                    },
                    id: "dt_timeline_timestamp.month",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.month",
                    title: "Timeline - Month/Year",
                    description: "Month and Year (12/2020)",
                    attribute: {
                        identifier: "dt_timeline_timestamp.month",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.month_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_timeline_timestamp.monthOfYear",
                        type: "attribute",
                    },
                    id: "dt_timeline_timestamp.monthOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_timeline_timestamp.monthOfYear",
                    title: "Timeline - Month of Year",
                    description: "Generic Month (M1-M12)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_timeline_timestamp.monthOfYear",
                                type: "displayForm",
                            },
                            id: "dt_timeline_timestamp.monthOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.monthOfYear",
                            title: "Timeline - Month of Year",
                            description: "Generic Month (M1-M12)",
                            attribute: {
                                identifier: "dt_timeline_timestamp.monthOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_timeline_timestamp.monthOfYear",
                        type: "displayForm",
                    },
                    id: "dt_timeline_timestamp.monthOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.monthOfYear",
                    title: "Timeline - Month of Year",
                    description: "Generic Month (M1-M12)",
                    attribute: {
                        identifier: "dt_timeline_timestamp.monthOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.quarter",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_timeline_timestamp.quarter",
                        type: "attribute",
                    },
                    id: "dt_timeline_timestamp.quarter",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_timeline_timestamp.quarter",
                    title: "Timeline - Quarter/Year",
                    description: "Quarter and Year (Q1/2020)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_timeline_timestamp.quarter",
                                type: "displayForm",
                            },
                            id: "dt_timeline_timestamp.quarter",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.quarter",
                            title: "Timeline - Quarter/Year",
                            description: "Quarter and Year (Q1/2020)",
                            attribute: {
                                identifier: "dt_timeline_timestamp.quarter",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_timeline_timestamp.quarter",
                        type: "displayForm",
                    },
                    id: "dt_timeline_timestamp.quarter",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.quarter",
                    title: "Timeline - Quarter/Year",
                    description: "Quarter and Year (Q1/2020)",
                    attribute: {
                        identifier: "dt_timeline_timestamp.quarter",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.quarter_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_timeline_timestamp.quarterOfYear",
                        type: "attribute",
                    },
                    id: "dt_timeline_timestamp.quarterOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_timeline_timestamp.quarterOfYear",
                    title: "Timeline - Quarter of Year",
                    description: "Generic Quarter (Q1-Q4)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_timeline_timestamp.quarterOfYear",
                                type: "displayForm",
                            },
                            id: "dt_timeline_timestamp.quarterOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.quarterOfYear",
                            title: "Timeline - Quarter of Year",
                            description: "Generic Quarter (Q1-Q4)",
                            attribute: {
                                identifier: "dt_timeline_timestamp.quarterOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_timeline_timestamp.quarterOfYear",
                        type: "displayForm",
                    },
                    id: "dt_timeline_timestamp.quarterOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.quarterOfYear",
                    title: "Timeline - Quarter of Year",
                    description: "Generic Quarter (Q1-Q4)",
                    attribute: {
                        identifier: "dt_timeline_timestamp.quarterOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.week_us",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_timeline_timestamp.week",
                        type: "attribute",
                    },
                    id: "dt_timeline_timestamp.week",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_timeline_timestamp.week",
                    title: "Timeline - Week/Year",
                    description: "Week and Year (W52/2020)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_timeline_timestamp.week",
                                type: "displayForm",
                            },
                            id: "dt_timeline_timestamp.week",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.week",
                            title: "Timeline - Week/Year",
                            description: "Week and Year (W52/2020)",
                            attribute: {
                                identifier: "dt_timeline_timestamp.week",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_timeline_timestamp.week",
                        type: "displayForm",
                    },
                    id: "dt_timeline_timestamp.week",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.week",
                    title: "Timeline - Week/Year",
                    description: "Week and Year (W52/2020)",
                    attribute: {
                        identifier: "dt_timeline_timestamp.week",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.week_in_year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_timeline_timestamp.weekOfYear",
                        type: "attribute",
                    },
                    id: "dt_timeline_timestamp.weekOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_timeline_timestamp.weekOfYear",
                    title: "Timeline - Week of Year",
                    description: "Generic Week (W1-W53)",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_timeline_timestamp.weekOfYear",
                                type: "displayForm",
                            },
                            id: "dt_timeline_timestamp.weekOfYear",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.weekOfYear",
                            title: "Timeline - Week of Year",
                            description: "Generic Week (W1-W53)",
                            attribute: {
                                identifier: "dt_timeline_timestamp.weekOfYear",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_timeline_timestamp.weekOfYear",
                        type: "displayForm",
                    },
                    id: "dt_timeline_timestamp.weekOfYear",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.weekOfYear",
                    title: "Timeline - Week of Year",
                    description: "Generic Week (W1-W53)",
                    attribute: {
                        identifier: "dt_timeline_timestamp.weekOfYear",
                        type: "attribute",
                    },
                },
            },
            {
                granularity: "GDC.time.year",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "dt_timeline_timestamp.year",
                        type: "attribute",
                    },
                    id: "dt_timeline_timestamp.year",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributes/dt_timeline_timestamp.year",
                    title: "Timeline - Year",
                    description: "Year",
                    displayForms: [
                        {
                            type: "displayForm",
                            ref: {
                                identifier: "dt_timeline_timestamp.year",
                                type: "displayForm",
                            },
                            id: "dt_timeline_timestamp.year",
                            uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.year",
                            title: "Timeline - Year",
                            description: "Year",
                            attribute: {
                                identifier: "dt_timeline_timestamp.year",
                                type: "attribute",
                            },
                        },
                    ],
                },
                defaultDisplayForm: {
                    type: "displayForm",
                    ref: {
                        identifier: "dt_timeline_timestamp.year",
                        type: "displayForm",
                    },
                    id: "dt_timeline_timestamp.year",
                    uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/labels/dt_timeline_timestamp.year",
                    title: "Timeline - Year",
                    description: "Year",
                    attribute: {
                        identifier: "dt_timeline_timestamp.year",
                        type: "attribute",
                    },
                },
            },
        ],
    },
];
