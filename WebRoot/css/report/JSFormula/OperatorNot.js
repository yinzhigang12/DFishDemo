var igame;

importNamespace( 'igame.Expression.Operator.UnaryOperator' );

igame.Expression.Operator.Not = function ()
{
	igame.Expression.Operator.UnaryOperator.call( this );
	this.setToken( '!' );
}

with ( igame.Expression )
{
	ClassDerive( Operator.Not, 'Not', Operator.UnaryOperator );

	with ( Operator )
	{
		Not.prototype.evaluate = function ( operands )
		{
			UnaryOperator.prototype.evaluate.call( this, operands );

			var op = operands.pop();

			if ( op instanceof Operand.Boolean )
				return new Operand.Boolean( !op.getValue() );
			else
				if ( op instanceof Operand.Number )
					return new Operand.Boolean( op.getValue() != 0 ? false : true );
				else
					throw new Error( 'Unsupported operand' );
		}
	}
} // with igame


