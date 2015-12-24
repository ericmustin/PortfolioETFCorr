var userIndex = {};
var endDate = '2015-12-18';
var startDate = '2015-01-01';
var staticObject = {};
var staticSymbol = ['SPY','XLB','XLE','XLF','XLI','XLK','XLP','XLU','XLV','XLY'];
var topCorr;
var corrSymbol;
var indexCount = 0;
var initialDataCheck = 0;
var twitArray = [];

function getStockTwits() {


$.getJSON('http://anyorigin.com/get?url=https%3A//api.stocktwits.com/api/2/trending/symbols/equities.json&callback=?', function(data){
    $.each(data, function(key,val) {
    var twitData = val.symbols;
    for(var i = 0; i < twitData.length; i++) {
    	console.log(twitData[i].symbol);
    	twitArray.push(twitData[i].symbol);
    }
	});
});
}


function adjustDisplay() {
	var currentCount = indexCount;
	console.log(currentCount);
	$('.currentIndex').find('li').removeClass('hider');
	$('.currentIndex').find('li').filter(function() {
		return (!$(this).hasClass(currentCount));
	}).addClass('hider');
}

function clearData() {
	userIndex = {};
	$('#restart').addClass('hider');
	$('#calc').addClass('hider');
	topCorr;
	$(".currentIndex").find('li').filter(function() {
		return $(this).attr("class") !== indexCount;}).addClass('hider');

}


function determineIndex(indexObject) {
	$.each(indexObject, function(key,val){
		val.adjustedPriceData = $.map(val.adjustedPriceData,function(price) {
			return price*(val.weighting/100);
		});
	});
}


function combineIndexReturns(indexObject) {
	var combinedArray = [];
	$.each(indexObject,function(key,val) {
		for(var i = 0; i < val.adjustedPriceData.length; i++){
			if(isNaN(combinedArray[i])){
				combinedArray[i] = 0;
			}
			combinedArray[i] += val.adjustedPriceData[i];
		}
	});
	indexObject.indexReturns = combinedArray;
}

function retrieveData(inputURL,destinationObject) {
	var tempData = [];

	function returnsAsPercentage(closeArray) {
		var results =[];
		for(var i=1; i < closeArray.length; i++) {
			results.push((closeArray[i] - closeArray[i-1])/closeArray[i-1]*100);
		}
		return results;			
		}

	$.getJSON(inputURL, function(data) {
        $.each(data, function(key,val) {
        	var resultsArray = val.results.quote;
        	for(var i =0; i < resultsArray.length; i++) {
        		tempData.push(resultsArray[i].Close);
        	}
        });
        initialDataCheck++;
        destinationObject.priceData = tempData;
		destinationObject.adjustedPriceData = returnsAsPercentage(destinationObject.priceData);
		if(initialDataCheck >= staticSymbol.length){
			$('#getData').removeClass('hider');
		}
    });
}


function addToIndex(){
	var inputSymbol = $('#yourSymbol').val();
	var inputWeight =$('#yourWeighting').val();
	function publishToPage(ticker,weight,index) {
		var items = [];
		var $ul;
		items.push('<li class="'+index+'"><span>Symbol: '+ticker+' , Weighting: ' +weight+'%</span></li>');
		console.log(index);
		setTimeout(function() {
			$ul = $('<ul />').appendTo('.currentIndex');
			$ul.append(items);
		},2000);
		}

		publishToPage(inputSymbol,inputWeight,indexCount)
		$('#yourSymbol').val("");
		$('#yourWeighting').val("");

}

function addToIndexTwit(){
	var inputSymbol = $('#yourSymbol').val();
	var inputWeight =$('#yourWeighting').val();
	function publishToPage(ticker,weight,index) {
		var items = [];
		var $ul;
		items.push('<li class="'+index+'"><span>Symbol: '+ticker+' , Weighting: ' +weight+'%</span></li>');
		console.log(index);
		setTimeout(function() {
			$ul = $('<ul />').appendTo('.currentIndex');
			$ul.append(items);
		},2000);
		}

		publishToPage(inputSymbol,inputWeight,indexCount)
		$('#yourSymbol').val("");
		$('#yourWeighting').val("");

}

function pullData() {
	var inputSymbol = $('#yourSymbol').val();
	var inputWeight =$('#yourWeighting').val();

	function detectSymbol(object,symbol,weight) {
		if(object[symbol] == undefined) {
			object[symbol] = {};
			object[symbol].weighting = weight/100;
			object[symbol].URL = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22'+symbol+'%22%20and%20startDate%20%3D%20%22'+startDate+'%22%20and%20endDate%20%3D%20%22'+endDate+'%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
			retrieveData(object[symbol].URL,object[symbol]);
		}
	}

    detectSymbol(userIndex,inputSymbol,inputWeight);

     addToIndex();
     adjustDisplay();
     $('#calc').removeClass('hider');
}

