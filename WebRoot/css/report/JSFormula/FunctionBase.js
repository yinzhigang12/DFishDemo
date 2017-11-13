var igame;

importNamespace( 'igame.Expression.Operator.Function' );

igame.Expression.Operator.FunctionBase = function ()
{
	igame.Expression.Operator.OperatorBase.call( this );

	this.setToken( 'Undefined' );

	igame.newProperty( this, 'Name', 'Unknown' );
	igame.newProperty( this, 'MinArgumentLength', 0 );
	igame.newProperty( this, 'MaxArgumentLength', 65535 );
}

with ( igame.Expression )
{
	with ( Operator )
	{
		ClassDerive(FunctionBase, 'FunctionBase', OperatorBase );

		FunctionBase.prototype.isFunction = function ()
		{
			return true;
		}

		FunctionBase.prototype.evaluate = function ( operands )
		{
			if ( operands.length < this.getMinArgumentLength() || operands.length > this.getMaxArgumentLength() )
				throw new Error( 'Wrong number of arguments: ' + this.getMinArgumentLength() + ' for min and ' + this.getMaxArgumentLength() + ' for max' );
		}

		FunctionBase.prototype.test = function ( logFunc, numbers )
		{
			logFunc( 'TEST FunctionBase:' + this.getToken() + '(' + numbers.joint( ',' ) + ')' );

			var operands = [];

			for ( var i = 0; i < numbers.length; i++)
			{
				operands.push( new Operand.Number( numbers[i] ) );
			}

			this.evaluate( operands );

			var res = operands.pop();

			logFunc( 'Result:' + res.getValue() );
		}
	} // with Operator
} // with igame.Expression


