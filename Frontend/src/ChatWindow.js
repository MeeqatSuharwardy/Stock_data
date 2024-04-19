import React, { useState } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import "./main.css";

function StockApp() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);

  const appendMessage = (text, type, options = {}) => {
    setMessages((messages) => [...messages, { text, type, ...options }]);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleFormSubmit = async () => {
    if (query.trim() === "") return;

    appendMessage(query, "user");

    const formData = new URLSearchParams();
    formData.append("question", query);

    try {
      const response = await fetch("http://127.0.0.1:5000/stock_info", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        if (result.response) {
          appendMessage(result.response, "system");
        } else {
          appendMessage(result.description, "system");
          if (result.need_chart) {
            appendMessage("Displaying stock price chart:", "chart", {
              chartData: result,
            });
          }
        }
      } else {
        appendMessage(`Error: ${result.error}`, "error");
      }
    } catch (error) {
      appendMessage(`Network Error: ${error.message}`, "error");
    }
    setQuery(""); // Reset query input after submission
  };

  const chartOptions = {
    chart: {
      type: "line",
      backgroundColor: "#11161C",
      style: { fontFamily: "Arial" },
    },
    title: {
      text: "Stock Price Chart",
      style: { color: "white" },
    },
    xAxis: {
      type: "datetime",
      dateTimeLabelFormats: { month: "%e. %b", year: "%b" },
      labels: { style: { color: "white" } },
    },
    yAxis: {
      title: {
        text: "Price ($)",
        style: { color: "white" },
      },
      labels: { style: { color: "white" } },
    },
    series: [],
    credits: { enabled: false },
  };

  return (
    <div className="chat-container">
      <div className="message-display-area">
        {messages.map((msg, index) => (
          <React.Fragment key={index}>
            {msg.type === "chart" ? (
              <div className="message chart-message">
                <HighchartsReact
                  highcharts={Highcharts}
                  constructorType="stockChart"
                  options={{
                    ...chartOptions,
                    series: [
                      {
                        name: msg.chartData.symbol,
                        data: msg.chartData.dates.map((date, index) => [
                          new Date(date).getTime(),
                          msg.chartData.prices[index],
                        ]),
                      },
                    ],
                  }}
                />
              </div>
            ) : (
              <div className={`message ${msg.type}-message`}>{msg.text}</div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          className="text-input"
          value={query}
          onChange={handleInputChange}
          placeholder="Ask about a stock or say hi!"
        />
        <button
          type="button"
          onClick={handleFormSubmit}
          className="send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default StockApp;
