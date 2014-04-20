var lookupApp = angular.module('lookupApp', []);

glob = '';

lookupApp.controller('mainPageCtrl', function($scope, $http){
	$scope.loaded = false;
	// $scope.addressID = '1gRPd4uauVLjHEFzyKohQaX9VK96awLFP'
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

				transactions[i] = {
					'Hash' : data.txs[i]['hash'],
					'Amount' : data.txs[i]['result'] / 100000000,
					'Total Balance' : data.txs[i]['balance'] / 100000000,
					'InputAddress' : inputAddr
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