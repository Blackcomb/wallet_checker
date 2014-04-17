var lookupApp = angular.module('lookupApp', []);

glob = '';

lookupApp.controller('mainPageCtrl', function($scope, $http){
	$scope.loaded = false;

	$scope.lookupAddress = function(address){		
		// $scope.loaded = false;
		var url = 'https://blockchain.info/multiaddr?cors=true&active='+address;
		$http.get(url).success(function(data){
			$scope.loaded = true;
			glob = data;
			$scope.output = {
				'BTC' : data.wallet.final_balance / 100000000, //Response in satoshi, so have to divide.
				'Address' : address,
				'Total Received': data.addresses[0].total_received,
				'Total Sent': data.addresses[0].total_sent,
			};
		});
	}
});