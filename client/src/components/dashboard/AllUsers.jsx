import React from "react";
import './css/admin.css';
import Title from "./title";
import UserList from "./UserList";

const AllUsers = () => {

    return (
      
        <div className="mainAdmin">
            <Title text="Все пользователи"/>
            
            <UserList/>
            
        </div>

    )
}

export default AllUsers;