pragma solidity ^0.4.2;
import './DappToken.sol';
contract Tokensale{
	address admin;
	DappToken tokenContract;
	uint256 public tokenPrice;
	uint256 public tokenSold;
	event Sell( address _buyer, uint256 _amount );
	function Tokensale( DappToken _tokenContract, uint256 _tokenPrice ) public{
		admin = msg.sender;
		tokenContract = _tokenContract;
		tokenPrice = _tokenPrice;
	}
	function multiply( uint x, uint y) internal pure returns( uint z){
		require( y==0 || (z =x*y) / y == x );
	}
	// Buy Tokens
	function buyTokens(uint256 _noOfTokens) public payable{
		require( msg.value == multiply(_noOfTokens, tokenPrice ));
		require(tokenContract.balanceOf(this) >= _noOfTokens );
		require(tokenContract.transfer( msg.sender, _noOfTokens ));
		tokenSold+= _noOfTokens;
		emit Sell( msg.sender, _noOfTokens );
	}
	// Ending the tonkenSale
	function endSale() public{
		// Require only admin
		require( msg.sender == admin );
		// Transfer remaining tokens to admin
		require( tokenContract.transfer(admin,tokenContract.balanceOf(this)));
		// Destroy the contract
	}
	
}