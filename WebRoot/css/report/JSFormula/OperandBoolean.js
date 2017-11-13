var igame;

importNamespace( 'igame.Expression.Operand' );

igame.Expression.Operand.Boolean = function ()
{
	igame.Expression.Operand.OperandBase.call( this );

	if ( !arguments.length )
		this.setValue( false );
	else
		this.setValue( arguments[0] );
}

with ( igame.Expression )
{
	ClassDerive(Operand.Boolean, 'Boolean', Operand.OperandBase);

	Operand.Boolean.prototype.validate = function ( val )
	{
		if ( val == undefined || val == null )
			return false;

		switch ( typeof val )
		{
			case 'string': return /true|false/i.test( val );
			case 'number':
			case 'boolean': return true;
			default: return false;
		} // switch
	}

	Operand.Boolean.prototype.convertFrom = function ( val )
	{
		if ( this == val || val instanceof Operand.Boolean )
			return this.getValue();

		if ( val instanceof Operand.Number )
			return val.getValue() > 0 ? true : false;

		if ( val instanceof Operand.String )
		{
			if ( /true/i.test( val.getValue() ) )
				return true;
			else
				if ( /false/i.test( val.getValue() ) )
					return false;
				else
					return parseInt( val.getValue() ) > 0;
		}
		else
		{
			switch ( typeof val )
			{
				case 'string': return /true/i.test( val );
				case 'number': return val != 0;
				case 'boolean': return val;
				default: return false;
			} // switch
		}
	}
} // with igame