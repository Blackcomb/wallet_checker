var lookupApp = angular.module('lookupApp', []);

glob = '';

lookupApp.controller('mainPageCtrl', function($scope, $http){
	$scope.lookupAddress = function(address){
		var url = 'https://blockchain.info/multiaddr?cors=true&active='+address;
		$http.get(url).success(function(data){
			glob = data;
		});
	}
});