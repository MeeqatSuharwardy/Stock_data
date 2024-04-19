from flask import Flask, render_template, request, jsonify
import yfinance as yf
from flask_cors import CORS
import groq
import re

app = Flask(__name__)
CORS(app)
client = groq.Client(api_key="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")


def get_stock_symbol_from_llm(question):
    chat_completion = client.chat.completions.create(
        model="llama2-70b-4096",
        messages=[{"role": "user", "content": question}],
    )
    llm_response = chat_completion.choices[0].message.content
    stock_symbol = re.search(r'\b[A-Z]{1,5}\b', llm_response)
    return stock_symbol.group(0) if stock_symbol else None


def is_simple_query(question):
    simple_queries = ["hi", "hello", "hey", "what do you do", "who are you", "what can you do", "what you do"]
    return any(query in question for query in simple_queries)


@app.route('/stock_info', methods=['POST'])
def stock_info():
    question = request.form.get('question').lower()

    if is_simple_query(question):
        response = "I am Solvent GPT. I can provide you with the latest stock information, including prices, P/E ratios, and trends. Just ask me about any stock!"
        return jsonify({'success': True, 'response': response})

    stock_symbol = get_stock_symbol_from_llm(question)
    if not stock_symbol:
        return jsonify({'success': False, 'error': 'Unable to retrieve stock symbol'})

    stock = yf.Ticker(stock_symbol)
    stock_name = stock.info.get('longName', stock_symbol)
    pe_ratio = stock.info.get('trailingPE', "P/E ratio not available")
    data = stock.history(period="1d")
    current_price = data['Close'].iloc[-1] if not data.empty else "No data available"
    chart_keywords = {
        "stock", "stocks", "stockprice", "stock price", "chart", "charts",
        "graph", "graphs", "plot", "trend", "trends", "visualization", "visualisation",
        "highchart", "highcharts", "market", "index", "indices", "performance",
        "quote", "quotes", "trading", "candlestick", "bar chart", "line chart",
        "technical analysis", "market data", "equity", "equities", "share", "shares",
        "price movement", "price chart"
    }

    description = (f"The current stock price of {stock_name} ({stock_symbol}) is {current_price}. "
                   f"The overall earnings ratio, commonly referred to as the Price-to-Earnings (P/E) ratio, "
                   f"for {stock_name} ({stock_symbol}) is currently {pe_ratio}. This ratio indicates "
                   f"how much investors are willing to pay for one dollar of earnings and is a commonly used "
                   f"metric to gauge a company's valuation.\n\n"
                   f"Please take a look at the chart to see the price movements over the past six months.")

    def contains_chart_keywords(question):
        """Check if the question contains any chart-related keywords."""
        question_lower = question.lower()
        return any(keyword in question_lower for keyword in chart_keywords)

    # if "stock" in question or "stockprice" in question or "stock price" in question or "chart" in question or "graph" in question or "highchart" in question or "graph" in question:
    if contains_chart_keywords(question):
        period = request.form.get('period', '6mo')
        chart_data = stock.history(period=period)
        if chart_data.empty:
            return jsonify({'success': False, 'error': 'No chart data available'})

        prices = chart_data['Close'].tolist()
        dates = [date.strftime('%Y-%m-%d') for date in chart_data.index]
        description += (f"I've plotted a price trend chart for {stock_name} ({stock_symbol}). "
                        f"Please take a look at the chart to see the price movements over the past {period}.")
        return jsonify(
            {'success': True, 'symbol': stock_symbol, 'prices': prices, 'dates': dates, 'description': description,
             'need_chart': True})

    return jsonify({'success': True, 'symbol': stock_symbol, 'current_price': current_price, 'description': description,
                    'need_chart': False})


if __name__ == '__main__':
    app.run(debug=True)
