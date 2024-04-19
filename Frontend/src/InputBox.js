import React, { useState } from "react";
import "./InputBox.css"; // InputBox specific styling

const InputBox = ({ onSendMessage }) => {
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    onSendMessage(input);
    setInput(""); // Clear input after sending
  };

  return (
    <form className="input-form" onSubmit={handleSend}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message here..."
        className="input-box"
      />
      <button type="submit" className="send-button">
        Send
      </button>
    </form>
  );
};

export default InputBox;
