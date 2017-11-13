var igame;

importNamespace( 'igame.Expression.Operator' );

igame.Expression.Operator.Xor = function ()
{
	igame.Expression.Operator.BinaryOperator.call( this );
	this.setToken( '^' );;
}

with ( igame.Expression )
{
	ClassDerive( Operator.Xor, 'Xor', Operator.BinaryOperator );

	Operator.Xor.prototype.evaluate = function ( operands )
	{
		Operator.BinaryOperator.prototype.evaluate.call( this, operands );

		var op2 = operands.pop();
		var op1 = operands.pop();

		if ( !( op1 instanceof Operand.Number ) )
			op1 = new Operand.Number( op1.getValue() );

		if ( !( op2 instanceof Operand.Number ) )
			op2 = new Operand.Number( op2.getValue() );

		return new Operand.Number( op1.getValue() ^ op2.getValue() );
	}
} // with igame