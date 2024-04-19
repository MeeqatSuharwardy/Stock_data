document.getElementById('stock-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const question = document.getElementById('question').value.toLowerCase();
    fetch('/stock_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `question=${encodeURIComponent(question)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.need_chart) {
            fetchChart(data.symbol);
        } else if (data.success) {
            document.getElementById('response').innerHTML = '<p>Stock Price: ' + data.price + '</p>';
        } else {
            document.getElementById('response').innerHTML = '<p>Error: ' + data.error + '</p>';
        }
    })
    .catch(error => {
        document.getElementById('response').innerHTML = '<p>Error sending request: ' + error + '</p>';
    });
});

function fetchChart(symbol) {
    let chartType = 'line'; // Default to line chart
    fetch(`/stock_chart?symbol=${symbol}&period=1mo`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            plotChart(data, chartType);
        } else {
            document.getElementById('response').innerHTML = '<p>Error: ' + data.error + '</p>';
        }
    })
    .catch(error => {
        document.getElementById('response').innerHTML = '<p>Error sending request: ' + error + '</p>';
    });
}

function plotChart(data, type) {
    Highcharts.stockChart('stock-chart', {
        rangeSelector: { selected: 1 },
        title: { text: data.symbol + ' Stock Price' },
        series: [{ name: data.symbol, data: data.prices, tooltip: { valueDecimals: 2 } }]
    });
}


const sidebar = document.querySelector("#sidebar");
const hide_sidebar = document.querySelector(".hide-sidebar");
const new_chat_button = document.querySelector(".new-chat");

hide_sidebar.addEventListener( "click", function() {
    sidebar.classList.toggle( "hidden" );
} );

const user_menu = document.querySelector(".user-menu ul");
const show_user_menu = document.querySelector(".user-menu button");

show_user_menu.addEventListener( "click", function() {
    if( user_menu.classList.contains("show") ) {
        user_menu.classList.toggle( "show" );
        setTimeout( function() {
            user_menu.classList.toggle( "show-animate" );
        }, 200 );
    } else {
        user_menu.classList.toggle( "show-animate" );
        setTimeout( function() {
            user_menu.classList.toggle( "show" );
        }, 50 );
    }
} );

const models = document.querySelectorAll(".model-selector button");

for( const model of models ) {
    model.addEventListener("click", function() {
        document.querySelector(".model-selector button.selected")?.classList.remove("selected");
        model.classList.add("selected");
    });
}

const message_box = document.querySelector("#message");

message_box.addEventListener("keyup", function() {
    message_box.style.height = "auto";
    let height = message_box.scrollHeight + 2;
    if( height > 200 ) {
        height = 200;
    }
    message_box.style.height = height + "px";
});

function show_view( view_selector ) {
    document.querySelectorAll(".view").forEach(view => {
        view.style.display = "none";
    });

    document.querySelector(view_selector).style.display = "flex";
}

new_chat_button.addEventListener("click", function() {
    show_view( ".new-chat-view" );
});

document.querySelectorAll(".conversation-button").forEach(button => {
    button.addEventListener("click", function() {
        show_view( ".conversation-view" );
    })
});