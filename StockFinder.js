var cheerio = require("cheerio");
var request = require("request");
var async = require("async");
var fs = require("fs");
var args = require("optimist").argv;
var jade = require("jade");

var url = "http://www.bnn.ca/Shows/Market-Call.aspx?PicksPage=";
var filename = "scrape output.html";
var results = {};
var requests = [];

var pagesToGet = args.n || 10;
var fileExport = args.e;

for(var i=1; i<=pagesToGet; i++){
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

	if(fileExport){
		var jadeOptions = {
			pretty: true,
			picks: sortable
		};
		jade.renderFile("template.jade", jadeOptions, function(err, html){
			if(err){
				console.log(err);
			} else {
				fs.writeFile(filename, html, function(err){
					if(err){
						console.log(err);
					} else {
						console.log("Data logged to " + filename);
					}
				});
			}
		});
	} else {
		var consoleOutput = "";
		for(var i in sortable){
			consoleOutput += sortable[i][0] + ": " + sortable[i][1] + "\n";
		}
		console.log(consoleOutput);
	}
}
