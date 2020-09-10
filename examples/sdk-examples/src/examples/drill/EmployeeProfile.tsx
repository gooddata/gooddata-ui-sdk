// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import moment from "moment";

const dateFormat = "YYYY-MM-DD";

interface IEmployeeProfileProps {
    gender: string;
    dob: {
        date: string;
    };
    cell: string;
    location: {
        city: string;
        state: string;
    };
    registered: {
        date: string;
    };
    id: string;
}

export const EmployeeProfile: React.FC<IEmployeeProfileProps> = ({
    gender,
    dob,
    cell,
    id,
    registered,
    location,
}) => {
    const menOrWomen = gender === "male" ? "men" : "women";
    return (
        <div className="employeeProfile s-employee-profile">
            <style jsx>{`
                .employeeProfile {
                    display: flex;
                    margin-top: 20px;
                }
                .picture {
                    border-radius: 50%;
                    border: 2px solid #14b2e2;
                    width: 100px;
                    height: 100px;
                }
                .text {
                    flex: 1 1 auto;
                    margin-left: 20px;
                }
            `}</style>
            <div>
                <img
                    className="picture"
                    src={`https://randomuser.me/api/portraits/${menOrWomen}/${parseInt(id, 10) % 100}.jpg`}
                    alt=""
                />
            </div>
            <div className="text">
                <p>Date of birth: {moment(dob.date).format(dateFormat)}</p>
                <p>
                    Place of birth: {location.city}, {location.state}
                </p>
                <p>Phone: {cell}</p>
                <p>Employed since: {moment(registered.date).format(dateFormat)}</p>
            </div>
        </div>
    );
};
