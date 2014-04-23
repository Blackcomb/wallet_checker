var lookupApp = angular.module('lookupApp', ['ngTable']);

glob = '';

lookupApp.controller('mainPageCtrl', function($scope, $http, ngTableParams, $filter){
	$scope.Math = window.Math; //So absolute value can be called within bindings.
	$scope.loaded = false;
	$scope.loading = false; //loaded != loading.  loading is for spinners, etc.
	$scope.user = {addressID : '1gRPd4uauVLjHEFzyKohQaX9VK96awLFP'}
	var USD;
	var transactions = [];

	$scope.lookupAddress = function(address){		
		var url = 'https://blockchain.info/multiaddr?cors=true&active='+address;
		$scope.loading = true;
		$http.get(url).success(function(data){
			$scope.loading = false;
			$scope.loaded = true;
			$scope.loadError = false;
			glob = data;

			//Take Blockchain.info's response of transactions and put it in a format we want.
			//index 0 is the newest; index length - 1 is the first transaction.
			for (i = data.txs.length -1; i > -1; i-- ){
				var inputAddr = [];	
				for (z = 0; z < data.txs[i]['inputs'].length; z++){
					inputAddr.push(data.txs[i]['inputs'][z]['prev_out']['addr'])
				}
				var outputAddr = [];
				for (z = 0; z < data.txs[i]['out'].length; z++){
					outputAddr.push(data.txs[i]['out'][z]['addr'])
				}

				transactions[i] = {
					'Hash' : data.txs[i]['hash'],
					'Amount' : data.txs[i]['result'] / 100000000,
					'Total Balance' : data.txs[i]['balance'] / 100000000,
					'InputAddress' : inputAddr,
					'OutputAddress' : outputAddr,
					'Date' : timeConverter(data.txs[i]['time'])
				};
			};

			$scope.output = {
				'BTC' : data.wallet.final_balance / 100000000, //Response in satoshi, so have to divide.
				'Address' : address,
				'Total Received': data.addresses[0].total_received / 100000000,
				'Total Sent': data.addresses[0].total_sent / 100000000,
				'Transactions' : transactions

			};

			var data = transactions;
			
			$scope.tableParams = new ngTableParams({
		        page: 1,            
		        count: 5           // items per page
		    }, {
		        total: data.length, 
		        getData: function($defer, params) {
		            // use build-in angular filter
		            var data = transactions;
		            var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
		            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
		        }
		    });
		}).
		error(function(data){
			$scope.loadError = true;
		});
	}
	$scope.getUSD = function(){
		var url = 'https://blockchain.info/ticker?cors=true'
		$http.get(url).success(function(data){
			USD = data.USD;
			$scope.output['USD'] = $scope.output['BTC']
		});
	}
});

window.onload = function(){
	$('.poppop').popover({trigger: 'hover'});
};

//Thanks StackOverflow
function timeConverter(UNIX_timestamp){
 var a = new Date(UNIX_timestamp*1000); //Multiplied by 1000 because JS keeps time in miliseconds.  Unix time = seconds.
 var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
     var year = a.getFullYear();
     var month = months[a.getMonth()];
     var date = a.getDate();
     var hour = a.getHours();
     var min = a.getMinutes();
     var sec = a.getSeconds();
     var time = date+', '+month+' '+year+' '+hour+':'+min+':'+sec ;
     return time;
 }