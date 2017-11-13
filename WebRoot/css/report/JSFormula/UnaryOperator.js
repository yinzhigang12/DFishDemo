var igame;

importNamespace( 'igame.Expression.Operator' );

igame.Expression.Operator.UnaryOperator = function ()
{
	igame.Expression.Operator.OperatorBase.call( this );
}

with ( igame.Expression )
{
	ClassDerive( Operator.UnaryOperator, 'UnaryOperator', Operator.OperatorBase );

	with ( Operator )
	{
		UnaryOperator.prototype.isUnary = function ()
		{
			return true;
		}

		UnaryOperator.prototype.evaluate = function ( operands )
		{
			if ( operands.length < 1 )
				throw new Error( 'Binary operator can only deal with two operands' );
		}

		UnaryOperator.prototype.test = function ( logFunc, numbers )
		{
			logFunc( 'TEST unary operator:' + this.getToken() );

			for ( var i = 0; i < numbers.length; i++ )
			{
				var op = new Operand.Number( numbers[i] );
				var operands = [op];
				var res = this.evaluate( operands );

				logFunc( this.getToken() + numbers[i] + '=' + res.getValue() );
			}
		}
	}
} // with igame