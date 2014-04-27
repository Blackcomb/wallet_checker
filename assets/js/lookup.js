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

lookupApp.controller('mainPageCtrl', function($scope, $http, ngTableParams, $filter, $location, $routeParams){
	$scope.Math = window.Math; //So absolute value can be called within bindings.
	$scope.loaded = true;
	$scope.loading = false; //loaded != loading.  loading is for spinners, etc.
	$scope.user = {addressID : '1gRPd4uauVLjHEFzyKohQaX9VK96awLFP'} //This is for debugging!  Remove this or equal to '' for prod.
	var USD;
	var transactions = [];
	var data = [];

	$scope.routeParams = $routeParams;

	$scope.lookupAddress = function(address){		
		var url = 'https://blockchain.info/multiaddr?cors=true&active='+address;
		// if ($scope.tableParams){$scope.reloadTable();}
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
					'Balance' : data.txs[i]['balance'] / 100000000,
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
			//Enables new data to be loaded, e.g. on a new address.
			//Pretty sure it's not working right now.
			if ($scope.tableParams){$scope.tableParams.reload();} 
			var data = transactions; //this data var is what is called by the tables.
			$scope.tableParams = new ngTableParams({
		        page: 1,            
		        count: 5,           // items per page
		        sorting: {
		        	Date: 'desc' 
		        }
		    }, {
		        total: transactions.length, 
		        getData: function($defer, params) {
		        	var data = transactions;
		            var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
		            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
		            
		        }
		    });
		    setTimeout(function(){loadPopovers()}, 10)
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
	$scope.go = function ( path ) {
	  $location.path( path );
	  console.log(path);

	};
});

lookupApp.controller('txController', function($scope, $http, $routeParams){
	$scope.lookupTx = function(txID){
		var url = 'https://blockchain.info/rawtx/' + txID +'?cors=true';
		$http.get(url).success(function(data){console.log("Tx Success!");console.log(data);});
	}
	$scope.lookupTx($routeParams.txID)
});

loadPopovers = function(){
	console.log("Pop pop!");
	$('.poppop').popover({trigger: 'hover'
	});
}
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


