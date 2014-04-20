var lookupApp = angular.module('lookupApp', []);

glob = '';

lookupApp.controller('mainPageCtrl', function($scope, $http){
	$scope.Math = window.Math; //So absolute value can be called within bindings.
	$scope.loaded = false;
	$scope.user = {addressID : '1gRPd4uauVLjHEFzyKohQaX9VK96awLFP'}

	$scope.lookupAddress = function(address){		
		var url = 'https://blockchain.info/multiaddr?cors=true&active='+address;
		$http.get(url).success(function(data){
			$scope.loaded = true;
			glob = data;

			//Take Blockchain.info's response of transactions and put it in a format we want.
			//index 0 is the newest; index length - 1 is the first transaction.
			var transactions = [];
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