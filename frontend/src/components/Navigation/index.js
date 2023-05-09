import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';
import logo from "../../assets/RareBnB.png"

function Navigation({ isLoaded }){
  const sessionUser = useSelector(state => state.session.user);

  return (
    <ul className='header-ul'>
      <li>
        <NavLink exact to="/" className="home-button" ><a href='' className='logo'><img className='logo' src={logo}/></a></NavLink>
      </li>
      {isLoaded && (
        <li>
          {/* turn this into a navlink to create a spot
          <a>{sessionUser ? "TESTEST" : ''}</a> */}
          <ProfileButton user={sessionUser} />
        </li>
      )}
    </ul>
  );
}

export default Navigation;
