import React from "react";
import { useSelector } from "react-redux";
import './css/admin.css';
import Title from "./title";
import StatusList from "./StatusList";
import FilialList from "./FilialList";
import Settings from "./Settings";
import Banners from "./Banners";
import Contacts from "./Contacts";

const MyCargo = () => {
    const role = useSelector(state => state.user.currentUser.role);

    return (
        <div className="my-cargo mainAdmin">
            <Title text="Мой карго" />

            {role === 'filial' ? (
                <>
                    <div className="section-my-cargo">
                        <Settings />
                        <div className="my-cargo-flex2">
                            <Contacts />
                        </div>
                    </div>
                </>
            ) : (
                <>
                <div className="my-cargo-bottom-section">
                        <FilialList />
                    </div>
                    
                    <div className="my-cargo-top-panels">
                        <div className="panel-card">
                            <Banners />
                            <StatusList />
                        </div>
                    </div>
                    
                </>
            )}
        </div>
    );
};

export default MyCargo;