var cheerio = require("cheerio");
var request = require("request");
var async = require("async");
var fs = require("fs");

var url = "http://www.bnn.ca/Shows/Market-Call.aspx?PicksPage=";
var results = {};
var requests = [];
for(var i=1; i<=3; i++){
	requests.push(getPageData.bind({}, i));
}

async.series(requests, saveResults);

function getPageData(i, callback){
	request(url + i, function(err, res, body){
		$ = cheerio.load(body);
		$(".ShowGuestPicks .Column3 a").each(function(i, element){
			var stock = $(this).text();
			if(stock in results){
				results[stock] += 1;
			} else {
				results[stock] = 1;
			}
		});
		console.log("Page " + i + " downloaded.");
		callback();
	});
}

function saveResults(){
	var sortable = [];
	for(var stock in results){
		sortable.push([stock, results[stock]]);
	}
	sortable = sortable.sort(function(a, b){
		return b[1] - a[1];
	});

	var output = "";
	for(var i in sortable){
		output += sortable[i][0] + ": " + sortable[i][1] + "\n";
	}

	fs.writeFile("scrape output.txt", output, function(err){
		if(err){
			console.log(err);
		} else {
			console.log("Data downloaded");
		}
	});
}
