import React from 'react';
import { useSelector } from 'react-redux';
import Archive from './Archive';
import Tab from './Tab';
import './styles/main2.css';
import './styles/MainBookmarks.css';

const ArchivePage = () => {
  const currentUser = useSelector(state => state.user.currentUser);
  const userId = currentUser?.id;

  return (
    <div className="main">
      <header className='header-main'>
        <h1 className='text-header'>Архив</h1>
      </header>

      <div className="section-main">
        <Archive userId={userId} embedded={false} />
      </div>

      <div className="area"></div>
      <Tab className="TabMain" />
    </div>
  );
};

export default ArchivePage;
