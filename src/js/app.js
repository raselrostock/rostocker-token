App = {
	web3Provider: null,
	contracts: {},
	account: '0x0',
	loading: false,
	tokenPrice: 1000000000000000,
	tokenSold: 0,
	tokenAvailable: 750000,
	init: function(){
		console.log("App initialized...");
		return App.initWeb3();
	},

	initWeb3: function(){
		if( typeof web3 !== 'undefined'){
			App.web3Provider = web3.currentProvider;
			web3 = new Web3(web3.currentProvider);
		}
		else{
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
			web3 = new Web3(App.web3Provider);
		}
		return App.initContracts();
	},

	initContracts: function(){
		$.getJSON('TokenSale.json',function(tokenSale){
			App.contracts.TokenSale = TruffleContract(tokenSale);
			App.contracts.TokenSale.setProvider(App.web3Provider);
			App.contracts.TokenSale.deployed().then(function(tokenSale){
				console.log("Dapp TokenSale Address: ",tokenSale.address)
			});
		}).done(function(){
				$.getJSON('DappToken.json',function(dappToken){
					App.contracts.DappToken = TruffleContract(dappToken);
					App.contracts.DappToken.setProvider(App.web3Provider);
					App.contracts.DappToken.deployed().then(function(dappToken){
						console.log("Dapp Token Address:",dappToken.address);
					});
					App.listenForEvents();
					return App.render();
				});
			})
	},
	
	listenForEvents: function(){
		App.contracts.TokenSale.deployed().then(function(instance){
			instance.Sell({}, {
				fromBlock: 0,
				toBlock: 'latest',
			}).watch(function(error, event){
				console.log('Event Triggered: ', event);
				App.render();
			})
		})
	},

	render: function(){
		if(App.loading){
			return;
		}
		App.loading = true;
		var loader = $('#loader');
		var content = $('#content');
		loader.show();
		content.hide();
		web3.eth.getCoinbase(function(err, account){
			if( err === null ){
				App.account = account;
				$('#accountAddress').html("Your Account: "+account);
			}
		})

		App.contracts.TokenSale.deployed().then(function(instance){
			tokensaleInstance = instance;
			return tokensaleInstance.tokenPrice();
		}).then(function(tokenPrice){
			App.tokenPrice = tokenPrice;
			 $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
			 return tokensaleInstance.tokenSold();
		}).then(function(tokenSold){
			App.tokenSold = tokenSold.toNumber();
			$('.tokens-sold').html(App.tokenSold);
			$('.tokens-available').html(App.tokenAvailable);
			var progressPercent = (Math.ceil(App.tokenSold)/App.tokenAvailable) * 100;
			$('#progress').css('width',progressPercent + '%');
		});

		App.contracts.DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.balanceOf(App.account);
		}).then(function(balance){
			 $('.dapp-balance').html(balance.toNumber());
			 App.loading = false;
			 loader.hide();
			 content.show();
		})
		
	},

	buyTokens: function(){
		$('#content').hide();
		$('#loader').show();
		var numberOfToken = $('#numberOfToken').val();
		App.contracts.TokenSale.deployed().then(function(instance){
			tokensaleInstance = instance;
			return tokensaleInstance.buyTokens( numberOfToken, {
				from: App.account,
				value: numberOfToken * App.tokenPrice,
				gas: 500000
			} );
		}).then(function(result){
			console.log('Tokens bought ...');
			$('form').trigger('reset');
		});
	}
}

$(function(){
	$(window).load(function(){
		App.init();
	});
});