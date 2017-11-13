var igame;

importNamespace( 'igame.Expression' );


igame.Expression.Operator.ShiftRight = function ()
{
	igame.Expression.Operator.BinaryOperator.call( this );
	this.setToken( '>>' );
}

with ( igame.Expression )
{
	ClassDerive( Operator.ShiftRight, 'ShiftRight', Operator.BinaryOperator );

	Operator.ShiftRight.prototype.evaluate = function ( operands )
	{
		Operator.BinaryOperator.prototype.evaluate.call( this, operands );

		var op2 = operands.pop();
		var op1 = operands.pop();

		if ( !( op2 instanceof Operand.Number ) )
			op2 = new Operand.Number( op2.getValue() );

		if ( !( op1 instanceof Operand.Number ) )
			op1 = new Operand.Number( op1.getValue() );

		if ( op1.getValue() < 0 )
			throw new Error( 'Shift count less than 0' );

		return new Operand.Number( op1.getValue() >> op2.getValue() );
	}

} // with igame