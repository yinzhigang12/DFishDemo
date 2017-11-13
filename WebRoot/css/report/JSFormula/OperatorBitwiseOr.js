var igame;

importNamespace( 'igame.Expression.Operator' );

igame.Expression.Operator.BitwiseOr = function ()
{
	igame.Expression.Operator.BinaryOperator.call( this );
	this.setToken( '|' );;
}

with ( igame.Expression )
{
	ClassDerive( Operator.BitwiseOr, 'BitwiseOr', Operator.BinaryOperator );

	Operator.BitwiseOr.prototype.evaluate = function ( operands )
	{
		Operator.BinaryOperator.prototype.evaluate.call( this, operands );

		var op2 = operands.pop();
		var op1 = operands.pop();

		if ( op1 instanceof Operand.String || op2 instanceof Operand.String )
		{
			throw new Error( 'Invalid data type' );
		}
		else
		{
			return new Operand.Number( op1.getValue() | op2.getValue() );
		}
	}
} // with igame