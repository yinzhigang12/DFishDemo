var igame;

importNamespace( 'igame.Expression.Operator.Function' );

igame.Expression.Operator.Function.Average = function ()
{
	igame.Expression.Operator.FunctionBase.call( this );

	this.setMinArgumentLength( 1 );
	this.setMaxArgumentLength( 65535 );
	this.setName( 'AVERAGE' );
}

with ( igame.Expression )
{
	with ( Operator )
	{
		with ( Function )
		{
			ClassDerive( Average, 'Average', FunctionBase );

			Average.prototype.evaluate = function ( operands )
			{
				FunctionBase.prototype.evaluate.call( this, operands );

				var res = 0;
				var len = operands.length;

				while ( operands.length )
				{
					var op = operands.pop();

					if ( !( op instanceof Operand.Number || op instanceof Operand.Boolean ) )
						throw new Error( 'Unsupported type' );

					res += op.getValue();
				}

				return new Operand.Number( res / len );
			}
		} // with Function
	} // with Operator
} // with namespace
