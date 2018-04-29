var DappToken = artifacts.require( './DappToken.sol' );
var TokenSale = artifacts.require( './TokenSale.sol');
module.exports = function( deployer ){
	deployer.deploy( DappToken, 1000000 ).then(function(){
		return deployer.deploy( TokenSale, DappToken.address, 100000000 );
	});
};