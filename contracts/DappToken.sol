pragma solidity ^0.4.20;
contract DappToken{
	//Initialize the Token Information variables
	string public name;
	string public symbol;
	string public standard;
	uint256 public decimals;
	uint256 public totalSupply;

	// Mapped the balance with address
	mapping( address => uint256 ) public balanceOf;
	mapping( address =>mapping( address => uint256 ) ) public allowance;

	// Event Transfer log
	event Transfer(
		address indexed _from,
		address indexed _to,
		uint256 _value
		);

	// Event Approval log
	event Approval(
		address indexed _owner,
		address indexed _spender,
		uint256 _value
		);

	// Define the constractor
	function DappToken( uint256 _initialToken ) public{
		name = 'RL Token';
		symbol = 'RLT';
		standard = 'version 1.0';
		decimals = 18;
		balanceOf[msg.sender] = _initialToken;
		totalSupply = _initialToken;
	} 

	function transfer( address _to, uint256 _value ) public returns( bool success){
		// Check sender has grater than value amount of token
		require(balanceOf[msg.sender] >= _value );
		// Decrease the sender token
		balanceOf[msg.sender]-= _value;
		// Increase the receiver token
		balanceOf[_to]+= _value;
		// Assign the Transfer amount in the log
		emit Transfer(msg.sender, _to, _value);
		return true;
	}

	function approve( address _spender, uint256 _value) public returns( bool success ){
		allowance[msg.sender][_spender] = _value;
		emit Approval( msg.sender, _spender, _value );
		return true;
	}

	function transferFrom( address _from, address _to, uint256 _value ) public returns( bool success){
		require(allowance[_from][msg.sender] >= _value);
		require( balanceOf[_from] >= _value);
		balanceOf[_from]-= _value;
		balanceOf[_to]+= _value;
		allowance[_from][msg.sender]-= _value;
		emit Transfer( _from, _to, _value );
		return true;
	}
}