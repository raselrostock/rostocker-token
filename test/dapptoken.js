var DappToken = artifacts.require( './DappToken.sol' );

contract( 'DappToken' , function( accounts){
	var tokenInstance;
	it('Validate the Token Informatiion', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name){
			assert.equal(name, 'RL Token', 'Name is correct');
			return tokenInstance.symbol();
		}).then(function(symbol){
			assert.equal(symbol, 'RLT', 'Symbol is correct');
			return tokenInstance.standard();
		}).then(function(standard){
			assert.equal(standard, 'version 1.0', 'standard is correct');
			return tokenInstance.decimals();
		}).then(function(decimals){
			assert.equal(decimals, 18, 'decimals is correct');
		});
	});

	it('Allocate to initial token supply upon development ', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply){
			assert.equal(totalSupply.toNumber(), 1000000, 'Initial Token supplied');
			return tokenInstance.balanceOf( accounts[0] );
		}).then(function(balanceOf){
			assert.equal(balanceOf.toNumber(), 1000000, 'Admin balance is correct');
		});
	});

	it('Transfer token ownership', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			// Test `require` statement first by transferring something larger than the sender's balance
			return tokenInstance.transfer.call( accounts[1],999999999999);
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
			// This will only call the function, and not write to disk
      // We want to inspect the function return value rather than the transaction receipt
			return tokenInstance.transfer.call(accounts[1], 250000);
		}).then(function(success){
			assert.equal(success,true, 'return value is true');
			// Actually transfer by calling the function & writing to disk
			return tokenInstance.transfer(accounts[1], 250000);
		}).then(function(receipt){
			assert.equal(receipt.logs.length,1, 'Event is triggered');
			assert.equal(receipt.logs[0].event,'Transfer','Transfer event is triggered');
			assert.equal(receipt.logs[0].args._from,accounts[0],'log the transfer From account 0');
			assert.equal(receipt.logs[0].args._to,accounts[1],'log the transfer To account 1');
			assert.equal(receipt.logs[0].args._value,250000,'log the transfer amount');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance){
			assert.equal(balance.toNumber(),750000, 'Token decreased');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance){
			assert.equal(balance.toNumber(),250000, 'Token increased');
		});
	});

	it('approves tokens for delegated transfer', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.approve.call(accounts[2], 100);
		}).then(function(success){
			assert.equal(success,true,'return is true');
			return tokenInstance.approve(accounts[2],100);
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'A event is triggered');
			assert.equal(receipt.logs[0].event, 'Approval', 'Approval event');
			assert.equal(receipt.logs[0].args._owner, accounts[0], 'Approval Owner');
			assert.equal(receipt.logs[0].args._spender, accounts[2], 'Approval Spender');
			assert.equal(receipt.logs[0].args._value, 100, 'Approved amount 100');
			return tokenInstance.allowance(accounts[0],accounts[2]);
		}).then(function(allowance){
			assert.equal(allowance.toNumber(),100, 'The amount is 100');
		});
	});

	it('handles delegated token transfers ', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			fromAccount= accounts[3];
			toAccount= accounts[4];
			spenderAccount= accounts[5];
			// Transfer some tokens to fromAccount
			return tokenInstance.transfer(fromAccount,100, {from: accounts[0]});
		}).then(function(receipt){
			// Approve spendingAccount to spend 10 tokens from fromAccount
			return tokenInstance.approve(spenderAccount,10, {from: fromAccount});
		}).then(function(receipt){
			// Try transferring something larger than the sender's balance
			return tokenInstance.transferFrom( fromAccount, toAccount, 999999999999,{from: spenderAccount});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >=0, 'Amount can not larger than the account');
			return tokenInstance.transferFrom( fromAccount, toAccount, 20, {from: spenderAccount});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >=0, 'Amount can not larger than the account');
			 // Try transferring something larger than the approved amount
			return tokenInstance.transferFrom.call( fromAccount, toAccount, 10, {from: spenderAccount});
		}).then(function(success){
			assert.equal(success,true,'return is true');
			return tokenInstance.transferFrom( fromAccount, toAccount, 10, {from: spenderAccount});
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'A event is triggered');
			assert.equal(receipt.logs[0].event, 'Transfer', 'the event must be transfer event');
			assert.equal(receipt.logs[0].args._from, fromAccount, 'log data transfer from account');
			assert.equal(receipt.logs[0].args._to, toAccount, 'log data transfer to account');
			assert.equal(receipt.logs[0].args._value, 10, 'log data token amount');
			return tokenInstance.allowance(fromAccount,spenderAccount);
		}).then(function(allowance){
			assert.equal(allowance.toNumber(),0, 'deduct the allowance amount');
		});
	});


});