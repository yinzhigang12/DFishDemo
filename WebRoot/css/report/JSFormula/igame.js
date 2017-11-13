var igame = {}; /** < base namespace */

/*! Base class of all classes. */
igame.Base = function () { /* dummy */ }

with ( igame )
{
	// Everybody should use unique classname, which is used to identify 
	// object
	Base.prototype.classname = 'Base';

	// Test whether the specificed object is an ancestor.
    Base.prototype.hasSuper = function ( obj )
    {
        if (obj == undefined || this == obj)
            return false;

        var superObj = obj;

        do
        {
			// Simply compare the class name.
            if ( this.superclass.getClassname() == superObj.getClassname() )
                return true;

            superObj = obj.superclass;

        } while ( superObj );

        return false;
    }

	Base.prototype.test = function ( logFunc )
    {
		// Dummy
    }
} // with igame

/*! Derive class from parent with specified class name
*/
ClassDerive = function ( theClass, theClassname, parent )
{
	theClass.prototype = new parent();
	theClass.prototype.classname = theClassname;
	theClass.prototype.constructor = theClass;
	theClass.prototype.superclass = parent;
}

/*! This function checks namespace to assure 
* specified modals are included.
*/
importNamespace = function (ns)
{
	if ( arguments.length == 0 )
		return;

	var root = igame; ///< root of namespace, which is always 'igame'.
	
	if ( !root )
		throw new Error( 'Namespace ' + root + ' not defined' );

	var nsList = ns.split( '.' );

	if ( nsList.length < 1 )
		throw new Error( 'Namespace is empty' );

	if ( nsList[0] != 'igame' )
		throw new Error( 'igame shall be the base namespace' );

	var path = root;

	for ( var i = 1; i < nsList.length; i++ )
	{
		root = root[nsList[i]];

		path = '.' + nsList[i];

		if ( !root )
			throw new Error( 'Namespace ' + path + ' not defined' );
	} // for
}
