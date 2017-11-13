var igame;


importNamespace( 'igame.Expression.Formula' );

igame.Expression.Formula.test = function ( logFunc )
{
	var srcCode = [
		/*'=1+1',
		'=0+1',
		'=1++1',
		'=1-+1',
		'=1*2+3/1',*/
		'=(1+2)*2 - +3'
	];

	for ( var i = 0; i < srcCode.length; i++ )
	{
		var formula = new igame.Expression.Formula( srcCode[i] );
		var res = formula.evaluate();

		logFunc( srcCode[i] + '--->' + res.getValue() );
	}
}
