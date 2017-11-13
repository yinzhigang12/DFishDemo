var igame;

importNamespace( 'igame.Expression.Operator.UnaryOperator' );

igame.Expression.Operator.Minus = function ()
{
	igame.Expression.Operator.UnaryOperator.call( this );
	this.setToken( '-' );
}

with ( igame.Expression )
{
	ClassDerive( Operator.Minus, 'Minus', Operator.UnaryOperator );

	with ( Operator )
	{
		Minus.prototype.evaluate = function ( operands )
		{
			UnaryOperator.prototype.evaluate.call( this, operands );

			var op = operands.pop();

			if ( op instanceof Operand.Number )
				return new Operand.Number( -op.getValue() );
			else
				if ( op instanceof Operand.Boolean )
					return new Operand.Number( op.getValue() ? -1 : 0 );
				else
					throw new Error( 'Unsupported operand' );
		}
	}
} // with igame


