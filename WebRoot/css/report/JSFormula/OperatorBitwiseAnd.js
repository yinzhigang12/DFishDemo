var igame;

importNamespace( 'igame.Expression.Operator' );

igame.Expression.Operator.BitwiseAnd = function ()
{
	igame.Expression.Operator.BinaryOperator.call( this );
	this.setToken( '&' );;
}

with ( igame.Expression )
{
	ClassDerive( Operator.BitwiseAnd, 'BitwiseAnd', Operator.BinaryOperator );

	Operator.BitwiseAnd.prototype.evaluate = function ( operands )
	{
		Operator.BinaryOperator.prototype.evaluate.call( this, operands );

		var op2 = operands.pop();
		var op1 = operands.pop();

		if ( op1 instanceof Operand.String || op2 instanceof Operand.String )
		{
			// String concate
			return new Operand.String(op1.getValue() + op2.getValue());
		}
		else
		{
			return new Operand.Number( op1.getValue() & op2.getValue() );
		}
	}
} // with igame