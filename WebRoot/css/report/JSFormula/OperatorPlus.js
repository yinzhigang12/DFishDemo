var igame;

importNamespace( 'igame.Expression.Operator.UnaryOperator' );

igame.Expression.Operator.Plus = function ()
{
	igame.Expression.Operator.UnaryOperator.call( this );
	this.setToken( '+' );
}

with ( igame.Expression )
{
	ClassDerive( Operator.Plus, 'Plus', Operator.UnaryOperator );

	with ( Operator )
	{
	
		Plus.prototype.evaluate = function ( operands )
		{
			UnaryOperator.prototype.evaluate.call( this, operands );

			// Do nothing
			return operands.pop();
		}
	}
} // with igame


