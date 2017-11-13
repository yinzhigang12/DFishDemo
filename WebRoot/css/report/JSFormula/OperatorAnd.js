var igame;

importNamespace( 'igame.Expression.Operator' );

igame.Expression.Operator.And = function ()
{
	igame.Expression.Operator.BinaryOperator.call( this );
	this.setToken( '&&' );
}

with ( igame.Expression )
{
	ClassDerive( Operator.And, 'And', Operator.BinaryOperator );

	Operator.And.prototype.evaluate = function ( operands )
	{
		Operator.BinaryOperator.prototype.evaluate.call( this, operands );

		var op2 = operands.pop();
		var op1 = operands.pop();

		if ( op1 instanceof Operand.String || op2 instanceof Operand.String )
		{
			// String concate
			return new Operand.Boolean(op1.getValue().toString().length > 0 && op2.getValue().toString().length > 0 );
		}
		else
		{
			return new Operand.Boolean( op1.getValue() && op2.getValue() );
		}
	}
} // with igame