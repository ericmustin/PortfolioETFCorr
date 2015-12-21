var userIndex = {};
var endDate = '2015-12-18';
var startDate = '2015-01-01';
var staticObject = {};
var staticSymbol = ['SPY','XLB','XLE','XLF','XLI','XLK','XLP','XLU','XLV','XLY'];
var topCorr;
var corrSymbol;
var indexCount = 0;
var indexDisplay = "Index "+indexCount;
var initialDataCheck = 0;

function determineIndex(indexObject) {
	$.each(indexObject, function(key,val){
		val.adjustedPriceData = $.map(val.adjustedPriceData,function(price) {
			return price*(val.weighting/100);
		});
	});
}

function returnsAsPercentage(closeArray) {
	var results =[];
		for(var i=1; i < closeArray.length; i++) {
			results.push((closeArray[i] - closeArray[i-1])/closeArray[i-1]*100);
		}
	return results;
			
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

function detectSymbol(object,symbol,weight) {
	if(object[symbol] == undefined)
		{
		object[symbol] = {};
		object[symbol].weighting = weight/100;
		object[symbol].URL = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22'+symbol+'%22%20and%20startDate%20%3D%20%22'+startDate+'%22%20and%20endDate%20%3D%20%22'+endDate+'%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
		retrieveData(object[symbol].URL,object[symbol]);
		}
}


function addToIndex(){
	var inputSymbol = $('#yourSymbol').val();
	var inputWeight =$('#yourWeighting').val();
	function publishToPage(ticker,weight) {
		var items = [];
		var $ul;
		items.push('<li><span>Symbol: '+ticker+' , Weighting: ' +weight+'%</span></li>');
		setTimeout(function() {
			$ul = $('<ul />').appendTo('.currentIndex');
			$ul.append(items);
		},2000);
		indexCount++;
		}

		publishToPage(inputSymbol,inputWeight)
		$('#yourSymbol').val("");
		$('#yourWeighting').val("");

}

function pullData() {
	    var inputSymbol = $('#yourSymbol').val();
	    var inputWeight =$('#yourWeighting').val();
        detectSymbol(userIndex,inputSymbol,inputWeight);

        addToIndex();
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
	console.log(staticObject);
	console.log(staticSymbol[0]);
	for(var i =0; i< staticSymbol.length; i++) {
		staticObject[staticSymbol[i]]={};
	staticObject[staticSymbol[i]].URL = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22'+staticSymbol[i]+'%22%20and%20startDate%20%3D%20%22'+startDate+'%22%20and%20endDate%20%3D%20%22'+endDate+'%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
	retrieveData(staticObject[staticSymbol[i]].URL,staticObject[staticSymbol[i]]);
	}
}

function determineCorrelation(){
topCorr;
corrSymbol;

for(var i=0; i < staticSymbol.length; i++)
	{
		staticObject[staticSymbol[i]].correlation = 0;
staticObject[staticSymbol[i]].correlation = calculateDetails(userIndex.indexReturns,staticObject[staticSymbol[i]].adjustedPriceData);
	console.log(staticObject[staticSymbol[i]].correlation);
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
		var items = [];
		var $ul;
		items.push('<li class="'+index+'"><span>' +index+ ' can be hedged using ' + stockBenchmark + ' which has a correlation of: '+ correlation +'</span> </li>');
		setTimeout(function() {
			$ul = $('<ul />').appendTo('.content');
			$ul.append(items);
		},2000);
		indexCount++;
		}

determineIndex(userIndex);
combineIndexReturns(userIndex);
determineCorrelation();
publishToPage(topCorr.toFixed(2),indexDisplay,corrSymbol);
}