var igame;

importNamespace( 'igame.Expression.Operand' );

igame.Expression.Operand.Number = function ()
{
	igame.Expression.Operand.OperandBase.call( this );

	if ( !arguments.length )
		this.setValue( 0 );
	else
		this.setValue( arguments[0] );
}

with ( igame.Expression )
{
	ClassDerive(Operand.Number, 'Number', Operand.OperandBase);

	Operand.Number.prototype.validate = function ( val )
    {
        return val != null && val != 'undefined' && !isNaN( val );
    }

	Operand.Number.prototype.convertFrom = function ( val )
    {
		if ( this == val || val instanceof Operand.Number )
    		return val.getValue();

    	if ( val instanceof Operand.Boolean )
    		return val.getValue() ? 1 : 0;

		return parseFloat(val);
    }

	Operand.Number.prototype.compareTo = function ( that )
    {
    	if ( this == that )
    		return 0;

    	var thatNum = new Operand.Number( that );

    	if ( this.getValue() == thatNum.getValue() )
    		return 0;
    	else
    		if ( this.getValue() < thatNum.getValue() )
    			return -1;
    		else
    			return 1;
    }
} // with igame