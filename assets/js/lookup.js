var lookupApp = angular.module('lookupApp', ['ngRoute','ngTable', 'ngAnimate']);

glob = '';

lookupApp.config(['$routeProvider', 
	function($routeProvider){
		$routeProvider.
			when('/', {
				controller: 'mainPageCtrl',
				templateUrl: 'ledger.html'
			})
			.when('/tx/:txID', {
				controller: 'txController',
				templateUrl: 'transactions.html'
			})
			.otherwise({
				redirectTo: '/'
			})
	}])
var data = [];
lookupApp.controller('mainPageCtrl', function($scope, $http, ngTableParams, $filter, $location, $routeParams){
	$scope.Math = window.Math; //So absolute value can be called within bindings.
	$scope.loaded = true;
	$scope.loading = false; //loaded != loading.  loading is for spinners, etc.
	$scope.user = {addressID : '1gRPd4uauVLjHEFzyKohQaX9VK96awLFP'} //This is for debugging!  Remove this or equal to '' for prod.
	var USD;
	var transactions = [];
	// var data = [];

	$scope.routeParams = $routeParams;

	$scope.lookupAddress = function(address){		
		var url = 'https://blockchain.info/multiaddr?cors=true&active='+address;
		$scope.loading = true;
		$scope.clearTableData();
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
				//This is what is displayed in the leder/tables.
				transactions[i] = {
					'Hash' : data.txs[i]['hash'],
					'Amount' : data.txs[i]['result'] / 100000000,
					'Balance' : data.txs[i]['balance'] / 100000000,
					'InputAddress' : inputAddr,
					'OutputAddress' : outputAddr,
					'Date' : timeConverter(data.txs[i]['time'])
				};
			};

			//Output is for general data, not for the tabular data.
			$scope.output = {
				'BTC' : data.wallet.final_balance / 100000000, //Response in satoshi, so have to divide.
				'Address' : address,
				'Total Received': data.addresses[0].total_received / 100000000,
				'Total Sent': data.addresses[0].total_sent / 100000000,
				'Transactions' : transactions
			};
			//Enables new data to be loaded, e.g. on a new address.
			//Pretty sure it's not working right now.
			if ($scope.tableParams){
				$scope.tableParams.reload();
			} 
			data = transactions; //this data var is what is called by the tables. Unsure if can remove.
			$scope.tableParams = new ngTableParams({
		        page: 1,            
		        count: 5,           // items per page
		        sorting: {
		        	Date: 'desc' 
		        }
		    }, {
		        total: transactions.length, 
		        getData: function($defer, params) {
		        	data = transactions;
		            var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
		            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
		            
		        },
		        $scope: { $data: {} }
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
	// This is basically just <a href='path'> in a JS fn.  Allows links to be bound to ng-click.
	$scope.go = function (path){
	  $location.path(path);
	};

	//After every address lookup the previous data isn't wiped.  This function fixes that problem.
	$scope.clearTableData = function(){
		transactions = [];
		$scope.output = {}
		if ($scope.tableParams){
				$scope.tableParams.reload();
		} 
	}
	
});

lookupApp.controller('txController', function($scope, $http, $routeParams){
	$scope.lookupTx = function(txID){
		var url = 'https://blockchain.info/rawtx/' + txID +'?cors=true';
		$http.get(url).success(function(data){
			console.log("Tx Success!");
			console.log(data);
			$scope.txOutput = {

			}
		});
	}
	$scope.lookupTx($routeParams.txID)
});
//Thanks StackOverflow
function timeConverter(UNIX_timestamp){
 var a = new Date(UNIX_timestamp*1000); //Multiplied by 1000 because JS keeps time in miliseconds.  Unix time = seconds.
 var months = ['1','2','3','4','5','6','7','8','9','10','11','12'];
     var year = a.getFullYear();
     var month = months[a.getMonth()];
     var date = a.getDate();
     var hour = a.getHours();
     var min = a.getMinutes();
     var sec = a.getSeconds();
     var time = year+'-'+month+'-'+date+ ' '+hour+':'+min+':'+sec ;
     return time;
 }

 //HELPER FUNCTIONS

//This manually scrolls to anchor tags.  For some reason the functionality was broken, I believe due to AngularJS routing.
 function jump(h){
    var url = location.href;
    location.href = "#"+h;
        history.replaceState(null,null,url)
}


