var igame;

importNamespace( 'igame.Expression.Operator' );

igame.Expression.Operator.Parentheses = function ()
{
	igame.Expression.Operator.OperatorBase.call( this );

	this.setToken( '()' );
}

with ( igame.Expression.Operator )
{
	ClassDerive( Parentheses, 'Parentheses', OperatorBase );

	Parentheses.prototype.isParentheses = function ()
	{
		return true;
	}

}

