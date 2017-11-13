var igame;

// Using Expression.Operand & Operator
importNamespace( 'igame.Expression' );
importNamespace( 'igame.Expression.Operand' );
importNamespace( 'igame.Expression.Operator' );

/*! Formula */
igame.Expression.Formula = function ()
{
	igame.Base.call( this );

	if (arguments.length != 1)
		throw new Error('Input formula needed');

	if ( arguments[0] == undefined )
		throw new Error( 'Undefined expression' );

	// Try to match '=MyExpression'
	var matches = /s*=(.*)/gi.exec( arguments[0] );

	if ( matches != null )
		igame.newProperty( this, 'SourceCode', matches[1], true );
	else
	{	// or 'MyExpression'
		igame.newProperty( this, 'SourceCode', arguments[0], true );
	}
		

	this.m_curIdx = 0;			///< current index of reading.
	this.m_lastToken = null;	///< last token.
	this.m_tokenStack = [];		///< token stake.
	this.m_lastSuccess = false;	///< whether last parsing has succeeded.
	this.m_lastResult = null;	///< result of last parsing.

	//! supported operator
	__VALID_OPERATOR_PREFIX = {
		'+': true,
		'-': true,
		'*': true,
		'/': true,
		'%': true,
		'=': true,
		'>': true, // include >, >=, >>
		'<': true, // include <, <=, <<
		'&': true,
		'|': true,
		'!': true,
		'~': true,
		'^': true
	};

	// Parse
	this.__parse();
}

