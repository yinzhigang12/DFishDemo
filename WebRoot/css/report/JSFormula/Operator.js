// namespace Operator

var igame;

importNamespace( 'igame.Base' );

igame.Expression.Operator = {};

// Define operators' priority
igame.Expression.Operator.OPERATOR_PRIORITY = {
	// Logic
	'Or': 0,
	'And': 0,
	// Compare
	'Greater': 1,
	'GreaterEqual': 1,
	'Equal': 1,
	'NotEquual': 1,
	'Less': 1,
	'LessEqual': 1,
	// Bitwise
	'BitwiseOr': 2,
	'BitwiseAnd': 2,
	'BitwiseXor': 2,
	// Mathematic
	'Add': 3,
	'Sub': 3,
	'Mul': 4,
	'Div': 4,
	'Mod': 4,
	// Function
	'Function': 5,
	// Unary
	'Minus': 6,
	'Plus': 6,
	'Not': 6
};



