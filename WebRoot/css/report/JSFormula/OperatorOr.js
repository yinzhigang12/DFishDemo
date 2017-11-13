var igame;

importNamespace( 'igame.Expression.Operator' );

igame.Expression.Operator.Or = function ()
{
	igame.Expression.Operator.BinaryOperator.call( this );
	this.setToken( '||' );;
}

with ( igame.Expression )
{
	ClassDerive( Operator.Or, 'Or', Operator.BinaryOperator );

	Operator.Or.prototype.evaluate = function ( operands )
	{
		Operator.BinaryOperator.prototype.evaluate.call( this, operands );

		var op2 = operands.pop();
		var op1 = operands.pop();

		if (!(op1 instanceof Operand.Boolean))
			op1 = new Operand.Boolean(op1.getValue());

		if (!(op2 instanceof Operand.Boolean))
			op2 = new Operand.Boolean(op2.getValue());

		return new Operand.Boolean(op1.getValue() || op2.getValue());
	}
} // with igame