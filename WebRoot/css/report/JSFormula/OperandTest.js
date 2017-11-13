var igame;

importNamespace( 'igame.Expression.Operand' );

igame.Expression.Operand.test = function ( logFunc )
{
	var operand = igame.Expression.Operand;

	var num = new operand.Number( 100 );
	var num2 = new operand.Number( 99 );
	var num3 = new operand.Number( 98 );
	var num4 = new operand.Number( 97 );

	var bool = new operand.Boolean( true );
	var str = new operand.String( 'this is a string' );

	logFunc( 'Num:' + num.getValue() );
	logFunc( 'bool:' + bool.getValue() );
	logFunc( 'str:' + str.getValue() );
} // test