var igame;

importNamespace( 'igame.Expression.Operator.Function' );

igame.Expression.Operator.Function.Power = function ()
{
	igame.Expression.Operator.FunctionBase.call( this );

	this.setMinArgumentLength( 2 );
	this.setMaxArgumentLength( 2 );
	this.setName( 'POWER' );
}

with ( igame.Expression )
{
	with ( Operator )
	{
		with ( Function )
		{
			ClassDerive( Power, 'Power', FunctionBase );

			Power.prototype.evaluate = function ( operands )
			{
				FunctionBase.prototype.evaluate.call( this, operands );

				var res = 0;
				var opPower = operands.pop();
				var opBase = operands.pop();

				return new Operand.Number( Math.pow(opBase.getValue(), opPower.getValue()) );
			}
		} // with Function
	} // with Operator
} // with namespace


