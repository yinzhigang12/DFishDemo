var igame;

importNamespace( 'igame.Expression.Operator' );

igame.Expression.Operator.test = function ( logFunc )
{
	var operator = igame.Expression.Operator;

	// binary operator
	// Arithematic
	var add = new operator.Add();
	var sub = new operator.Sub();
	var mul = new operator.Mul();
	var div = new operator.Div();
	var mod = new operator.Mod();

	add.test( logFunc, [0, 0, 0, 1, 1, 0, 1, 1, 0, -1, -1, 0, -1, -1] );
	sub.test( logFunc, [0, 0, 0, 1, 1, 0, 1, 1, 0, -1, -1, 0, -1, -1] );
	mul.test( logFunc, [0, 0, 0, 1, 1, 0, 1, 1, 0, -1, -1, 0, -1, -1] );
	div.test( logFunc, [0, 1, 1, 1, 1, 2, 2, 1, 3, 3, 2, 4, 4, 2] );
	mod.test( logFunc, [0, 1, 1, 1, 2, 1, 2, 4, 4, 2] );

	// Shift
	var shiftLeft = new operator.ShiftLeft();
	var shiftRight = new operator.ShiftRight();

	shiftLeft.test( logFunc, [0, 1, 0, 2, 0, 4, 1, 0, 1, 1, 1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1, 7, 1, 8, 1, 9, 1, 15, 1, 16, 1, 24, 1, 32, 1, 64] );
	shiftRight.test( logFunc, [0, 1, 0, 1, 0, 33, 0x10000000, 1, 0x10000000, 2, 0x10000000, 3, 0x10000000, 4, 0x10000000, 5, 0x10000000, 6, 0x10000000, 7, 0x10000000, 8, 0x10000000, 9, 0x10000000, 10, 0x10000000, 11, 0x10000000, 12, 0x10000000, 13, 0x10000000, 14, 0x10000000, 15, 0x10000000, 16, 0x10000000, 32, 0x10000000, 33, 0x10000000, 64] );

	// Bitwise
	var bitwiseAnd = new operator.BitwiseAnd();
	var bitwiseOr = new operator.BitwiseOr();

	bitwiseAnd.test( logFunc, [0, 0, 0, 1, 1, 0, 1, 1, 0x0001, 0x0010, 0x1000, 0x0111] );
	bitwiseOr.test( logFunc, [0, 0, 0, 1, 1, 0, 1, 1, 0x0001, 0x0010, 0x1000, 0x0111] );

	// Logic
	var and = new operator.And();
	var or = new operator.Or();
	var xor = new operator.Xor();
	var greater = new operator.Greater();
	var greaterEqual = new operator.GreaterEqual();
	var less = new operator.Less();
	var lessEqual = new operator.LessEqual();

	and.test( logFunc, [true, false, true, true, false, true, false, false, 0, 0, 1, 0, 0, 1, 1, 1, true, 1, true, 0, false, 1, false, 0] );
	or.test( logFunc, [true, false, true, true, false, true, false, false, 0, 0, 1, 0, 0, 1, 1, 1, true, 1, true, 0, false, 1, false, 0] );
	xor.test( logFunc, [true, false, true, true, false, true, false, false, 0, 0, 1, 0, 0, 1, 1, 1, true, 1, true, 0, false, 1, false, 0] );
	greater.test( logFunc, [0, 0, 0, 1, 1, 0, 1, 1] );
	greaterEqual.test( logFunc, [0, 0, 0, 1, 1, 0, 1, 1] );
	less.test( logFunc, [0, 0, 0, 1, 1, 0, 1, 1] );
	lessEqual.test( logFunc, [0, 0, 0, 1, 1, 0, 1, 1] );

	// Unary
	var minus = new operator.Minus();
	var plus = new operator.Plus();
	var not = new operator.Not();
	var bitwiseNot = new operator.BitwiseNot();

	minus.test( logFunc, [-2, -1, 0, 1, 2] );
	plus.test( logFunc, [-2, -1, 0, 1, 2] );
	not.test( logFunc, [-2, -1, 0, 1, 2, true, false] );
	bitwiseNot.test( logFunc, [0x1000, 0x0001, 0, -1, -2, 1, 2] );
} // test