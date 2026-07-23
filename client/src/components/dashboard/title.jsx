import React from "react";
import './css/admin.css';
// import { useSelector } from "react-redux";
// import config from "../../config";


// import track from '../../assets/img/track2.png';
// import list from '../../assets/img/list.png';
// import users from '../../assets/img/users.png';
// import stats from '../../assets/img/stats.png';
// import truck from '../../assets/img/truck.png';
// import message from '../../assets/img/message.png';
// import lost from '../../assets/img/lost.png'
// import logo from '../../assets/img/logo2.jpg'



const Title = ({ text, onNavItemClick }) => {
    // const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    // const [selectedNavItem, setSelectedNavItem] = useState(sessionStorage.getItem('selectedNavItem') || "addTrack");


    
    // const role = localStorage.getItem('role')
    // const name = useSelector(state => state.user.currentUser.name);
    // const surname = useSelector(state => state.user.currentUser.surname);
    // const phone = useSelector(state => state.user.currentUser.phone);


    

    // const handleNavItemClick = (navItem) => {
    //     setSelectedNavItem(navItem);
    //     onNavItemClick(navItem);
    //   };


    // const toggleSidebar = () => {
    //     setIsSidebarOpen(!isSidebarOpen);
    //   };

    
      return (
        <>
     
{/* 
        
        <div id="sidebar" className='sidebar'>
          
        <div className="header-admin">
          <img src={logo} className="logo-admin" alt="" />
          <p>{config.nameCargo}</p>
        </div>
        
        <div className="navigation-admin">
       
  
          <div className={`nav-link ${selectedNavItem === "addTrack" && "nav-active"}`} onClick={() => handleNavItemClick("addTrack")}>
            <img src={track} alt="" className="nav-icon" />
            <h5 className="nav-title">Добавить трек</h5>
            <div></div>
          </div>
          <div className={`nav-link ${selectedNavItem === "allUsers" && "nav-active"}`} onClick={() => handleNavItemClick("allUsers")}>
            <img src={users} alt="" className="nav-icon" />
            <h5 className="nav-title">Все пользователи</h5>
            <div></div>
          </div>
          
          <div className={`nav-link ${selectedNavItem === "trackList" && "nav-active"}`} onClick={() => handleNavItemClick("trackList")}>
            <img src={list} alt="" className="nav-icon" />
            <h5 className="nav-title">Список треков</h5>
            <div></div>
          </div>

          <div className={`nav-link ${selectedNavItem === "Lost" && "nav-active"}`} onClick={() => handleNavItemClick("Lost")}>
            <img src={lost} alt="" className="nav-icon" />
            <h5 className="nav-title">Потеряшки</h5>
            <div></div>
          </div>
  
          
          {role !== 'filial' && 
          <div className={`nav-link ${selectedNavItem === "myCargo" && "nav-active"}`} onClick={() => handleNavItemClick("myCargo")}>
            <img src={truck} alt="" className="nav-icon" />
            <h5 className="nav-title">Мой карго</h5>
            <div></div>
          </div>
          }
          {role !== 'filial' && 
          <div className={`nav-link ${selectedNavItem === "mailing" && "nav-active"}`} onClick={() => handleNavItemClick("mailing")}>
            <img src={message} alt="" className="nav-icon" />
            <h5 className="nav-title">Партнерская программа</h5>
            <div></div>
          </div>
          }
         
          {role !== 'filial' && 
          <div className={`nav-link ${selectedNavItem === "statistics" && "nav-active"}`} onClick={() => handleNavItemClick("statistics")}>
            <img src={stats} alt="" className="nav-icon" />
            <h5 className="nav-title">Статистика</h5>
            <div></div>
          </div>
          }
         
         
          </div>
          <div className="footer-admin">
            <p>{name + ' ' + surname + '  '+ phone}</p>
            <p></p>
          </div>
  
        
          
      </div> */}
        
        </>
    );
}

export default Title;
