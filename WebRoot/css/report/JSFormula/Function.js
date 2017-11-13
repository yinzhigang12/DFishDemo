var igame;

importNamespace( 'igame.Expression.Operator' );

igame.Expression.Operator.Function = {
	'createFunction': function ( funcName )
	{
		switch ( funcName.toLowerCase() )
		{
			case 'sum': return new igame.Expression.Operator.Function.Sum();
			case 'average': return new igame.Expression.Operator.Function.Average();
			case 'power': return new igame.Expression.Operator.Function.Power();
			default: throw new Error( 'Function \'' + funcName + '\' is not defined' );
		}
	}

};
