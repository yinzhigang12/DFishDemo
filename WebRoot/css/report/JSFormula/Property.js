var igame;

importNamespace( 'igame.Base' );

/*! Initialize global property count which is used as the surfix of properties'
* name internally.
*/
( function ()
{
	if ( igame.GLOBAL_PROP_COUNT == undefined )
	{
		igame.GLOBAL_PROP_COUNT = 0;
	}
} )();

/*! Declare new property 
\param obj object which will be assigned a new property.
\param name name of property.
\param defaultValue default value of property.
\param isReadonly indicates whether the property is read only.
\param nameOfValidateFunc the function to validate assigned value.
\param nameofConvertFunc the function to convert assigned value.
*/
igame.newProperty = function ( obj, name, defaultValue, isReadonly, nameOfValidateFunc, nameofConvertFunc )
{
	//var value = defaultValue;
	var varName = '_private_' + obj.classname + '_' + name + '$' + igame.GLOBAL_PROP_COUNT++;

	obj[varName] = defaultValue;

	// Add getter
    obj['get' + name] = function ()
    {
    	//return value;
    	return obj[varName];
    }

	// Add setter
    if ( isReadonly )
    {
    	obj['set' + name] = function ()
    	{
    		throw new Error( 'Property \'' + name + '\' is isReadonly' );
    	};
    }
    else
    {
    	obj['set' + name] = function ( val )
    	{
    		if ( typeof obj[nameOfValidateFunc] == 'function' && !obj[nameOfValidateFunc]( val ) )
    			throw new Error( 'set' + name + ': invalid value' );
    		
    		if ( typeof obj[nameofConvertFunc] == 'function' )
    			obj[varName] = obj[nameofConvertFunc]( val );
    		else
    			obj[varName] = val;
    	}
    }
} // function newProperty
