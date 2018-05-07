var TokenSale = artifacts.require( './TokenSale.sol');
var DappToken = artifacts.require( './DappToken.sol');
contract('TokenSale', function(accounts){
	var tokensaleInstance;
	var tokenInstance;
	var admin = accounts[0];
	var buyer = accounts[1];
	var numberOfTokens;
	var tokenAvailable = 750000;
	var tokenPrice = 1000000000000000; // in wei

	it('Check', function(){
		TokenSale.deployed().then(function(instance){
			tokensaleInstance = instance;
			return tokensaleInstance.address
		}).then(function(address){
			assert.notEqual(address, '0x0', 'Address');
			return tokensaleInstance.tokenContract();
		}).then(function(address){
			assert.notEqual(address, '0x0', 'Address');
			return tokensaleInstance.tokenPrice();
		}).then(function(tokenPrice){
			assert.equal(tokenPrice.toNumber(),tokenPrice, 'Equal');
		});
	});

	it('Facilitates token buy',function(){
			return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return TokenSale.deployed();
		}).then(function(instance){
			tokensaleInstance = instance;
			return tokenInstance.transfer(tokensaleInstance.address, tokenAvailable, {from: admin });
		}).then(function(receipt){
			return tokenInstance.balanceOf(tokensaleInstance.address);
		}).then(function(balance){
			assert.equal(balance.toNumber(),tokenAvailable,'Token sale contact get the tokens to sell');
			numberOfTokens = 10;
			return tokensaleInstance.buyTokens( numberOfTokens, { from: buyer, value: numberOfTokens*tokenPrice });
		}).then(function(receipt){
			assert.equal(receipt.logs.length,1,'triggers one event');
			assert.equal(receipt.logs[0].event,'Sell', 'should be the "Sell" event');
			assert.equal(receipt.logs[0].args._buyer,buyer,'logs the account holder that purchased the tokens');
			assert.equal(receipt.logs[0].args._amount,numberOfTokens,'logs the amount of tokens sold');
			return tokensaleInstance.tokenSold();
		}).then(function(amount){
			assert.equal(amount.toNumber(),numberOfTokens, 'Increment the number of token sold');
			return tokenInstance.balanceOf(buyer);
		}).then(function(balance){
			assert.equal(balance.toNumber(),numberOfTokens,'Buyer has 10 token');
			return tokenInstance.balanceOf(tokensaleInstance.address);
		}).then(function(balance){
			assert.equal(balance.toNumber(),tokenAvailable-numberOfTokens);
			// Try to buy tokens with different eather value
			return tokensaleInstance.buyTokens( numberOfTokens, {from:buyer, value: 1 });
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert')>0,'Number of token must equal to msg.value in wei');
			return tokensaleInstance.buyTokens(800000 , {from:buyer, value:numberOfTokens* tokenPrice});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert')>=0,'Can not purchase more than available token');
		});
	});
	
	it('Ends token sale',function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance= instance;
			return TokenSale.deployed();
		}).then(function(instance){
			tokensaleInstance = instance;
			return tokensaleInstance.endSale({from:buyer});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert')>=0,'must be admin to end sale');
			return tokensaleInstance.endSale({from:admin});
		}).then(function(receipt){
			return tokenInstance.balanceOf(admin);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 999990,'returns all token to admin');
			// Check that token price was reset when selfDestruct was called
			return tokensaleInstance.tokenPrice();
		}).then(function(price){
			assert.equal(price.toNumber(), 0, 'token price was reset');
			// Check that token price was reset when selfDestruct was called

		});
	});
	
});