import React from "react";
import Sidebar from "./Sidebar";
import StockApp from "./ChatWindow";
import "./App.css"; // Main app styling

function App() {
  const handleNewChat = () => {
    console.log("Starting a new chat session...");
    // Implement functionality to handle new chat session
  };

  return (
    <div className="app">
      <Sidebar onNewChat={handleNewChat} />
      <StockApp />
    </div>
  );
}

export default App;
