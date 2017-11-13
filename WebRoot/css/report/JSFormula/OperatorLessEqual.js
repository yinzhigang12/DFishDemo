var igame;

importNamespace( 'igame.Expression.Operator' );

igame.Expression.Operator.LessEqual = function ()
{
	igame.Expression.Operator.BinaryOperator.call( this );
	this.setToken( '<=' );;
}

with ( igame.Expression )
{
	ClassDerive( Operator.LessEqual, 'LessEqual', Operator.BinaryOperator );

	Operator.LessEqual.prototype.evaluate = function ( operands )
	{
		Operator.BinaryOperator.prototype.evaluate.call( this, operands );

		var op2 = operands.pop();
		var op1 = operands.pop();

		return new Operand.Boolean(op1.compareTo( op2 ) <= 0);
	}
} // with igame