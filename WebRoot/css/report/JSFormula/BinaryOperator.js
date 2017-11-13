var igame;

importNamespace( 'igame.Expression.Operator' );

igame.Expression.Operator.BinaryOperator = function ()
{
	igame.Expression.Operator.OperatorBase.call( this );
}

with ( igame.Expression )
{
	with ( Operator )
	{
		ClassDerive( BinaryOperator, 'BinaryOperator', OperatorBase );

		BinaryOperator.prototype.isBinary = function ()
		{
			return true;
		}

		BinaryOperator.prototype.evaluate = function ( operands )
		{
			if ( operands.length < 2 )
				throw new Error( 'Binary operator can only deal with two operands' );
		}

		BinaryOperator.prototype.test = function ( logFunc, numbers )
		{
			logFunc( 'TEST binary operator:' + this.getToken() );

			for ( var i = 0; i < numbers.length; i += 2 )
			{
				var op1 = new Operand.Number( numbers[i] );
				var op2 = new Operand.Number( numbers[i + 1] );
				var operands = [op1, op2];
				
				var res = this.evaluate( operands );
				var text = '' + numbers[i] + this.getToken() + numbers[i + 1] + '=' + res.getValue();

				logFunc( text );
			}
		} // test
	}
} // with igame