// implementation
with ( igame.Expression )
{
	ClassDerive( Formula, 'Formula', igame.Base );
	
	Formula.prototype.eof = function ()
	{
		return this.m_curIdx >= this.getSourceCode().length;
	}

	Formula.prototype.charAt = function(idx)
	{
		return this.getSourceCode().charAt( idx );
	}

	Formula.prototype.currentChar = function()
	{
		return this.charAt( this.m_curIdx );
	}

	Formula.prototype.getTokens = function ()
	{
		return this.m_tokenStack.concat( [] );
	}
	
	Formula.prototype.lastSuccess = function ()
	{
		return this.m_lastSuccess;
	}

	Formula.prototype.getLastResult = function ()
	{
		return this.m_lastResult;
	}

	/**
	* Internal evaluation function
	*/
	Formula.prototype.__evaluateUnary = function ( token, tokens, operands )
	{
		operands.push( token.evaluate( operands ) );
	}

	Formula.prototype.__evaluateBinary = function ( token, tokens, operands )
	{
		operands.push( token.evaluate( operands ) );
	}

	Formula.prototype.__evaluateFunction = function ( token, tokens, args, operands )
	{
		operands.push( token.evaluate( args ) );
	}


	Formula.prototype.evaluate = function ()
	{
		this.m_lastResult = null;
		this.m_lastSuccess = false;

		var operands = [];
		var tokens = this.getTokens().reverse();
		var token;

		// FILO 
		while ( tokens.length )
		{
			token = tokens.pop();

			// Operand or Operator?
			if ( token instanceof Operand.OperandBase )
			{
				operands.push( token );
			}
			else
			{
				// Process oerpator
				if ( token instanceof Operator.OperatorBase )
				{
					// Unary, Binary or Function operator ?
					if ( token.isUnary() )
					{
						this.__evaluateUnary( token, tokens, operands );
					}
					else
					{
						if ( token.isBinary() )
						{
							this.__evaluateBinary( token, tokens, operands );
						}
						else
						{
							if ( token.isFunction() )
							{
								var argNum = operands.pop().getValue(); // Top item in operand stack is the number of arguments.
								var args = [];

								while ( argNum > 0 )
								{
									args.push( operands.pop() );
									argNum--;
								}

								// Arguments were stored in FILO.
								this.__evaluateFunction( token, tokens, args.reverse(), operands );
							}
							else
							{
								if ( token.isParenthese() )
								{
								}
								else
									throw new Error( 'Unsupported operator: class:' + token.classname + ':' + token.getToken() );
							}
						}
					}
				}
				else
				{	// Unknown
					throw new Error( 'Unsupported token: class:' + token.classname + ':' + token.getToken() );
				}
			}
		} // while

		// A successful evaluation should leave only one operand in 
		// stack, which is the result.
		if ( operands.length != 1 )
			throw new Error( 'Failed to evaluate' );

		// Result in operands
		this.m_lastResult = operands.pop();
		this.m_lastSuccess = true;

		return this.m_lastResult;
	}

	Formula.prototype.__parse = function ()
	{
		var itNum = 0;

		while ( !this.eof() )
		{
			var ch = this.charAt( this.m_curIdx );

			try
			{
				switch ( ch )
				{
					case ' ': this.m_curIdx++; break; //eat space
					case '"': this.__parseString(); break; // string starts 
					case '(': this.__parseParentheses(); break;
					default:
						{
							if ( this.__isLetter( ch ) )
								this.__parseFunction();
							else
								if ( this.__isDigit( ch ) )
									this.__parseNumber();
								else
									if ( this.__isOperator( ch ) )
										this.__parseOperator();
									else
										throw new Error('Pos:' + this.m_curIdx + ' char: \'' + ch + '\' should not appear here' );
						}
						break;
				} // switch


			}
			catch ( e )
			{
				throw new Error( 'Failed to parse expression:' + e.description );
			}

			itNum++;
			if ( itNum > this.getSourceCode().length )
				throw new Error( 'Take too long time to parse formula:' + itNum + ' time(s)' );
		}
	}

	/**
	* Internal utility functions
	*/
	Formula.prototype.__isDigit = function(ch)
	{
		return ( ch >= '0' && ch <= '9' ) || ch == '.';
	}

	Formula.prototype.__isLetter = function(ch)
	{
		return ( ch >= 'a' && ch <= 'z' ) || ( ch >= 'A' && ch <= 'Z' );
	}

	Formula.prototype.__isOperator = function (ch)
	{
		return __VALID_OPERATOR_PREFIX[ch];
	}

	Formula.prototype.__getNumber = function ()
	{
		var pos = this.m_curIdx;

		var unaryNum = 0;
		var pointNum = 0;
		var eNum = 0;

		while ( !this.eof() )
		{
			var ch = this.currentChar();

			if ( !this.__isDigit( ch ) )
			{
				if ( ch == '.' )
				{
					if ( pointNum > 0 ) // too much point
						break;

					pointNum++;
				}
				else
				{
					if ( ch == '+' || ch == '-' )
					{
						if ( eNum == 0 || unaryNum > 0 ) // 
							break;

						unaryNum++;
					} // if unary
					else
					{
						if ( ch == 'E' || ch == 'e' )
						{
							if ( eNum > 0 )
								break;

							eNum++;
						}
						else
							break;
					}
				}
			} // if not digit

			this.m_curIdx++;
		} // while

		if ( unaryNum > 1 || pointNum > 1 || eNum > 1 )
			throw new Error('Pos:' + this.m_curIdx + ':Invalid number format' );

		var str = this.getSourceCode().substring( pos, this.m_curIdx );

		var matches = /\d+\.?[Ee][\+-]\d+/i.exec( str ); // Exponential: x.yE+/-z

		if ( matches == null )
		{
			var tailMatches = /\.\d+/i.exec( str ); // try match tail float format: .x
			var floatMatches = /\d+\.?\d*/i.exec( str ); // try match normal float format: xxx.yyy
			var matches = null;

			if ( tailMatches == null )
				matches = floatMatches;
			else
				if ( floatMatches == null )
					matches = tailMatches;
				else
					matches = tailMatches[0].length > floatMatches[0].length ? tailMatches : floatMatches;
		}

		if ( matches == null )
			throw new Error( 'Pos:' + this.m_curIdx + ' char:Invalid number' );

		return matches[0];
	}

	/*! Get operator array based on their order and priority
	*/
	Formula.prototype.__getOperators = function ()
	{
		var tokens = [];

		while ( this.m_tokenStack.length > 0 )
		{
			var token = this.m_tokenStack.pop();

			if ( token instanceof Operator.OperatorBase )
			{
				if ( token.isUnary())
				{
					tokens.push( token );
				}
				else
				{	// binary
					if ( token.isBinary())
					{
						if ( tokens.length > 0 )
						{
							if ( tokens[tokens.length - 1].isUnary() )
							{
								tokens.push( token );
							}
							else
							{
								if ( tokens[tokens.length - 1].comparePriority( token ) > 0 )
								{
									tokens.push( token );
								}
								else
								{
									this.m_tokenStack.push( token );
									break;
								}
							}
						}
						else
						{
							tokens.push( token );
						}
					}
					else
					{	// function or parentheses
						this.m_tokenStack.push( token );

						while ( tokens.length > 0 && tokens[tokens.length - 1].isUnary() )
						{
							this.m_tokenStack.push( tokens.pop() );
						}

						break;
					} // if ... else Binary/functions
				} // if ... else Unary/Binary
			}
			else
			{
				this.m_tokenStack.push( token );

				if ( tokens.length > 0 )
				{
					if ( tokens[tokens.length - 1].isUnary())
					{
						this.m_tokenStack.push( tokens.pop() );
					}
					else
					{
						if ( tokens.length > 1 )
						{
							if ( tokens[tokens.length - 1].comparePriority( tokens[tokens.length - 2] ) > 0 )
							{
								this.m_tokenStack.push( tokens.pop() );
							}
						}
					}

					break;
				}
			} // if ... else Opertor/Operand
		} // while

		// sort tokens
		tokens.sort( function ( a, b )
		{
			return a.comparePriority( b );
		} );

		return tokens;
	}

	Formula.prototype.__parseNumber = function ()
	{
		if ( this.m_lastToken instanceof Operand.OperandBase )
			throw new Error( 'Pos:' + this.m_curIdx + ' char:\'' + this.currentChar() + '\' should not appear here' );

		var operand = new Operand.Number( this.__getNumber() );

		if ( this.m_lastToken instanceof Operator.OperatorBase )
		{
			var tokens = this.__getOperators();

			this.m_tokenStack.push( operand );

			while ( tokens.length )
				this.m_tokenStack.push( tokens.pop() );
		}
		else
			this.m_tokenStack.push( operand );

		this.m_lastToken = new Operand.OperandBase();
	}

	Formula.prototype.__getFunctionName = function ()
	{
		var match = /[a-z,\$]+\d*/i.exec( this.getSourceCode().substring( this.m_curIdx ) );
		
		if ( match == null )
			throw new Error('Pos:' + this.m_curIdx + ':Get function name failed' );

		this.m_curIdx += match[0].length;

		return match[0];
	}

	Formula.prototype.__skipSpace = function ()
	{
		var ch;

		while ( !this.eof() )
		{
			ch = this.currentChar();

			if ( ch != ' ' )
				break;

			this.m_curIdx++;
		}
	}

	Formula.prototype.__getParenthesesContent = function ()
	{
		if ( this.eof() || this.currentChar() != '(' )
			throw new Error( 'Pos:' + this.m_curIdx + ':Can\'t match \'(\'' );

		var num = 0;
		var startPos = this.m_curIdx;
		var ch;

		while ( !this.eof() )
		{
			ch = this.currentChar();

			if ( ch == '(' )
			{
				num++;
			}
			else
			{
				if ( ch == ')' )
				{
					num--;

					if ( num == 0 )
						break;
				}
			}

			this.m_curIdx++;
		} // while !eof

		return this.getSourceCode().substring( startPos + 1, this.m_curIdx++ );
	}

	Formula.prototype.__stringToArguments = function (str)
	{
		var args = [];
		var pos = 0;
		var parentheses = 0;
		var arg = '';
		var ch;

		while ( pos < str.length )
		{
			ch = str.charAt( pos );

			switch ( ch )
			{
				case '(':
					{
						parentheses++;
						arg += ch;
					}
					break;
				case ')':
					{
						parentheses--;
						arg += ch;
					}
					break;
				case ',':
					{
						if ( parentheses == 0 )
						{
							args.push( arg );
							arg = '';
						}
						else
							arg += ch;
					}
					break;
				default: arg += ch; break;
			} // switch

			pos++;
		} // while

		if ( arg.length > 0 )
			args.push( arg );

		return args;
	}

	Formula.prototype.__parseFunction = function ()
	{
		if (this.m_lastToken instanceof Operand.OperandBase )
		{
			throw new Error( 'Pos:' + this.m_curIdx + ' char:\'' + this.currentChat() + '\' should not appear here' );
		}

		var funcName = this.__getFunctionName();
		
		if ( /true|false/i.test( funcName ) )
		{
			this.m_tokenStack.push( new Operand.Boolean( funcName ) );
			this.m_lastToken = new Operand.OperandBase();

			return;
		}
		
		this.__skipSpace();

		// Excel cell reference
		// TODO

		var paramStrArray = this.__stringToArguments( this.__getParenthesesContent() );
		var params = [];
		
		for ( var i = 0; i < paramStrArray.length; i++ )
		{
			var exp = new Formula( paramStrArray[i] );

			params = params.concat( exp.getTokens());
		} // for each str in paramStrArray

		var func = Operator.Function.createFunction( funcName );

		if ( paramStrArray.length > func.getMaxArgumentLength() )
			throw new Error( 'Function expects ' + func.getMaxArgumentLength() + ' arguments but gets ' + paramStrArray.length + '.' );

		params.push( new Operand.Number( paramStrArray.length ) );
		//params.push( new Operator.FunctionBase( funcName ) );
		params.push( func );

		// Adjust order of last opertor and current function.
		var tokens = [];

		if ( this.m_lastToken instanceof Operator.OperatorBase)
		{
			tokens.push( this.m_tokenStack.pop() );

			while ( this.m_tokenStack.length > 0 )
			{
				var token = this.m_tokenStack.pop();

				if ( !( token instanceof Operator.OperatorBase ) )
				{
					this.m_tokenStack.push( token );
					break;
				}
				else
					tokens[tokens.length] = token;

				if ( token.isBinary() )
					break;
			} // while
		}

		this.m_tokenStack = this.m_tokenStack.concat( params.concat( tokens ) );
		this.m_lastToken = new Operator.FunctionBase( '' );
	}

	Formula.prototype.__parseOperator = function ()
	{
		var ch = this.currentChar();
		
		if ( this.m_lastToken == null && '*/%&|><^='.indexOf( ch ) >= 0 )
			throw new Error( '\'' + ch + '\' should not appear here.' );

		var unary = '+-~!'.indexOf(ch) >= 0 &&
					(
						this.m_lastToken == null || 
						(this.m_lastToken instanceof Operator.OperatorBase && 
						!(this.m_lastToken instanceof Operator.FunctionBase || this.m_lastToken instanceof Operator.Parentheses))
					);


		switch ( ch )
		{
			case '+':
				{
					if (unary)
					{
						this.m_tokenStack.push( new Operator.Plus() ); // Unary
					}
					else
					{
						this.m_tokenStack.push( new Operator.Add() ); // Binary
					}
				}
				break;
			case '-':
				{
					if (unary)
					{
						this.m_tokenStack.push( new Operator.Minus() ); // Unary
					}
					else
					{
						this.m_tokenStack.push( new Operator.Sub() ); // Binary
					}
				}
				break;
			case '~':
				{
					if ( !unary )
						throw new Error( '\'' + ch + '\' is unary operator' );

					this.m_tokenStack.push( new Operator.BitwiseNot() );
				}
				break;
			case '!':
				{
					if ( !unary )
						throw new Error( '\'' + ch + '\' is unary operator' );

					this.m_tokenStack.push( new Operator.Not() );
				}
				break;
			case '*':this.m_tokenStack.push( new Operator.Mul() ); break;
			case '/': this.m_tokenStack.push( new Operator.Div() ); break;
			case '%': this.m_tokenStack.push( new Operator.Mod() ); break;
			case '&':
				{
					if ( this.m_curIdx < this.getSourceCode().length - 1 && this.charAt( this.m_curIdx + 1 ) == '&' )
					{
						this.m_tokenStack.push( new Operator.And() );
						this.m_curIdx++;
					}
					else
					{
						this.m_tokenStack.push( new Operator.BitwiseAnd() );
						//this.m_tokenStack.push( new OperatorStringConcat() ); // Excel uses '&' to concat string
					}
				}
				break;
			case '|':
				{
					if ( this.m_curIdx < this.getSourceCode().length - 1 && this.charAt( this.m_curIdx + 1 ) == '|' )
					{
						this.m_tokenStack.push( new Operator.Or() );
						this.m_curIdx++;
					}
					else
					{
						this.m_tokenStack.push( new Operator.BitwiseOr() );
					}
				}
				break;
			case '=':
				{
					if ( this.m_curIdx < this.getSourceCode().length - 1 && this.charAt( this.m_curIdx + 1 ) == '=' )
					{
						this.m_tokenStack.push( new Operator.Equal() );
						this.m_curIdx++;						
					}
				}
				break;
			case '>':
				{
					if ( this.m_curIdx < this.getSourceCode().length - 1)
					{
						switch ( this.charAt( this.m_curIdx + 1 ) )
						{
							case '=': this.m_tokenStack.push( new Operator.GreaterEqual() ); this.m_curIdx++; break;
							case '>': this.m_tokenStack.push( new Operator.ShiftRight() ); this.m_curIdx++; break;
							default: this.m_tokenStack.push( new Operator.Greater() ); break;
						}
					}
					else
					{
						this.m_tokenStack.push( new Operator.Greater() );
					}
				}
				break;
			case '<':
				{
					if ( this.m_curIdx < this.getSourceCode().length - 1 )
					{
						switch ( this.charAt( this.m_curIdx + 1 ) )
						{
							case '=': this.m_tokenStack.push( new Operator.LessEqual() ); this.m_curIdx++; break;
							case '<': this.m_tokenStack.push( new Operator.ShiftLeft() ); this.m_curIdx++; break;
							default: this.m_tokenStack.push( new Operator.Less() ); break;
						}
					}
					else
					{
						this.m_tokenStack.push( new Operator.Less() );
					}
				}
				break;
			case '^': this.m_tokenStack.push( new Operator.Xor() ); break;
			default: throw new Error( 'Unknown operator:\'' + ch + '\'' );
		} // switch

		this.m_lastToken = new Operator.OperatorBase();
		this.m_curIdx++;
	}

	Formula.prototype.__parseString = function ()
	{
		var num = 1;
		var pos = this.m_curIdx + 1;
		var ch;

		while ( pos < this.getSourceCode().length )
		{
			ch = this.charAt( pos );

			if ( ch == '"' )
				break;

			pos++;
		} // while

		this.m_lastToken = new Operand.OperandBase();
		this.m_tokenStack.push( new Operand.String( this.getSourceCode().substring( this.m_curIdx + 1, pos ) ) );
		this.m_curIdx = pos + 1;
	}

	Formula.prototype.__parseArguments = function ()
	{
		var num = 1;
		var pos = this.m_curIdx + 1;
		var ch;

		while ( pos < this.getSourceCode().length )
		{
			ch = this.charAt( pos );

			if ( ch == '(' )
			{
				num++;
			}
			else
			{
				if ( ch == ')' )
				{
					num--;

					if ( num == 0 )
						break;
				}
			}

			pos++;
		} // while

		var strArray = this.getSourceCode().substring( this.m_curIdx + 1, pos ).split( ',' );
		var args = [];

		for ( var i = 0; i < strArray.length; i++ )
		{
			if ( /s*(.*)s*/gi.exec( strArray[i] ) )
				args.push( RegExp.$1 );
		} // for

		var token = this.m_tokenStack.pop();
		var expArray = [];
		
		for ( var i = 0; i < args.length; i++ )
		{
			var exp = new Formula( args[i] );

			expArray.push( exp );
		}

		for ( var i = 0; i < expArray.length; i++ )
		{
			for ( var n = 0; n < expArray[i].getTokens().length; n++ )
			{
				this.m_tokenStack.push(expArray[i].getTokens()[n]);
			}
		}
		
		this.m_tokenStack.push( new Operand.Number( expArray.length ) );
		this.m_tokenStack.push( token );
		this.m_curIdx = pos + 1;
	}

	// Parse utilities 
	Formula.prototype.__parseParentheses = function ()
	{
		if ( this.m_lastToken instanceof Operator.FunctionBase )
		{
			this.__parseArguments();
		}
		else
		{
			if ( !( this.m_lastToken == null || this.m_lastToken instanceof Operator.OperatorBase ) )
			{
				throw new Error( 'Pos:' + this.m_curIdx + ': \'(\' should not appear here' );
			}

			var num = 1;
			var pos = this.m_curIdx + 1;
			var ch;

			while ( pos < this.getSourceCode().length )
			{
				ch = this.charAt( pos );

				if ( ch == '(' )
					num++;
				else
				{
					if ( ch == ')' )
					{
						num--;

						if ( num == 0 )
							break;
					}
				}

				pos++;
			} // while

			var lastToken = this.m_lastToken instanceof Operator.OperatorBase ? this.m_tokenStack.pop() : null;
			var exp = new Formula( '=' + this.getSourceCode().substring( this.m_curIdx + 1, pos ) );

			this.m_tokenStack = this.m_tokenStack.concat( exp.getTokens() );

			if ( lastToken != null )
				this.m_tokenStack.push( lastToken );

			this.m_curIdx = pos + 1;
			this.m_lastToken = new Operator.Parentheses();
		}
	}
} // with igame