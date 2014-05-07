var lookupApp = angular.module('lookupApp', ['ngRoute', 'ngAnimate', 'ngGrid']);

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
lookupApp.controller('mainPageCtrl', function($scope, $http, $filter, $location, $routeParams, BlockchainService, $q){
	$scope.Math = window.Math; //So absolute value can be called within bindings.
	$scope.loaded = true;
	$scope.loading = false; //loaded != loading.  loading is for spinners, etc.
	$scope.user = {addressID : '1gRPd4uauVLjHEFzyKohQaX9VK96awLFP'} //This is for debugging! Set the property to '' for prod.
	var USD;
	$scope.transactions = [];
	$scope.myData = [];

	// Deprecated code.  Removing soon. 
	// $scope.lookupAddress = function (address) {
	//   var url = 'https://blockchain.info/multiaddr?cors=true&active=' + address;
	//   $http.get(url).success(function (data) {
	//     $scope.transactions = data;
	//     $scope.columnsSelected = [{field: 'name', displayName: 'Updated'}, {field:'age', displayName:'updaterrr'}];
	    
	//   });
	// };

	$scope.callBlockchain = function(address) {
		var url = 'https://blockchain.info/multiaddr?cors=true&active='+address;
		var promise = BlockchainService.lookupAddress(url);
		promise.then(function(data){
			$scope.myData = data;
			$scope.columnsSelected = [{field:'Date', displayName:'Date'},
									{field: 'Hash', displayName: 'Hash'}, 
									{field:'Amount', displayName:'Amount', cellTemplate: '<div ng-class="{green: row.getProperty(col.field) > 0, red: row.getProperty(col.field) < 0, }"><div class="ngCellText">{{row.getProperty(col.field)}}</div></div>'},
									{field:'Balance', displayName:'Balance'}
									];

		})
	}

	$scope.getUSD = function(){
		var url = 'https://blockchain.info/ticker?cors=true'
		$http.get(url).success(function(data){
			USD = data.USD;
			$scope.output['USD'] = $scope.output['BTC']
		});
	}
	// This is basically just <a href='path'> in a JS fn.  Allows links to be bound to ng-click.
	//Anchor tags weren't working before, I think it's related to Angular URL routing.
	$scope.go = function (path){
	  $location.path(path);
	};

	$scope.clearTableData = function(){
		$scope.myData = [];
	};
	$scope.mySelections = [];
    $scope.columnsSelected = [{field: 'Info', displayName: 'Info'}]; // Columns are properly set in callBlockchain().
    $scope.myData = [{Info: "To get started use the 'Lookup' button above.  You can click on rows to get more details."}];  
    $scope.gridOptions = { 
        data: 'myData',
        selectedItems: $scope.mySelections,
        multiSelect: false,
        plugins: [new ngGridFlexibleHeightPlugin()],
        enablePinning: true,
        columnDefs: 'columnsSelected'
    };
});

lookupApp.controller('txController', function($scope, $http, $routeParams){
	//TODO: refactor so that it uses BlockchainService.
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

lookupApp.service('BlockchainService', ['$http', '$q', function($http, $q){
	this.lookupAddress = function(url) {
	//Lookup Address is to be called for addresses only.  TODO: Another method for transactions and txController.
	//Currently I'm refactoring so the function returns a promise.
	var transactions = [];
	var deferred = $q.defer();
		return $http.get(url).then(function(data){
			data = data.data; //original data var also includes header response.
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


			deferred.resolve(transactions);
			return deferred.promise;

			//Output is for general data, not for the tabular data.
			//TODO: Implement a way to pass this info back to the controller without making a second HTTP request.
			//Probably wrap the output in an array/obj, one is the below info, the other is the array of transactions.
			// $scope.output = {
			// 	'BTC' : data.wallet.final_balance / 100000000, //Response in satoshi, so have to divide.
			// 	'Address' : address,
			// 	'Total Received': data.addresses[0].total_received / 100000000,
			// 	'Total Sent': data.addresses[0].total_sent / 100000000,
			// 	'Transactions' : transactions
			// };
			
		}, function(error){
			console.log(error);
		});
	}
}]);

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


