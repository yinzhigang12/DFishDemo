var igame;

importNamespace( 'igame.Expression.Operand' );

igame.Expression.Operand.OperandBase = function ()
{
	igame.Base.call( this );

	igame.newProperty( this, 'Value', null, false, 'validate', 'convertFrom' );

	if ( arguments.length > 0 )
		this.setValue( arguments[0] );
}

with ( igame.Expression.Operand )
{
	ClassDerive( OperandBase, 'OperandBase', igame.Base );

	/*! virtual function, derived class should has selves implementation. */
	OperandBase.prototype.validate = function ( val )
	{
		return false;
	}

	/*! virtual function, derived class should has selves implementation. */
	OperandBase.prototype.convertFrom = function ( val )
	{
		return val;
	}

	OperandBase.prototype.toString = function ()
	{
		return this.getValue() + '';
	}

	OperandBase.prototype.compareTo = function ( that )
	{
		if ( this == that )
			return 0;

		if ( ( this instanceof Operand.OperandNumber || this instanceof Operand.OperandBoolean ) &&
			( that instanceof Operand.OperandNumber || that instanceof Operand.OperandBoolean ) )
		{
			if ( this.getValue() == that.getValue() )
				return 0;
			else
				if ( this.getValue() < that.getValue() )
					return -1;
				else
					return 1;
		}
		else
		{
			if ( this.toString() == that.toString() )
				return 0;
			else
				if ( this.toString() < that.toString() )
					return -1;
				else
					return 1;
		}
	}

	OperandBase.prototype.equals = function ( that )
	{
		return this.compareTo( that ) == 0;
	}
} // with igame
