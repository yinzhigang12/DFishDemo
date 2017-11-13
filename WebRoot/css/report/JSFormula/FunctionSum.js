var igame;

importNamespace( 'igame.Expression.Operator.Function' );

igame.Expression.Operator.Function.Sum = function ()
{
	igame.Expression.Operator.FunctionBase.call( this );

	this.setMinArgumentLength( 1 );
	this.setMaxArgumentLength( 65535 );
	this.setName( 'SUM' );
}

with ( igame.Expression )
{
	with ( Operator )
	{
		with ( Function )
		{
			ClassDerive( Sum, 'Sum', FunctionBase );

			Sum.prototype.evaluate = function ( operands )
			{
				FunctionBase.prototype.evaluate.call( this, operands );

				var res = 0;
				
				while ( operands.length )
				{
					var op = operands.pop();

					if ( !( op instanceof Operand.Number || op instanceof Operand.Boolean ) )
						throw new Error( 'Unsupported type' );

					res += op.getValue();
				}
				
				return new Operand.Number( res );
			}
		} // with Function
	} // with Operator
} // with namespace


