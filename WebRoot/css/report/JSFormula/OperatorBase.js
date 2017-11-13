var igame;

importNamespace( 'igame.Expression.Operator' );


/*! OperatorBase */
igame.Expression.Operator.OperatorBase = function ()
{
	igame.Base.call( this );
	igame.newProperty( this, 'Token', '' );
}

with ( igame.Expression.Operator )
{
	ClassDerive( OperatorBase, 'OperatorBase', igame.Base );

	OperatorBase.prototype.isBinary = function ()
	{
		return false;
	}

	OperatorBase.prototype.isUnary = function ()
	{
		return false;
	}

	OperatorBase.prototype.isFunction = function ()
	{
		return false;
	}

	OperatorBase.prototype.isParentheses = function ()
	{
		return false;
	}

	OperatorBase.prototype.evaluate = function ( operands )
	{
		throw new Error( 'Not implemented' );
	}

	OperatorBase.prototype.comparePriority = function ( that )
	{
		if ( this == that )
			return 0;

		if ( !( that instanceof OperatorBase ) )
			throw new Error( 'Can\'t compare non-Operator' );

		var thisPrio = 0;
		var thatPrio = 0;

		if ( this instanceof FunctionBase )
			thisPrio = OPERATOR_PRIORITY['Function'];
		else
			thisPrio = OPERATOR_PRIORITY[this.classname];

		if ( that instanceof FunctionBase )
			thatPrio = OPERATOR_PRIORITY['Function'];
		else
			thatPrio = OPERATOR_PRIORITY[that.classname];

		if ( thisPrio == undefined || thatPrio == undefined )
			throw new Error( 'Operator priority not defined' );

		if ( thisPrio == thatPrio )
			return 0;
		else
			if ( thisPrio < thatPrio )
				return -1;
			else
				return 1;
	}
} // with igame