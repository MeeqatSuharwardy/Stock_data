import React from "react";
import "./Sidebar.css"; // Ensure you have the right path for your styles
import logo from "./logo-12@2x.png"; // Update the path if necessary

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="logo" className="sidebar-logo" />
        <button className="new-chat-button">New Chat</button>
      </div>
      <ul className="sidebar-nav"></ul>
      <button className="upgrade-button">Upgrade to Pro</button>
    </div>
  );
};

export default Sidebar;
