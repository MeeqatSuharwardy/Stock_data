from flask import Flask, render_template, request, jsonify
import yfinance as yf
from flask_cors import CORS
import groq
import re

app = Flask(__name__)
CORS(app)
client = groq.Client(api_key="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")

def get_stock_info_from_llm(question):
    # Add more specific instructions to the LLM
    prompt = f"Extract the stock symbol from the following user query about a company's stock performance: '{question}'"
    chat_completion = client.chat.completions.create(
        model="llama2-70b-4096",
        messages=[{"role": "user", "content": prompt}]
    )
    llm_response = chat_completion.choices[0].message.content
    # print("LLM Response:", llm_response)  # Debugging: What does the LLM say?

    # Attempt to extract a stock symbol
    stock_symbol = re.search(r'\b[A-Z]{1,5}\b', llm_response)
    if stock_symbol:
        return stock_symbol.group(0), question

    return None, question

@app.route('/stock_info', methods=['POST'])
def stock_info():
    question = request.form.get('question').lower()
    stock_symbol, _ = get_stock_info_from_llm(question)
    if not stock_symbol:
        stock_symbol = fallback_symbol_extractor(question)
        if not stock_symbol:
            return jsonify({'success': False, 'error': 'Unable to retrieve stock symbol'})

    stock = yf.Ticker(stock_symbol)
    stock_name = stock.info.get('longName', stock_symbol)
    pe_ratio = stock.info.get('trailingPE', "P/E ratio not available")

    # Fetch chart data
    period = request.form.get('period', '6mo')
    chart_data = stock.history(period=period)
    if chart_data.empty:
        return jsonify({'success': False, 'error': 'No chart data available'})

    prices = chart_data['Close'].tolist()
    dates = [date.strftime('%Y-%m-%d') for date in chart_data.index]

    # Description for response
    description = (f"The current stock price of {stock_name} ({stock_symbol}) is {prices[-1] if prices else 'No data available'}. "
                   f"The overall earnings ratio, commonly referred to as the Price-to-Earnings (P/E) ratio, "
                   f"for {stock_name} ({stock_symbol}) is currently {pe_ratio}. This ratio indicates "
                   f"how much investors are willing to pay for one dollar of earnings and is a commonly used "
                   f"metric to gauge a company's valuation.\n\n"
                   f"I've plotted a price trend chart for {stock_name} ({stock_symbol}) over the past {period}. "
                   f"Please take a look at the chart to see the price movements.")

    return jsonify(
        {'success': True, 'symbol': stock_symbol, 'prices': prices, 'dates': dates, 'description': description,
         'need_chart': True})

if __name__ == '__main__':
    app.run(debug=True)
