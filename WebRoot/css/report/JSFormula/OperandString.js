var igame;

importNamespace( 'igame.Expression.Operand' );

igame.Expression.Operand.String = function ()
{
	igame.Expression.Operand.OperandBase.call( this );

	if ( !arguments.length )
		this.setValue( '' );
	else
		this.setValue( arguments[0] );
}

with ( igame.Expression )
{
	ClassDerive(Operand.String, 'String', Operand.OperandBase);

	Operand.String.prototype.validate = function ( val )
	{
		return val != undefined;
	}

	Operand.String.prototype.convertFrom = function ( val )
	{
		return val.toString();
	}

} // with igame