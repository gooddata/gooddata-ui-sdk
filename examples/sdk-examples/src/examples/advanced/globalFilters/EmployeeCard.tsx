// (C) 2007-2019 GoodData Corporation
import React from "react";

/* We do not actually store gender, avatar nor startDate in the platform, only the name.
 * We enrich employee data with custom data to showcase a trivial
 * implementation of combining platform and 3rd party data.
 */
const employeeAdditionalInfo = [
    {
        name: "Aaron Clements",
        gender: "M",
        avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
        startDate: "2001",
    },
    {
        name: "Aaron Watson",
        gender: "M",
        avatarUrl: "https://randomuser.me/api/portraits/men/2.jpg",
        startDate: "2006",
    },
    {
        name: "Abbie Adams",
        gender: "F",
        avatarUrl: "https://randomuser.me/api/portraits/women/1.jpg",
        startDate: "2017",
    },
    {
        name: "Adam Kimble",
        gender: "M",
        avatarUrl: "https://randomuser.me/api/portraits/men/3.jpg",
        startDate: "2015",
    },
    {
        name: "Aimee McKenzie",
        gender: "F",
        avatarUrl: "https://randomuser.me/api/portraits/women/2.jpg",
        startDate: "2015",
    },
    {
        name: "Alex Gray",
        gender: "M",
        avatarUrl: "https://randomuser.me/api/portraits/men/4.jpg",
        startDate: "2016",
    },
    {
        name: "Alex Meyer",
        gender: "M",
        avatarUrl: "https://randomuser.me/api/portraits/men/5.jpg",
        startDate: "2000",
    },
    {
        name: "Allen Garza",
        gender: "M",
        avatarUrl: "https://randomuser.me/api/portraits/men/6.jpg",
        startDate: "2014",
    },
    {
        name: "Alvin Moir",
        gender: "M",
        avatarUrl: "https://randomuser.me/api/portraits/men/7.jpg",
        startDate: "2003",
    },
    {
        name: "Amanda Lewis",
        gender: "F",
        avatarUrl: "https://randomuser.me/api/portraits/women/3.jpg",
        startDate: "2017",
    },
    {
        name: "Amber Young",
        gender: "F",
        avatarUrl: "https://randomuser.me/api/portraits/women/4.jpg",
        startDate: "2016",
    },
    {
        name: "Amelia Reid",
        gender: "F",
        avatarUrl: "https://randomuser.me/api/portraits/women/5.jpg",
        startDate: "2008",
    },
    {
        name: "Amelia Simpson",
        gender: "F",
        avatarUrl: "https://randomuser.me/api/portraits/women/6.jpg",
        startDate: "2013",
    },
    {
        name: "Amelie Humphries",
        gender: "F",
        avatarUrl: "https://randomuser.me/api/portraits/women/7.jpg",
        startDate: "2015",
    },
    {
        name: "Amelie Webster",
        gender: "F",
        avatarUrl: "https://randomuser.me/api/portraits/women/8.jpg",
        startDate: "2016",
    },
    {
        name: "Amy Holt",
        gender: "F",
        avatarUrl: "https://randomuser.me/api/portraits/women/9.jpg",
        startDate: "2017",
    },
    {
        name: "Amy McGowen",
        gender: "F",
        avatarUrl: "https://randomuser.me/api/portraits/women/10.jpg",
        startDate: "2012",
    },
    {
        name: "Anamaria Funches",
        gender: "F",
        avatarUrl: "https://randomuser.me/api/portraits/women/11.jpg",
        startDate: "2018",
    },
    {
        name: "Angel Lawson",
        gender: "F",
        avatarUrl: "https://randomuser.me/api/portraits/women/12.jpg",
        startDate: "2000",
    },
    {
        name: "Ann Howell",
        gender: "F",
        avatarUrl: "https://randomuser.me/api/portraits/women/13.jpg",
        startDate: "2005",
    },
];

export const EmployeeCard = ({ name }: { name: string }): JSX.Element => {
    const { avatarUrl, gender, startDate } = employeeAdditionalInfo.find((info) => info.name === name) || {};

    return (
        <div className="employee-card">
            {/* language=CSS */}
            <style jsx>{`
                .rounded-avatar {
                    object-fit: cover;
                    border-radius: 50%;
                    width: 100px;
                    height: 100px;
                    border: 4px solid #14b2e2;
                }

                .employee-card {
                    display: flex;
                }

                h1 {
                    margin-top: 0;
                    line-height: 1.25em;
                }

                .avatar-wrapper {
                    padding-right: 20px;
                }

                .additional-info {
                    flex: 1 1 auto;
                }

                .info-title {
                    font-size: 1.3rem;
                    font-weight: bold;
                    margin-right: 10px;
                }

                .info-text {
                    font-size: 1.2rem;
                }
            `}</style>
            <div className="avatar-wrapper">
                <img className="rounded-avatar" src={avatarUrl} alt={name} />
            </div>
            <div className="additional-info">
                <h1>{name}</h1>
                <p>
                    <span className="info-title">Employed since</span>
                    <span className="info-text">{startDate}</span>
                </p>
                <p>
                    <span className="info-title">Job title</span>
                    <span className="info-text">{gender === "M" ? "waiter" : "waitress"}</span>
                </p>
            </div>
        </div>
    );
};