function pullDataTwit() {

	function addToIndexTwit(){

		function publishToPage(ticker,weight,index) {
		var items = [];
		var $ul;
		items.push('<li class="'+index+'"><span>Symbol: '+ticker+' , Weighting: ' +weight+'%</span></li>');
		console.log(index);
		setTimeout(function() {
			$ul = $('<ul />').appendTo('.currentIndex');
			$ul.append(items);
		},2000);
		}

		publishToPage(inputSymbol,inputWeight,indexCount)
		$('#yourSymbol').val("");
		$('#yourWeighting').val("");

	}

	function detectSymbol(object,symbol,weight) {
		if(object[symbol] == undefined) {
			object[symbol] = {};
			object[symbol].weighting = weight/100;
			object[symbol].URL = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22'+symbol+'%22%20and%20startDate%20%3D%20%22'+startDate+'%22%20and%20endDate%20%3D%20%22'+endDate+'%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
			retrieveData(object[symbol].URL,object[symbol]);
		}
	}

	for (var i = 0; i < twitArray.length; i++) {
	var inputSymbol = twitArray[i];
	var inputWeight = 3.3333;

	

    detectSymbol(userIndex,inputSymbol,inputWeight);

     addToIndex();
     adjustDisplay();
     
}
$('#calc').removeClass('hider');
}

function calculateDetails(indexReturns,staticReturns) {
	var returns;
	var returnsStatic;
	var sDev;
	var sDevStatic;
	var cov;
	var corr;


		function returnsAveraged(percentageArray) {
			var results;
			results = (percentageArray.reduce(function(a,b){return a+b;})/percentageArray.length);
			return results;
		}

		function sDevOfSymbol(percentageArray) {
		var results;
		results = [];
		for(var i = 0; i < percentageArray.length; i++) {
		results.push((percentageArray[i]-returnsAveraged(percentageArray))*(percentageArray[i]-returnsAveraged(percentageArray)));
			}
		results = Math.sqrt((results.reduce(function(a,b){return a+b;}))/(results.length-1));
		return results;
		}

		function covOfSymbols(symbolAReturns,symbolBReturns) {
			var results = [];
			for(var i = 0; i<symbolBReturns.length; i++) {
				results.push((symbolAReturns[i] - returnsAveraged(symbolAReturns))*(symbolBReturns[i] - returnsAveraged(symbolBReturns)));
			}

			results = results.reduce(function(a,b){return a+b;})/(results.length-1);	

			return results;
		}

		function stockCorrelation(cov,sDevA,sDevB) {
			var results;
			results = cov/(sDevA*sDevB);
			return results;
		}

		sDev = sDevOfSymbol(indexReturns);
		sDevStatic = sDevOfSymbol(staticReturns);
		cov = covOfSymbols(indexReturns,staticReturns);
		corr = stockCorrelation(cov,sDev,sDevStatic);
		return corr;
}

function pullStaticData() {
	getStockTwits();
	console.log(staticObject);
	console.log(staticSymbol[0]);
	for(var i =0; i< staticSymbol.length; i++) {
		staticObject[staticSymbol[i]]={};
	staticObject[staticSymbol[i]].URL = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22'+staticSymbol[i]+'%22%20and%20startDate%20%3D%20%22'+startDate+'%22%20and%20endDate%20%3D%20%22'+endDate+'%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
	retrieveData(staticObject[staticSymbol[i]].URL,staticObject[staticSymbol[i]]);
	}
}

function determineCorrelation(){
topCorr = -1;
corrSymbol = "None";

for(var i=0; i < staticSymbol.length; i++)
	{
	staticObject[staticSymbol[i]].correlation = 0;
	staticObject[staticSymbol[i]].correlation = calculateDetails(userIndex.indexReturns,staticObject[staticSymbol[i]].adjustedPriceData);

	if(topCorr === undefined) {
		topCorr = staticObject[staticSymbol[i]].correlation;
		corrSymbol = staticSymbol[i];
		}
	else if(staticObject[staticSymbol[i]].correlation > topCorr) {
		topCorr = staticObject[staticSymbol[i]].correlation;
		corrSymbol = staticSymbol[i];
		}
	}
}

function programFire() {
	function publishToPage(correlation,index,stockBenchmark) {
		var indexDisplay = "Index "+index;
		var items = [];
		var $ul;
		items.push('<li class="'+indexCount+'"><span> <button class='+indexCount+'>'+indexDisplay+'</button> can be hedged using ' + stockBenchmark + ' which has a correlation of: '+ correlation +'</span> </li>');
		setTimeout(function() {
			
		$ul = $('<ul />').appendTo('.corrHistory');
		$ul.append(items);
		}
		,2000);

	}

	determineIndex(userIndex);
	combineIndexReturns(userIndex);
	determineCorrelation();
	publishToPage(topCorr.toFixed(2),indexCount,corrSymbol);
	indexCount++;
	$('#restart').removeClass('hider');
}