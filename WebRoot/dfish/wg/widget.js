/*!
 *  widget
 *	@version	3.0
 *	@author		cmy
 *  @modified	2016-03-29
 */

var U, N = null, F = false, T = true, _STR = 'string', _FUN = 'function', _OBJ = 'object', _NUM = 'number', _BOL = 'boolean',
$   = require( 'dfish' ),
Q   = require( 'jquery' ),
Loc = require( 'loc' ),
br  = $.br,
ie  = br.ie,
ie7 = br.ie7,
cfg = $.x,
eve = $.abbr + '.e(this)',
evw = $.abbr + '.w(this)',
_dfopt	= cfg.default_option || {},
_number = $.number,
_slice  = Array.prototype.slice,
_putin  = { append: T, prepend: T, undefined: T },

// widget实例缓存
_all = {}, _viewCache = {}, _globalCache = $.globals,
// 引入dfish后会产生一个不可见的原始view，所有widget从这个view起始。调用 VM() 会返回这个view
_docView,
// @a -> htmlElement: 返回html元素对象所在的widget
// @a -> JSON: 参数为符合widget配置项的json对象，则创建这个widget
_widget = function( a ) {
	var b = typeof a === _STR ? a : a.id;
	if ( b && ( b = _getWidgetById( b ) ) )
		return b;
	if ( a.nodeType ) {
		do {
			if ( a.id && ( b = _getWidgetById( a.id ) ) )
				return b;
		} while ( (a = a.parentNode) && a.nodeType === 1 );
	} else
		return a.isWidget ? a : a.type ? new (require( a.type ))( a ) : N;
},
_getWidgetById = function( a ) {
	if ( a ) {
		if ( _all[ a ] )
			return _all[ a ];
		var b = a.indexOf( ':' );
		if ( b > 0 && ( b = a.slice( 0, b + 1 ) ) && _all[ b ] )
			return _all[ b ];
	}
},
_event_point = { clientX: 0, clientY: 0 },
// 鼠标点击时记录位置
_event_click = { click: T, contextmenu: T },
// 把mouseover和mouseout修为mouseenter和mouseleave的效果
_event_enter = {
	mouseover: function( a, e ) { return ! a.contains( e.fromElement ) },
	mouseout: function( a, e ) { return ! a.contains( e.toElement ) }
},
_event_stop = {
	contextmenu: function( e ) {
		if ( !(cfg.debug && e.ctrlKey) )
			$.stop( e );
	}
},
// 每次执行命令时都要记录事件发生的坐标
_eventRecord = function() {
	if( window.event && _event_click[ event.type ] )
		_event_point.clientX = event.clientX, _event_point.clientY = event.clientY;
},
// 触发事件的入口  /@ a -> element
_widgetEvent = function( a ) {
	var e = window.event || _widgetEvent.caller.arguments[ 0 ], // _widgetEvent.caller: 解决firefox下没有window.event的问题
		t = e.type;
	if ( ! _event_enter[ t ] || _event_enter[ t ]( a, e ) ) {
		e.elemId = a.id;
		if ( a = _widget( a ) ) {
			a.trigger( e );
		} else
			$.stop( e );
	}
	_event_stop[ t ] && _event_stop[ t ]( e );
},
// _view(), _view( '/' ) 返回docView
// _view( '/abc' ) 根据路径返回view
// _view( '#g' )   根据globalId返回view
_view = function( a ) {
	if ( ! a || a === '/' )
		return _docView;
	if ( a.type_view )
		return a;
	if ( a.ownerView )
		return a.ownerView;
	if ( typeof a === _STR ) {
		if ( a.indexOf( 'javascript:' ) === 0 )
			a = Function( a ).call( this );
		return a.charAt( 0 ) === '/' ? _viewCache[ a ] : a.charAt( 0 ) === '#' ? _globalCache[ a ] : (a = $.dialog( a )) && a.contentView;
	} else {
		return _vmByElem( a );
	}
	return _docView;
},
_vmByElem = function ( o ) {
	var p = _widget( o );
	if( p ) {
		while ( p && ! p.ownerView )
			p = p.parentNode;
		return p ? p.ownerView : ( ( p = _widget( o ).$() ) && _vmByElem( p.parentNode ) );
	}
},
_rangeEvents = function( a ) {
	for ( var i = 0, r = {}, j, k, v; i < arguments.length; i += 2 ) {
		k = arguments[ i ], r[ k ] = {}, v = [];
		for ( j = 1; j < i + 2; j += 2 )
			v.push.apply( v, arguments[ j ].split( ',' ) );
		for( j = 0; j < v.length; j ++ )
			r[ k ][ v[ j ] ] = T;
	}
	return r;
},
_range_events = _rangeEvents( 'all', 'mouseover,mouseout,mousedown,mouseup,mousemove,mousewheel,mouseenter,mouseleave,contextmenu,click,dblclick,drag,dragend,dragenter,dragleave,dragover,dragstart,drop,keydown,keypress,keyup,copy,cut,paste,scroll,select,selectstart,propertychange,paste,beforepaste',
	'input', 'focus,blur,input', 'option', 'change' ),
// 生成html事件属性 / @a -> context, s -> 指定要有的事件
_html_on = function( a, s ) {
	var s = s || '', n;
	if ( a.isWidget ) {
		var h = a.Const.Listener, r = _range_events[ h && h.range ] || _range_events.all;
		if ( a.x.on ) {
			for ( var i in a.x.on )
				s = _s_html_on( s, h && h.body, i, r );
		}
		if ( h && (h = h.body) ) {
			for ( var i in h ) {
				if ( h[ i ] && (typeof h[ i ].prop === _FUN ? h[ i ].prop.call( a ) : h[ i ].prop) )
					s = _s_html_on( s, h, i, r );
			}
		}
	} else {
		i = a.length;
		while ( i -- ) s += ' on' + a[ i ] + '=' + eve;
	}
	return s;
},
// 用于leaf, row 这样的多层次子节点
_html_on_child = function( a, s ) {
	var s = _html_on( a, s ), r = _range_events[ a.Const.Listener && a.Const.Listener.range ] || _range_events.all,
		e = a.nodeIndex > -1 && a.rootNode && a.rootNode.Const.Child === a.type && a.rootNode.x.pub && a.rootNode.x.pub.on;
	if ( e ) {
		for ( var i in e )
			s = _s_html_on( s, a.Const.Listener && a.Const.Listener.body, i, r );
	}
	return s;
},
_s_html_on = function( s, h, i, r ) {
	for ( var p = h && h[ i ] && h[ i ].proxy, k = p ? p.split( ' ' ) : [ i ], j = 0; j < k.length; j ++ ) {
		if ( s.indexOf( 'on' + k[ j ] + '=' ) < 0 && r[ k[ j ] ] )
			s += ' on' + k[ j ] + '=' + eve;
	}
	return s;
},
_html_cls = function( a ) {
	var p = a.parentNode,
		c = ( a.attr( 'scroll' ) ? ' f-scroll-wrap' : '' ) + ( a.className ? ' ' + a.className : '' ) + ( a.x.readonly || a.x.disabled ? ' z-ds' : '' ) + ( a.x.cls ? ' ' + a.x.cls.replace( /\./g, '' ) : '' );
	if ( p ) {
		if ( p.type_frame )
			c += ' f-sub-frame' + ( a === p.focusNode ? '-on' : '' );
		if ( p.childCls )
			c += ' ' + p.childCls;
	}
	return c;
},
_setView = function( a ) {
	if ( a && ! this.ownerView ) {
		this.ownerView = a;
		_regIdName.call( this, a );
		var i = this.length;
		while ( i -- ) _setView.call( this[ i ], a );
		if ( this.discNodes ) {
			for ( i in this.discNodes )
				_setView.call( this.discNodes[ i ], a );
		}
	}
},
_regIdName = function( a ) {
	if ( this.x.id )   a.widgets[ this.x.id ] = this;
	if ( this.x.name ) $.jsonArray( this, a.names, this.x.name );
},
_regWidget = function( x, p, n ) {
	p && p.addNode( this, n );
	x.gid && (_globalCache[ x.gid ] = this);
	_all[ $.uid( this ) ] = this;
	this.init_x( x );
},
_render = function( s, k ) {
	for ( var i = this.nodeIndex - 1, p = this.parentNode, l = p.length, c; i > -1; i -- )
		if ( (c = p[ i ]).$() ) return c.insertHTML( s, 'after' );
	for ( i = this.nodeIndex + (k || 1); i < l; i ++ )
		if ( (c = p[ i ]).$() ) return c.insertHTML( s, 'before' );
	p.insertHTML( s );
},
_jsf_cache = {},
// 解析并运行包含 "$属性名" 的js语法内容  /@a -> js, b -> arg array, c -> value array
_jsformat = function( a, b, c ) {
	if ( ! _jsf_cache[ a ] ) {
		var d = b.concat(), e = c.concat();
		if ( a.indexOf( '$' ) > -1 ) {
			var h = /\$(\w+)/g, k;
			while ( k = h.exec( a ) )
				d.push( k[ 0 ] ), e.push( k[ 1 ] );
		}
		_jsf_cache[ a ] = { hdl: Function( d.join( ',' ), a.indexOf( 'function' ) === 0 ? 'return(' + a + ').call(this)' : a ), fld: e };
	}
	for ( var i = c.length, x = this.x, f = _jsf_cache[ a ].fld, l = f.length; i < l; i ++ ) {
		c.push( (typeof x.data === _OBJ && (f[ i ] in x.data) ? x.data : x)[ f[ i ] ] );
	}
	return _jsf_cache[ a ].hdl.apply( this, c );
},
// 取得一个表单的值  /@ a -> input el, b -> url mode?
_f_val = function( a, b ) {
	var d = a.name, v = a.value;
	if ( ! d )
		return N;
	switch ( a.type ) {
		case 'checkbox':
			if ( ! a.checked && !(a.indeterminate && a.getAttribute( 'w-partialsubmit' )) )
				return N;
		break;
		case 'radio':
			if ( ! a.checked )
				return N;
			d = a.getAttribute( 'w-name' ) || d;
		break;
		case 'select-one':
			if ( a.selectedIndex < 0 )
				return N;
		break;
		case 'textarea':
			// ie7-8的换行是\r\n，如果在ie7-8编辑内容后，在谷歌上浏览，换行会变成两个，所以替换掉\r
			ie && (v = v.replace( /\\r\\n/g, '\n' ));
	}
	v && (v = $.strTrim( v ));
	return b ? ( d + '=' + $.urlEncode( v ) ) : { name: d, value : v };
},
//获取要提交数据的widget /@ a -> range
//如果以!开头，表示排除
_submitNames = function( a ) {
	if ( ! a )
		return this.names;
	var c = a.charAt( 0 ) === '!', r = {};
	if ( c )
		a = a.replace( /\!/g, '' );
	for ( var i = 0, a = a.split( ',' ), d = [], e; i < a.length; i ++ ) {
		( e = this.find( a[ i ] ) ) && d.push( e );
	}
	for ( var k in this.names ) {
		for ( var i = 0, f; i < d.length; i ++ ) {
			if ( e = this.names[ k ][ 0 ] ) {
				f = d[ i ].contains( e );
				( c ? !f : f ) && ( r[ k ] = T );
			}
		}
	}
	return r;
},
/*	beforesend 发送请求之前调用
 *	error      请求出错时调用。传入XMLHttpRequest对象，描述错误类型的字符串以及一个异常对象（如果有的话）
 *	success    请求之后调用。传入返回后的数据，以及包含成功代码的字符串。
 *	complete   请求完成之后调用这个函数，无论成功或失败。传入XMLHttpRequest对象，以及一个包含成功或错误代码的字符串。
 */// @x -> cmd object, a -> url args, t -> post data
_ajaxCmd = function( x, a, t ) {
	var u = x.src || x.action;
	if ( a )
		u = $.urlParse( u, a );
	if ( x.beforesend && $.fncall( x.beforesend, this, x ) === F )
		return;
	if ( t && x.data ) {
		if ( typeof x.data === _OBJ ) {
			if ( $.isArray( x.data ) ) {
				for ( var i = 0, l = x.data.length; i < l; i ++ )
					t += '&' + x.data[ i ].name + '=' + $.urlEncode( x.data[ i ].value );
			} else {
				for ( var i in x.data )
					t += '&' + i + '=' + $.urlEncode( x.data[ i ] );
			}
		} else
			t += '&' + x.data;
	}
	if ( x.loading )
		this.cmd( typeof x.loading === _OBJ ? $.extend( { type: 'loading' }, x.loading ) : { type: 'loading', text: x.loading } );
	this.trigger( 'lock' );
	_view( this ).ajax( u, function( v ) {
		x.loading && this.cmd( { type: 'loading', hide: T } );
		if ( ! this._disposed )
			this.exec( v, N, x.transfer );
		if ( ! this._disposed && x.success )
			$.fncall( x.success, this, v );
	}, this, x.sync, t || x.data, x.error, function( v ) {
		if ( ! this._disposed && x.complete )
			$.fncall( x.complete, this, v );
		if ( ! this._disposed )
			this.trigger( 'unlock' );
	} );
},
// @a -> widget, b -> frame focus?, c -> pos?
_scrollIntoView = function( a, b, c ) {
	if ( a ) {
		b && (Frame.focus( a ), Toggle.focus( a ));
		var s = Scroll.get( a );
		if ( s ) {
			s.scrollTop( a, c === U ? 'middle' : c );
			//s.scrollLeft( a, 'center' );
		}
	}
},
_cmd = function( x ) {
	var i = 0, e = x.path ? _view.call( this, x.path ) : this, l = x.nodes && x.nodes.length;
	if ( x.target )
		e = e && e.find( x.target );
	for ( ; i < l; i ++ )
		e && e.exec( x.nodes[ i ] );
},
_cmdHooks = {
	'cmd': function( x ) {
		if ( x.delay != N ) {
			var self = this;
			setTimeout( function() { _cmd.call( self, x ) }, x.delay * 1000 );
		} else
			_cmd.call( this, x );
	},
	'js': function( x, a ) {
		var c = '$0,$1,$2,$3,$4,$5,$6,$7,$8,$9';
		if ( a && a.length > 10 ) {
			for ( var i = 10; i < a.length; i ++ )
				c += ',$' + i;
		}
		return Function( c, x.text ).apply( this, a || [] );
	},
	'ajax': function( x, a ) {
		x.download ? $.download( x.src ) : _ajaxCmd.call( this, x, a );
	},
	'submit': function( x, a ) {
		if ( _view( this ).valid( x.validate, x.validaterange || x.range, x.validateeffect ) ) {
			var d = _view( this ).getPostData( x.range, ! x.download );
			x.download ? $.download( x.src, d ) : _ajaxCmd.call( this, x, a, d );
		}
	},
	'menu': function( x ) {
		return new Menu( x, this ).show();
	},
	'dialog': function( x, a ) {
		if ( typeof x.src === _STR )
			x.src = $.urlParse( x.src, a );
		x.title && (x.title = $.urlParse( x.title, a, N, T ));
		return new Dialog( x, this ).show();
	},
	'tip': function( x, a ) {
		if ( typeof x.src === _STR )
			x.src = $.urlParse( x.src, a );
		return new Tip( x, this ).show();
	},
	'loading': function( x, a ) {
		if ( x.hide ) {
			Loading.instance && Loading.instance.hide();
			delete Loading.instance;
		} else {
			return new Loading( x, this ).show();
		}
	},
	'alert': function( x, a ) {
		x.args = a;
		return new Alert( x, this ).show();
	},
	'confirm':  function( x, a ) {
		x.args = a;
		return new Confirm( x, this ).show();
	}
};
$.arrEach( 'before after prepend append replace remove'.split(' '), function( v, i ) {
	_cmdHooks[ v ] = function( a ) {
		var d = a.target || (i > 3 && a.node && a.node.id), e;
		if ( d ) {
			if ( e = _view( this ).find( d ) )
				e[ v ]( a.node || a.nodes );
			else if ( a.node && _cmdHooks[ a.node.type ] ) {
				(_view( this ).x.commands || (_view( this ).x.commands = {}))[ d ] = i === 5 ? N : a.node;
			}
		}
	}
} );

/* `widget`  最基础的widget类，所有widget都继承它 **/
var
W = define( 'widget', function() {
	return $.createClass( {
	// @x -> 配置参数, p -> parentNode, n -> number/name
	Const: function( x, p, n ) {
		_regWidget.call( this, x, p, n );
		p && _setView.call( this, _view( p ) );
		this.init_nodes( x );
		this._instanced = T;
	},
	Helper : {
		all: _all,
		get: _widget,
		vm:  _view,
		fire: _widgetEvent,
		html_on: _html_on,
		html_on_child: _html_on_child,
		html_cls: _html_cls,
		scrollIntoView: _scrollIntoView,
		isCmd: function( a ) { return a && _cmdHooks[ a.type ] }
	},
	Extend: [ $.Event, $.Node ],
	Prototype: {
		// 据此变量把widget实例和json对象区别开
		isWidget: T,
		// 生成html时使用的样式名
		className: '',
		// html标签名
		tagName: 'div',
		// 获取 DOM 元素
		$: function( a ) {
			return document.getElementById( a == N ? this.id : this.id + a );
		},
		// @private: 初始化配置参数
		init_x: function( x ) {
			this.x = x;
			var n;
			//(r = this.Const.Rooter) && (n = this.rootNode) && this.nodeIndex !== -1 && r === n.type && (n = n.x.pub) && $.extendDeep( x, n );
			this.Const.Rooter && (n = this.rootNode) && this.nodeIndex !== -1 && (n = n.x.pub) && $.extendDeep( x, n );
			_dfopt[ this.type ] && $.extendDeep( x, _dfopt[ this.type ] );
		},
		// @private: 初始化子节点
		init_nodes: function( x ) {
			var c = this.x_nodes();
			if ( c ) {
				for ( var j = 0, l = c.length; j < l; j ++ )
					this.parse( c[ j ] );
			} else if ( x.node )
				this.parse( x.node );
		},
		// 改变默认设置 @a -> key
		defaults: function( a ) {
			if ( typeof a === _STR ) {
				var d = this.defaultHooks || this.Const.Default;
				return d && d[ a ];
			}
			this.defaultHooks = $.extend( a, this.Const.Default, this.defaultHooks );
		},
		// @private: 返回子节点配置项的集合
		x_nodes: function() {
			return this.x.nodes;
		},
		// @private: 解析子节点配置项，获取需要的type
		x_type: function( t, n ) {
			return n === -1 ? t : this.Const.Child || t;
		},
		// @private: 解析并生成子节点
		parse: function( x, n ) {
			return new (require( this.x_type( x.type, n ) ))( x, this, n );
			/*try {
				return new (require( this.x_type( x.type, n ) ))( x, this, n );
			} catch( ex ) {
				$.msg( Loc.ps( Loc.debug.widget_parse_error, $.jsonString( x ) ) );
				console.log( ex );
			}*/
		},
		// 增加一个子节点 /@ a -> widget option, n -> nodeIndex?, g -> default widget option(附加的默认选项)?
		add: function( a, n, g ) {
			if ( a.isWidget ) {
				( a.type_view ? _setParent : _setView ).call( a, _view( this ) );
				g && a.attr( g );
				return this.addNode( a, n );
			}
			g && (a = $.extend( {}, a, g ));
			// 离散节点直接调用
			return this.parse( a, n );
		},
		// 读/写属性
		attr: function( a, b ) {
			if ( b !== U ) {
				var c = this.x[ a ];
				this.x[ a ] = b;
				this.attrSetter && this.attrSetter( a, b );
			} else if ( typeof a === _STR ) {
				var c = this.x[ a ];
				if ( c != N )
					return typeof c === _STR && c.indexOf( 'javascript:' ) === 0 ? Function( c ).call( this ) : c;
				return this.defaults( a );
			} else { /* typeof a === 'object' */
				$.merge( this.x, a );
				for ( b in a ) this.attr( b, a[ b ] );
			}
		},
		addClass: function( a ) {
			this.$() ? $.classAdd( this.$(), a ) : (this.x.cls = (this.x.cls || '')  + ' ' + a);
		},
		removeClass: function( a ) {
			this.$() ? $.classRemove( this.$(), a ) : (this.x.cls = (this.x.cls || '')  + ' ' + a);
		},
		hasClass: function( a ) {
			return $.classAny( this.$() || this.x.cls || '', a );
		},
		css: function( a, b ) {
			$.css( this.$(), a, b );
		},
		// 获取第几个子节点
		get: function( a ) {
			return a == N ? _slice.call( this ) : a < 0 ? this[ this.length + a ] : this[ a ];
		},
		// 查找符合条件的祖先元素
		// a -> string: 根据type查找
		// a -> json:   符合所有条件则返回
		// a -> function 返回true则返回
		closest: function( a ) {
			var p = this, b = typeof a;
			while ( p ) {
				if ( b === _STR ) {
					if ( p.type === a )
						return p;
				} else if ( b === _FUN ) {
					if ( a.call( p, this ) === T )
						return p;
				} else if ( b === _OBJ ) {
					var i, r = T;
					for ( i in a ) {
						if ( p.x[ i ] !== a[ i ] ) {
							r = F;
							break;
						}
					}
					if ( r )
						return p;
				}
				if ( p.parentNode ) {
					p = p.parentNode;
				} else if ( p.type !== 'view' && p.$() ) {
					if ( ! ( p = _widget( p.$().parentNode ) ) )
						return;
				} else
					return;
			}
		},
		click: function() {
			this.trigger( 'click' );
		},
		// 获取下一个兄弟节点
		next: function() {
			 return this.parentNode && this.parentNode[ this.nodeIndex + 1 ];
		},
		// 获取上一个兄弟节点
		prev: function() {
			 return this.parentNode && this.parentNode[ this.nodeIndex - 1 ];
		},
		// 执行命令 /@a -> cmd id, arg1, arg2,...argN
		cmd: function( a ) {
			return this.exec( a, arguments.length > 1 ? _slice.call( arguments, 1 ) : N );
		},
		// 执行命令 /@a -> id[string/object], b -> args[array], c -> feature
		exec: function( a, b, c ) {
			var self = this._disposed ? this.ownerView : this;
			if ( ! self || self._disposed )
				return;
			if ( typeof a === _STR ) {
				var e = _view( self ).x.commands;
				if ( e && ( e = e[ a ] ) )
					a = $.jsonClone( e );
				else {
					$.msg( Loc.ps( Loc.debug.no_command, a, _view( self ).path ) ); // 没有找到命令
					return;
				}
			}
			if ( a ) {
				if ( c )
					a = $.merge( {}, a, c );
				if ( _cmdHooks[ a.type ] ) {
					_dfopt[ a.type] && $.extendDeep( a, _dfopt[ a.type] );
					_eventRecord();
					return _cmdHooks[ a.type ].call( self, a, b );
				}
			}
		},
		find: function( a ) {
			var b = this.ownerView.find( a );
			if ( b && (this.contains( b ) || (this.$() && (b = $.get( '[w-id="' + a + '"]', this.$() )) && (b = _widget( b )))) )
				return b;
		},
		// 是否包含某wg或元素 /@a -> elem|widget, b -> strict mode?
		contains: function( a, b ) {
			if ( a == N )
				return;
			if ( a.isWidget ) {
				if ( a.$() && this.$() && this.$().contains( a.$() ) )
					return T;
				if ( ! b ) {
					do { if ( a === this ) return T } while ( a = a.parentNode );
				}
			} else {
				if ( this.$() && this.$().contains( a ) )
					return T;
				return ! b && this.contains( _widget( a ) );
			}
		},
		// 存取临时变量
		data: function( a, b ) {
			var c = this.x.data || (this.x.data = {});
			return b === U ? c[ a ] : ( c[ a ] = b );
		},
		// 显示或隐藏
		display: function( a ) {
			var b = a == N || ( a.isWidget ? a.x.open : a ), o = this.$();
			if ( o.tagName === 'TR' ) {
				$.classAdd( o, 'f-none', ! b );
			} else {
				if ( ! this._disp )
					this._disp = o.currentStyle.display;
				o.style.display = b ? (this._disp === 'none' ? 'block' : this._disp) : 'none';
			}
			a.isWidget && (b ? o.removeAttribute( 'w-toggle' ) : o.setAttribute( 'w-toggle', a.id ));
		},
		// 触发用户定义的事件 / @e -> event, @a -> [args]?, f -> func string?
		triggerHandler: function( e, a, f ) {
			var t = e.jobType || e.type || e,
				f = f || (this.x.on && this.x.on[ t ]);
			if ( f ) {
				var g = [ 'event' ], r = [ e ];
				return typeof f === _STR ? _jsformat.call( this, f, g, r ) : ( typeof f === _FUN ? f : Function( g[ 0 ], f ) ).apply( this, arguments.length > 1 ? r.concat( a ) : r );
			}
		},
		// 触发系统事件
		triggerListener: function( e, a ) {
			if ( this._disposed )
				return;
			var b = this.Const.Listener,
				t = e.jobType || e.type || e,
				h = b && b.body[ t ],
				g = arguments.length > 1 ? [ e ].concat( a ) : [ e ],
				f = h && (h.method || h);
				if ( typeof f === _FUN && f.apply( this, g ) === F )
					return F;
		},
		// 触发用户定义的事件和系统事件 / @e -> event, @a -> [data]
		// 优先返回用户事件的返回值，其次返回系统事件的值
		trigger: function( e, a ) {
			if ( this._disposed )
				return;
			var b = this.Const.Listener,
				c = this.Const.ListenerProxy,
				t = e.jobType || e.type || e,
				h = b && b.body[ t ],
				g = arguments.length > 1 ? [ e ].concat( a ) : [ e ],
				f = h && (h.method || h),
				r, s;
			if ( b && b.block && b.block.call( this, e ) )
				return;
			if ( c = c && c[ t ] ) {
				for ( var j in c ) {
					var n = new Q.Event( e.type || e, e );
					n.jobType = j;
					this.trigger( n, a );
				}
			}
			if ( _userPriority[ t ] ) { // 用户事件优先执行
				if ( ! ( h && h.block && h.block.call( this, e ) ) && (r = this.triggerHandler( e, a )) === F )
					return F;
				if ( this._disposed )
					return;
				this.fireEvent( e, a );
				if ( typeof f === _FUN )
					s = f.apply( this, g );
				if ( ! r )
					r = s;
			} else { // 系统事件优先
				this.fireEvent( e, a );
				if ( typeof f === _FUN && ( s = f.apply( this, g ) ) === F )
					return F;
				if ( ! ( h && h.block && h.block.call( this, e ) ) )
					r = this.triggerHandler( e, a );
				if ( ! r )
					r = s;
			}
			return r;
		},
		// 递归所有子节点触发事件
		triggerAll: function( e ) {
			this.trigger( e );
			for ( var i = 0, l = this.length; i < l; i ++ )
				this[ i ].triggerAll( e );
			for ( i in this.discNodes )
				! this.discNodes[ i ].isDialogWidget && this.discNodes[ i ].triggerAll( e ); // 弹窗不触发来自父节点的递归事件
		},
		// 实现兄弟节点的tab效果 /@ a -> true/false
		tabFocus: function( a, b ) {
			if ( ! this._disposed ) {
				var p = this.rootNode || this.parentNode, f = p.focusNode;
				if ( a == N || a ) {
					f && f !== this && f.tabFocus( F );
					this.$() && $.classAdd( this.$(), b || 'z-on' );
					p.focusNode = this;
					this.focusOwner = p;
				} else {
					if ( f === this ) {
						this.$() && $.classRemove( this.$(), b || 'z-on' );
						delete p.focusNode; delete this.focusOwner;
					}
				}
			}
		},
		// 调整大小
		resize: function( w, h ) {
			if ( w != N && typeof w === _OBJ ) {
				h = w.height, w = w.width;
			}
			if ( w != N )
				_w_size.width.call( this, w );
			if ( h != N )
				_w_size.height.call( this, h );
			if ( w != N || h != N ) {
				delete this._scales;
				for ( var i = 0, l = this.length; i < l; i ++ )
					_w_rsz_all.call( this[ i ] );
				this.trigger( 'resize' );
			}
		},
		// 替换为另一个widget /@ a -> widget option
		replace: function( a ) {
			if ( this._disposed )
				return;
			if ( a.type !== this.type && ( this.type === 'hidden' || a.type === 'hidden' ) )
				return $.msg( Loc.ps( Loc.debug.hidden_replace, this.x.name ) );
			var p = this.parentNode, i = this.nodeIndex, o = this.focusOwner;
			if ( ! a.isWidget ) {
				a.width == N && (a.width = this.x.width);
				a.height == N && (a.height = this.x.height);
			}
			var e = this.$();
			this.dispose();
			var g = p.add( a, i );
			o && (g.focusOwner = o, o.focusNode = g);
			g.render( e, 'replace' );
			this.removeElem();
			return g;
		},
		// 清空子节点
		empty: function() {
			var i = this.length;
			while ( i -- )
				this[ i ].remove();
		},
		// 生成页面可见的 DOM 元素  /@a -> target elem, b -> method[append|prepend|before|after|replace]
		render: function( a, b ) {
			// 没有父节点 则先加上父节点
			if ( ! this.parentNode ) {
				( ( a && _widget( a ) ) || _docView ).add( this );
			}
			var s = this.html();
			if ( this.$() && ! a )
				$.replace( this.$(), s );
			else
				a ? $[ b || 'append' ]( a || document.body, s ) : _render.call( this, s );
			this.trigger( 'render' );
			this.triggerAll( 'ready' );
			this.parentNode.trigger( 'nodechange' );
			return this;
		},
		// @dao 通过js增加子节点时会调用此方法 / a -> html|widget, b -> where(prepend|append|before|after)
		insertHTML: function( a, b ) {
			this.$() && $[ b || 'append' ]( this.$(), a.isWidget ? a.$() : a );
		},
		html_nodes: function() {
			for ( var i = 0, l = this.length, s = []; i < l; i ++ )
				s.push( this[ i ].html() );
			return s.join( '' );
		},
		html_prop: function() {
			var b = ' w-type="' + this.type + '" id=' + this.id,
				v, t = this.cssText || '', n = this.Const.Listener;
			if ( this.x.id )
				b += ' w-id="' + this.x.id + '"';
			if ( ( v = this.innerWidth() ) != N )
				t += 'width:' + v + 'px;';
			if ( ( v = this.innerHeight() ) != N )
				t += 'height:' + v + 'px;';
			if ( this.x.minwidth && (v = this.innerWidth( 'min' )) )
				t += 'min-width:' + v + 'px;';
			if ( this.x.minwidth && (v = this.innerWidth( 'max' )) )
				t += 'min-width:' + v + 'px;';
			if ( this.x.minheight && (v = this.innerHeight( 'min' )) )
				t += 'min-height:' + v + 'px;';
			if ( this.x.maxheight && (v = this.innerHeight( 'max' )) )
				t += 'min-height:' + v + 'px;';
			if ( this.x.style )
				t += this.x.style;
			if ( t )
				b += ' style="' + t + '"';
			if ( ! (n && n.tag) && (this.x.on || n) )
				b += _html_on( this );
			if ( v = _html_cls( this ) )
				b += ' class="' + v + '"';
			if ( this.x.align )
				b += ' align=' + this.x.align;
			if ( this.property )
				b += this.property;
			return b;
		},
		html_before: function() {
			return this.x.beforecontent ? this.html_after( this.x.beforecontent ) : '';
		},
		html_after: function( a ) {
			if ( a || (a = this.x.aftercontent) ) {
				if ( (typeof a === _FUN && (a = a.toString())) || a.indexOf( 'javascript:' ) === 0 )
					a = _jsformat.call( this, a, [], [] );
				if ( typeof a === _OBJ )
					a = this.add( a, -1 ).html();
			}
			return a || '';
		},
		html: function() {
			return '<' + this.tagName + this.html_prop() + '>' + this.html_before() + this.html_nodes() + this.html_after() + '</' + this.tagName + '>';
		},
		removeElem: function( a ) {
			$.remove( this.$( a ) );
		},
		remove: function() {
			this.removeElem();
			var p = this.parentNode;
			this.dispose();
			if ( p ) {
				var s = p.type_horz ? 'width' : 'height';
				p[ 0 ] && (p.type_horz || p.type_vert) && _w_size[ s ].call( p[ 0 ], p[ 0 ].x[ s ] );
				p.trigger( 'nodechange' );
			}
		},
		dispose: function( d ) {
			if ( ! this._disposed ) {
				this.trigger( 'remove' );
				var i = this.length;
				while ( i -- )
					this[ i ].dispose( T );
				for ( i in this.discNodes ) {
					this.discNodes[ i ].dispose( T );
					delete this.discNodes[ i ]; delete this[ i ];
				}
				if ( this.focusOwner ) {
					delete this.focusOwner.focusNode; delete this.focusOwner;
				}
				if ( this.ownerView ) {
					if ( this.x.id )
						delete this.ownerView.widgets[ this.x.id ];
					if ( this.x.name && this.ownerView.names[ this.x.name ] )
						$.arrPop( this.ownerView.names[ this.x.name ], this );
				}
				if ( this.parentNode ) {
					delete this.parentNode._scales;
				}
				if ( ! d ) {
					this.removeEvent();
					this.removeNode();
				}
				if ( this.x.gid && _globalCache[ this.x.gid ] === this )
					delete _globalCache[ this.x.gid ];
				this._disposed = T;
				delete _all[ this.id ];
			}
		}
	}
	} );
} ),

_proto   = W.prototype,
_w_scale = {},
_w_size  = {},
_w_css   = {},
_w_mix   = {},
_w_lay   = {},
// 兄弟节点是否需要调整大小
_w_bro   = { 'width': 'type_horz', 'height': 'type_vert' },
_w_rsz_all = function() {
	_w_css.width.call( this );
	_w_css.height.call( this );
	var l = this.length;
	if ( l ) {
		delete this._scales;
		for ( var i = 0; i < l; i ++ )
			_w_rsz_all.call( this[ i ] );
	}
	for ( i in this.discNodes )
		_w_rsz_all.call( this.discNodes[ i ] );
	this.trigger( 'resize' );
},
_w_rsz_layout = function() {
	delete this._scales;
	for ( var i = 0, l = this.length; i < l; i ++ )
		_w_rsz_all.call( this[ i ] );	
},
// widget配置项里设置了style，又没有设置wmin和hmin，则由系统解析style，获取wmin和hmin的值
// 如果设置了cls，而cls里有 padding margin border 等，就需要人工计算并设置wmin和hmin
//@ _c -> cls, _1 -> style, _2 -> wmin, _3 = hmin
_size_fix = function( _c, _1, _2, _3 ) {
	var m, p, d, _2 = _2 == N ? 0 : _2, _3 = _3 == N ? 0 : _3, r = cfg.border_cls_regexp, o = cfg.border_cls_only;
	if ( _c && r && r.test( _c ) ) {
		if ( o && ($.idsAny( _c, o.top, ' ' ) || $.idsAny( _c, o.bottom, ' ' )) )
			_3 = 1;
		else if( o && ($.idsAny( _c, o.left, ' ' ) || $.idsAny( _c, o.right, ' ' )) )
			_2 = 1;
		else
			_2 = _3 = 2;
	}
	if ( _1 && ( _1.indexOf( 'margin' ) > -1 || _1.indexOf( 'padding' ) > -1 || _1.indexOf( 'border' ) > -1 ) ) {
		for ( var i = 0, c = _1.split( ';' ), k; i < c.length; i ++ ) {
			e = $.strTrim( c[ i ] ).toLowerCase().split( /\s*:\s*/ );
			if ( e.length !== 2 ) continue;
			k = e[ 0 ].indexOf( 'margin' ) === 0;
			if ( k || e[ 0 ].indexOf( 'padding' ) === 0 ) {
				if ( ! m ) m = {};
				if ( ! p ) p = {};
				k = k ? m : p;
				if ( f = $.strFrom( e[ 0 ], '-' ) )
					k[ f ] = _number( e[ 1 ] );
				else {
					f = e[ 1 ].split( /\s* \s*/ );
					k.top    = _number( f[ 0 ] );
					k.right  = _number( f.length > 1 ? f[ 1 ] : f[ 0 ] );
					k.bottom = _number( f.length > 2 ? f[ 2 ] : f[ 0 ] );
					k.left   = _number( f.length > 3 ? f[ 3 ] : k.right );
				}
			} else if ( e[ 0 ].indexOf( 'border' ) === 0 ) {
				if ( ! d ) d = {};
				if ( e[ 0 ] === 'border' ) {
					var r = e[ 1 ].match( /\d+(?:px|pt:em)/ );
					if ( r ) d.top = d.right = d.bottom = d.left = _number( r[ 0 ] );
				} else if ( e[ 0 ] === 'border-width' ) {
					f = e[ 1 ].split( /\s* \s*/ );
					d.top    = _number( f[ 0 ] );
					d.right  = _number( f[ 1 ] || f[ 0 ] );
					d.bottom = _number( f[ 2 ] || f[ 0 ] );
					d.left   = _number( f[ 3 ] || f[ 1 ] || f[ 0 ] );
				} else if ( e[ 0 ].indexOf( 'width' ) > 0 ) {
					d[ e[ 0 ].split( '-' )[ 1 ] ] = _number( e[ 1 ] );
				} else {
					var r = e[ 1 ].match( /\d+(?:px|pt:em)/ );
					if ( r ) {
						if ( e[ 0 ] === 'border' )
							d.top = d.right = d.bottom = d.left = _number( r[ 0 ] );
						else
							d[ e[ 0 ].split( '-' )[ 1 ] ] = _number( r[ 0 ] );
					}
				}
			}
		}
		if ( d ) {
			var t = _3 ? ( d.top || 1 )    : ( d.top || 0 ),
				o = _3 ? ( d.bottom || 1 ) : ( d.bottom || 0 ),
				l = _2 ? ( d.left || 1 )   : ( d.left || 0 ),
				r = _2 ? ( d.right || 1 )  : ( d.right || 0 );
			_2 = l + r;
			_3 = t + o;
		}
		if ( m ) {
			if ( m.left )   _2 += m.left;
			if ( m.right )  _2 += m.right;
			if ( m.top )    _3 += m.top;
			if ( m.bottom ) _3 += m.bottom;
		}
		if ( p ) {
			if ( p.left )   _2 += p.left;
			if ( p.right )  _2 += p.right;
			if ( p.top )    _3 += p.top;
			if ( p.bottom ) _3 += p.bottom;
		}
	}
	return { wmin: _2, hmin: _3 };
};
$.arrEach( [ 'width', 'height' ], function( v, j ) {
	var c = v.charAt( 0 ),
		y = "__" + v,   // __width, __height
		z = c.toUpperCase() + v.slice( 1 ),
		iu = c + 'min', // wmin, hmin
		nv = 'min' + v,
		xv = 'max' + v,
		rv = "__runtime_" + v,   // __width, __height
		sz = 'scale' + z,	// scaleWidth, scaleHeight	为子元素分配大小
		oz = 'outer' + z,	// outerWidth, outerHeight  整体所占空间, 相当于 offset + margin
		iz = 'inner' + z;	// innerWidth, innerHeight	内部可用空间, 并为当前元素的style.width/style.height提供值

	// 实现 wg.width(), wg.height()
	// 返回为null时，去获取元素的offsetWidth/offsetHeight
	_proto[ v ] = function( a ) {
		if ( a == N ) {
			var b = this[ oz ]();
			return b == N && this.$() ? this.$()[ 'offset' + z ] : b;
		} else {
			v === 'width' ? this.resize( a ) : this.resize( N, a );
		}
	};
	_proto[ oz ] = function( m ) {
		// @fixme: 如果在构造函数Const里调用 .width() 和 .height(), 会因为兄弟节点还没加载完成而计算出错，因此添加_instanced参数做控制，当兄弟节点全部加载完成时才能调用.width 和 .height。
		// 		   这是暂时的解决办法。之后的优化目标是在Const里可以获取高宽。
		if ( ! this._instanced ) { return N; }
		if ( y in this && (! m) ) {
			return this[ y ];
		}
		var r = this.parentNode[ sz ]( this, m );
		return this.parentNode._instanced && ! m ? (this[ y ] = r) : r;
	};
	_w_size[ v ] = function( a ) {
		if ( (v in this.x) || v != N )
			this.x[ v ] = a;
		var p = this.parentNode;
		if ( p ) {
			delete p._scales;
			if ( p[ _w_bro[ v ] ] ) {
				for ( var i = 0; i < p.length; i ++ ) {
					p[ i ] !== this && _w_rsz_all.call( p[ i ] );
				}
			}
		}
		_w_css[ v ].call( this );
	};
	_w_css[ v ] = function() {
		var t = this[ y ], a = this.attr( v );
		if ( t !== U || a ) {
			delete this[ y ];
			if ( t != this[ oz ]() ) {
				t = this[ iz ]();
				this.$() && (this.$().style[ v ] = t == N ? 'auto' : t + 'px');
			}
		}
		if ( this.x[ nv ] ) {
			t = this[ iz ]( 'min' );
			this.$() && (this.$().style[ 'min' + z ] = t == N ? 'auto' : t + 'px');
		}
		if ( this.x[ xv ] ) {
			t = this[ iz ]( 'max' );
			this.$() && (this.$().style[ 'max' + z ] = t == N ? 'auto' : t + 'px');
		}
	};
	//.innerWidth, .innerHeight
	_proto[ iz ] = function( m ) {
		var a = this[ oz ]( m );
		if ( a == N )
			return a;
		// 如果用户定义了样式且没有设置wmin和hmin，则使用系统预设的样式处理机制
		if ( ( this.x.cls || this.x.style ) && this.attr( 'wmin' ) == N && this.attr( 'hmin' ) == N ) {
			var f = _size_fix( this.x.cls, this.x.style );
			if ( f )
				return a - (f[ iu ] || 0);
		}
		return a - (this.attr( iu ) || 0);
	};
	// scaleWidth, scaleHeight 默认的分配给子元素高宽的方法 /@a -> widget, m -> max, min
	_proto[ sz ] = function( a, m ) {
		if ( a == N )
			return N;
		var b = a.isWidget ? a.attr( v ) : a;
		if ( b && ! isNaN( b ) )
			b = parseFloat( b );
		if ( typeof b === _NUM && ! m )
			return b < 0 ? N : b;
		var c = this[ iz ]();
		if ( c != N && typeof b === _STR && b.indexOf( '%' ) > 0 )
			c = Math.floor( c * parseFloat( b ) / 100 );
		return c == N ? N : a.isWidget ? $.scaleRange( c, { min: a.attr( nv ), max: a.attr( xv ) } ) : c;
	};
	// 根据子元素各自设置的比例，统一计算后进行高宽分配 /@a -> widget, m -> max, min
	_w_scale[ v ] = function( a, m ) {
		var b = a.attr( v ), c = this[ iz ](), s = this._scales;
		if ( typeof b === _NUM && b > -1 && ! m )
			return b;
		if ( ! s || m ) {
			if ( ! this.length )
				return N;
			for ( var i = 0, d, e, f, n, x, r = [], l = this.length; i < l; i ++ ) {
				d = this[ i ][ rv ] ? this[ i ][ v ]() : this[ i ].attr( v ), e = (d == N || d < 0) && ! this[ _w_bro[ v ] ] ? '*' : d, n = this[ i ].attr( nv ), x = this[ i ].attr( xv );
				r.push( { value: (m && (m === 'min' ? n : x)) || e, min: n, max: x } );
			}
			s = $.scale( c, r );
		}
		! m && (this._scales = s);
		r = s[ a.nodeIndex ];
		r == N && (r = a.defaults( v ));
		return r < 0 ? N : r;
	};
	_w_lay[ v ] = function( a ) {
		for ( var i = 0, h, f, d; i < a.length; i ++ ) {
			h = a[ i ].attr( v );
			if( h < 0 || h == N ) f = T;
			else if ( h && isNaN( h ) ) d = a[ i ];
			if ( f && d ) {
				_w_mix[ v ]( d );
				break;
			}
		}
	};
	_w_mix[ v ] = function( a ) {
		a.addEvent( 'ready', function() {
			var p = this.parentNode;
			delete p._scales;
			for ( var i = 0, d; i < p.length; i ++ ) {
				d = p[ i ].x[ v ];
				if ( d < 0 || d == N ) {
					p[ i ][ rv ] = T;
					delete p[ i ].x[ v ];
				}
			}
			_w_rsz_layout.call( p );
		} ).parentNode.addEvent( 'resize', _w_rsz_layout );
	};
} );
// 实现方法： wg.append(), wg.prepend(), wg.before, wg.after()
$.arrEach( 'prepend append before after'.split(' '), function( v, j ) {
	_proto[ v ] = function( a ) {
		if ( typeof a === _STR )
			return this.insertHTML( a, v );
		a = $.arrMake( a );
		var q, i;
		if ( a[ 0 ].isWidget ) {
			if ( a[ 0 ] === this )
				return this;
			for ( q = a[ 0 ].parentNode, i = 0; i < a.length; i ++ )
				a[ 0 ].removeNode( T );
			q = q[ 0 ];
		}
		var i = j === 3 ? this.nodeIndex + 1 : j === 2 ? this.nodeIndex : j === 1 ? this.length : 0, d = this.nodeIndex > -1,
			p = j > 1 ? this.parentNode : this, l = a.length, k = 0, s = p.type_horz ? 'width' : 'height', r = [];
		for ( ; k < l; k ++ )
			r.push( p.add( a[ k ], d || j < 2 ? i + k : -1 ) );
		if ( this.$() ) {
			if ( a[ 0 ].isWidget && a[ 0 ].$() ) {
				for ( k = 0; k < l; k ++ )
					this.insertHTML( a[ k ], v );
			} else {
				for ( k = 0, s = ''; k < l; k ++ )
					s += r[ k ].html();
				this.insertHTML( s, v );
				for ( k = 0; k < l; k ++ )
					r[ k ].trigger( 'render' ), r[ k ].triggerAll( 'ready' );
			}
		}
		d && (((k = {})[ s ] = r[ 0 ].x[ s ]), r[ 0 ].resize( k ));
		d && q && (((k = {})[ s ] = q.x[ s ]), q.resize( k ));
		p.trigger( 'nodechange' );
		return p[ i ];
	}
} );
// scroll helper
var _html_resize_sensor = function( w, h ) {
	var e = '', s = '';
	if ( w != N ) {
		e += 'width:' + w + 'px;';
		s += 'width:200%;';
	}
	if ( h != N ) {
		e += 'height:' + h + 'px;';
		s += 'height:200%;';
	}
	return '<div id=' + this.id + 'rsz class=f-resize-sensor><div class=f-resize-sensor-expand><div class=f-resize-sensor-expand-core></div></div><div class=f-resize-sensor-shrink><div class=f-resize-sensor-shrink-core></div></div></div>'
},
_reset_resize_sensor = function() {
	var b = this.$( 'rsz' ).children, i = b.length,
		w = this.$( 'ovf' ).scrollWidth, h = this.$( 'cont' ).offsetHeight;
	if ( this._scr_wd !== w || this._scr_ht !== h ) {
		b[ 0 ].firstChild.style.width  = w + 'px';
		b[ 0 ].firstChild.style.height = h + 'px';
		while ( i -- ) {
			b[ i ].scrollTop = b[ i ].offsetHeight;
			b[ i ].scrollLeft = b[ i ].scrollWidth;
			if ( ! this._scr_ready )
				_bind_resize_sensor.call( this, b[ i ] );
		}
		if ( this._scr_wd === U )
			_show_scroll.call( this );
		this._scr_wd = w;
		this._scr_ht = h;
		return T;
	}
},
_bind_resize_sensor = function( a ) {
	var c = this._scr_check;
	setTimeout( function() { a.onscroll = c } );
},
_show_scroll = function() {
	if ( this._scr_usable && this.$() ) {
		var b = ie7 ? br.scroll : 0,
			c = this.innerHeight(),
			d = this.$( 'cont' ).offsetHeight || this.$( 'gut' ).scrollHeight,
			e = Math.min( 1, c / d ),
			f = this.innerWidth(),
			g = this.$( 'ovf' ).scrollWidth - b,
			h = Math.min( 1, f / g );
		this.$( 'y' ).style.display  = e < 1 ? 'block' : '';
		this.$( 'x' ).style.display  = h < 1 ? 'block' : '';
		this.$( 'ytr' ).style.height = Math.max( 14, c * e ) + 'px';
		this.$( 'xtr' ).style.width  = Math.max( 14, f * h ) + 'px';
		this._scr_rateY = e < 1 && (( d - c ) / ( this.$( 'y' ).offsetHeight - this.$( 'ytr' ).offsetHeight ));
		this._scr_rateX = h < 1 && (( g - f + b ) / ( this.$( 'x' ).offsetWidth - this.$( 'xtr' ).offsetWidth ));
		this.trigger( 'scroll' );
	}
},
_html_scroll = function( s ) {
	this._scr_usable = T;
	return '<div id=' + this.id + 'tank class=f-scroll-tank><div id=' + this.id + 'ovf class=f-scroll-overflow style="width:' + ( this.innerWidth() + br.scroll ) + 'px;height:' + ( this.innerHeight() + br.scroll ) +
		'px;" onscroll=' + eve + '><div id=' + this.id + 'gut' + (ie7 ? '' : ' class=f-rel') + '><div id=' + this.id + 'cont>' + ( s || '' ) + '</div><div id=' + this.id +
		'rsz class=f-resize-sensor><div class=f-resize-sensor-expand><div class=f-resize-sensor-expand-core></div></div><div class=f-resize-sensor-shrink><div class=f-resize-sensor-shrink-core></div></div></div></div></div></div><div id=' +
		this.id + 'y class=f-scroll-y><div id=' + this.id + 'ytr class=f-scroll-y-track onmousedown=' + evw + '.scrollDragY(this,event)></div></div><div id=' +
		this.id + 'x class=f-scroll-x><div id=' + this.id + 'xtr class=f-scroll-x-track onmousedown=' + evw + '.scrollDragX(this,event)></div></div>'
},
_wrap_scroll = function() {
	if ( ! this._scr_usable && this.$() ) {
		var a = $.frag( this.$() );
		$.append( this.$(), _html_scroll.call( this ) );
		$.append( this.$( 'cont' ), a );
		this.$( 'bg' ) && $.prepend( this.$(), this.$( 'bg' ) );
	}
},
/* `Scroll` */
/* 目前需要高度和宽度都有，才有滚动条 */
Scroll = define.widget( 'scroll', {
	Helper: {
		// 获取某个 widget 所在的有 scroll 的面板 / a -> widget|elem
		get: function( a ) {
			return _widget( a ).closest( function() { return this.isScrollable && this.isScrollable() } );
		}
	},
	Listener: {
		body: {
			ready: function() {
				// widget的dom可能会被业务重新生成，需要重置相关变量
				delete this._scr_ready; delete this._scr_wd; delete this._scr_ht;
			},
			mouseover: {
				prop: T,
				method: function() {
					if ( this._scr_usable ) {
						if ( ! this._scr_check ) {
							this._scr_check = $.proxy( this, function() {
								if ( ! this._disposed ) {
									if ( this.$() ) {
										_reset_resize_sensor.call( this ) && _show_scroll.call( this );
									} else {
										clearInterval( this._scr_timer );
										delete this._scr_check; delete this._scr_timer;
									}
								}
							} );
						}
						if ( ! this._scr_ready ) {
							_reset_resize_sensor.call( this );
							this._scr_ready = T;
						}
						if ( ! this._scr_timer )
							this._scr_timer = setInterval( this._scr_check, 777 );
					}
				}
			},
			mouseout: {
				prop: T,
				method: function() {
					if ( this._scr_timer ) {
						clearInterval( this._scr_timer );
						delete this._scr_timer;
					}
				}
			},
			scroll: function() {
				if ( this._scr_rateY )
					this.$( 'ytr' ).style.top  = Math.min( this.$( 'ovf' ).scrollTop / this._scr_rateY, this.$( 'y' ).offsetHeight - _number(this.$( 'ytr' ).style.height) ) + 'px';
				if ( this._scr_rateX ) {
					this.$( 'xtr' ).style.left = ( this.$( 'ovf' ).scrollLeft / this._scr_rateX ) + 'px';
				}
			},
			resize: function() {
				if ( this.attr( 'scroll' ) && ! this._scr_usable && this.innerWidth() != N && this.innerHeight() != N )
					this.setScroll();
				if ( this._scr_usable ) {
					_show_scroll.call( this );
					var d = this.id + 'ovf';
					if ( $( d ) ) {
						$( d ).style.width  = ( this.innerWidth()  + br.scroll ) + 'px';
						$( d ).style.height = ( this.innerHeight() + br.scroll ) + 'px';
					}
				}
			}
		}
	},
	Prototype: {
		// 让元素滚动到可见区域。支持下面两种调用方式 /e -> el|wg, y -> (top,bottom,middle,auto), x -> (left,right,center,auto), p -> ease?, q -> divide(整除数字，让滚动的距离是这个数字的整数倍), r -> callback
		scrollTo: function( e, y, x, p, q, r ) {
			var a = this.$( 'ovf' ), b = this.$( 'gut' ), c = $.bcr( a ), d = $.bcr( b ), f = e ? $.bcr( e ) : d, t, l;
			if ( y != N || e ) {
				if ( y == N || ! isNaN( y ) ) {
					t = _number( y );
					if ( e ) t = f.top - d.top - t;
				} else if ( y === 'top' ) {
					t = f.top - d.top;
				} else if ( y === 'bottom' ) {
					t = f.bottom - d.top - c.height;
				} else if ( y === 'middle' ) {
					t = f.top - d.top - ( ( c.height / 2 ) - ( f.height / 2 ) );
				} else {
					if ( f.top < c.top )
						t = a.scrollTop - c.top + f.top;
					else if ( f.bottom > c.bottom - br.scroll )
						t = a.scrollTop + f.bottom - c.bottom + br.scroll;
				}
			}
			if ( x != N || e ) {
				if ( x == N || ! isNaN( x ) ) {
					l = _number( x );
					if ( e ) l = f.left - d.left - l;
				} else if ( x === 'left' ) {
					l = f.left - d.left;
				} else if ( x === 'right' ) {
					l = f.right - d.left - c.width;
				} else if ( x === 'center' ) {
					l = f.left - d.left - ( ( c.width / 2 ) - ( f.width / 2 ) );
				} else {
					if ( f.left < c.left )
						l = a.scrollLeft - f.left + c.left;
					else if ( f.right > c.right - br.scroll )
						l = a.scrollLeft + f.right - c.right + br.scroll;
				}
			}
			if ( q != N ) {
				 t != N && (t = t - (t % q));
				 l != N && (l = l - (l % q));
			}
			if ( p ) {
				var g = a.scrollTop, h = a.scrollLeft;
				$.ease( function( i ) {
					if ( t != N ) a.scrollTop  = g + (t - g) * i;
					if ( l != N ) a.scrollLeft = h + (l - h) * i;
					i == 1 && r && r.call( this );
				}, p );
			} else {
				if ( t != N ) a.scrollTop  = t;
				if ( l != N ) a.scrollLeft = l;
				r && r.call( this );
			}
		},
		//@public  /@ e -> el, y -> (top,bottom,middle), p -> ease?, q -> divide, r -> callback
		scrollTop: function( e, y, p, q, r ) {
			if ( arguments.length === 0 )
				return this.$( 'ovf' ).scrollTop;
			if ( typeof e !== _OBJ )
				q = p, p = y, y = e, e = N;
			this.scrollTo( e, y, N, p, q );
		},
		//@public  /@ e -> el, x -> (left,right,center), p -> ease?, q -> divide, r -> callback
		scrollLeft: function( e, x, p, q, r ) {
			if ( arguments.length === 0 )
				return this.$( 'ovf' ).scrollLeft;
			if ( typeof e !== _OBJ )
				q = p, p = x, x = e, e = N;
			this.scrollTo( e, N, x, p, q );
		},
		setScroll: function( a ) {
			if ( a == N || a )
				_wrap_scroll.call( this );
		},
		checkScroll: function() {
			_reset_resize_sensor.call( this ) && _show_scroll.call( this );
		},
		isScrollable: function() {
			return this.attr( 'scroll' ) && this.innerWidth() != N && this.innerHeight() != N;
		},
		isScrollBottom: function() {
			return this.$( 'ovf' ).scrollTop == this.$( 'ovf' ).scrollHeight - this.$( 'ovf' ).clientHeight;
		},
		scrollDragY: function( a, e ) {
			var b = this.id,
				t = $( b + 'ovf' ).scrollTop,
				y = e.clientY;
			$.stop( e );
			$( b + 'y' ).style.visibility = 'visible';
			$.moveup( function( e ) {
				if ( _all[ b ]._scr_rateY )
					$( b + 'ovf' ).scrollTop = t + ( e.clientY - y ) * _all[ b ]._scr_rateY;
			}, function() {
				$( b ) && ($( b + 'y' ).style.visibility = '');
			} );
		},
		scrollDragX: function( a, e ) {
			var b = this.id,
				t = $( b + 'ovf' ).scrollLeft,
				x = e.clientX;
			$.stop( e );
			$( b + 'x' ).style.visibility = 'visible';
			$.moveup( function( e ) {
				if ( _all[ b ]._scr_rateX )
					$( b + 'ovf' ).scrollLeft = t + ( e.clientX - x ) * _all[ b ]._scr_rateX;
			}, function() {
				$( b ) && ($( b + 'x' ).style.visibility = '');
			} );
		},
		//@implement  /@ a -> html|widget, b -> method(prepend,append,after,before)
		insertHTML: function( a, b ) {
			$[ b || 'append' ]( (_putin[ b ] ? (this.$( 'vln' ) || this.$( 'cont' )) : N) || this.$(), a.isWidget ? a.$() : a );
		},
		html: function() {
			return '<div' + this.html_prop() + '>' + this.html_before() + ( this.isScrollable() ? _html_scroll.call( this, this.html_nodes() ) : this.html_nodes() ) + this.html_after() + '</div>';
		},
		dispose: function() {
			clearInterval( this._scr_timer );
			_proto.dispose.call( this );
		}
	}
} ),
_initView = function() {
	this.widgets = {};
	this.names   = {};
	this.views   = {};
	this.layout  = N;
},
_setParent = function( a ) {
	if ( a ) {
		this.parent = a;
		_regIdName.call( this, a );
		this.path   = ( a === _docView ? '' : a.path ) + '/' + ( this.x.id || this.id );
		_viewCache[ this.path ] = this;
	}
},
_userPriority = { 'click': T, 'close': T, 'valid': T },
// view的占据空间的widget，可见元素都隶属于此
ViewLayout = define.widget( 'view/layout', {} ),
// template实例集合
_templates = {},
/* `view` */
View = define.widget( 'view', {
	Const: function( x, p ) {
		if ( cfg.debug )
			x.attr = 'onclick=' + $.abbr + '.debug(this)';
		if ( x.templates )
			$.merge( _templates, x.templates );
		_initView.call( this );
		_regWidget.apply( this, arguments );
		p && _setParent.call( this, _view( p ) );
		if ( this.x.node )
			_ajaxViewEnd.call( this, this.x );
		this._instanced = T;
	},
	Listener: {
		body: {
			ready: function() {
				if ( this.layout ) {
					this.trigger( 'load' );
					return F;
				} else {
					this.showLoading();
					if ( this.loading ) {
						this.addEventOnce( 'layoutload', _renderView );
					} else {
						var f = Frame.edge( this );
						if ( f && f.parentNode.getFocus() !== f )
							f.addEventOnce( 'view', _loadView, this );
						else
							_loadView.call( this );
					}
				}
			},
			framefocus: function() {
				! this.layout && this.triggerListener( 'ready' );
			}
		}
	},
	Prototype: {
		className: 'w-view',
		type_view: T,
		init_x: function( x ) {
			if ( this.x ) {
				$.extend( x, { width: this.x.width, height: this.x.height, src : this.x.src, style: this.x.style, cls: this.x.cls, wmin: this.x.wmin, hmin: this.x.hmin } );
			}
			delete this.__width; delete this.__height;
			this.x = x;
		},
		// 根据ID获取wg /@a -> id
		find: function( a, b ) {
			var r;
			if ( typeof a === _STR ) {
				r = this.widgets[ a ] || this.views[ a ];
				b && b.call( this, r );
			} else {
				for ( var i = 0, c, r = []; i < a.length; i ++ )
					(c = this.widgets[ a[ i ] ] || this.views[ a[ i ] ]) && (b && b.call( this, c ), r.push( c ));
			}
			return r;
		},
		// 获取表单 /@a -> name, b -> range?(elem|widget)
		f: function( a, b ) {
			return this.fAll( a, b )[ 0 ];
		},
		// 获取范围内的所有表单 /@a -> name, b -> range?(elem|widget)
		fAll: function( a, b ) {
			var r, c = b && (b.isWidget ? b.$() : typeof b === _STR ? this.find( b ) : b);
			if ( a === '*' || a == N ) {
				r = [];
				(! b || c) && Q( ':input', (c || this.$()) ).each( function() {
					var g = _widget( this );
					g && g.isFormWidget && r.push( g );
				} );
				return r;
			}
			var r = this.names[ a ];
			if ( b && r ) {
				for ( var r = r.concat(), i = r.length - 1; i > -1; i -- )
					if ( ! c || ! c.contains( r[ i ].$() ) ) r.splice( i, 1 );
			}
			return r || [];
		},
		// 读/写表单值 /@a -> name, b -> value, c -> text
		fv: function( a, b, c ) {
			if ( a = (this.f( a ) || Q( ':input[name="' + a + '"]', this.$() )) )
				b === U ? ( b = a.val() ) : a.val( b, c );
			return b;
		},
		// 获取提交数据 [ {name, value}, ... ] /@ a -> range [widgetID, 可选，如果 range 以 ! 开头，表示排除], b -> url mode?
		getPostData: function( a, b ) {
			var f, r = [];
			if ( ! a ) {
				f = Q.find( '[id="' + this.id + '"] :input:not(:disabled)' );
			} else {
				var c = a.charAt( 0 ) === '!', d = [];
				if ( c )
					a = a.replace( /\!/g, '' );
				for ( var i = 0, a = a.split( ',' ), e; i < a.length; i ++ ) {
					if ( e = this.find( a[ i ] ) )
						d.push( '[id="' + e.id + '"] :input:not(:disabled)' );
				}
				if ( d = d.join() )
					f = Q.find( c ? '[id="' + this.id + '"] :input:not(:disabled):not(' + d + ')' : d );
			}
			if ( f ) {
				for ( var i = 0, l = f.length, v; i < l; i ++ )
					( v = _f_val( f[ i ], b ) ) && r.push( v );
			}
			return b ? r.join( '&' ) : r;
		},
		// 判断表单是否更改
		isModified: function( a ) {
			var d = this.$();
			if ( d ) {
				if ( a ) {
					for ( var i = 0, a = a.split( ',' ), d = [], e; i < a.length; i ++ )
						a[ i ] && (e = this.find( a[ i ] )) && e.$() && d.push( e.$() );
				}
				var o = F;
				if ( Q( ':text,:password,textarea', d ).is( function() { if ( this.value.replace( /\r\n/g, '\n' ) != this.defaultValue.replace( /\r\n/g, '\n' ) ) { o = this; return T; } } ) ||
					Q( ':radio,:checkbox', d ).is( function() { if ( this.checked != this.defaultChecked ) { o = this; return T; } } ) ||
					Q( 'input[type="hidden"]', d ).is( function() { var c = _widget( this ); if ( c && c.val ) { if ( c.isModified ? c.isModified() : ((c.x.value || '') != c.val()) ) { o = c; return T; } } } ) ) {
					return _widget( o );
				}
				return F;
			}
		},
		// 保存表单所做的更改
		saveModified: function() {
			var d = this.$();
			if ( d ) {
				Q( ':text,textarea', d ).each( function() { this.defaultValue = this.value.replace( /\r\n/g, '\n' ) } );
				Q( ':radio,:checkbox', d ).each( function() { this.defaultChecked = this.checked } );
				Q( 'input[type="hidden"]', d ).each( function() { var c = _widget( this ); if ( c && c.val ) { c.saveModified ? c.saveModified() : (c.x.value = c.val()) } } );
			}
		},
		// @a -> range
		resetForm: function( a ) {
			var c = [];
			if ( a ) {
				for ( var i = 0, d = a.split( ',' ), e; i < d.length; i ++ ) {
					(e = this.find( d[ i ] )) && c.push.apply( c, this.fAll( N, e ) );
				}
			} else
				c = this.fAll();
			for ( var i = 0, l = c.length; i < l; i ++ ) {
				c[ i ].reset();
			}
		},
		// a -> url, b -> callback, c -> context, d -> sync?, e -> data, f -> error fn, g -> complete
		ajax: function( a, b, c, d, e, f, g ) {
			return $.ajaxJSON( this.x.scope ? $.urlLoc( this.x.scope, a ) : a, b, c || this, d, e, f, g );
		},
		abort: function() {
			$.ajaxAbort( this );
			this.loading = F;
		},
		// @a -> src, b -> sync?, c -> fn
		reload: function( a, b, c ) {
			if ( typeof b === _FUN )
				c = b, b = U;
			this.abort();
			this.empty();
			_initView.call( this );
			this.loaded = F;
			a && this.attr( 'src', a );
			if ( this.$() ) {
				this.attr( 'src' ) ? _loadView.call( this, b, c ) : _ajaxViewEnd( this, this.x );
			} else
				this.preload( b, c );
		},
		// 预先装载数据 / @a -> sync?, b -> fn
		preload: function( a, b ) {
			if ( typeof a === _FUN )
				b = a, a = U;
			_ajaxView.call( this, a, b );
		},
		showLoading: function() {
			$.html( this.$(), '<div class="w-view-loading" id=' + this.id + 'loading><i class=f-vi></i><cite class=_c>' + $.image( '%img%/loading-cir.gif' ) + ' <em class=_t>' + Loc.loading + '</em></cite></div>' );
		},
		// 表单验证。如果验证过程中发现错误，将返回一个包含错误信息的数组 /@ n -> validate name, g -> range
		getValidError: function( n, g ) {
			var c = _submitNames.call( this, g ), d, e, k, v;
			for ( k in c ) {
				for ( var i = 0, d = this.names[ k ]; i < d.length; i ++ ) {
					if ( v = d[ i ].trigger( 'valid', [ n ] ) )
						(e || (e = [])).push( v );
				}
			}
			return e;
		},
		// 表单验证。验证通过返回true /@ n -> validate name, g -> range, f -> validateeffect
		// valid 用户事件返回值的处理:
		//   false -> 表示有错，并停止执行submit命令 (跳过引擎对当前widget的验证)
		//   "错误信息" -> 提示信息 (跳过引擎对当前widget的验证)
		//   null -> 没有错误，(继续引擎验证)
		valid: function( n, g, f ) {
			if ( this._err_ns ) {
				for ( var i = 0, l = this._err_ns.length; i < l; i ++ ) { 
					for ( var j = 0, d = this.names[ this._err_ns[ i ].name ]; j < d.length; j ++ )
						d[ j ].trigger( 'error', F );
				}
			}
			var e = this.getValidError( n, g );
			if ( e ) {
				var i = 0, l = e.length, t, o, f = f || cfg.validate_effect || 'red,tip',
					r = $.idsAny( f, 'red' ), a = $.idsAny( f, 'alert' ), h = $.idsAny( f, 'tip' );
				for ( ; i < l; i ++ ) { 
					if ( r && e[ i ].name ) {
						for ( var j = 0, d = this.names[ e[ i ].name ]; j < d.length; j ++ )
							d[ j ].trigger( 'error' );
						! o && _scrollIntoView( o = d[ 0 ], T );
					}
					if ( (a || h) && ! t )
						t = e[ i ].text;
				}
				if ( cfg.validate_handler ) {
					cfg.validate_handler( e );
				} else {
					a && o.trigger( 'error', [{ type: 'alert', text: t, id: $.ID_ALERT }] );
					h && o.trigger( 'error', [{ type: 'tip', text: t }] );
				}
			}
			return !(this._err_ns = e);
		},
		append: function() {
			this.layout.append.apply( this.layout, arguments );
		},
		prepend: function() {
			this.layout.prepend.apply( this.layout, arguments );
		},
		html_nodes: function() {
			return this.layout ? this.layout.html() : '';
		},
		dispose: function() {
			delete this.layout;
			this.abort();
			_proto.dispose.call( this );
		}
	}
} ),
// @a -> sync?, b -> fn
_loadView = function( a, b ) {
	this.showLoading();
	_ajaxView.call( this, a, function( x ) {
		_renderView.call( this );
		b && b.call( this, x );
	} );
},
// @a -> sync?, b -> fn
_ajaxView = function( a, b ) {
	this.abort();
	this.loading = T;
	var u = this.attr( 'src' );
	u && (this.parent || this).ajax( $.urlLoc( cfg.path, u ), function( x ) {
		_ajaxViewEnd.call( this, x );
		b && b.call( this, x );
	}, this, a );
},
_ajaxViewEnd = function( x ) {
	this.loading = F;
	if ( ! this.x )
		return;
	if ( x.type === 'view' ) {
		if ( this.x !== x )
			this.init_x( x );
		if ( x.templates )
			$.merge( _templates, x.templates );
		if ( x.node )
			this.layout = new ViewLayout( { node: x.node }, this );
		this.loaded = T;
		this.trigger( 'layoutload' );
	} else
		this.cmd( x );
},
_renderView = function() {
	if ( this.x ) {
		this.removeElem( 'loading' );
		this.layout && this.render();
	}
},
/* `DocView *
 *  引擎初始化后会创建一个顶级的DocView。这个view不是可见元素，但统领所有view和widget，类似于window.document
 *  只提供 find, cmd 等方法
 */
DocView = define.widget( 'docview', {
	Const: function() {
		_initView.call( this );
		this._wd = this.width();
		this._ht = this.height();
		var self = this, f;
		$.attach( window, 'resize', f = function() {
			var w = self.width(), h = self.height();
			if ( self._wd !== w || self._ht !== h ) {
				self.resize( self._wd = w, self._ht = h );
				Dialog.cleanPop();
			}
		} );
		if ( ie7 ) { // ie7监视缩放
			var dpi = screen.deviceXDPI;
			setInterval( function() {
				if ( screen.deviceXDPI != dpi ) {
					dpi = screen.deviceXDPI;
					f();
				}
			}, 500 );
		}
	},
	Extend: 'view',
	Prototype: {
		x: {},
		path: '/',
		loaded: T,
		$: function() {	return document.body },
		outerWidth: function() { return $.width() },
		outerHeight: function() { return $.height() }
	}
} ),
// 创建有且仅有一个的docView实例
_docView = new DocView(),

// horz/scale: 子元素被约束为：横向排列，高度占满，宽度按子元素设置的width属性分配
HorzScale = define.widget( 'horz/scale', {
	Prototype: {
		type_horz: T,
		scaleWidth: _w_scale.width
	}
} ),
/* `horz`   可滚动的横向布局面板，子元素如果没有设置宽度，则宽度默认为-1  */
Horz = define.widget( 'horz', {
	Const: function( x ) {
		x.nobr === F && (this.className += ' z-br');
		W.apply( this, arguments );
		_w_lay.width( this );
	},
	Extend: [ 'scroll', 'horz/scale' ],
	Listener: {
		body: {
			nodechange: _w_rsz_layout
		}
	},
	Prototype: {
		className: 'w-horz',
		childCls: 'f-sub-horz',
		scaleWidth: _w_scale.width,
		html_nodes: function() {
			this.x.valign && (this.childCls += ' f-va-' + this.x.valign);
			var s = _proto.html_nodes.call( this ), v = this.attr( 'valign' );
			return v ? '<div id=' + this.id + 'vln class="f-inbl f-va-' + v + '">' + s + '</div><i class=f-vi-' + v + '></i>' : s;
		}
	}
} ),
// vert/scale: 子元素被约束为：纵向排列，宽度占满，高度按子元素设置的height属性分配
VertScale = define.widget( 'vert/scale', {
	Prototype: {
		type_vert: T,
		scaleHeight: _w_scale.height
	}
} ),
/* `vert`  可滚动的纵向布局面板，子元素如果没有设置高度，则高度默认为-1  */
Vert = define.widget( 'vert', {
	Const: function( x ) {
		W.apply( this, arguments );
		_w_lay.height( this );
	},
	Extend: [ 'scroll', 'vert/scale' ],
	Listener: {
		body: {
			nodechange: _w_rsz_layout
		}
	},
	Prototype: {
		className: 'w-vert',
		childCls: 'f-sub-vert',
		scaleHeight: _w_scale.height,
		html_nodes: Horz.prototype.html_nodes
	}
} ),
/* `Frame`  子元素被约束为：高度宽度占满，只有一个可见  */
Frame = define.widget( 'frame', {
	Const: function( x, p ) {
		W.apply( this, arguments );
		(this.focusNode = this.getFocus()) && (this.focusNode.focusOwner = this);
	},
	Helper: {
		// 获取a节点最接近 frame 的祖先元素
		edge: function( a ) {
			var n = _widget( a );
			do {
				if ( n.parentNode && n.parentNode.type_frame )
					return n;
			} while( (n = n.parentNode) && ! n.isDialogWidget );
		},
		// 让 frame 中的a可见 /@a -> widget|elem
		focus: function( a ) {
			var e = a && Frame.edge( a );
			if ( e ) {
				if ( e.parentNode.getFocus() != e ) {
					var n = $.get( '[w-target="' + e.x.id + '"]', e.parentNode.ownerView.$() );
					n && _widget( n ).focus();
				}
				Frame.focus( e.parentNode );
			}
		}
	},
	Prototype: {
		type_frame: T,
		className: 'w-frame',
		getFocus: function() {
			return this.focusNode || (this.x.dft && this.ownerView.find( this.x.dft ));
		},
		// @a -> wgid
		// animate: scrollX(横向滚动),scrollY(纵向滚动),
		view: function( a ) {
			if ( this.$() ) {
				var o = this.getFocus(), c = 'f-sub-frame', d = c + '-on',
					n = a.isWidget ? a : this.ownerView.find( a );
				if ( n && n !== o ) {
					if ( this.x.animate ) {
						var d = n.nodeIndex > o.nodeIndex ? 'Left' : 'Right';
						$.classReplace( n.$(), c, d );
						$.animate( o.$(), 'fadeOut' + d, 100 );
						$.animate( n.$(), 'fadeIn' + d, 100, function() {
							o.$() && $.classReplace( o.$(), d, c );
						} );
					} else {
						o && $.classReplace( o.$(), d, c );
						$.classReplace( n.$(), c, d );
					}
					delete o.focusOwner;
					this.focusNode = n;
					n.focusOwner = this;
					n.trigger( 'framefocus' );
				}
			}
		}
	}
} ),
/* `ewin` */
/*  embedwindow 有text就显示text，否则显示src  */
Ewin = define.widget( 'ewin', {
	Listener: {
		body: {
			ready: function() {
				if ( this.x.text )
					with ( this.getContentWindow().document ){ open(), write( this.x.text ), close() }
			}
		}
	},
	Prototype: {
		getContentWindow: function() {
			return this.$().contentWindow;
		},
		html: function() {
			return '<iframe' + this.html_prop() + (this.x.id ? ' w-id="' + this.x.id + '"' : '') + ' src="' + ( this.attr( 'src' ) || 'about:blank' ) + '" marginwidth=0 marginheight=0 frameborder=0 allowtransparency></iframe>';
		}
	}
} ),
/* `html`
 *  支持自定义标签: <d:wg></d:wg>
 *  内容为widget配置项，例: <d:wg>{type: "button", text: "click"}</d:wg>
 */
Html = define.widget( 'html', {
	Extend: 'scroll',
	Prototype: {
		className: 'w-html',
		// @a -> text
		text: function( a ) {
			var o = this.$( 'vln' ) || this.$( 'cont' ) || this.$();
			o && (o.innerHTML = $.parseHTML( a, this ));
		},
		html_nodes: function() {
			var t = this.x.text || '', s = $.parseHTML( this.x.escape ? $.strEscape( t ) : t, this ), v = this.attr( 'valign' );
			if ( v )
				s = '<i class=f-vi-' + v + '></i><div id=' + this.id + 'vln class="f-inbl f-va-' + v + '">' + s + '</div>';
			return s;
		}
	}
} ),
_splitSize = function( a, b ) {
	return a && a[ a.parentNode.type_horz ? 'width' : 'height' ]( b );
},
/* `split`  可拖动调整大小的分隔条 */
Split = define.widget( 'split', {
	Listener: {
		body: {
			ready: function() {
				$.classAdd( this.parentNode.$(), 'f-rel' );
				var w = this.width();
				if ( w <= 1 ) $.classAdd( this.$(), 'z-0' );
				ie7 && (this.$( 'bg' ).style.backgroundColor = this.$().currentStyle.backgroundColor);
			}
		}
	},
	Prototype: {
		className: 'w-split',
		// 拖动调整大小
		drag: function( a, e ) {
			var r = $.bcr( e.srcElement.parentNode ), o = this.isOpen(), p = this.prev(), n = this.next(), d = this.x.range.split( ',' ), j = _number( d[ 0 ] ), k = _number( d[ 1 ] ),
				h = this.parentNode.type_horz, t = this.x.target == 'next', cln = h ? 'clientX' : 'clientY', pos = h ? 'left' : 'top', x = e[ cln ], self = this, b, c, f, g, h;
			$.stop( e );
			$.moveup( function( e ) {
				if ( ! b && e[ cln ] !== x ) {
					h = $.db( '<div style="position:absolute;top:0;bottom:0;left:0;right:0;"></div>' );
					b = $.db( '<div style="position:absolute;width:' + (h ? 5 : r.width) + 'px;height:' + (h ? r.height : 5) + 'px;left:' + r.left + 'px;top:' + r.top + 'px;background:#bbb;opacity:.6;z-index:1"></div>' );
					f = p && _splitSize( p ), g = n && _splitSize( n );
				}
				if ( b ) {
					c = e[ cln ];
					f && (c = Math.max( c, x - f + j ));
					g && (c = Math.min( c, x + g - k ));
					b.style[ pos ] = (c + r[ pos ] - x) + 'px';
				}
			}, function( e ) {
				if ( b ) {
					$.remove( b ), $.remove( h );
					var j = f + c - x, k = g + x - c;
					if ( j > -1 && k > -1 ) {
						p && _splitSize( p, n && t ? '*' : j );
						n && _splitSize( n, p && ! t ? '*' : k );
						if ( j && k )
							self._size = t ? k : j;
						if ( self.$( 'i' ) && o != (j = self.isOpen()) )
							$.replace( self.$( 'i' ), self.html_icon( j ) );
					}
				}
			} );
		},
		// a -> bool/数字/百分比/*
		toggle: function( a ) {
			var o = this.isOpen(), n, v = a;
			if ( a == N ) {
				n = ! o;
				v = o ? 0 : this._size;
			} else if ( typeof a === _BOL ) {
				n = a;
				v = a ? this._size : 0;
			}
			this.major( v );
			this.minor( '*' );
			if ( n === U )
				n = this.isOpen();
			o != n && this.$( 'i' ) && $.replace( this.$( 'i' ), this.html_icon( n ) );
		},
		isOpen: function() {
			return this.major() > (this.x.range || '').split( ',' )[ this.x.target == 'next' ? 1 : 0 ];
		},
		major: function( a ) {
			return _splitSize( this[ this.x.target || 'prev' ](), a );
		},
		minor: function( a ) {
			return _splitSize( this[ this.x.target == 'next' ? 'prev' : 'next' ](), a );
		},
		html_icon: function( a ) {
			a = a == N ? this.isOpen() : a;
			return $.image( ( ! a && this.x.openicon) || this.x.icon, { id: this.id + 'i', cls: '_' + (this.x.target || 'prev'), click: evw + '.toggle()' } );
		},
		html_nodes: function() {
			var w = this.width(), h = this.height(), p = this.parentNode, z = p.type_horz,
				s = '<div id=' + this.id + 'bg style="position:absolute;background:inherit;height:' + (z ? '100%' : h + 'px') + ';width:' + (z ? w + 'px' : '100%') + '">';
			if ( this.x.range && (z || p.type_vert) && this.next() && this.prev() ) {
				s += '<div onmousedown=' + evw + '.drag(this,event) style="position:absolute;z-index:1;cursor:' + (z ? 'col' : 'row') + '-resize;height:' + (z || h >= 5 ? '100%' : '5px') + ';width:' +
					(! z || w >= 5 ? '100%' : '5px') + ';margin-' + (z ? 'left' : 'top') + ':' + ( (z ? w : h) < 5 ? ((z ? w : h) - 5) / 2 : 0 ) + 'px"></div>';
				this._size = _number( this.x.range.split( ',' )[ 2 ] ) || this.major();
			}
			if ( this.x.icon )
				s += '<table cellspacing=0 cellpadding=0 border=0 width=100% height=100%><tr><td align=' + ( this.x.target === 'next' ? 'right' : 'left' ) + '>' + this.html_icon() + '</table>';
			return s + '</div>';
		}
	}
} ),
/* `buttonbar` */
Buttonbar = define.widget( 'buttonbar', {
	Const: function( x ) {
		var d = x.dir || 'h';
		if ( d !== 'h' || x.nobr !== F )
			this.className += ' z-dir' + d;
		W.apply( this, arguments );
	},
	Extend: 'horz',
	Child: 'button',
	Default: { valign: 'middle'	},
	Listener: {
		body: {
			nodechange: function() {
				Horz.Listener.body.nodechange.apply( this, arguments );
				Q( '.w-button', this.$() ).removeClass( 'z-last z-first' ).first().addClass( 'z-first' ).end().last().addClass( 'z-last' );
				Q( '.w-button-split', this.$() ).next().addClass( 'z-first' ).end().prev().addClass( 'z-last' );
			}
		}
	},
	Prototype: {
		type_buttonbar: T,
		NODE_ROOT: T,
		className: 'w-buttonbar',
		x_type: function( t, n ) {
			return t === 'split' ? 'button/split' : (t || 'button');
		},
		getFocus: function() {
			for ( var i = 0; i < this.length; i ++ )
				if ( this[ i ].isFocus() ) return this[ i ];
		},
		scaleWidth: function() {
			return (this.x.dir === 'v' ? _proto.scaleWidth : _w_scale.width).apply( this, arguments );
		},
		scaleHeight: function() {
			return (this.x.dir === 'v' ? _w_scale.height : _proto.scaleHeight).apply( this, arguments );
		},
		html_nodes: function() {
			for ( var i = 0, l = this.length, s = [], v = this.attr( 'valign' ); i < l; i ++ ) {
				s.push( this[ i ].html() );
				if ( this.x.split && i < l - 1 && this[ i ].type !== 'button/split' && this[ i + 1 ].type !== 'button/split' ) {
					s.push( this.add( $.extend( { type: 'split' }, this.x.split ), i + 1 ).html() );
					i ++, l ++;
				}
			}
			s = s.join( '' );
			return ( v ? '<i class=f-vi-' + v + '></i>' + (this.x.dir === 'v' ? '<div id=' + this.id + 'vln class="f-inbl f-va-' + v + '">' + s + '</div>' : s) : s ) + '<div class=w-buttonbar-line></div>';
		}
	}
} ),
/* `button` */
Button = define.widget( 'button', {
	Listener: {
		block: function( e ) {
			return e !== 'unlock' && ! this.usa();
		},
		body: {
			mouseover: {
				prop: T,
				method: function( e ) {
					$.classAdd( $( e.elemId || this.id ), 'z-hv' );
					if ( this.type === 'menu/button' ) {
						for ( var i = 0, p = this.parentNode; i < p.length; i ++ )
							p[ i ] === this ? p[ i ].show() : p[ i ].hide();
					} else if ( this.x.hoverdrop || (Menu.instance && this.more && this.more !== Menu.instance && this.more.type === 'menu' && Menu.instance.parentNode.parentNode === this.parentNode) ) {
						this.drop();
					}
				}
			},
			mouseout: {
				prop: T,
				method: function( e ) {
					$.classRemove( $( e.elemId || this.id ), 'z-hv' );
				}
			},
			mousedown: {
				prop: T,
				method: function( e ) {
					$.classAdd( $( e.elemId || this.id ), 'z-dn' );
				}
			},
			mouseup: {
				prop: T,
				method: function( e ) {
					$.classRemove( $( e.elemId || this.id ), 'z-dn' );
				}
			},
			click: function( e ) {
				if ( this.parentNode.x.focusable )
					this.trigger( this.parentNode.x.focusmultiple && this.isFocus() ? 'blur' : 'focus' );
				if ( ! ( this.x.on && this.x.on.click ) )
					this.drop();
			},
			focus: function() { this._focus( T ) },
			blur: function() { this._focus( F ) },
			lock: function() {
				if ( ! this._locked ) {
					if ( this._dft_icon === U )
						this._dft_icon = this.x.icon || '';
					if ( this.$() ) {
						if ( this.x.icon )
							$.append( this.$( 'i' ), '<i class=_ld></i>' );
						else
							this.attr( 'icon', '%img%/loading-dot.gif' );
						$.classAdd( this.$(), 'z-lock' );
						$.append( this.$(), '<div class=f-locker id=' + this.id + 'lock></div>' );
					}
				}
				this._locked = T;
			},
			unlock: function() {
				this._locked = F;
				this.attr( 'icon', this._dft_icon );
				if ( this.$() ) {
					$.classRemove( this.$(), 'z-lock' );
					this.removeElem( 'lock' );
					Q( '.z-hv', this.$() ).add( this.$() ).removeClass( 'z-hv' );
				}
			}
		}
	},
	Default: { width: -1 },
	Rooter: 'buttonbar',
	Prototype: {
		init_nodes: function( x ) {
			if ( x.more || x.nodes )
				this.more = this.add( x.more || { type: 'menu', nodes: x.nodes }, -1, { memory: T, snap: this, indent: 1, hoverdrop: x.hoverdrop } );
			if ( this.more && x.on && x.on.click )
				this._combo = T;
		},
		usa: function() {
			return ! this.x.disabled && ! this._locked;
		},
		root: function() {
			return this.parentNode.type_buttonbar && this.parentNode;
		},
		_focus: function( a ) {
			if ( this._disposed )
				return;
			var a = a == N || a, p = this.parentNode, d;
			if ( this.$() && this.x.focus !== a ) {
				$.classAdd( this.$(), 'z-on', a );
				if ( a && p.x.focusable ) {
					if ( ! p.x.focusmultiple ) {
						for ( var i = 0, d = this.x.name ? this.ownerView.names[ this.x.name ] : p; i < d.length; i ++ )
							if ( d[ i ].x.focus && d[ i ] !== this ) { d[ i ].trigger( 'blur' ); break; }
					}
					if ( (d = this.x.target) && (d = d.split(',')) ) {
						for ( var i = 0, e; i < d.length; i ++ )
							(e = this.ownerView.find( d[ i ] )) && e.parentNode && e.parentNode.type_frame && e.parentNode.view( d[ i ] );
					}
				}
			}
			this.x.focus = a;
		},
		isFocus: function() {
			return this.x.focus;
		},
		focus: function( a ) {
			this.trigger( a === F ? 'blur' : 'focus' );
		},
		drop: function() {
			if ( this.usa() && this.more ) {
				this.more.x.style = 'min-width:' + (this.$().offsetWidth - 2) + 'px';
				this.more.show();
			}
		},
		close: function( e ) {
			e && $.stop( e );
			if ( ! this._disposed && F !== this.trigger( 'close' ) )
				this.remove();
		},
		disable: function( a ) {
			this.x.disabled = a = a == N || !! a;
			$.classAdd( this.$(), 'z-ds', a );
		},
		lock: function( a ) {
			this.trigger( a === F ? 'unlock' : 'lock' );
		},
		// @implement
		insertHTML: function( a, b ) {
			this.$() && $[ _putin[ b ] ? 'after' : b ]( this.$(), a.isWidget ? a.$() : a );
		},
		// 新增或更换图标。如果 a == '', 则删除图标  / @a -> image src
		icon: function( a ) {
			this.attrSetter( 'icon', a );
		},
		// 新增或更换文本。如果 a == ''  / @a -> text
		text: function( a ) {
			this.attrSetter( 'text', a );
		},
		// @implement
		attrSetter: function( a, b ) {
			if ( ! this.$() )
				return;
			if ( a === 'icon' ) {
				if ( b )
					this.$( 'i' ) ? $.replace( this.$( 'i' ), this.html_icon( b ) ) : $.prepend( this.$( 'c' ), this.html_icon( b ) );
				else
					this.removeElem( 'i' );
			} else if ( a === 'text' ) {
				if ( b )
					this.$( 't' ) ? $.replace( this.$( 't' ), this.html_text( b ) ) : $.append( this.$( 'c' ), this.html_text( b ) );
				else
					this.removeElem( 't' );
			}
		},
		html_icon: function( a ) {
			return $.image( a || this.x.icon, { id: this.id + 'i', cls: '_i', width: this.x.iconwidth, height: this.x.iconheight } );
		},
		html_text: function( a ) {
			return '<span id=' + this.id + 't class="_t f-omit"' + ( this.x.textstyle ? ' style="' + this.x.textstyle + '"' : '' ) + '><em>' + (a || this.x.text) + '</em><i class=f-vi></i></span>';
		},
		html: function() {
			var x = this.x, p = this.parentNode,t = this.tagName || 'div',
				a = '<' + t + ' id=' + this.id + ' class="',
				b = (this.className ? this.className + ' ' : '') + 'w-button',
				c = this._combo, d, s = '';
			b += x.hidetoggle ? ' z-normal' : c ? ' z-combo' : this.more ? ' z-more' : ' z-normal';
			if ( x.closeable || x.closeicon )
				b += ' z-x';
			if ( x.disabled )
				b += ' z-ds';
			if ( (d = this.innerWidth()) != N ) {
				s += 'width:' + d + 'px;';
				b += ' z-fixed';
			}
			if ( this.attr( 'height' ) != N ) {
				if ( (d = this.innerHeight()) != N )
					s += 'height:' + d + 'px;';
			}
			if ( d = this.attr( 'cls' ) )
				b += ' ' + d;
			if ( p.type_buttonbar ) {
				if ( this === p[ 0 ] || ((d = this.prev()) && d.type === 'button/split') )
					b += ' z-first';
				if ( this === p[ p.length - 1 ] || ((d = this.next()) && d.type === 'button/split') )
					b += ' z-last';
			}
			if ( x.focus )
				b += ' z-on';
			a += b + '"';
			if ( (d = p.x.space) != N && this !== p[ p.length - 1 ] )
				s += 'margin-' + ( p.x.dir === 'v' ? 'bottom' : 'right' ) + ':' + d + 'px;';
			if ( x.style )
				s += x.style;
			if ( s )
				a += ' style="' + s + '"';
			if ( x.target )
				a += ' w-target="' + ((x.target.x && x.target.x.id) || x.target) + '"';
			a += c ? ' onmouseover=' + eve + ' onmouseout=' + eve : _html_on( this, ' onclick=' + eve );
			if ( x.tip )
				a += ' title="' + $.strQuot( x.tip === T ? x.text : x.tip ) + '"';
			x.id && (a += ' w-id="' + x.id + '"');
			if ( this.property )
				a += this.property;
			a += '>' + this.html_before() + '<div class=_c id=' + this.id + 'c' + (c ? _html_on(this, ' onclick=' + eve) : '' ) + '>';
			if ( x.icon )
				a += this.html_icon();
			if ( x.text )
				a += this.html_text();
			a += '</div>';
			if ( ! x.hidetoggle && this.more )
				a += '<div class=_m id=' + this.id + 'more' + ( c ? _html_on( this, ' onclick=' + evw + '.drop()' ) : '' ) + '><em class=f-arw></em><i class=f-vi></i></div>';
			if ( x.closeicon )
				a += $.image( x.closeicon, { cls: '_x', click: evw + '.close()' } );
			else if ( x.closeable )
				a += '<div class=_x onclick=' + evw + '.close(event)><i class=f-vi></i><i class="_xi">&times;</i></div>';
			a += this.html_after() + '</' + t + '>';
			return a;
		}
	}
}),
/* `submitbutton` */
Submitbutton = define.widget( 'submitbutton', {
	Const: function( x, p ) {
		Button.apply( this, arguments );
		! this.ownerView.submitButton && (this.ownerView.submitButton = this);
	},
	Extend: Button,
	Rooter: 'buttonbar',
	Prototype: {
		className: 'w-submit w-button',
		dispose: function() {
			if ( this.ownerView.submitButton === this )
				delete this.ownerView.submitButton;
			Button.prototype.dispose.call( this );
		}
	}
} ),
/* `menubutton` */
_menu_button_height,
MenuButton = define.widget( 'menu/button', {
	Extend: Button,
	Rooter: 'menu',
	Listener: {
		body: {
			click: function() {
				if ( ! this.x.disabled && this.x.on && this.x.on.click ) {
					var r = this.root();
					r.isLocked ? $.hide( r.$() ) : r.hide();
				}
			},
			lock: function() {
				this.root().isLocked = T;
			},
			unlock: function() {
				var r = this.root();
				r.isLocked = F;
				r.hide();
			}
		}
	},
	Prototype: {
		className: 'w-menu-button f-nobr',
		elemht: function() {
			if ( ! _menu_button_height ) {
				br.chdiv( 'w-menu-button', function() { _menu_button_height = this.offsetHeight || 28 } );
			}
			return _menu_button_height;
		},
		x_type: function( t, n ) {
			return t === 'menu' ? 'submenu' : t;
		},
		root: function() {
			return this.closest( 'menu' );
		},
		show: function() {
			if ( this.more ) {
				this.$() && $.classAdd( this.$(), 'z-open' );
				this.more.show();
			}
			return this;
		},
		hide: function() {
			if ( this.more ) {
				this.$() && $.classRemove( this.$(), 'z-open' );
				this.more.hide();
			}
			return this;
		},
		dispose: function() {
			this.more && ( this.more.dispose(), this.more = N );
			_proto.dispose.call( this );
		},
		html: function() {
			var x = this.x,
				a = '<div id=' + this.id + ' class="',
				b = this.className,
				s = ''; // style
			if ( x.closeable )
				b += ' z-close';
			if ( x.disabled )
				b += ' z-ds';
			var w = this.innerWidth();
			if ( w != null ) {
				s += 'width:' + w + 'px;';
				b += ' w-button-fixed';
			}
			if ( this.more )
				b += ' z-more';
			if ( x.cls )
				b += ' ' + x.cls.replace( /\./g, '' );
			if ( x.style )
				s += x.style;
			if ( x.focus )
				b += ' z-on';
			a += b + '"';
			if ( s )
				a += ' style="' + s + '"';
			x.id && (a += ' w-id="' + x.id + '"');
			a += _html_on( this, ' onclick=' + eve ) + '><div class=_c id=' + this.id + 'c>';
			a += $.image( x.icon || '', { cls: '_i', id: this.id + 'i' } );
			if ( x.text )
				a += '<span class="_t f-omit" id=' + this.id + 't><em>' + x.text + '</em><i class=f-vi></i></span>';
			a += '</div>';
			a += '<div class=_m>' + ( this.more ? $.arrow( 'r1' ) : '' ) + '<i class=f-vi></i></div>';
			if ( x.closeable )
				a += '<div class=_x></div>';
			return a + '</div>';
		}
	}
} ),
MenuSubmitbutton = define.widget( 'menu/submitbutton', {
	Const: function() {
		Submitbutton.apply( this, arguments );
	},
	Extend: 'menu/button',
	Prototype: {
		className: 'w-menu-button w-submit f-nobr',
		dispose: function() {
			if ( this.ownerView.submitButton === this )
				delete this.ownerView.submitButton;
			MenuButton.prototype.dispose.call( this );
		}
	}
} );
/* `buttonsplit` */
ButtonSplit = define.widget( 'button/split', {
	Const: function( x, p ) {
		W.apply( this, arguments );
		var s = _dfopt.buttonbar && _dfopt.buttonbar.space;
		s && this.defaults( { width: s } );
	},
	Prototype: {
		className: 'w-button-split',
		html_nodes: function() {
			return '<span class="f-va _vr">' + (this.x.text != N ? this.x.text : '|') + '</span><i class=f-vi></i>';
		}
	}
} ),
/* `album` */
Album = define.widget( 'album', {
	Const: function( x, p ) {
		Horz.apply( this, arguments );
		if ( x.hiddens )
			this._hiddens = this.add( { type: 'hiddens', nodes: x.hiddens }, -1 );
	},	
	Extend: 'horz',
	Child: 'img',
	Prototype: {
		NODE_ROOT: T,
		className: 'w-album',
		getFocus: function() {
			for ( var i = 0; i < this.length; i ++ )
				if ( this[ i ].isFocus() ) return this[ i ];
		},
		getFocusAll: function() {
			for ( var i = 0, r = []; i < this.length; i ++ )
				if ( this[ i ].isFocus() ) r.push( this[ i ] );
			return r;
		},
		focusAll: function( a ) {
			for ( var i = 0; i < this.length; i ++ )
				this[ i ].focus( a );
		},
		html_nodes: function() {
			return Horz.prototype.html_nodes.call( this ) + (this._hiddens ? this._hiddens.html() : '');
		}
	}
} ),
/* `img` */
Img = define.widget( 'img', {
	Const: function( x, p ) {
		W.apply( this, arguments );
		x.focus && $.classAdd( this, 'z-on' );
		if ( x.face )
			this.className += ' z-face-' + x.face;
		if ( p.x.space )
			this.cssText = 'margin-top:' + p.x.space + 'px;margin-left:' + p.x.space + 'px;';
	},
	Extend: 'horz',
	Rooter: 'album',
	Listener: {
		body: {
			mouseover: {
				prop: T,
				method: function() {
					this.parentNode.x.hoverable && $.classAdd( this.$(), 'z-hv' );
				}
			},
			mouseout: {
				prop: T,
				method: function() {
					$.classRemove( this.$(), 'z-hv' );
				}
			},
			click: {
				prop: T,
				block: function( e ) { return this.box && e.srcElement && e.srcElement.id === this.box.id + 't' },
				method: function() {
					this.parentNode.x.focusable && this.focus( ! this.isFocus() );
				}
			}
		}
	},
	Default: { height: -1 },
	Prototype: {
		className: 'w-img',
		width_minus: function() {
			return (p.x.space || 0);
		},
		attrSetter: function( a, b ) {
			if ( a === 'src' ) {
				this.$( 'i' ) && $.replace( this.$( 'i' ), this.html_img() );
			} else if ( a === 'text' || a === 'description' ) {
				this.$( 't' ) && $.replace( this.$( 't' ), this.html_text() );
			}
		},
		isFocus: function() {
			return $.classAny( this.$(), 'z-on' );
		},
		focus: function( a ) {
			var a = a == N || a, p = this.parentNode, b = p.getFocus();
			$.classAdd( this.$(), 'z-on', a );
			this.box && this.box.click( a );
			a && b && b !== this && ! p.x.focusmultiple && b.focus( F );
		},
		html_img: function() {
			var x = this.x, b = this.parentNode.type === 'album', w = x.imgwidth, h = x.imgheight,
				g = $.image( this.x.src, { width: w, height: h }, { tip: x.tip === T ? x.text + (x.description ? '\n' + x.description : '') : x.tip } );
			return '<div id=' + this.id + 'i class="w-img-i f-inbl" style="width:' + ( w ? w + 'px' : 'auto' ) + ';height:' + ( h ? h + 'px' : '100%' ) + ';">' + g + '</div>';
		},
		html_text: function() {
			var x = this.x, p = this.parentNode, f = p.x.format, s, t = x.text;
			if ( typeof t !== _OBJ && f )
				t = _grid_format.call( this, f, p.x.escape );
			else if ( typeof t === _STR && p.x.escape )
				t = $.strEscape( t );
			return t ? '<div id=' + this.id + 't class="w-img-t f-' + ( x.nobr ? 'fix' : 'wdbr' ) + '"' + ( x.nobr && this.x.text ? ' title="' + $.strQuot( this.x.text ) + '"' : '' ) + ' style="width:' + (x.textwidth ? x.textwidth + 'px' : 'auto') + '">' +
					(typeof t === _OBJ ? this.add( t, -1 ).html() : '<span class=w-img-s>' + t + '</span>') + (x.description ? '<div class="w-img-d f-fix" title="' + $.strQuot( x.description ) + '">' + x.description + '</div>' : '') + '</div>' : '';
		},
		html_nodes: function() {
			var s = this.html_img();
			if ( this.x.box ) {
				this.box = Checkbox.parseOption( this, { checked: this.x.focus } );
				$.classAdd( this.box, 'w-img-box' );
				s = this.box.html() + s;
			}
			s += this.html_text();
			return s;
		}
	}
} ),
/* `toggle` 可展开收拢的工具条。可显示单行文本与(或)分割线。
 *  /@text: 文本; @hr(Bool) 显示横线; /@open(Bool): 设置初始展开收拢效果并产生一个toggle图标; /@target: 指定展开收拢的widget ID, 多个用逗号隔开
 */
Toggle = define.widget( 'toggle', {
	Listener: {
		body: {
			ready: function() {
				this.x.open != N && this.toggle( this.x.open );
			},
			click: {
				prop: T,
				method: function() {
					this.toggle();
				}
			}
		}
	},
	Helper: {
		focus: function( a ) {
			var p = a;
			do {
				var b = p.$() && p.$().getAttribute( 'w-toggle' );
				if ( b ) {
					$.all[ b ].toggle( T );
					break;
				}
			} while ( p = p.parentNode );
		}
	},
	Prototype: {
		className: 'w-toggle',
		toggle: function( a ) {
			var a = a == N ? ! (this.x.open == N ? T : this.x.open) : a, c = this.x.target, d = this.x.icon, e = this.x.openicon || d;
			this.x.open = a;
			if ( c && (c = c.split(',')) ) {
				for ( var i = 0; i < c.length; i ++ )
					this.ownerView.find( c[ i ] ).display( this );
			}
			for ( var i = this.nodeIndex + 1, p = this.parentNode, l = p.length; i < l; i ++ ) {
				if ( p[ i ].type === this.type )
					break;
				p[ i ].display( this );
			}
			if ( this.$( 'o' ) ) {
				if ( e ) {
					$.replace( this.$( 'o' ), $.image( a === F ? (d || e) : e, { cls: 'w-toggle-icon', id: this.id + 'o' } ) );
				} else
					$.arrow( this.$( 'o' ), a ? 'b1' : 'r1' );
			}
			$.classAdd( this.$(), 'z-collapse', ! a );
			this.trigger( a ? 'expand' : 'collapse' );
		},
		html_nodes: function() {
			var x = this.x, s = '<table class="w-toggle-table' + ( this.x.hr ? ' z-hr' : '' ) + '" cellspacing=0 cellpadding=0><tr><td class=f-nobr>', c = x.icon, d = x.openicon || c;
			if ( d ) {
				s += $.image( x.open === F ? (c || d) : d, { cls: 'w-toggle-icon', id: this.id + 'o' } );
			} else
				s += ( x.open != N ? $.arrow( this.id + 'o', x.open === F ? 'r1' : 'b1' ) : '' );
			return s + ' <span class=w-toggle-text><em>' + this.x.text + '</em></span>' + ( x.hr ? '<td width=100%><hr class=w-toggle-hr noshade>' : '' ) + '</table>';
		}
	}
} ),
/* `page`
 *  @target: 指向另一个widget，点击页数时让这个widget执行 .page() 方法。如果设定了此参数，那么 currentpage sumpage 等参数都从这个widget里读取
 *  @src: 带$0的url, 点击页数时把$0替换为页数并执行ajax命令
 *  @sumpage: 总页数
 *  @nofirstlast: 不显示"首页"和"尾页"
 *  @jump: 显示跳转输入框
 *  @btncount: 中间有几个显示页数的按钮
 *  @name: 隐藏表单值
 */
Page = define.widget( 'page/mini', {
	Const: function( x ) {
		W.apply( this, arguments );
		x.transparent && (this.className += ' z-trans');
	},
	Extend: 'html',
	Prototype: {
		className: 'w-page w-page-mini',
		isModified: $.rt_false,
		eve: function( i, b ) {
			return b ? ' onclick=' + evw + '.go(' + i + ',this) onmouseover=' + evw + '.over(this) onmouseout=' + evw + '.out(this)' : '';
		},
		over: function( a ) {
			$.classAdd( a, 'z-hv' );
		},
		out: function( a ) {
			$.classRemove( a, 'z-hv' );
		},
		go: function( i, a ) {
			if ( (i = _number( i )) > 0 ) {
				this.$( 'v' ) && (this.$( 'v' ).value = i);
				if ( this.x.target ) {
					var g = this.ownerView.find( this.x.target );
					if ( g ) {
						g.page( i );
						this.x.currentpage = i;
						this.render();
					}
				} else if ( this.x.src ) {
					var s = this.x.src;
					if ( s.indexOf( 'javascript:' ) === 0 ) {
						s = Function( '$0', s ).call( this, i );
						if ( typeof s === _OBJ )
							return this.cmd( s );
					}
					s && this.cmd( { type: 'ajax', src: $.urlParse( s, [ i ] ) } );
				}
			}
		},
		val: function( a ) {
			if ( a === U )
				return this.x.currentpage;
			this.go( a );
		},
		ego: function( e ) {
			if ( e.type === 'keyup' && e.keyCode !== 13 )
				return;
			else if ( e.type === 'click' )
				this.$( 'j' ).focus();
			this.go( this.$( 'j' ).value );
		},
		jumpFocus: function( e, a ) {
			a = a == N || a;
			if ( e.type === 'blur' && this.jbtn.$().contains( document.activeElement ) )
				return;
			$.classAdd( this.$( 'j' ), 'z-on', a );
			$.classAdd( this.$( 'j' ).nextSibling, 'z-on', a );
		},
		initByTarget: function() {
			var c = this.ownerView.find( this.x.target ).page();
			this.x.currentpage = Math.max( _number( c.currentpage ), 1 );
			this.x.sumpage = Math.max( _number( c.sumpage ), 1 );
		},
		html_nodes: function() {
			this.x.target && this.initByTarget();
			var c = this.x.currentpage, m = _number( this.x.sumpage ), n = _number( this.x.btncount ), h = this.x.nofirstlast, f = Math.max( 1, c - Math.ceil( n / 2 ) + 1 ), z = this.x.btncls ? ' ' + this.x.btncls : '',
				s = ( h ? '' : '<em class="_o _b _first' + ( c == 1 ? '' : ' z-us' ) + z + '"' + this.eve( 1, c != 1 ) + '>' + (this.x.labelfirst || this.page_first || '') + '</em>' ) +
					'<em class="_o _b _prev' + ( c == 1 ? '' : ' z-us' ) + z + '"' + this.eve( c - 1, c != 1 ) + '>' + (this.x.labelprev || this.page_prev || '') + '</em>';
			for ( var l = Math.min( m + 1, f + n ), i = l - f < n ? Math.max( 1, l - n ) : f; i < l; i ++ ) {
				s += '<em class="_o _num' + ( i == c ? ' _cur' : ' z-us' ) + z + '"' + this.eve( i, i != c ) + '>' + i + '</em>';
			}
			s += '<em class="_o _b _next' + ( c == m ? '' : ' z-us' ) + z + '"' + this.eve( c + 1, c != m ) + '>' + (this.x.labelnext || this.page_next || '') + '</em>' + ( h ? '' : '<em class="_o _b _last' + ( c == m ? '' : ' z-us' ) + z + '"' + this.eve( m, c != m ) + '>' + (this.x.labellast || this.page_last || '') + '</em>' );
			return (this.x.name ? '<input type=hidden id="' + this.id + 'v" name="' + this.x.name + '" value="' + (c || 1) + '">' : '') + s + this.html_info() + '<i class=f-vi></i>';
		},
		html_info: function() {
			var s = '';
			if ( this.x.info )
				s += '<span class="_t _inf">' + this.x.info + '</span>';
			if ( this.x.jump ) {
				this.jbtn = this.add( { type: 'button', cls: '_jbtn', text: 'GO', on: { click: 'this.parentNode.ego(event)' } }, -1 );
				s += '<span class="_t _to">' + Loc.to + '</span> <input class=_jump id=' + this.id + 'j onfocus=' + evw + '.jumpFocus(event) onblur=' + evw + '.jumpFocus(event,!1) onkeyup=' + evw + '.ego(event)>' + this.jbtn.html() + ' <span class=_t>' + Loc.page + '</span>';
			}
			if ( this.x.setting ) {
				this.sbtn = this.add( { type: 'button', cls: 'f-button _sbtn', icon: '.f-i .f-i-config', nodes: this.x.setting }, -1 );
				s += this.sbtn.html();
			}
			return s;
		}
	}
} ),
PageText = define.widget( 'page/text', {
	Extend: 'page/mini',
	Prototype: {
		className: 'w-page w-page-text',
		page_next: Loc.page_next,
		page_prev: Loc.page_prev,
		page_first: Loc.page_first,
		page_last: Loc.page_last
	}
} ),
PageGroup = define.widget( 'page/buttongroup', {
	Extend: 'horz',
	Prototype: {
		className: 'w-page w-page-buttongroup',
		isModified: $.rt_false,
		go: Page.prototype.go,
		val: Page.prototype.val,
		drop: function( a ) {
			var i = 1, c = _number( this.x.currentpage ), s = _number( this.x.sumpage ), n = [];
			for ( ; i <= s; i ++ ) {
				n.push( { text: i, on: { click: 'this.root().parentNode.parentNode.parentNode.go(' + i + ')' }, disabled: this.x.currentpage == i } );
			}
			a.cmd( { type: 'menu', nodes: n, snap: a, snaptype: 'v', focusIndex: c } );
		},
		html_nodes: function() {
			this.x.target && this.initByTarget();
			var c = 'w-page-button ' + (this.x.btncls != N ? this.x.btncls : this.x.transparent ? 'f-page-button' : ' f-button'), d = this.x.currentpage,
				b = [ { type: 'button', text: '&lt;', cls: c, disabled: d == 1, on: { click: 'this.rootNode.parentNode.go(' + (d - 1) + ')' } },
					  { type: 'button', text: '&gt;', cls: c, disabled: d == this.x.sumpage, on: { click: 'this.rootNode.parentNode.go(' + (d + 1) + ')' } } ];
			if ( this.x.btncount != 0 )
				b.splice( 1, 0, { type: 'button', text: this.x.currentpage + '/' + this.x.sumpage, cls: c, on: { click: 'this.rootNode.parentNode.drop(this)' } } );
			this.groupbar = this.add( { type: 'buttonbar', cls: 'f-groupbar', nodes: b }, -1 );
			return (this.x.name ? '<input type=hidden id="' + this.id + 'v" name="' + this.x.name + '" value="' + d + '">' : '') + this.groupbar.html() + Page.prototype.html_info.call( this ) + '<i class=f-vi></i>';
		}
	}
} ),
/* `fieldset` */
Fieldset = define.widget( 'fieldset', {
	Extend: 'vert/scale',
	Default: { wmin: 2, hmin: 2 },
	Prototype: {
		className: 'w-fieldset',
		init_nodes: function( x ) {
			this.gut = this.add( { type: 'vert', hmin: 23, nodes: x.nodes } );
			if ( x.box )
				this.box = Checkbox.parseOption( this, { target: this.gut } );
		},
		add: function( x, n ) {
			return _proto.add.call( (n !== -1 && this.gut) || this, x, n );
		},
		html: function() {
			return '<fieldset' + this.html_prop() + '><legend class=w-fieldset-legend>' + ( this.box ? this.box.html() : '' ) + this.x.legend + '</legend>' + this.html_before() + this.gut.html() + this.html_after() + '</fieldset>'
		}
	}
} ),
// 模板标题
TemplateTitle = define.widget( 'template/title', {
	Const: function( x, p ) {
		var d = Dialog.get( p );
		if ( d ) {
			d.templateTitle = this;
			x.text = d.x.title;
		}
		W.apply( this, arguments );
	},
	Extend: 'html',
	Listener: {
		body: {
			mousedown: {
				prop: T,
				method: function( e ) {
					var o = Dialog.get( this );
					if ( o ) {
						var b = o._pos.pix_b ? -1 : 1, r = o._pos.pix_r ? -1 : 1, v = b < 0 ? 'bottom' : 'top', h = r < 0 ? 'right' : 'left',
							x = e.clientX, y = e.clientY, t = _number( o.$().style[ v ] ), l = _number( o.$().style[ h ] ), self = this, m;
						if ( o.x.moveable !== F && ! $.classAny( o.$(), 'z-max' ) ) {
							m = $.db( '<div class=w-dialog-move style="width:' + $.width() + 'px;height:' + $.height() + 'px;"></div>' );
							$.moveup( function( e ) {
								o.$().style[ v ] = (t + b * (e.clientY - y)) + 'px';
								o.$().style[ h ] = (l + r * (e.clientX - x)) + 'px';
							}, function( e ) {
								m && $.remove( m );
							} );
						}
					}
				}
			}
		}
	}
} ),
/* `templateview */
TemplateView = define.widget( 'template/view', {
	Const: function( x, p, n ) {
		var d = Dialog.get( p );
		if ( d ) {
			d.contentView = this;
			if ( d.__node ) {
				x = $.extend( {}, d.__node, x );
			} else if ( d.x.src )
				x.src = d.x.src;
			if ( ! x.id && d.x.id )
				x.id = d.x.id;
		}
		View.call( this, x, p, n );
	},
	Extend: 'view'
} ),
/* `dialog`
 *  id 用于全局存取 ( dfish.dialog(id) ) 并保持唯一，以及用于里面的view的 path */
Dialog = define.widget( 'dialog', {
	Const: function( x, p, n ) {
		if ( x.node ) {
			if ( x.node.type !== 'view' )
				x.node = { type: 'view', node: x.node };
			if ( ! x.node.id && x.id )
				x.node.id = x.id;
		}
		if ( x.template ) {
			if ( t = Dialog.tpl( x.template ) ) {
				if ( x.node )
					this.__node = x.node;
				x.node = $.jsonClone( t.node );
				if ( x.cls && t.cls )
					x.cls = t.cls + ' ' + x.cls;
				$.extend( x, t );
			} else {
				var s = Loc.ps( Loc.debug.no_template, x.template );
				t === F ? alert( s ) : $.winbox( s );
			}
		}
		if ( x.width && ! isNaN( x.width ) && x.width > $.width() )
			x.width = $.width();
		if ( x.height && ! isNaN( x.height ) && x.height > $.height() )
			x.height = $.height();
		p == N && (p = _docView);
		W.call( this, x, p, n == N ? -1 : n );
		if ( ! x.node && ! x.template && x.src )
			this.add( { type: 'view', src: x.src, id: x.id } );
		if ( this[ 0 ] && this[ 0 ].type_view )
			this.contentView = this[ 0 ];
		this.contentView && this.contentView.addEvent( 'load', function() { this.trigger( 'load' ) }, this );
		if ( x.id ) {
			Dialog.custom[ x.id ] && Dialog.custom[ x.id ].remove();
			Dialog.custom[ x.id ] = this;
		}
		Dialog.all[ this.id ] = this;
		(this.commander = p).addEventOnce( 'remove', this.remove, this );
	},
	Helper: {
		all: {},
		custom: {},
		get: function( a ) {
			if ( typeof a === _STR )
				return Dialog.custom[ a ];
			if ( a.isWidget )
				return ! a._disposed && a.closest( function() { return this.isDialogWidget } );
			for ( var k in Dialog.all ) {
				if ( Dialog.all[ k ].contains( a, T ) )
					return Dialog.all[ k ];
			}
		},
		tpl: function( a ) {
			var t = typeof a === _STR ? _templates[ a ] : a;
			if ( ! t && cfg.template_src )
				$.ajaxJSON( $.urlParse( cfg.template_src, [ a ] ), function( x ) { t = _templates[ a ] = x; }, N, T, N, function() { t = F; } );
			return t;
		},
		cleanPop: function() {
			for ( var k in Dialog.all ) {
				Dialog.all[ k ].attr( 'pophide' ) && Dialog.all[ k ].close();
			}
		}
	},
	Listener: {
		body: {
			ready: function() {
				this.loaded = T;
				var w = this.x.width, h = this.x.height;
				if ( (w === '*' || w === '100%') || (h === '*' || h === '100%') )
					this.max();
			}
		}
	},
	Prototype: {
		loaded: F,
		className: 'w-dialog',
		isDialogWidget: T,
		outerWidth: function() {
			var w = this.attr( 'width' );
			return w == N || w < 0 ? N : _docView.scaleWidth( this );
		},
		outerHeight: function() {
			var h = this.attr( 'height' );
			return h == N || h < 0 ? N : _docView.scaleHeight( this );
		},
		attrSetter: function( a, b ) {
			if ( a === 'title' ) {
				this.templateTitle && this.templateTitle.text( b );
			}
		},
		max: function() {
			var s = this.$().style, o = this._ori_pos;
			this._ori_pos = o ? N : { width: this.width(), height: this.height(), top: s.top || s.bottom, left: s.left || s.right };
			this.resize( o ? o.width : '*', o ? o.height : '*' );
			s[ s.top ? 'top' : 'bottom' ] = o ? o.top : 0;
			s[ s.left ? 'left' : 'right' ] = o ? o.left : 0;
			$.classAdd( this.$(), 'z-max', ! o );
		},
		//@public 移动到指定位置 /@a -> left, b -> top
		moveTo: function( a, b ) {
			var s = this.$().style;
			s.left = a + 'px'; s.top = b + 'px';
			s.right = s.bottom = '';
		},
		//@public 移动到指定位置 /@a -> elem|widget, b -> snap option
		snapTo: function( a, b ) {
			$.snapTo( this.$(), $.snap( this.width(), this.height(), a.isWidget ? a.$() : a, b ) );
		},
		_dft_pos: function() {
			var w = this.width(), h = this.height();
			return { left: ( $.width() - w ) / 2, top: Math.max( 0, ( $.height() - h ) / 2 ) };
		},
		reload: function( a, b, c ) {
			if ( typeof b === _FUN )
				c = b, b = N;
			this.contentView.reload( a, b, c && $.proxy( this, c ) );
		},
		preload: function( a, b ) {
			if ( typeof a === _FUN )
				b = a, a = N;
			this.contentView.preload( a, b && $.proxy( this, b )  );
		},
		render: function() {
			if ( this._disposed )
				return;
			var f = $.number( this.x.position ), r;
			! this.parentNode && _docView.add( this );
			this.$() && this.removeElem();
			if ( this.x.cover )
				$.db( '<div id=' + this.id + 'cvr class="w-dialog-cover z-type-' + this.type +  '"></div>' );
			$.db( this.html() );
			if ( (this.x.minwidth || this.x.maxwidth) && ! this.x.width ) {
				var w = Math.max( this.$().offsetWidth, this.$().scrollWidth + 1 ), n = this.attr( 'minwidth' ), m = this.attr( 'maxwidth' );
				this.width( n && n > w ? n : m && m < w ? m : w + (this.attr( 'wmin' ) || 0) );
			}
			if ( (this.x.minheight || this.x.maxheight) && ! this.x.height ) {
				var h = Math.max( this.$().offsetHeight, this.$().scrollHeight + 1 ), n = this.attr( 'minheight' ), m = this.attr( 'maxheight' );
				this.height( n && n > h ? n : m && m < h ? m : h + (this.attr( 'hmin' ) || 0) );
			}
			var g = this._snapElem(), w = this.$().offsetWidth, h = this.$().offsetHeight;
			// 如果有指定 snap，采用 snap 模式
			if ( g ) {
				r = $.snap( w, h, g, this.x.snaptype || this._snaptype, this._fitpos, this.x.indent );
			} else if ( f ) { // 八方位浮动的起始位置
				var b = '14,23,21,34,32,41,43,12'.split( ',' );
				r = $.snap( w, h, N, b[ f - 1 ], this._fitpos, this.x.indent );
			}
			if ( ! r )
				r = this._dft_pos();
			$.snapTo( this.$(), r );
			if ( f ) { // 八方位浮动效果
				var m = Math.ceil( f / 2 ) - 1;
				Q( this.$() ).animate( m == 1 ? { left: r.left - w } : m == 2 ? { top: r.top - h } : m == 3 ? { right: r.right - w } : { bottom: r.bottom - h }, 100 );
			}
			if ( r.type ) {
				$.classAdd( this.$(), 'z-snap-' + r.type );
				$.classAdd( this.$(), 'z-mag-' + ( r.mag_t ? 't' : r.mag_l ? 'l' : r.mag_b ? 'b' : 'r' ) );
			}
			// 检测object控件，如果存在则生成iframe遮盖。如果确定object不会影响dialog的显示，请给object标签加上属性 data-transparent="1"
			for ( var i = 0, o = $.tags( 'object' ); i < o.length; i ++ ) {
				if ( ! o[ i ].getAttribute( 'data-transparent' ) ) {
					this[ 0 ].$() && $.classAdd( this[ 0 ].$(), 'f-rel' );
					$.prepend( this.$(), '<iframe style="height:100%;width:100%;position:absolute;" src="about:blank" frameborder=0 marginheight=0 marginwidth=0></iframe>' );
					break;
				}
			}
			this._pos = r;
			this.attr( 'pophide' ) && this.listenHide( T );
			this.triggerAll( 'ready' );
			if ( this.x.timeout )
				this.listenTimeout();
			this.vis = T;
			return this;
		},
		isShow: function() {
			return this.vis;
		},
		show: function( a ) {
			if ( this.x.cache && this.$() ) {
				$.show( this.$() ); this.x.cover && $.show( this.$( 'cvr' ) ); this.vis = T;
			} else
				this.render();
			this._snapElem( T );
			return this;
		},
		_snapElem: function( a ) {
			var d = this.x.snap;
			if ( typeof d === _STR )
				(d = this.ownerView.find( d )) && (d = d.$());
			d && (a != N) && $.classAdd( d, 'z-snap', a );
			return d;
		},
		hide: function() {
			if ( this._disposed )
				return;
			this._snapElem( F );
			if ( this.x.cache )
				this.$() && ($.hide( this.$() ), (this.x.cover && $.hide( this.$( 'cvr' ) )), this.vis = F);
			else
				this.x.memory ? this._hide() : this.remove();
		},
		_hide: function() {
			if ( this.vis ) {
				this.contentView && this.contentView.abort();
				this.listenHide( F );
				this.removeElem();
				this.vis = F;
			}
		},
		// 绑定鼠标监听 /@a -> 为 false 时解除监听
		listenHide: function( a ) {
			if ( a === F ) {
				this.listenHide_ && this._listenHide( a );
			} else {
				var self = this;
				setTimeout( function() { ! self._disposed && self._listenHide( a ); }, 200 ); // 延时处理，避免出现后立即消失的情况
			}
		},
		_listenHide: function( a ) {
			var self = this, d = this.x.hoverdrop;
			$.attach( document, 'mousedown mousewheel', self.listenHide_ || ( self.listenHide_ = function( e ) {
				! self._disposed && (e.srcElement.id == self.id + 'cvr' || ! ( self.contains( e.srcElement ) || ( ! self.x.independent && self.x.snap && self.x.snap.contains( e.srcElement ) ) )) && self.close();
			} ), a );
			if ( d ) {
				var o = d === T ? ($( this.x.snap ) || this.parentNode.$()) : d.isWidget ? d.$() : d, f = a === F ? 'off' : 'on';
				Q( [ o, self.$() ] )[ f ]( 'mouseenter', self._hover_over || (self._hover_over = function() { clearTimeout( self._hover_timer ); delete self._hover_timer; }) );
				/*Q( [ o, self.$() ] )[ f ]( 'mouseleave', self._hover_move || (self._hover_move = function( e ) {
					if ( ! o.contains( e.relatedTtarget ) && ! self.contains( e.relatedTtarget ) ) {
						clearTimeout( self._hover_timer );
						self._hover_timer = setTimeout( function() { self.close() }, 300 );
					}
				}) );*/
				Q( document )[ f ]( 'mousemove', self._hover_move || (self._hover_move = function( e ) {
					if ( ! self._hover_timer && ! o.contains( e.target ) && ! self.contains( e.target ) ) {
						clearTimeout( self._hover_timer );
						self._hover_timer = setTimeout( function() { self.close() }, 300 );
					}
				}) );
			}
		},
		listenTimeout: function() {
			setTimeout( $.proxy( this, this.close ), this.x.timeout * 1000 );
		},
		removeElem: function( a ) {
			_proto.removeElem.call( this, a );
			! a && this.x.cover && $.remove( this.$( 'cvr' ) );
		},
		remove: function() {
			if ( ! this._disposed ) {
				this._hide();
				this.dispose();
			}
		},
		close: function() {
			if ( ! this._disposed && F !== this.trigger( 'close' ) )
				this.hide();
		},
		dispose: function() {
			if ( ! this._disposed ) {
				this.commander && this.commander.removeEvent( 'remove', this.remove, this );
				delete Dialog.all[ this.id ];
				delete this.commander;
				if( this.x.id )
					delete Dialog.custom[ this.x.id ];
				_proto.dispose.call( this );
			}
		}
	}
} ),
_operexe = function( x, g, a ) {
	return typeof x === _OBJ ? g.exec( x, a ) : (x && $.fnapply( x, g, a ));
},
/* `alert/button` */
AlertButton = define.widget( 'alert/button', {
	Extend: Button,
	Listener: {
		body: {
			click: {
				block: function() {
					var d = $.dialog( this );
					_operexe( (this.x.on && this.x.on.click) || (this.type === 'alert/submitbutton' ? d.x.yes : d.x.no), d.commander, d.x.args );
					d.close();
					return T;
				}
			}
		}
	}
} ),
AlertSubmitButton = define.widget( 'alert/submitbutton', {
	Extend: 'submitbutton',
	Listener: {
		body: {
			click: {
				block: AlertButton.Listener.body.click.block
			}
		}
	}
} ),
/*  `alert`  */
Alert = define.widget( 'alert', {
	Const: function( x, p ) {
		var a = this.type === 'alert', k, t = cfg.template_alert || cfg.template, r = x.args, s = x.btncls || 'f-button',
			b = { type: 'alert/submitbutton', cls: s, text: '    ' + Loc.confirm + '    ' },
			c = { type: 'alert/button', cls: s, text: '    ' + Loc.cancel + '    ' }, d;
		if ( x.buttons ) {
			for ( var i = 0, d = []; i < x.buttons.length; i ++ ) {
				x.buttons[ i ].type = 'alert/' + x.buttons[ i ].type;
				! x.buttons[ i ].cls && (x.buttons[ i ].cls = s);
				d.push( x.buttons[ i ] );
			}
		}
		if ( this._tpl = Dialog.tpl( t ) ) {
			$.extend( x, { template: t, minwidth: 260, maxwidth: 700, maxheight: 600, title: Loc.opertip, node: { type: 'vert', nodes: [
				{ type: 'html', scroll: T, height: '*', text: '<table border=0 style="margin:10px 20px 20px 5px;word-wrap:break-word;"><tr><td align=center valign=top><div style=width:65px;padding-top:5px>' +
				$.image( x.icon ? x.icon : '.f-i-alert' + (a ? 'warn' : 'ask') ) + '</div><td>' + $.urlParse((x.text || '') + '', x.args, N, T).replace( /\n/g, '<br>' ) + '</table>' },
				{ type: 'buttonbar', align: 'center', height: 60, space: 10, nodes: d || (a ? [ b ] : [ b, c ]) }
			] } } );
		}
		Dialog.call( this, x, a ? _docView : p );
	},
	Extend: Dialog,
	Prototype: {
		className: 'w-dialog w-alert',
		render: function() {
			var s = document.readyState;
			if ( this._tpl && (s === 'complete' || s === U) ) {
				return Dialog.prototype.render.call( this );
			} else {
				var x = this.x, t = $.urlParse((x.text || '') + '', x.args, N, T);
				if ( this.type === 'alert' ) {
					$.winbox( t );
					_operexe( x.yes, this, x.args );
				} else {
					_operexe( confirm( t ) ? x.yes : x.no, this, x.args );
				}
			}
		}
	}
} ),
/*  `confirm`  */
Confirm = define.widget( 'confirm', {
	Extend: Alert
} ),
/*  `tip`  */
Tip = define.widget( 'tip', {
	Const: function( x, p ) {
		$.extend( x, { template: {  cls: 'w-tip' + (x.prong === F ? ' z-noprong' : '') + (x.closable !== F ? ' z-x' : ''), indent: -10, node: { type: 'vert', aftercontent: '<div class=w-tip-o></div><div class=w-tip-i></div>', nodes: [ { type: 'template/view', height: '*' } ] } },
			node: { type: 'html', text: '<div class=w-tip-text>' + (x.text && /^<\w+/g.test( x.text ) ? x.text : '<span class=f-va' + (x.closable ? ' style="padding-right:20px;"' : '') + '>' + $.urlParse(x.text || '', x.args, N, T) + '</span><i class=f-vi></i>') + '</div>' + (x.closable !== F ? $.image('.f-i-close',{cls: 'w-tip-x', click:$.abbr + '.close(this)'}) : '') },
			pophide: T, independent: T, snap: p, snaptype: 'tb,rl,lr,bt,rr,ll,bb,tt,cc' } );
		Dialog.apply( this, arguments );
		if ( ! this.x.multiple ) {
			Tip.instance && Tip.instance.hide();
			Tip.instance = this;
		}
	},
	Extend: Dialog
} ),
/*  `loading`  */
Loading = define.widget( 'loading', {
	Const: function( x, p ) {
		var s = '<div class=w-loading><cite class=_c>' + $.image( '%img%/loading-cir.gif' ) + ' <em class=_t>' + (x.text || Loc.loading) + '</em></cite><i class=f-vi></i></div>', g = x.progress, w = -1;
		if ( g ) {
			s = '<div class=w-loading>' + new Progress( $.extend( g, { text: x.text, face: 'loading' } ), this, -1 ).html() + '</div>';
			w = 200;
		}
		$.extend( x, { cls: 'f-shadow', width: w, node: { type: 'html', text: s }, independent: T } );
		Dialog.apply( this, arguments );
		Loading.instance && Loading.instance.hide();
		Loading.instance = this;
	},
	Extend: Dialog,
	Prototype: {
		text: function() {
			
		}
	}
} ),
// 以 src 为 key 存储 progress 实例。相同 src 的实例进程将被合并。
_progressCache = {},
/*  `progress`  */
/*  { type: 'progress', percent: 10, delay: 5, src: '' }   */
Progress = define.widget( 'progress', {
	Const: function( x, p ) {
		W.apply( this, arguments );
		x.src && $.jsonArray( this, _progressCache, x.src );
	},
	Listener: {
		body: {
			ready: function() {
				var x = this.x, s = x.src, self = this;
				if ( s ) {
					this._timer = setTimeout( function() {
						// 相同 src 的实例，只让第一个去请求ajax
						if ( ! self._disposed && self.isHead() ) {
							$.ajaxJSON( s, function( x ) {
								// 返回数据可以是 command | {type:'progress'} | {nodes:[{type:'progress'}]}
								if ( _cmdHooks[ x.type ] ) {
									_cmdHooks[ x.type ].call( self, x );
								} else {
									for ( var i = 0, n = x.nodes || [ x ], l = n.length, d, o; i < l; i ++ ) {
										o = (d = n[ i ]).id && self.ownerView.find( d.id );
										(o || self).replace( ! d.id || o === self ? $.extend( d, { text: self.x.text, face: self.x.face } ) : d );
									}
								}
							} );
						}
					}, x.delay * 1000 );
				}
			}
		}
	},
	Prototype: {
		stop: function() {
			clearTimeout( this._timer );
		},
		start: function() {
			this.triggerListener( 'ready' );
		},
		isHead: function() {
			return _progressCache[ this.x.src ][ 0 ] === this;
		},
		html: function() {
			var f = this.x.face || 'normal';
				s = '<table id=' + this.id + ' class="w-progress-' + f + '"><tr><td colspan=2>' + (this.x.text || Loc.loading) +
					'<tr><td width=100%><div class=_bar><div class=_cur style="width:' + this.x.percent + '%"></div></div><td width=30><span class=_num>' + this.x.percent + '%</span></table>';
			return s;
		},
		dispose: function() {
			this.stop();
			$.arrPop( _progressCache[ this.x.src ], this );
			_proto.dispose.call( this );
		}
	}
} ),
MenuSplit = define.widget( 'menu/split', {
	Prototype: {
		show: $.rt_null, hide: $.rt_null, elemht: function() { return 5 },
		html: function() {
			return '<div class=w-toggle-hr>&bnsp;</div>';
		}
	}
} ),
/* `menu` */
Menu = define.widget( 'menu', {
	Const: function( x, p, n ) {
		p == N && (p = _docView);
		W.call( this, x, p, n == N ? -1 : n );
		Dialog.all[ this.id ] = this;
		this.echoStart = 0;
		this.echoEnd   = this.length -1;
		this._fitpos   = T;
		(this.commander = p).addEventOnce( 'remove', this.remove, this );
	},
	Extend: Dialog,
	Child: 'menu/button',
	Default: { width: -1, height: -1, pophide: T },
	Listener: {
		body: {
			// menu的DOM渲染做两次，第一次测量并调整可用范围，第二次渲染menu/button。所以第一次装载完毕时不触发用户定义的load事件，等第二次渲染menu/button时再触发
			ready: $.rt_false,
			mousewheel: function( e ) {
				if ( this.$( 'up' ) )
					this.scroll( e.wheelDelta > 0 ? -1 : 1 );
				$.stop( e );
			}
		}
	},
	Prototype: {
		NODE_ROOT: T,
		className: 'w-menu',
		// menu有两种子节点: menu/split, menu/button
		x_type: function( t ) {
			return t && t.indexOf( 'menu/' ) !== 0 ? 'menu/' + t : 'menu/button';
		},
		_dft_pos: function() {
			return $.snap( this.width(), this.height(), _event_point, '21,12', this._fitpos );
		},
		_hide: function() {
			if ( this.$() ) {
				var i = this.length;
				while ( i -- )
					this[ i ].hide();
				Dialog.prototype._hide.call( this );
				if ( Menu.instance == this )
					delete Menu.instance;
				this.parentNode.$() && $.classRemove( this.parentNode.$(), 'z-drop' );
			}
		},
		listenHide: function( a ) {
			this.type === 'menu' && Dialog.prototype.listenHide.call( this, a );
		},
		render: function() {
			if ( this.type === 'menu' ) {
				Menu.instance && ! Menu.instance.isLocked && Menu.instance.hide();
				Menu.instance = this;
				$.classAdd( this.parentNode.$(), 'z-drop' );
			}
			for ( var i = 0, l = this.length, e = h = 0, m = $.height(); i < l; i ++ ) {
				h += this[ i ].elemht();
				if ( h > m && ! e )
					this.echoEnd = e = i;
			}
			this.virht = h;
			Dialog.prototype.render.call( this );
			this.checkOverflow();
			this.triggerHandler( 'ready' );
			return this;
		},
		// 检查是否有高度溢出，并填充内容
		checkOverflow: function() {
			var r = this._pos, m = 0, g = this.$( 'g' ), b = MenuButton.prototype.elemht();
			if ( r.top < 0 )
				m -= r.top;
			if ( r.bottom < 0 )
				m -= r.bottom;
			if ( m ) {
				// realht 是按钮可展现区域的高度 / 18 = 上下两个翻页按钮高度 + menu的padding border高度
				this.realht = g.offsetHeight - 18 - m;
				this.realht -= this.realht % b;
				g.style.height = this.realht + 'px';
				$.before( g, '<div id=' + this.id + 'up class="_ar" onclick=' + evw + '.scroll(-1)>' + $.arrow( 't2' ) + '</div>' );
				$.after( g,  '<div id=' + this.id + 'dn class="_ar" onclick=' + evw + '.scroll(1)>'  + $.arrow( 'b2' ) + '</div>' );
				// 如果有设置focusIndex, 需要让这个menu/button显示在中间
				var f = this.x.focusIndex;
				if ( f != N && f > 0 && f < this.length ) {
					var j = f - 1, k = f + 1, l = this.length, h = this[ f ].elemht();
					while ( j > - 1 || k < l ) {
						if ( ( j > -1 && (h += this[ j -- ].elemht()) >= this.realht ) || ( k < l && (h += this[ k ++ ].elemht()) >= this.realht ) )
							break;
					}
					this.echoStart = j + 1, this.echoEnd = k - 1;
				}
			} else
				this.realht = this.virht;
			this.fill();
		},
		scroll: function( a ) {
			if ( $.classAny( this.$( a > 0 ? 'dn': 'up' ), 'z-us' ) ) {
				var i = a > 0 ? this.echoEnd : this.echoStart, l = this.length, c = 0;
				for ( ; i > -1 && i < l; i += ( a === 0 ? 1 : a ) ) {
					c += this[ i ].elemht();
					if ( c > this.realht )
						break;
				}
				a > 0 ? (this.echoStart = this.echoEnd, this.echoEnd = Math.min( i, l - 1 )) : (this.echoEnd = this.echoStart, this.echoStart = Math.max( 0, i ));
				if ( c < this.realht ) {
					for ( i = this.echoEnd; i < l; i ++ ) {
						c += this[ i ].elemht();
						if ( c > this.realht )
							break;
					}
					this.echoEnd = Math.min( i, l - 1 );
				}
				this.fill();
			}
		},
		fill: function() {
			for ( var i = this.echoStart, l = this.echoEnd, s = '', e = h = 0, m = this.realht; i <= l; i ++ ) {
				h += this[ i ].elemht();
				if ( h > m ) {
					this.echoEnd = i;
					break;
				}
				s += this[ i ].html();
			}
			this.$( 'g' ).innerHTML = s;
			if ( this.realht !== this.virht ) {
				$.classAdd( this.$( 'up' ), 'z-us', this.echoStart > 0 ? T : F );
				$.classAdd( this.$( 'dn' ), 'z-us', this.echoEnd === this.length - 1 && (this.$( 'g' ).offsetHeight === this.$( 'g' ).scrollHeight) ? F : T );
			}
			/*var g = this.$( 'g' ), r = $.bcr( g );
			if ( g.scrollWidth - r.width >= 1 ) {
				g.style.width = (g.offsetWidth + 6) + 'px';
				$.classAdd( this.$(), 'z-omit' );
			}*/
		},
		html_nodes: function() {
			//取最长的一个做snap测试
			for ( var i = 0, l = this.length, m = 0, t, j; i < l; i ++ ) {
				if ( this[ i ].type == 'menu/button' ) {
					t = ('' + this[ i ].x.text || '').length;
					m <= t && (m = t, j = i);
				}
			}
			var s = '<div class=_g id=' + this.id + 'g onmousewheel=' + eve + ' style="max-width:' + (Math.floor(($.width() / 2)) - 2) + 'px;height:' + this.virht + 'px">' + ( j != N ? this[ j ].html() : '' ) + '</div>';
			return ie7 ? '<table cellspacing=0 cellpadding=0 border=0><tr><td>' + s + '</table>' : s;
		}
	}
} ),
/* `submenu` */
SubMenu = define.widget( 'submenu', {
	Extend: Menu,
	Prototype: {
		_snaptype: '21,12'
	}
} );
/* `deck` */
define.widget( 'deck/button', {
	Const: function( x, p ) {
		var d = p.parentNode,
			h = d.x.buttonheight;
		// 如果button没有定义这些参数，就加上系统默认的参数值
		$.extend( x, { width: '*', height: h, cls: 'f-deck-button', hmin: 2 } );
		Button.apply( this, arguments );
		this.addEvent( 'click', function() {
			var f = d.getFocus();
			if ( f && f !== this ) {
				f.parentNode.height( h - 1 );
				f.focus( F );
			}
			if ( ! this.isFocus() ) {
				this.parentNode.height( '*' );
				this.focus();
			}
		} );
	},
	Extend: Button
} );
define.widget( 'deck/item', {
	Const: function( x, p ) {
		W.apply( this, arguments );
		x.height = x.button.focus ? '*' : p.x.buttonheight - 1;
		this.button  = this.add( x.button );
		this.content = this.add( x.content );
	},
	Extend: 'vert',
	Prototype: {
		className: 'w-vert f-rel',
		x_type: function( t ) {
			return t === 'button' ? 'deck/' + t : t;
		}
	}
} );
/* `deck */
define.widget( 'deck', {
	Extend: 'vert',
	Child: 'deck/item',
	Prototype: {
		x_nodes: function() {
			for ( var i = 0, d = this.x.nodes, l = d.length, r = []; i < l; i += 2 )
				r.push( { button: d[ i ], content: d[ i + 1 ] } );
			return r;
		},
		getFocus: function() {
			for ( var i = 0; i < this.length; i ++ )
				if ( this[ i ].button.isFocus() ) return this[ i ].button;
		}
	}
} );

/* 表单控件部分 包括输入表单和按钮 */
var
_dft_min = 2,
_z_on = function( a ) {
	if ( ! (this.x.readonly || this.x.disabled) ) {
		$.classAdd( this.$(), 'z-on', a );
		a !== F && $.classRemove( this.$(), 'z-err' );
		var c = this.isEmpty();
		this.x.placeholder && this.$( 'ph' ) && $.classAdd( this.$( 'ph' ), 'f-none', a !== F || ! c );
	}
},
// /@ a -> valid object, b -> valid code, c -> args
_form_err = function( a, b, c ) {
	return { name: this.x.name, code: b, label: this.x.label, text: ( a && a[ b + 'text' ] ) || Loc.ps.apply( N, [ Loc.form[ b === 'required' && ! this.x.label ? 'complete_required' : b ], this.x.label || Loc.field ].concat( c || [] ) ) || '' };
},
_valid_err = function( b, v ) {
	if ( ! b )
		return;
	if ( typeof v === _STR ) {
		if ( b.required && ! (v = $.strTrim( v )) )
			return _form_err.call( this, b, 'required' );
		var c = $.strLen( v ), d;
		if ( b.maxlength && c > b.maxlength ) // maxlength, minlength 检查字符长度
			return _form_err.call( this, b, 'maxlength', [ c - b.maxlength ] );
		if ( b.minlength && c < b.minlength )
			return _form_err.call( this, b, 'minlength', [ b.minlength ] );
		if ( b.maxvalue && v && $.number( v ) > $.number( b.maxvalue ) ) // maxvalue, minvalue 检查 spinner date 的最大值最小值
			return _form_err.call( this, b, 'maxvalue', [ b.maxvalue ] );
		if ( b.minvalue && v && $.number( v ) < $.number( b.minvalue ) )
			return _form_err.call( this, b, 'minvalue', [ b.minvalue ] );
		if ( b.maxsize && v && v.split( ',' ).length > $.number( b.maxsize ) ) // maxsize, minsize 检查 checkbox combox 可以选择多少项
			return _form_err.call( this, b, 'maxsize', [ b.maxsize ] );
		if ( b.minsize && v && v.split( ',' ).length < $.number( b.minsize ) )
			return _form_err.call( this, b, 'minsize', [ b.minsize ] );
		if ( b.beforenow && v && v > $.dateFormat( new Date(), this.x.format ) )
			return _form_err.call( this, b, 'beforenow', [ b.beforenow ] );
		if ( b.afternow && v && v < $.dateFormat( new Date(), this.x.format ) )
			return _form_err.call( this, b, 'afternow', [ b.afternow ] );
		if ( b.pattern && v && ! eval( b.pattern + '.test(v)' ) )
			return _form_err.call( this, b, 'pattern' );
		if ( b.compare && v && (c = this.ownerView.f( b.compare )) && (d = c.val()) ) {
			if ( this.valueType === 'date' && c.valueType === 'date' ) {
				var f = (this.x.format.length > c.x.format.length ? this : c).x.format;
				v = $.dateFormat( $.dateParse( v, this.x.format ), f );
				d = $.dateFormat( $.dateParse( d, c.x.format ), f );
			}
			if ( this.valueType === _NUM )
				v = _number( v );
			if ( c.valueType === _NUM )
				d = _number( d );
			if ( ! eval( ( typeof v === _STR ? '"' + $.strQuot( v ) + '"' : v) + ( b.comparemode || '==' ) + ( typeof d === _STR ? '"' + $.strQuot( d ) + '"' : d) ) )
				return _form_err.call( this, b, 'compare', [ b.comparemode, this.ownerView.f( b.compare ).x.label ] );
		}
		if ( b.method && (d = Function( b.method ).call( this, v )) )
			return { name: this.x.name, code: 'method', text: d };
	} else if ( $.isArray( v ) ) {
		if ( b.required && ! v.length )
			return _form_err.call( this, b, 'required' );
		if ( b.maxsize && v.length > b.maxsize ) // maxsize, minsize 检查 checkbox combox 可以选择多少项
			return _form_err.call( this, b, 'maxsize', [ b.maxsize ] );
		if ( b.minsize && v.length < b.minsize )
			return _form_err.call( this, b, 'minsize', [ b.minsize ] );
	}
},
_valid_opt = function( a ) {
	return b = a == N || a === T ? this.x.validate : a === F ? N : typeof a === _OBJ ? a : (this.x.validategroup && this.x.validategroup[ a ]);
},
_enter_submit = function( k, a ) {
	k === 13 && a.ownerView.submitButton && a.ownerView.submitButton.click();
},
// 检查是否正在用中文输入法
_listen_ime = function( a, b ) {
	$.attach( b || a.ipt(), 'compositionstart', function() { a._imeMode = T } );
	$.attach( b || a.ipt(), 'compositionend',   function() { a._imeMode = F } );
},
// 检测表单高度和缩进
_input_indent_value,
_input_indent = function() {
	if ( ! _input_indent_value ) {
		br.chdiv( 'w-form w-input w-text', '<input class=_t style=width:0>', function() {
			_input_indent_value = this.children[ 0 ].offsetWidth || 5;
		} );
	}
	return _input_indent_value;
},
/* `abs/form` */
AbsForm = define.widget( 'abs/form', {
	Const: function( x, p ) {
		W.apply( this, arguments );
		this.className += ' w-' + this.type;
	},
	Listener: {
		tag: 't',
		body: {
			focus: {
				prop: T,
				method: function( e ) {
					e == N && this.$( 't' ).focus();
					_z_on.call( this );
				}
			},
			blur: {
				prop: T,
				method: function() { ! this.contains( document.activeElement ) && _z_on.call( this, F ) }
			},
			valid: function( e, a ) {
				return this.getValidError( a );
			},
			error: function( e, a ) {
				typeof a === _OBJ ? this.cmd( a ) : $.classAdd( this.$(), 'z-err', a );
			}
		}
	},
	Prototype: {
		isFormWidget: T,
		className: 'w-form',
		usa: function() { return ! this.x.readonly && ! this.x.disabled },
		text:  function() {
			return $( this.id + 't' ).value;
		},
		ipt: function() {
			return this.$( 't' );
		},
		isEmpty: function() {
			return !(this.val() || this.text());
		},
		//@implement
		attrSetter: function( a, b ) {
			if ( a == 'readonly' )
				this.readonly( b );
			else if ( a == 'disabled' )
				this.disable( b );
		},
		disable: function( a ) {
			a = a == N || a;
			this.ipt().disabled = this.x.disabled = a;
			$.classAdd( this.$(), 'z-ds', a );
			$.classRemove( this.$(), 'z-err' );
		},
		readonly: function( a ) {
			a = a == N || a;
			this.ipt().readOnly = this.x.readonly = a;
			$.classAdd( this.$(), 'z-ds', a );
			$.classRemove( this.$(), 'z-err' );
		},
		// @a -> valid name
		getValidError: function( a ) {
			if ( this.x.readonly || this.x.disabled )
				return;
			return _valid_err.call( this, _valid_opt.call( this, a ), this.val() );
		},
		// @a -> validate object, b -> group name
		validate: function( a, b ) {
			var x = this.x, c;
			if ( b ) {
				c = (x.validategroup || (x.validategroup = {}));
				a ? $.merge( (c[ b ] || (c[ b ] = {})), a ) : (c[ b ] = N);
			} else {
				c = (x.validate || (x.validate = {}));
				a ? $.merge( c, a ) : (x.validate = N);
				this.$() && $.classAdd( this.$(), 'z-required', !!c.required );
			}
		},
		val: function( a ) {
			if ( a == N )
				return this.ipt() ? this.ipt().value : this.x.value;
			this.ipt().value = a;
			this.ipt() && this.resetEffect();
			this.trigger( 'change' );
		},
		reset: function() {
			this.val( this.x.value == N ? '' : this.x.value );
		},
		resetEffect: function() {
			if ( this.x.placeholder && this.$( 'ph' ) )
				$.classAdd( this.$( 'ph' ), 'f-none', !! this.val() || this.$().contains( document.activeElement ) );
		},
		form_prop: function( a ) {
			var t = '', w = this.innerWidth(), h = this.innerHeight();
			if ( w != N )
				t += 'width:' + ( w - this.width_minus() ) + 'px;';
			if ( h != N )
				t += 'height:' + ( h - this.height_minus() ) + 'px;';
			if ( t )
				t = ' style="' + t + '"';
			return ' id="' + this.id + 't" class=_t name="' + (this.x.name || '') + '"' + (this.x.readonly ? ' readonly' : '') + (this.x.disabled ? ' disabled' : '') + (a === F ? '' : ' value="' + $.strEscape(this.x.value == N ? '' : '' + this.x.value) + '"') + t + _html_on( this );
		}
	}
} ),
/* `hidden` */
Hidden = define.widget( 'hidden', {
	Const: function( x ) {
		x.width = x.height = 0;
		W.apply( this, arguments );
	},
	Extend: AbsForm,
	Prototype: {
		isModified: $.rt_false,
		readonly: $.rt_null,
		disable: function( a ) { this.$().disabled = a == N || a },
		val: function( a ) {
			return a === U ? ($( this.id ) || this.x).value : (($( this.id ) || this.x).value = a);
		},
		html: function() {
			return '<input type=hidden id="' + this.id + '" name="' + (this.x.name || '') + ( this.x.disabled ? ' disabled' : '' ) + '" value="' + $.strQuot(this.x.value || '') + '"' + (this.x.id ? ' w-id="' + this.x.id + '"' : '') + '>';
		}
	}
} ),
/* `textarea` */
Textarea = define.widget( 'textarea', {
	Const: function( x, p ) {
		AbsForm.apply( this, arguments );
		if ( x.cls || x.style || x.transparent ) {
			this.defaults( _size_fix( x.cls, x.style, x.transparent ? 0 : _dft_min, x.transparent ? 0 : _dft_min ) );
			x.transparent && (this.className += ' z-trans');
		}
		if ( x.validate && x.validate.required )
			this.className += ' z-required';
	},
	Extend: AbsForm,
	Listener: {
		range: 'input',
		body: {
			change: {
				proxy: ie ? 'propertychange keyup' : 'input',
				block: $.rt_true,
				prop: function() {
					return this.x.validate && this.x.validate.maxlength;
				},
				method: function( e ) {
					//this._imeMode === U && _listen_ime( this );
					var v = this.val(), c = this.x.on && this.x.on.change, m = this.x.validate && this.x.validate.maxlength,
						f = function() {
							//if ( ! this._imeMode ) {
								m && $.strLen( v ) > m && this.val( v = $.strSlice( v, m ) );
								c && $.fncall( c, this );
							//}
						};
					if ( this._value === U )
						this._value = this.x.value;
					if ( this._value != v ) {
						if ( ie ) {
							if ( ( e.propertyName === 'value' || e.type === 'keyup' ) ) {
								if ( ie7 ) {
									clearTimeout( this._change_timer );
									this._change_timer = setTimeout( $.proxy( this, f ), 10 );
								} else
									f.call( this );
							}
						} else
							f.call( this );
						this._value = v;
					}
				}
			},
			resize: function() {
				var w = this.innerWidth();
				if ( w > 0 && this.$() ) {
					this.$( 't' ).style.width = (w -= this.width_minus()) + 'px';
					this.$( 'ph' ) && (this.$( 'ph' ).style.width = w + 'px');
				}
			}
		}
	},
	Default: {
		height: -1,
		wmin: _dft_min,
		hmin: _dft_min
	},
	Prototype: {
		className: 'w-form w-input',
		width_minus:  function() { return _input_indent() },
		height_minus: function() { return 0 },
		focus: function( a ) {
			this.$( 't' )[ a === F ? 'blur' : 'focus' ]();
			_z_on.call( this, a == N || a );
		},
		focusEnd: function() {
			this.focus();
			this.cursorEnd();
		},
		cursorEnd: function() {
			$.rngCursor( this.ipt() );
		},
		clkhdr: function( e ) {
			this.focus();
			this.trigger( e );
		},
		html_placehoder: function() {
			var w = this.innerWidth(), v = this.x.value;
			return this.x.placeholder ? '<label style="width:' + ( w ? (w - this.width_minus()) + 'px' : 'auto' ) + '" class="w-input-placeholder f-fix' + ( v != N && v !== '' ? ' f-none' : '' ) +
				'" id="' + this.id + 'ph" onclick=' + evw + '.clkhdr(event) ondblclick=' + evw + '.clkhdr(event)><i class=f-vi></i><span class=f-va id="' + this.id + 'pht">' + this.x.placeholder + '</span></label>' : '';
		},
		html_nodes: function() {
			return '<textarea' + this.form_prop( F ) + '>' + $.strEscape(this.x.value || '') + '</textarea>';
		},
		html: function() {
			return '<div' + this.html_prop() + '>' + this.html_before() + this.html_placehoder() + this.html_nodes() + this.html_after() + '</div>';
		}
	}
} ),
/* `text` */
Text = define.widget( 'text', {
	Extend: Textarea,
	Listener: {
		body: {
			keyup: {
				prop: T,
				method: function( e ) { _enter_submit( e.keyCode, this ) }
			}
		}
	},
	Prototype: {
		fixhdr: function() {
			this.x.placeholder && $.classAdd( this.$( 'ph' ), 'f-none', this.ipt().value != '' );
		},
		html_nodes: function() { return '<input type=' + (this.formType || this.type) + this.form_prop() + '>' }
	}
} ),
/* `password` */
Password = define.widget( 'password', {
	Extend: Text,
	Prototype: {
		form_prop: function() { return AbsForm.prototype.form_prop.call( this ) + ( this.x.autocomplete === T ? '' : ' autocomplete="new-password"' ) + '>' }
	}
} ),
/* `checkboxgroup` */
CheckboxGroup = define.widget( 'checkboxgroup', {
	Const: function( x, p ) {
		AbsForm.apply( this, arguments );
		if ( x.targets ) {
			for ( var i = 0, l = x.targets.length, t = l && [], o; i < l; i ++ ) {
				t.push( o = this.add( x.targets[ i ], -1 ) );
				this[ i ] && (this[ i ].x.target = o);
			}
			this.targets = t;
		}
	},
	Extend: AbsForm,
	Child: 'checkbox',
	Default: { height: -1 },
	Listener: {
		range: 'option'
	},
	Prototype: {
		NODE_ROOT: T,
		type_horz: T,
		_boxgroup: T,
		childCls: 'f-va f-inbl',
		x_nodes: function() {
			return this.x.options || [ { value: this.x.value, text: this.x.text, checked: this.x.checked, target: this.x.target } ];
		},
		val: function( a ) {
			if ( a == N )
				return $.arrSelect( this.elements( T, T ), 'v.value', T ).join( ',' );
			this.elements().each( function() { this.checked = $.idsAny( a, this.value ) } );
			this.trigger( 'change' );
		},
		// @a -> T/F 是否只获取所有选中项
		elements: function( a, b ) {
			return this[ 0 ] ? this[ 0 ].elements( a, b ) : Q([]);
		},
		getOptions: function() {
			return this.elements().map( function() { return _widget( this ) } );
		},
		// 点击 target 时直接切换选项
		evwClickList: function( i, e ) {
			if ( ! (this[ i ].x.readonly || this[ i ].x.disabled) && ! this[ i ].isChecked() && ! this[ i ].$().contains( e.srcElement ) ) {
				this[ i ].check();
				try { _widget( e.srcElement ).focus(); } catch( ex ) {}
				Q( e.srcElement ).click();
			}
		},
		checkAll: function( a ) {
			this.getOptions().each( function() { this.check( a ) } );
		},
		disable: function( a ) {
			this.getOptions().each( function() { this.disable( a ) } );
			this.x.disabled = a == N || a;
		},
		readonly: function( a ) {
			this.getOptions().each( function() { this.readonly( a ) } );
			this.x.readonly = a == N || a;
		},
		scaleWidth: function( a ) {
			if ( a.nodeIndex < 0 ) {
				var i = $.arrIndex( this.targets, a ), c = $.scale( this.innerWidth(), [ this[ i ] ? this[ i ].width() : 0, a.attr( 'width' ) || '*' ] );
				return c[ 1 ];
			} else
				return AbsForm.prototype.scaleWidth.call( this, a );
		},
		html_nodes: function() {
			if ( this.targets ) {
				for ( var i = 0, s = '', l = Math.max( this.length, this.x.targets.length ); i < l; i ++ )
					s += '<div class=w-' + this.type + '-list onclick=' + evw + '.evwClickList(' + i + ',event) style=margin-bottom:' + (i < l - 1 ? (this.x.space != N ? this.x.space : 10) : 0) + 'px>' + (this[ i ] ? this[ i ].html() : '') + (this.targets[ i ] ? this.targets[ i ].html() : '') + '</div>';
				return s;
			} else
				return AbsForm.prototype.html_nodes.call( this );
		}
	}
} ),
/* `checkbox` */
Checkbox = define.widget( 'checkbox', {
	Const: function( x, p ) {
		AbsForm.apply( this, arguments );
		if ( p && p._boxgroup ) {
			p.x.readonly && (this.x.readony = T);
			p.x.disabled && (this.x.disabled = T);
			p.x.on && ! this.x.on && (this.x.on = p.x.on);
			this.defaults( { wmin: 7, width: p.x.targets ? 62 : -1 } );
		}
	},
	Extend: AbsForm,
	Helper: {
		parseOption: function( p, f ) {
			var b = $.extend( {}, p.x.box, { type: 'checkbox' }, f ), d = p.x.data, g = b.field, j;
			for ( j in g )
				d && (g[ j ] in d) && (b[ j ] = d[ g[ j ] ]);
			return p.add( b, -1 );
		}
	},
	Listener: {
		range: 'option',
		body: {
			ready: function() {
				this.x.target && this._ustag();
			},
			change: {
				prop: T,
				block: function() { return this._blk() },
				method: function() {
					! this.x.readonly && ! this.parentNode.x.readonly && this.elements( '[w-target]' ).each( function() { _widget( this )._ustag() } );
				}
			},
			click: {
				prop: T,
				block: function() { return this._blk() },
				method: function( e ) {
					if ( this.x.readonly || this.parentNode.x.readonly ) {
						this.elements().each( function() { this.checked = this.defaultChecked } );
						return F;
					}
					if ( ie ) { // 修复ie下onchange失效问题
						var o = document.activeElement;
						this.$( 't' ).blur(), this.$( 't' ).focus();
						o.focus();
					}
					$.classRemove( this.parentNode.$(), 'z-err' );
				}
			}
		}
	},
	Default: { width: -1, wmin: 1 },
	Rooter: 'checkboxgroup',
	Prototype: {
		className: 'w-form',
		_blk: function() {
			return this.x.readonly || this.x.disabled || this.parentNode.x.readonly || this.parentNode.x.disabled;
		},
		_ustag: function() {
			var b = this.isChecked(), c = this.x.disabled === T, d = function( g ) {
				if ( g.parentNode && g.parentNode.type_frame ) {
					b && g.parentNode.view( g );
				} else {
					for ( var i = 0, r = this.fAll( '*', g ), l = r.length; i < l; i ++ )
						r[ i ].disable( ! b || c );
				}
			};
			this.x.target.isWidget ? d.call( this.ownerView, this.x.target ) : this.ownerView.find( this.x.target.split( ',' ), d );
		},
		elements: function( a, b ) {
			return Q( '[name="' + this.input_name() + '"]' + (b ? ':not(:disabled)' : '') + ( a === T ? ':checked' : a === F ? ':not(:checked)' : ( a || '' ) ), this.ownerView.$() );
		},
		ipt: function() {
			return this.$( 't' );
		},
		input_name: function() {
			return this.x.name || this.parentNode.x.name || '';
		},
		check: function( a ) {
			this.ipt().checked = a == N || a;
			this.trigger( 'change' );
		},
		isChecked: function() {
			return this.ipt().checked;
		},
		click: function( a ) {
			this.check( a == N ? ! this.isChecked() : a );
			this.trigger( 'click' );
		},
		status: function( a ) {
			if ( a == N )
				return this.ipt().checked ? 1 : 0;
			this.check( a == 1 ? T : F );
		},
		val: CheckboxGroup.prototype.val,
		selfVal: function() {
			var t = this.$( 't' );
			return t.disabled || ! t.checked ? '' : t.value;
		},
		htmlFor: function( a, e ) {
			this.$( 't' ).focus(); // for ie9-
			a.previousSibling.click();
			$.cancel( e );
		},
		readonly: function( a ) {
			AbsForm.prototype.readonly.call( this, a );	
			this.ipt().defaultChecked = this.ipt().checked;
		},
		disable: function( a ) {
			AbsForm.prototype.disable.call( this, a );
			this.x.target && this._ustag();
		},
		reset: function() {
			var c = this.$( 't' ).checked, d = this.$( 't' ).defaultChecked;
			this.$( 't' ).checked = d;
			if ( c != d && this.parentNode.type.indexOf( 'group' ) > 0 ) {
				this.parentNode.targets && this.check();
				this.parentNode.trigger( 'change' );
			}
		},
		html: function() {
			var p = this.parentNode, r = this.x.readonly || p.x.readonly, c = this.className, d = this.x.disabled || p.x.disabled, g = p.type_horz && (! p._boxgroup || p.targets), w = this.innerWidth(),
				k = this.x.checked != N ? this.x.checked : (p.x.value && this.x.value && $.idsAny( p.x.value, this.x.value )), s = _html_cls( this ), t = this.x.tip;
			if ( ! w ) s = s.replace( / f-inbl/g, '' );
			return '<cite id=' + this.id + ' class="' + s + '"' + (t ? 'title="' + $.strQuot( (t === T ? this.x.text : this.x.tip) || '' ) : '') + '"' + (w ? ' style="width:' + w + 'px"' : '') + (this.x.id ? ' w-id="' + this.x.id + '"' : '') + '><input id=' + this.id + 't type=' + this.type + ' name="' + this.input_name() +
				'" value="' + $.strQuot(this.x.value || '') + '"' + ( k ? ' checked' : '' ) + (d ? ' disabled' : '') + (this.type === 'radio' ? ' w-name="' + (p.x.name || this.x.name || '') + '"' : '') + 
				(this.x.target ? ' w-target="' + ((this.x.target.x && this.x.target.x.id) || this.x.target.id || this.x.target)+ '"' : '') + _html_on( this ) + '>' + ( this.x.text ? '<span class=_tit onclick="' + evw + '.htmlFor(this,event)">' + (p.x.escape || this.x.escape ? $.strEscape( this.x.text ) : this.x.text) + '</span>' : '' ) + (g ? '<i class=f-vi></i>' : '') + '</cite>';
		}
	}
} ),
/* `triplebox`
 *	status: 0(未选),1(已选),2(半选)
 */
Triplebox = define.widget( 'triplebox', {
	Extend: 'checkbox',
	Listener: {
		body: {
			ready: function() {
				if ( this.x.status == 2 )
					this.$( 't' ).indeterminate = T;
			},
			click: {
				prop: T,
				method: function() {
					Checkbox.Listener.body.click.method.apply( this, arguments );
					if ( ie && this.ipt().value == 2 ) // IE半选状态点击不会触发onchange，需要手动触发
						this.status( this.isChecked() ? 1 : 0 );
				}
			}
		}
	},
	Prototype: {
		className: 'w-checkbox w-triplebox',
		// @implement(Textarea)
		status: function( a ) {
			if ( a == N )
				return this.ipt().checked ? 1 : this.ipt().indeterminate ? 2 : 0;
			this.ipt().checked = a == 1;
			this.ipt().indeterminate = a == 2;
			this.trigger( 'change' );
		},
		check: function( a ) {
			this.status( a === F ? 0 : 1 );
			this.trigger( 'click' );
		},
		html: function() {
			var p = this.parentNode, r = this.x.readonly || p.x.readonly, d = this.x.disabled || p.x.disabled;
			return '<label id=' + this.id + ' class="w-triplebox"' + (this.x.id ? ' w-id="' + this.x.id + '"' : '') + '><input type=checkbox id=' + this.id + 't name="' + this.x.name + '" value="' + (this.x.value || '') + '"' +
			(this.x.status == 1 ? ' checked' : '') + (d ? ' disabled' : '') + (this.x.partialsubmit ? ' w-partialsubmit="1"' : '') + _html_on( this ) + '>' + (this.x.text ? '<span class=_tit>' + this.x.text + '</span>' : '') + '</label>';
		}
	}
} ),
/* `radiogroup` */
Radiogroup = define.widget( 'radiogroup', {
	Extend: 'checkboxgroup',
	Child: 'radio'
} ),
/* `radio` */
Radio = define.widget( 'radio', {
	Extend: 'checkbox',
	Rooter: 'radiogroup',
	Prototype: {
		// 为避免页面内出现相同name的radio组(如果同name，选中效果会出问题)，需要给name加上前缀
		input_name: function() {
			return this.ownerView.id + 'radio@' + (this.x.name || this.parentNode.x.name || this.parentNode.id);
		}
	}
} ),
/* `select` */
Select = define.widget( 'select', {
	Const: function( x ) {
		Textarea.apply( this, arguments );
		x.size && (this.className += ' w-select-multiple');
	},
	Extend: Textarea,
	Default: {
		width: -1, height: -1, wmin: 2
	},
	Listener: {
		range: 'option',
		body: {
			change: {
				prop: T,
				proxy: N,
				block: N,
				method: function() { $.classRemove( this.$(), 'z-err' ) }
			}
		}
	},
	Prototype: {
		width_minus: function() { return 0 },
		text: function() { return this.$( 't' ).options[ this.$( 't' ).selectedIndex ].text },
		val: function( a ) {
			if ( a == N )
				return this.$( 't' ).options[ this.$( 't' ).selectedIndex ].getAttribute( 'value' );
			var b = this.$( 't' ).value;
			this.$( 't' ).value = a;
			b != a && this.trigger( 'change' );
		},
		getFocusOption: function( a ) {
			return this.$( 't' ).options[ this.$( 't' ).selectedIndex + ( a == N ? 0 : a ) ];
		},
		getPrevOption: function() {
			return this.getFocusOption( -1 );
		},
		getNextOption: function() {
			return this.getFocusOption( 1 );
		},
		html_nodes: function() {
			var s = '', o = this.x.options, i = o.length;
			while ( i -- )
				s = '<option value="' + (o[ i ].value || '') + '"' + ( o[ i ].checked ? ' selected' : '' ) + '>' + o[ i ].text + '</option>' + s;
			var w = this.innerWidth(), z = this.x.size;
			return '<select class=_t id=' + this.id + 't ' + _html_on( this ) + ' style="width:' + ( w ? w + 'px' : 'auto' ) + '" name="' + (this.x.name || '') + '"' + ( this.x.multiple ? ' multiple' : '' ) +
			( z ? ' size=' + z : '' ) + '>' + s + '</select>';
		}
	}
} ),
CalendarNum = define.widget( 'calendar/num', {
	Const: function( x, p ) {
		this.rootNode = p;
		W.apply( this, arguments );
		x.focus && (this.className += ' z-on');
	},
	Rooter: 'calendar/date',
	Listener: {
		body: {
			click: {
				prop: T,
				method: function() {
					if ( ! this.x.disabled ) {
						var p = this.parentNode;
						if ( p.x.pickhour ) {
							p.pop( 'h', this.$() );
						} else { //表单赋值
							p.date = $.dateParse( this.val(), 'yyyy-mm-dd' );
							p.trigger( 'complete' );
							! this._disposed && this.trigger( 'focus' );
						}
					}
				}
			},
			focus: function( e ) {
				var b = this.parentNode.getFocus();
				if ( b && b !== this )
					$.classRemove( b.$(), 'z-on' );
				$.classAdd( this.$(), 'z-on' );
			}
		}
	},
	Default: { width: -1, height: -1 },
	Prototype: {
		className: '_a _d',
		tagName: 'td',
		val: function() { return this.x.value },
		focus: function() { this.trigger( 'focus' ) },
		html_prop:  function() { return _proto.html_prop.call( this ) + ' w-urn="' + this.val() + '"' },
		html_nodes: function() { return this.x.text }
	}
} ),
// 今天
CalendarNow = define.widget( 'calendar/now', {
	Extend: 'calendar/num',
	Prototype: {
		className: '_t',
		tagName: 'div',
		val: function() { return this.parentNode.format( new Date() ) },
		html_prop: function() { return _proto.html_prop.call( this ) + ' w-urn="now"' }
	}
} ),
/* `calendar` */
Calendar = CalendarDate = define.widget( 'calendar/date', {
	Const: function( x ) {
		var d = x.date ? this._ps( x.date ) : new Date(),
			b = x.begindate && this._ps( x.begindate ), e = x.enddate && this._ps( x.enddate );
		this.date = $.numRange( d, b, e );
		W.apply( this, arguments );
	},
	Child: 'calendar/num',
	Helper: {
		// @a -> commander, b -> format, c -> date, d -> focusdate, e -> begindate, f -> enddate, g -> complete
		pop: function( a, b, c, d, e, f, g ) {
			var o = _widget( a ), h = b.indexOf( 'h' ),
				x = { type: 'calendar/' + ( b == 'yyyy' ? 'year' : b == 'yyyy-mm' ? 'month' : b == 'yyyy-ww' ? 'week' : 'date' ), pickhour: h > 0,
					date: c, focusdate: d, begindate: e, enddate: f, on: { complete: function() { g && g.call( a, $.dateFormat( this.date, b ) ); o.isFormWidget && o.focus(); h !== 0 && $.close( this ) } } };
			if ( h === 0 ) {
				x.date = x.focusdate = '2017-01-01 ' + $.strTrim( c );
				o.add( x, -1 ).pop( 'h', o );
			} else
				return o.cmd( { type: 'dialog', snap: a, cls: 'w-calendar-dialog f-shadow-snap', width: 240, height: -1, wmin: 12, indent: 1, pophide: T,
					node: x, on:{close:function(){o.isFormWidget&&!o.contains(document.activeElement)&&o.focus(F)}}} );
		}
	},
	Prototype: {
		className: 'w-calendar w-calendar-date',
		_formatter: 'yyyy-mm-dd',
		_nav_unit: 'm',
		_nav_radix: 1,
		format: function( a ) {
			return $.dateFormat( a, this._formatter );
		},
		_ps: function( a ) {
			return $.dateParse( a, this._formatter );
		},
		nav: function( e ) {
			var a = e.srcElement, b;
			if ( $.classAny( a, '_y' ) ) { //年
				this.pop( 'y', a );
			} else if ( $.classAny( a, '_m' ) ) { //月
				this.pop( 'm', a );
			} else if ( b = $.classAny( a, 'f-arw-l2 f-arw-r2' ) ) { // 前 后
				this.go( $.dateAdd( this.date, this._nav_unit, b === 1 ? - this._nav_radix : this._nav_radix ) );
			} else if ( $.classAny( a, '_t' ) ) { // 今天
				this.date = new Date();
				if ( this.x.on && this.x.on.complete ) {
					this.trigger( 'complete' );
				} else {
					var f = this.get( this.format( new Date() ) );
					f ? f.focus() : this.go();
				}
			}
		},
		// 获取选中的值
		val: function() {
			var f = this.getFocus();
			return f && f.val();
		},
		today: function() {
			this.date = new Date();
			this.trigger( 'complete' );
		},
		go: function( d, f ) {
			if ( this.x.src ) {
				this.cmd( { type: 'ajax', src: $.urlParse( this.x.src, [ this.format( d || this.date ) ] ), success: f } );
			} else {
				d && (this.date = d);
				$.replace( this.$(), this.html() );
				f && f.call( this );
			}
		},
		get: function( a ) {
			if ( a.length != this._formatter.length ) {
				a = $.dateFormat( $.dateParse( a ), this._formatter );
			}
			var b = $.get( '[w-urn="' + a + '"]', this.$() );
			return b && _widget( b );
		},
		getFocus: function() {
			var b = $.get( '._a.z-on', this.$() );
			return b && _widget( b );
		},
		focus: function( a ) {
			var b = this.get( a );
			b && b.focus();
		},
		// 执行某个日期的点击事件
		click: function( a ) {
			var b = this.get( a );
			b && b.click();
		},
		// 年、月、时的浮动选择器
		pop: function( a, e ) {
			var Y = a === 'y', M = a === 'm', H = a === 'h',
				d = this.date, h = 18, l = M ? 12 : 10, c = [],
				b = Y ? d.getFullYear() : M ? d.getMonth() + 1 : d.getHours(),
				g = d.getMinutes(),
				y = Y ? ( b - b % 10 ) : M ? 1 : Math.max( 0, b * 2 - 5 ),
				s = ( M ? '' : '<div class="_b _scr">-</div>' ) + '<div class="_wr">',
				htm = function() {
					for ( var i = 0, t, r = ''; i < l; i ++ ) {
						t = H ? c[ Math.min(y,38) + i ] : y + i;
						r += '<div class="_b _i' + ( t == b ? ' _c' : '' ) + '">' + t + '</div>';
					}
					return r;
				};
			if ( H ) {
				for ( var i = 0, o; i < 24; i ++ )
					c.push( (o = $.strPad( i ) + ':') + '00', o + '30' );
				b = $.strPad( b ) + ':' + $.strPad( g );
			}
			s += htm() + '</div>' + ( M ? '' : '<div class="_b _scr">+</div>' );
			var d = this.cmd( { type: 'dialog', width: 60, height: h * 12, cls: 'w-calendar-select', snap: e, snaptype: e.valueType !== 'date' && 'cc', pophide: e.valueType === 'date', node: { type: 'html', text: s },
					on: { mouseleave: function(){ this.close() }, close: function() { clearTimeout( t ); Q( d.$() ).off(); } }
				} ),
				r = Q( '._wr', d.$() ),
				f = function( k ) {
					if ( Y || H ) {
						y = k === '+' ? y + l : y - l;
						if ( Y ) y = $.numRange( y, 1900 );
						if ( H ) y = $.numRange( y, 0, 38 );
						r.html( htm() );
					}
				}, t, self = this;
			M && r.height( h * l );
			Q( d.$() ).on( 'mousedown', '._scr', function() {
				var a = this.innerText;
				f( a );
				t = setTimeout( function() { f( a ); t = setTimeout( arguments.callee, 90 ); }, 600 );
			} ).on( 'mouseup', '._scr', function() {
				clearTimeout( t );
			} ).on( 'mousewheel', function( e ) {
				t = setTimeout( function() { f( e.originalEvent.wheelDelta > 0 ? '-' : '+' ) } );
			} ).on( 'click', '._i', function() {
				var h = this.innerText;
				with( self.date ) { Y ? setFullYear( h ) : M ? setMonth( h - 1 ) : ( h = h.split( ':' ), e.valueType !== 'date' && setDate( e.innerText ), setHours( h[ 0 ] ), setMinutes( h[ 1 ] ) ) }
				d.close();
				H ? self.trigger( 'complete' ) : self.go();
			} );
		},
		html_nodes: function() {
			var a = this.date, n = this.x.begindate && this.format( this._ps( this.x.begindate ) ), m = this.x.enddate && this.format( this._ps( this.x.enddate ) ), k = 0,
				b = new Date( a.getTime() ), c = b.getMonth(), y = b.getFullYear(), d = new Date( y, c + 1, 1 ), e = [], f = this.x.focusdate && this.x.focusdate.slice( 0, 10 ), o = this.x.css,
				s = '<div class="w-calendar-head f-clearfix" onclick=' + evw + '.nav(event)>' + $.arrow( 'l2' ) + Loc.ps( Loc.calendar.ym, a.getFullYear(), c + 1 ) + $.arrow( 'r2' ) + '<div class=_t>' + Loc.calendar.today + '</div></div>' +
					'<div style="padding:0 5px 5px 5px"><table class=w-calendar-tbl cellspacing=0 cellpadding=0 width=100%><thead><tr><td>' + Loc.calendar.day_title.join( '<td>' ) + '</thead><tbody>';
			b.setDate( 1 ), b.setDate( - b.getDay() + 1 );
			while ( b < d ) {
				var v = this.format( b ), g = { value: v, text: b.getDate(), disabled: (n && n > v) || (m && m < v), focus: f === v, style: h && o && o.value && o[ o.value[ k ++ ] ] },
					h = b.getMonth() === c;
				e.push( ( b.getDay() === 0 ? '<tr>' : '' ) + ( h ? this.add( g ).html() : '<td>&nbsp;' ) );
				b.setDate( b.getDate() + 1 );
			}
			if ( (n = 7 - ( e.length % 7 )) > 1 )
				e.push( '<td colspan=' + n + '>&nbsp;' );
			return s + e.join( '' ) + '</tbody></table></div>';
		}
	}
} ),
CalendarWeek = define.widget( 'calendar/week', {
	Extend: 'calendar/date',
	Child: 'calendar/num',
	Prototype: {
		className: 'w-calendar w-calendar-week',
		_nav_unit: 'y',
		format: function( a ) {
			var b = $.dateWeek( a, this.x.cg, this.x.start );
			return b[ 0 ] + '-' + $.strPad( b[ 1 ] );
		},
		html_nodes: function() {
			var a = this.date, w = $.dateWeek( a, this.x.cg, this.x.start ), y = w[ 0 ], t = this.x.begindate, m = this.x.enddate,
				b = $.dateWeek( new Date( y, 11, 31 ), this.x.cg, this.x.start ), e = [], f = this.x.focusdate && this.x.focusdate.slice( 0, 7 ), n = 0, o = this.x.css,
				s = '<div class="w-calendar-head f-clearfix" onclick=' + evw + '.nav(event)>' + $.arrow( 'l2' ) + Loc.ps( Loc.calendar.y, y )  + $.arrow( 'r2' ) + '<div class=_t>' + Loc.calendar.weeknow + '</div></div>' +
					'<div style="padding:0 5px"><table class=w-calendar-tbl cellspacing=0 cellpadding=0 width=100%><tbody>';
			this._year = y;
			if ( b[ 0 ] !== y )
				b = $.dateWeek( new Date( y, 11, 31 - 7 ), this.x.cg, this.x.start );
			for ( var i = 1, l = b[ 1 ]; i <= l; i ++ ) {
				var v = y + '-' + $.strPad( i ), g = { value: v, text: i, disabled: (t && t > v) || (m && m < v), focus: f === v, style: o && o.value && o[ o.value[ n ++ ] ] };
				e.push( ( (i - 1) % 7 === 0 ? '<tr>' : '' ) + this.add( g ).html() );
			}
			if ( (n = 7 - (i%7)) > 1 )
				e.push( '<td colspan=' + n + '>&nbsp;' );
			return s + e.join( '' ) + '</tbody></table></div>';
		}

	}
} ),
CalendarMonth = define.widget( 'calendar/month', {
	Extend: 'calendar/date',
	Child: 'calendar/num',
	Prototype: {
		className: 'w-calendar w-calendar-month',
		_nav_unit: 'y',
		_formatter: 'yyyy-mm',
		html_nodes: function() {
			var a = this.date, y = a.getFullYear(), t = this.x.begindate, m = this.x.enddate, e = [], f = this.x.focusdate && this.x.focusdate.slice( 0, 7 ), n = 0, o = this.x.css,
				s = '<div class="w-calendar-head f-clearfix" onclick=' + evw + '.nav(event)>' + $.arrow( 'l2' ) + Loc.ps( Loc.calendar.y, y ) + $.arrow( 'r2' ) + '<div class=_t>' + Loc.calendar.monthnow + '</div></div>' +
					'<div style="padding:0 5px"><table class=w-calendar-tbl cellspacing=0 cellpadding=0 width=100%><tbody>';
			for ( var i = 0; i < 12; i ++ ) {
				var v = y + '-' + $.strPad( i + 1 ), g = { value: v, text: Loc.calendar.monthname[ i ], disabled: (t && t > v) || (m && m < v), focus: f === v, style: o && o.value && o[ o.value[ n ++ ] ] };
				e.push( ( i % 4 === 0 ? '<tr class=_tr>' : '' ) + this.add( g ).html() );
			}
			return s + e.join( '' ) + '</tbody></table></div>';
		}
	}
} ),
CalendarYear = define.widget( 'calendar/year', {
	Extend: 'calendar/date',
	Child: 'calendar/num',
	Prototype: {
		className: 'w-calendar w-calendar-month',
		_nav_unit: 'y',
		_nav_radix: 10,
		_formatter: 'yyyy',
		html_nodes: function() {
			var a = this.date, t = this.x.begindate, m = this.x.enddate,
				y = a.getFullYear() - ( a.getFullYear() % 10 ) - 1,
				e = [], f = _number( this.x.focusdate && this.x.focusdate.slice( 0, 7 ) ), n = 0, o = this.x.css,
				s = '<div class="w-calendar-head f-clearfix" onclick=' + evw + '.nav(event)>' + $.arrow( 'l2' ) + Loc.ps( Loc.calendar.y, (y + 1) + ' - ' + (y + 10) ) + $.arrow( 'r2' ) + '<div class=_t>' + Loc.calendar.yearnow + '</div></div>' +
					'<div style="padding:0 5px"><table class=w-calendar-tbl cellspacing=0 cellpadding=0 width=100%><tbody>';
			for ( var i = 0; i < 12; i ++ ) {
				var v = y + i, g = { value: v, text: y + i, disabled: (t && t > v) || (m && m < v), focus: f === v, style: o && o.value && o[ o.value[ n ++ ] ] };
				e.push( ( i % 4 === 0 ? '<tr class=_tr>' : '' ) + this.add( g ).html() );
			}
			return s + e.join( '' ) + '</tbody></table></div>';
		}

	}
} ),
/* `date` */
_Date = define.widget( 'date', {
	Const: function( x ) {
		Text.apply( this, arguments );
		if ( ! x.format )
			x.format = 'yyyy-mm-dd';
		this.defaults( { width: 66 + this.x.format.length * 6 } );
	},
	Extend: Text,
	Listener: {
		body: {
			click: {
				prop: T,
				method: function() {
					this.usa() && this.popCalendar();
				}
			},
			resize: function() {
				this.$( 't' ).style.width = (this.innerWidth() - this.width_minus()) + 'px';
			}
		}
	},
	Prototype: {
		valueType: 'date',
		// @a -> fn
		popCalendar: function() {
			var b = $.dateFormat( new Date, this.x.format ), c = this.cal, d = this.x.validate, e = c && c.isShow(), f = d && d.compare, g = f && d.comparemode,
				m = d && (d.maxvalue || (d.beforenow && b)), n = d && (d.minvalue || (d.afternow && b)), p = this.parentNode, t, v = this.val() || b;
			if ( (this === p.begin && p.end && (t = p.end.val())) || (g && g.indexOf( '<' ) == 0 && (t = this.ownerView.fv( f ))) )
				m = m ? (m > t ? t : m) : t;
			if ( (this === p.end && p.begin && (t = p.begin.val())) || (g && g.indexOf( '>' ) == 0 && (t = this.ownerView.fv( f ))) )
				n = n ? (n < t ? t : n) : t;
			this.closePop();
			if ( ! e )
				this.cal = Calendar.pop( this, this.x.format, v, this.val(), n, m, function( v ) { this.val( v ) } );
			this.focus();
		},
		closePop: function() {
			this.cal && this.cal.close();
			this.list && this.list.close();
		},
		getValidError: function( a ) {
			if ( this.x.readonly || this.x.disabled )
				return;
			var p = this.parentNode;
			if ( this === p.begin && p.end && ! this.x.validate ) {
				this.validate( { comparemode: '<=', compare: p.end.x.name } );
			}
			var b = _valid_opt.call( this, a ), v = this.val();
			if ( v && ! $.dateValid( v, this.x.format ) )
				return _form_err.call( this, b, 'time_invalid' );
			return _valid_err.call( this, b, v );
		},
		width_minus: function() { return 20 + _input_indent() },
		html_nodes: function() { return '<input type=text' + this.form_prop() + '><em class="f-boxbtn" onclick=' + eve + '></em>' }
	}
} ),
/* `period` */
Period = define.widget( 'period', {
	Const: function( x, p ) {
		W.apply( this, arguments );
		this.begin = x.begin && this.add( $.merge( { width: '*' }, x.begin ) );
		this.to    = this.add( typeof x.to === _OBJ ? x.to : { type: 'html', text: x.to || Loc.to, width: 30, height: 30, align: 'center', valign: 'middle' } );
		this.end   = x.end && this.add( $.merge( { width: '*' }, x.end ) );
		this.className = 'w-horz w-period';
	},
	Extend: 'horz',
	Default: { width: -1 }
} ),
/* `muldate` */
Muldate = define.widget( 'muldate', {
	Extend: 'date',
	Listener: {
		body: {
			click: {
				prop: T,
				method: function() {
					if ( this.usa() ) {
						this.val() ? this.popList() : this.popCalendar();
					}
				}
			}
		}
	},
	Prototype: {
		width_minus: function() { return 20 + _input_indent() },
		ipt: function() { return this.$( 'v' ) },
		getValidError: AbsForm.prototype.getValidError,
		v2t: function( v ) {
			for ( var i = 0, b = v.split( ',' ), s = []; v && i < b.length; i ++ )
				s.push( '"' + b[ i ] + '"' );
			return s.join( ' ' );
		},
		val: function( a ) {
			if ( a == N )
				return this.ipt().value;
			this.ipt().value = a;
			this.text( this.v2t( a ) );
			this.trigger( 'change' );
		},
		text: function( t ) {
			return t != N ? (this.$( 't' ).innerText = t) : this.$( 't' ).innerText;
		},
		popList: function() {
			for ( var i = 0, v = this.val().split( ',' ), b = []; i < v.length; i ++ )
				b.push( this.li_str( v[ i ] ) );
			b.push( this.li_str() );
			this.mh = Math.floor(($.height() - this.height()) / 60) * 30 + 2;
			var h = (v.length + 1) * 30 + 2, c = this.list, d = c && c.isShow();
			this.closePop();
			if ( ! d ) 
				this.list = this.cmd( { type: 'dialog', cls: 'w-calendar-dialog w-muldate-dialog f-shadow-snap', width: 200, height: Math.min( this.mh, h ), hmin: 2, wmin: 2, pophide: T, snap: this, indent: 1,
					node: { type: 'html', text: b.join( '' ), scroll: T }, on:{ close: function() { this.commander.focus(F) } } } );
			this.focus();
		},
		// @a -> el, b -> act
		li_act: function( a, b ) {
			var self = this, t = Q( a ).closest( 'table' );
			if ( b == '+' ) {
				Calendar.pop( a, this.x.format, N, N, N, N, function( v ) {
					t.before( self.li_str( v ) );
					self.li_ref();
				} );
			} else if ( b == '-' ) {
				t.remove();
				self.li_ref();
			} else {
				var d = t.data( 'value' );
				Calendar.pop( a, this.x.format, d, d, N, N, function( v ) {
					a.innerText = v;
					t.attr( 'data-value', v );
					self.li_ref();
				} );
			}
		},
		li_ref: function() {
			var r = Q( 'table[data-value]', this.list.$() ).map( function() { return this.getAttribute( 'data-value' ) } ).get();
			this.val( r.join() );
			this.list.height( Math.min( (r.length + 1) * 30 + 2, this.mh ) );
		},
		li_str: function( v ) {
			var k = $.abbr + '.all["' + this.id + '"].li_act';
			return '<table width=100% height=30 cellspacing=0 cellpadding=0' + (v ? ' data-value="' + v + '"' : '') + '><tr><td>&nbsp; ' + (v ? '<a href=javascript: onclick=' + k + '(this,"=")>' + v + '</a>' : '') + '<td width=70 align=center>' +
				$.image( '.f-i-minus ._i', { style: 'visibility:' + (v ? 'visible' : 'hidden'), click: k + '(this,"-")' } ) + ' &nbsp; ' + $.image( '.f-i-plus ._i', { click: k + '(this,"+")' } ) + '</table>';
		},
		html_nodes: function() {
			return '<input type=hidden id=' + this.id + 'v name="' + this.x.name + '" value="' + (this.x.value || '') + '"><div id=' + this.id + 't class="f-inbl _c" style="width:' +
				( this.innerWidth() - this.width_minus() ) + 'px"' + _html_on( this ) + '>' + this.v2t( this.x.value || '' ) + '</div><em class="f-boxbtn" onclick=' + eve + '></em>';
		}
	}
} ),
/* `spinner` */
Spinner = define.widget( 'spinner', {
	Extend: Text,
	Default: {
		width: 100, wmin: _dft_min
	},
	Prototype: {
		valueType: 'number',
		width_minus: function() { return 20 + _input_indent() },
		getValidError: function( a ) {
			if ( this.x.readonly || this.x.disabled )
				return;
			var b = _valid_opt.call( this, a ), v = this.val();
			if ( v && ( isNaN( v ) || /\s/.test( v ) ) )
				return _form_err.call( this, b, 'number_invalid' );
			return _valid_err.call( this, b, v );
		},
		step: function( a ) {
			if ( ! this.x.disabled && ! this.x.readonly ) {
				var d = this.x.validate, m = d && d.maxvalue, n = d && d.minvalue, v = _number( this.val() ) + a * ( this.x.step || 1 );
				m != N && (v = Math.min( m, v ));
				n != N && (v = Math.max( n, v ));
				this.val( v );
				this.focus();
				this.trigger( 'change' );
			}
		},
		html_nodes: function() {
			return '<input type=text' + this.form_prop() + '><cite class=_b><em onclick=' + evw + '.step(1)><i class=f-vi></i><i class="f-arw f-arw-t2"></i></em><em onclick=' + evw + '.step(-1)><i class=f-vi></i><i class="f-arw f-arw-b2"></i></em></cite>';
		}
	}
} ),
/* `xbox` */
XBox = define.widget( 'xbox', {
	Const: function( x ) {
		this.initOptions( x );
		Textarea.apply( this, arguments );
	},
	Extend: Textarea,
	Listener: {
		tag: N,
		body: {
			click: {
				prop: T,
				method: function() {
					this.usa() && this.drop();
				}
			},
			change: N
		}
	},
	Prototype: {
		width_minus: function() { return 20 + _input_indent() },
		initOptions: function( x ) {
			var o = x.options || (x.options = []), i = o.length;
			this._sel = N;
			while ( i -- ) {
				o[ i ].value == N && (o[ i ].value = '');
				! this._sel && (o[ i ].checked || o[ i ].value == x.value) && (this._sel = o[ i ]);
			}
			(this._sel || (this._sel = o[ 0 ])) && (x.value = this._sel.value);
		},
		setOptions: function( a ) {
			this.x.options = a;
			this._dropper && this._dropper.close();
			var v = this.val();
			this.initOptions( this.x );
			this.$().innerHTML = this.html_nodes();
			this.ipt().value = this._sel ? this._sel.value : '';
		},
		val: function( a ) {
			var v = this.ipt().value;
			if ( a == N )
				return v;
			var o = a.jquery ? this.x.options[ a.attr( '_i' ) ] : $.arrFind( this.x.options, 'v.value=="' + a + '"' );
			if ( o && v != o.value ) {
				this.ipt().value = o.value;
				this._sel = o;
				this._val( o );
				this.trigger( 'change' );
			}
		},
		_val: function( o ) {
			this.$( 'p' ).innerHTML = this.htm_li( o );
		},
		text: function() {
			return $.strTrim( this.$( 'p' ).innerText );
		},
		getFocusOption: function( a ) {
			for ( var i = 0, v = this.val(), o = this.x.options, l = o.length; i < l; i ++ ) {
				if ( v == o[ i ].value ) break;
			}
			if ( i >= l ) i = 0;
			return o[ i + ( a == N ? 0 : a ) ];
		},
		getPrevOption: function() {
			return this.getFocusOption( -1 );
		},
		getNextOption: function() {
			return this.getFocusOption( 1 );
		},
		// @implement(Textarea)
		ipt: function() {
			return this.$( 'v' );
		},
		isEmpty: function() {
			return ! this.val();
		},
		drop: function() {
			var o = this.x.options;
			if ( ! o || ! o.length )
				return;
			var a = $.bcr( this.$() ), b = Math.max( $.height() - a.bottom, a.top ), c = Math.min( Math.floor( b / 28 ), o.length ) * 28, d = this._dropper;
			if ( d ) {
				this.focus( F );
				d.close();
			} else { 
				this.focus();
				this._dropper = this.cmd( { type: 'dialog', minwidth: this.innerWidth(), maxwidth: $.width() / 2, height: c + 2, hmin: 2, indent: 1, id: this.id, cls: 'w-xbox-dialog z-on', pophide: T, snaptype: 'v',
					snap: this, node: { type: 'html', scroll: T, text: this.html_options(), on: { ready: 'var t=$.get(".z-on",this.$());t&&this.scrollTop(t,"middle",null,28)' } } , on: { close: 'this.commander.focus(!1);this.commander._dropper=null;' } } );
			}
		},
		choose: function( a, e ) {
			this.val( Q( e.srcElement ).closest( '._o' ) );
			$.close( a );
		},
		html_placehoder: function() {
			return '';
		},
		htm_li: function( a ) {
			return a ? (a.icon ? $.image( a.icon, { cls: 'w-xbox-ico' } ) : '') + (this.x.escape ? $.strEscape( a.text ) : a.text) : '';
		},
		html_options: function() {
			for ( var i = 0, s = [], v = this._sel && this._sel.value, o = this.x.options || [], b, l = o.length; i < l; i ++ ) {
				s.push( '<div class="_o f-fix' + (v == o[ i ].value ? ' z-on' : '') + '" _i="' + i + '">' + this.htm_li( o[ i ] ) + '</div>' );
			}
			return '<div onclick=$.all["' + this.id + '"].choose(this,event)>' + s.join( '' ) + '</div>';
		},
		html_nodes: function() {
			var s = this._sel;
			return '<input type=hidden name="' + this.x.name + '" id=' + this.id + 'v value="' + (s ? (s.value || '') : '') + '"><div class="f-inbl f-omit _t" id=' + this.id + 't ' +
				' style="width:' + (this.innerWidth() - this.width_minus()) + 'px"><span id=' + this.id + 'p>' + this.htm_li( s ) + '</span></div><em class=f-boxbtn><i class=f-vi></i>' + $.arrow( 'b2' ) + '</em>';
		}
	}
}),
/* mulbox 是xbox的复选模式 */
Mulbox = define.widget( 'mulbox', {
	Const: function() {
		Textarea.apply( this, arguments );
	},
	Extend: [ 'scroll', Textarea ],
	Default: { height: 28 * 3, wmin: _dft_min, scroll: T },
	Prototype: {
		className: 'w-form w-input',
		width_minus: function() { return 0 },
		val: function( a ) {
			return a === U ? this.ipt().value : (this.ipt().value = a);
		},
		ipt: function() {
			return this.$( 'v' );
		},
		// a -> value, b -> text, c -> index
		addOption: function( a, b, c ) {

		},
		choose: function( a ) {
			$.remove( a );
			this.val( $.arrMap( Q( '._o', this.$() ), 'v.getAttribute("data-value")' ).join() );
		},
		html_nodes: function() {
			for ( var i = 0, v = [], o = this.x.options, l = o.length; i < l; i ++ )
				v.push( o[ i ].value );
			return '<input type=hidden name="' + this.x.name + '" id=' + this.id + 'v value="' + v.join() + '">' + XBox.prototype.html_options.call( this )
		}
	}
}),
/* `imgbox` */
Imgbox = define.widget( 'imgbox', {
	Const: function( x, p ) {
		this.imgw = x.imgwidth == N ? 80 : _number( x.imgwidth );
		this.imgh = x.imgheight == N ? 80 : _number( x.imgheight );
		this.txth = x.options && x.options[ 0 ] && x.options[ 0 ].text ? 22 : 0;
		this.txth && (this.className += ' z-tx');
		XBox.apply( this, arguments );
	},
	Extend: XBox,
	Default: { width: -1, height: -1, wmin: 2 },
	Listener: {
		tag: N,
		body: {
			focus: N, blur: N
		}
	},
	Prototype: {
		className: 'w-form w-input-border w-imgbox-c f-rel f-inbl',
		drop: function() {
			var d = this.x.options,
				l = d.length,
				r = $.bcr( this.$() ),
				csw = _number( this.x.dropwidth ),
				avw = Math.max( r.left, $.width() - r.left - r.width ),
				opw = this.imgw + 22,
				oph = this.imgh + 12 + (this.txth || 10),
				adw = ( Math.min( l, Math.ceil( avw / opw ) - 1 ) ) * opw,
				e = Math.max( opw, csw ? Math.min( csw, adw ) : adw ),
				f = Math.ceil( l / Math.ceil( e / opw ) ) * oph,
				g = $.snap( e, f, r, 'h' ),		// pos object
				ah = Math.min( g.mag_t ? r.top : $.height() - g.top, f ), // avail height
				h = ah < f ? ah - 2 : f,
				s = [ '<div class=w-imgbox-list>' ];
			if ( g.top < 0 ) h += g.top;
			if ( l ) {
				for ( var i = 0, v = this.val(); i < l; i ++ ) {
					s.push( '<div class="w-imgbox-c f-inbl' + (d[ i ].value == v ? ' z-on' : '') + '" onclick=$.all["' + this.id + '"].choose(' + i + ')>' + this.html_img( d[ i ] ) + '</div>' );
				}
				this.dg = this.add( { type: 'dialog', width: e, height: h, cls: 'w-input-border' + (this.txth ? ' z-tx': ''), snap: this, snaptype: g.type, pophide: T, indent: 1,
					node: { type: 'html', scroll: T, text: s.join( '' ) + '</div>' }, on: { close: '$.classRemove( this.parentNode.$(),"z-m-' + g.mag + '")' } } ).render();
				$.classAdd( this.$(), 'z-m-' + g.mag );
			}
		},
		choose: function( a ) {
			this._sel = this.x.options[ a ];
			this._val();
			this.dg.close();
		},
		_val: function( o ) {
			this.$().innerHTML = this.html_nodes();
		},
		html_img: function( a ) {
			return '<div class=_g style="width:' + this.imgw + 'px;height:' + this.imgh + 'px;">' + $.image( a.icon, { width: this.imgw, height: this.imgh } ) + '</div>' +
				( this.txth ? '<div class="_t f-fix" style=width:' + this.imgw + 'px;>' + (a.text || '') + '</div>' : '' );
		},
		html_nodes: function() {
			var a = this._sel || {icon:'.f-dot'};
			return (a ? this.html_img( a ) : '') + '<div class=_r><i class=f-vi></i>' + $.arrow( 'r2' ) + '</div><input type=hidden name="' + this.x.name + '" id=' + this.id + 'v value="' + ((a && a.value) || '') + '">';
		}
	}	
}),
/* `pickbox` */
Pickbox = define.widget( 'pickbox', {
	Extend: Text,
	Listener: {
		tag: 't',
		body: {
			click: {
				prop: T,
				block: $.rt_true,
				method: function( e ) {
					if ( this.x.on && this.x.on.click )
						this.triggerHandler( 'click' );
					else
						this.pick();
					this.focus( F );
				}
			}
		}
	},
	Prototype: {
		width_minus: function() { return 20 + _input_indent() },
		val: function( v, t ) {
			v != N && this.text( t || v );
			return AbsForm.prototype.val.apply( this, arguments );
		},
		text: function( t ) {
			return t == N ? this.x.text : (this.$( 't' ).innerText = this.x.text = t);
		},
		ipt: function() {
			return this.$( 'v' );
		},
		pick: function() {
			if ( this.x.picker && this.usa() ) {
				if ( this.x.picker.type === 'dialog' ) {
					var c = $.jsonClone( this.x.picker );
					c.src && (c.src = $.urlParse( c.src, { value: this.val(), text: this.x.text } ));
					this.cmd( c ).addEvent( 'close', function() { ! this.$().contains( document.activeElement ) && this.focus( F ); }, this );
				} else if ( W.isCmd( this.x.picker ) ) {
					this.cmd( this.x.picker );
				}
			}
		},
		html_nodes: function() {
			return '<input type=hidden id=' + this.id + 'v' + (this.x.name ? ' name="' + this.x.name + '"' : '') + ' value="' + $.strQuot(this.x.value || '') + '"><span id="' + this.id + 
				't" class="_t f-inbl f-nobr" style="width:' + (this.innerWidth() - this.width_minus()) + 'px" ' + _html_on( this ) + ' readonly>' + $.strQuot(this.x.text || this.x.value || '') + '</span><em class="f-boxbtn _dot" onclick=' + evw + '.pick()></em>';
		}
	}
} ),
/* `combobox`
	{ "type": "combobox", "name": "combobox", "id": "combobox", "value": "0001,aa@rj.com", "text": "", "dropsrc": "webapp/demo.json.php?act=combo", "readonly": true,
	  "src": "webapp/demo.json.php?act=combo&v=$value&t=$text", "pick": "this.cmd({type:'dialog',template:'std',src:'webapp/demo.json.php?act=pick',width:600,height:400})", "multiple": true,
	  "suggest": true, "placeholder": "124567893", "on": { "change": "" }, "pub": { "width": 100, "on": { "click": "" } } },
 *	注1: 当有设置初始value时，text一般可以不写，程序将会从数据岛(more属性)中匹配。如果数据岛不是完整展示的(比如树)，那么text属性必须加上。
 */
Combobox = define.widget( 'combobox', {
	Const: function( x ) {
		Textarea.apply( this, arguments );
		this.className += ' z-loading';
		//if ( x.height && x.height != -1 )
		//	x.nobr = T;
		x.nobr && (this.className += ' z-nobr');
		x.face && (this.className += ' z-face-' + x.face);
		this.more = this.createPop( x.src || x.more || {type:'dialog',node:{type:'grid',combo:{field:{}}}}, { value: x.value } );
		if ( this.more.contentView.layout )
			this.trigger( 'load' );
		else
			this.more.preload( $.proxy( this, function() { this.trigger( 'load' ) } ) );
		this.addEvent( 'focus', function() { this.focusNode && this.focusNode.tabFocus( F ) } );
	},
	Extend: Textarea,
	Child: 'combobox/option',
	Listener: {
		block: function( e ) {
			return e.srcElement && e.srcElement.id.indexOf( this.id ) < 0;
		},
		body: {
			ready: function() {
				this.domready = T;
				! this.loading && this.init();
			},
			load: function() {
				this.loading = F;
				$.classRemove( this, 'z-loading' );
				this.domready && this.init();
			},
			blur: {
				prop: T,
				method: function() {
					AbsForm.Listener.body.blur.method.apply( this, arguments );
					var t = this.$( 't' );
					! t.innerText && t.nextSibling && ! this.contains( document.activeElement ) && t.parentNode.appendChild( t );
				}
			},
			click: {
				prop: T,
				method: function( e ) {
					// 点击空白地方，光标移到文本末尾
					if ( this.usa() && e.srcElement ) {
						if ( e.srcElement.id === this.id + 'c' && ! $.rngSelection().text ) {
							var t = this.$( 't' );
							t.nextSibling && t.parentNode.appendChild( t );
							this.focus();
							$.rngCursor( this.$( 't' ) );
						}
						var t = $.strTrim( this.$( 't' ).innerText );
						t && this.suggest( t, 10 );
					}
				}
			},
			keydown: {
				prop: T,
				method: function( e ) {
					if ( this.usa() ) {
						var k = e.keyCode, n;
						if ( k === 13 )
							return $.stop( e );
						if ( ! this._imeMode ) {
							if ( k === 8 ) { // 8:backspace
								if ( $.rngCursorOffset() == 0 ) {
									var a = this.$( 't' ).previousSibling;
									a && $.widget( a ).close();
								}
							} else if ( k === 35 ) { // 35:end
								var a = this.$( 't' ), t = a.innerText;
								if ( $.rngCursorOffset() == t.length && a.nextSibling ) {
									(t = $.strTrim( t )) && (this.addOpt( t ), a.innerText = '');
									(a.parentNode.appendChild( a ), this.focus());
								}
							} else if ( k === 36 ) { // 36:home
								var a = this.$( 't' ), t;
								if ( $.rngCursorOffset() == 0 && a.previousSibling ) {
									(t = $.strTrim( a.innerText )) && (this.addOpt( t ), a.innerText = '');
									(a.parentNode.insertBefore( a, this[ 0 ].$() ), this.focus());
								}
							} else if ( k === 37 ) { // 37:left
								var a = this.$( 't' ), b, t;
								if ( $.rngCursorOffset() == 0 && (b = a.previousSibling) ) {
									(t = $.strTrim( a.innerText )) && (this.addOpt( t ), a.innerText = '');
									b && (b.parentNode.insertBefore( a, b ), this.focus());
								}
							} else if ( k === 39 ) { // 39:right
								var a = this.$( 't' ), b, t = a.innerText;
								if ( $.rngCursorOffset() == t.length && (b = a.nextSibling) ) {
									(t = $.strTrim( a.innerText )) && (this.addOpt( t ), a.innerText = '');
									b && (b.parentNode.insertBefore( b, a ), this.focus());
								}
							} else if ( k === 46 ) { // 46:delete
								var a = this.$( 't' ), t = a.innerText;
								if ( $.rngCursorOffset() == t.length && a.nextSibling ) {
									_widget( a.nextSibling ).close();
								}
							}
						}
					}
				}
			},
			// chrome中文模式打完字后按回车时，不会响应keyup事件，因此设置input事件来触发suggest()
			input: br.ms ? N : {
				prop: T,
				method: function( e ) {
					this._imeMode && this.suggest( this.inputText() );
				}
			},
			keyup: {
				prop: T,
				method: function( e ) {
					clearTimeout( this._sug_timer );
					if ( this.usa() && ! this._imeMode ) {
						var k = e.keyCode;
						if ( k === 13 || k === 38 || k === 40 ) { // 13:enter, 38:up, 40:down
							$.stop( e );
							var d = this.pop(), t;
							if ( k === 13 && (t = this.$( 't' ).innerText) != this._currText ) {
								this.suggest( t );
							} else if ( d.isShow() && d.contentView.combo ) {
								k === 13 && ! d.contentView.combo.getFocus() ? _enter_submit( k, this ) : d.contentView.combo.keyup( k );
							} else
								_enter_submit( k, this );
						} else if ( !(e.ctrlKey && k === 86) && !(k === 17) ) { //86: ctrl+v, 17: Ctrl, 37: left, 39: right
							var t = this.$( 't' ).innerText, s = String.fromCharCode( 160 ) + ' '; // 160: chrome的空格
							if ( k === 32 && s.indexOf( t[ t.length - 1 ] ) > -1 && (t = $.strTrim( t.slice( 0, -1 ) )) ) { // 最后一个字符是分隔符，则生成一个已选项
								this.$( 't' ).innerText = '';
								var o = this.addOpt( t );
								o.x.error && this.x.suggest && this.match( o ); // 新增的选项如果没即时匹配成功，并且有suggest，则以隐藏模式去后台匹配一次数据。
								this.closePop();
								$.stop( e );
							} else if ( ! e.ctrlKey ) {
								this.suggest( t );
							}
						}
					}
				}
			},
			paste: {
				prop: T,
				proxy: ie ? 'beforepaste' : N,
				method: function( e ) {
					this.focus();
					var r = $.rngSelection(), self = this,
						t = $.db( '<div class=f-abshide><textarea></textarea></div>' ).children[ 0 ],
						h = this.$( 'ph' );
					this._paste_rng = r;
				    t.focus();
				    h && (h.style.display = 'none');
					setTimeout( function() {
						var s = $.strTrim( t.value ).split( new RegExp( '[,\\s' + String.fromCharCode( 61453 ) + String.fromCharCode( 12288 ) + ']+' ) ).join().replace( /^,|,$/g, '' );
						self._paste( r, s );
						$.remove( t.parentNode );
						h && (h.style.display = '');
					} );
				}
			},
			resize: function() {
				var w = (this.innerWidth() - this.width_minus()) + 'px';
				this.$( 'c' ) && (this.$( 'c' ).style.width = w);
				this.$( 'ph' ) && (this.$( 'ph' ).style.width = w);
			},
			// 覆盖textarea的change事件定义，仅当已选项有变化时触发
			change: N
		}
	},
	Prototype: {
		NODE_ROOT: T,
		loading: T,
		_currText: '',
		width_minus: function() { return (this.x.dropsrc ? 20 : 0) + (this.x.picker ? 20 : 0); },
		init: function() {
			if ( ! this.$() )
				return;
			this._initOptions( this.x.value, this.x.text );
			this.$( 't' ).innerText = '';
			this.save();
			this.usa() && (this.$( 't' ).contentEditable = T);
			$.classRemove( this.$(), 'z-loading' );
			_listen_ime( this, this.$( 't' ) );
		},
		// 根据value设置已选项, 初始化时调用 /@v -> value, t -> text
		_initOptions: function( v, t ) {
			if ( v && (v = v.split( ',' )) ) {
				for ( var i = 0, t = t && t.split( ',' ), o, s = '', l = v.length; i < l; i ++ ) {
					if ( v[ i ] ) {
						if ( t ) {
							var r = { value: v[ i ], text: t[ i ] };
							s += this.add( r ).html();
							this.store().merge( r );
						} else if ( o = this.store().getParamByValue( v[ i ] ) )
							s += this.add( o ).html();
						else if ( this.x.strict === F )
							s += this.add( { text: v[ i ], error: T } ).html();
					}
				}
				s && $.before( this.$( 't' ), s );
			}
		},
		// @implement
		insertHTML: function( a, b ) {
			! b || b === 'append' ? $.before( this.$( 't' ), a ) : b === 'prepend' ? $.prepend( this.$( 'c' ), a ) : _proto.insertHTML.apply( this, arguments );
		},
		/*attrSetter: function() {
			
		},*/
		isEmpty: function() {
			return !(this._val() || this.text());
		},
		usa: function() {
			return ! this.loading && ! this.x.readonly && ! this.x.disabled;
		},
		store: function() {
			return this.more.contentView.combo;
		},
		// 获取当前的选项对话框
		pop: function() {
			return this.dropper && this.dropper.isShow() ? this.dropper : this.sugger && this.sugger.isShow() ? this.sugger : this.more;
		},
		// 创建选项窗口 /@ u -> url|dialogOption, r -> replace object?
		createPop: function( u, r ) {
			if ( typeof u === _STR ) {
				if ( u.indexOf( 'javascript:' ) === 0 )
					u = Function( '$value,$text', s ).call( this, r && r.value, r && r.text );
				u = { type: 'dialog', src: u, cls: 'w-combobox-dialog', indent: 1 };
			}
			var o = { pophide: T, memory: T, snap: this }, w = 'javascript:return this.parentNode.$().offsetWidth';
			//如果用户设置宽度为*或百分比，则设置maxwidth为不超过combobox的宽度
			if ( u.width ) {
				if ( isNaN( u.width ) )
					o.maxwidth = w;
			} else {
				o.width = w;
			}
			$.extend( u, o );
			u.src && (u.src = this.parseSrc( u.src, r ));
			return this.add( u, -1 ).addEvent( 'close', function(){
				! this.$().contains( document.activeElement ) && this.focus( F );
				var d = this.pop();
				d && d.isShow() && this.focusNode && this.focusNode.tabFocus( F );
			}, this );
		},
		closePop: function() {
			clearTimeout( this._sug_timer );
			var d = this.pop();
			d && d.close();
		},
		// 解析变量: $value(值), $text(文本) /@ u -> url, r -> replace object
		parseSrc: function( u, r ) {
			for ( var k in r )
				u = u.replace( '$' + k, $.urlEncode( r[ k ] ) );
			return u.replace( /\$\w+/g, '' );
		},
		// 读/写隐藏值
		_val: function( a ) {
			if ( a == N )
				return (this.$() ? this.ipt() : this.x).value || '';
			( this.$() ? this.ipt() : this.x ).value = a;
		},
		// @a -> value
		val: function( a ) {
			if ( a == N ) {
				this.save();
				return this._val();
			}
			this.empty();
			this._val( '' );
			a ? this.match( { value: a } ) : this.resetEffect();
		},
		// @implement(Textarea)
		ipt: function() {
			return this.$( 'v' );
		},
		// 获取文本
		text: function() {
			return $.idsAdd( this.optionText(), this.inputText() );
		},
		// 读/写正在输入的文本
		inputText: function( a ) {
			var e = this.$( 't' );
			if ( a == N )
				return e ? $.strTrim( e.innerText ) : '';
			e && (e.innerText = a);
		},
		// 获取选中项的文本
		optionText: function() {
			for ( var i = 0, s = []; i < this.length; i ++ )
				s.push( this[ i ].x.text );
			return s.join( ',' );
		},
		// 获取选中项的值
		optionValue: function() {
			for ( var i = 0, s = []; i < this.length; i ++ )
				s.push( this[ i ].x.value );
			return s.join( ',' );
		},
		// 根据value值返回对应的文本值
		val2txt: function( v ) {
			for ( var i = 0, s = [], v = (v || '').split( ',' ), o, l = v.length; i < l; i ++ )
				v[ i ] && (o = this.store().getParamByValue( v[ i ] )) && s.push( o.text );
			return s.join( ',' );
		},
		// 根据文本增加已选项, 多个用逗号或空白符隔开 /@ t -> text|replaceObject, a -> param data?
		addOpt: function( t, a ) {
			var v = this._val(), e = this.$( 't' ), k = e.nextSibling ? _widget( e.nextSibling ).nodeIndex : N;
			if ( t.value ) {
				this._initOptions( t.value );
			} else if ( (t = typeof t === _STR ? t : t.text) && (t = t.split( ',' )).length ) {
				for ( var i = 0, c = this.store(), d, o, s = []; i < t.length; i ++ ) {
					if ( t[ i ] ) {
						if ( d = (a || c.getParam( t[ i ] )) )
							! $.idsAny( v, d.value ) && ( s.push( this.add( d, k ).html() ), $.idsAdd( v, d.value ) );
						else
							s.push( this.add( { text: t[ i ], error: T }, k ).html() );
						if ( ! this.x.multiple && s.length )
							break;
					}
				}
				$.before( e, s.join( '' ) );
			}
			this.save();
			return this[ this.length - 1 ];
		},
		// 完成一个尚未匹配成功的项 /@o -> comboboxOption, a -> param data?
		fixOpt: function( o, a ) {
			var d = a || this.store().getParam( o.x.text );
			if ( d && o.x.error ) {
				$.idsAny( this._val(), d.value ) ? o.remove() : o.replace( d );
				this.save();
			}
		},
		//@public(用于 combo 窗口的点击事件) 完成正在输入的文本，或是没有匹配成功的项 / @a -> tr|leaf|xml
		complete: function( a ) {
			this.store().merge( a );
			var d = this.store().getParam( a ), f = this.focusNode;
			if ( d )
				f ? this.fixOpt( f, d ) : ((this._currText = this.$( 't' ).innerHTML = ''), this.addOpt( d.text, d ));
			this.focus();
		},
		suggest: function( t, s ) {
			var self = this, t = $.strTrim( t );
			this._currText = t;
			clearTimeout( this._sug_timer );
			if ( t ) {
				this._sug_timer = setTimeout( function() { self.doSuggest( t ) }, s || 200 );
			} else
				this.closePop();
		},
		// 弹出模糊匹配的选项窗口  /@ a -> text|comboboxOption
		doSuggest: function( a ) {
			var t = a.x ? a.x.text : a, u = this.x.suggest && this.x.src,
				f = function( m ) {
					var c = m.contentView.combo, d = c.getXML( t );
					d && this.store().merge( d );
					this.closePop();
					if ( u ? (c.isKeepShow() || c.getLength()) : c.filter( t ) ) {
						m.render();
						if ( a.x ) {
							m.addEvent( 'close',  t = function() { a.tabFocus( F ) } );
							a.addEvent( 'remove', function() { m.removeEvent( 'close', t ) } );
						}
					}
				};
			this._key = t;
			if ( u && (u = this.parseSrc( u, { text: t } )) ) {
				var self = this;
				(this.sugger || (this.sugger = this.createPop( u ))).reload( u, function() { ! self._disposed && f.call( self, this ) } );
			} else
				f.call( this, this.more );
		},
		// 精确匹配，在隐藏状态下进行 /@ a -> replaceObject|comboboxOption
		// 多个立即匹配成功; 单个显示下拉选项
		match: function( a ) {
			var c = a.x ? a : this;
			if ( this.x.suggest ) {
				var d = this.createPop( this.x.src || this.x.more, a.x || a ), self = this;
				c.setLoading();
				d.preload( function() {
					if ( ! c._disposed ) {
						c.setLoading( F );
						self.store().merge( this.contentView.combo );
						a.x ? self.fixOpt( a ) : self.addOpt( a );
						self.resetEffect();
					}
					this.remove();
				} );
			} else {
				a.x ? this.fixOpt( a ) : this.addOpt( a );
				this.resetEffect();
			}
		},
		// @r -> range, s -> text
		_paste: function( r, s ) {
			if ( s ) {
				if ( s.indexOf( ',' ) < 0 ) {
					this.$( 't' ).innerText = s;
					$.rngCursor( this.$( 't' ) );
					this.suggest( s );
				} else {
					if ( ! this.x.multiple )
						s = $.strTrim( $.strTo( s, ',' ) );
					this.match( { text: s } );
				}
			}
			this.focus();
		},
		save: function() {
			if ( this.loading )
				return;
			var v = this._val(), f = this.x.strict === F, t;
			if ( ! this.x.multiple ) {
				while ( this.length > 1 ) this[ 0 ].remove();
			}
			for ( var i = 0, l = this.length, s = []; i < l; i ++ ) {
				if ( f )
					s.push( this[ i ].x.value || this[ i ].x.text );
				else
					this[ i ].x.value && s.push( this[ i ].x.value );
			}
			f && (t = $.strTrim( this.inputText() )) && s.push( t );
			this._val( s.join( ',' ) );
			if ( this.x.on && this.x.on.change && v != this._val() )
				this.triggerHandler( 'change' );
		},
		drop: function() {
			if ( this.usa() ) {
				var d = this.dropper, b = d && d.isShow();
				this.closePop();
				this.focus();
				if ( ! b )
					(d || (this.dropper = this.createPop( this.x.dropsrc || this.x.more ))).show();
			}
		},
		pick: Pickbox.prototype.pick,
		setLoading: function( a ) {
			a = a == N || a;
			this.loading = a;
			this.$( 't' ).innerText = a ? (this.x.loadingtext || 'loading..') : '';
			this.$( 't' ).contentEditable = ! a;
		},
		getValidError: function( a ) {
			if ( this.x.readonly || this.x.disabled )
				return;
			var b = _valid_opt.call( this, a ), v = this.val();
			if ( this.x.strict !== F && Q( '._o.z-err', this.$() ).length )
				return _form_err.call( this, b, 'invalid_obj' );
			return _valid_err.call( this, b, v );
		},
		disable: function( a ) {
			a = a == N || a;
			this.$( 't' ).contentEditable = !(this.x.disabled = a);
			this.$( 'v' ).disabled = a;
			$.classAdd( this.$(), 'z-ds', a );
			$.classRemove( this.$(), 'z-err' );
		},
		html_nodes: function() {
			var s = '<input type=hidden id=' + this.id + 'v name="' + (this.x.name || '') + '" value="' + (this.x.value || '') + '"' + (this.x.disabled ? ' disabled' : '') + '><div class="f-inbl _c' + (this.x.nobr ? ' f-nobr' : '') + '" id=' + this.id + 'c' + _html_on( this ) +
				' style="width:' + ( this.innerWidth() - this.width_minus() ) + 'px"><var class=_e id=' + this.id + 't' + ( this.usa() ? ' contenteditable' : '' ) + ' onfocus=' + eve + ' onblur=' + eve + '>' + ( this.loaded ? '' : (this.x.loadingtext || 'loading..') ) + '</var></div>';
			if ( this.x.dropsrc )
				s += '<em class="f-boxbtn _drop" onclick=' + evw + '.drop()><i class=f-vi></i>' + $.arrow( 'b2' ) + '</em>';
			if ( this.x.picker )
				s += '<em class="f-boxbtn _dot" onclick=' + evw + '.pick()></em>';
			return s;
		}
	}
} ),
/* `comboboxoption`
	@x: { value: String, text: String, error: Boolean }
 */
ComboboxOption = define.widget( 'combobox/option', {
	Const: function( x, p ) {
		this.className = '_o f-inbl' + ( x.error ? ' z-err' : '' );
		W.apply( this, arguments );
	},
	Default: { width: -1, height: -1 },
	Listener: {
		tag: 'g',
		body: {
			click: {
				prop: T,
				// 禁用用户事件
				block: $.rt_true,
				method: function() {
					var p = this.parentNode, e = ! p.x.readonly && ! p.x.disabled;
					if ( this.loading || this._disposed )
						return;
					// 没有成功匹配文本时只做聚焦和搜索，不执行用户设置的click事件
					if ( this.x.error ) {
						if ( p.focusNode !== this ) {
							this.tabFocus();
							p.suggest( this );
						}
					} else {
						//e && p.focus();
						this.triggerHandler( 'click' );
					}
				}
			}
		}
	},
	Rooter: 'combobox',
	Prototype: {
		val: function() {
			return this.x.value;
		},
		text: function() {
			return this.x.text;
		},
		close: function( e ) {
			var p = this.parentNode;
			if ( ! p.x.readonly && ! p.x.disabled && F !== this.trigger( 'close' ) ) {
				this.remove();
				p.save();
				//p.focus();
				e && $.stop( e );
			}
		},
		write: function() {
			var p = this.parentNode, t = p.$( 't' );
			t.parentNode.insertBefore( t, this.$() );
			p.focus();
		},
		setLoading: function( a ) {
			$.classAdd( this.$(), 'z-loading', this.loading = a === F ? a : T );
		},
		html_nodes: function() {
			var p = this.parentNode, w = this.width(), t = $.strEscape( this.x.text ), r = this.x.remark ? $.strEscape( this.x.remark ) : N;
			return '<i class="f-inbl _b" onclick=' + evw + '.write()></i><div class="f-inbl _g"' + _html_on( this ) + '><cite class="_v f-omit" style="' + ( w ? 'width:' + (w - 32) : 'max-width:' + ( p.innerWidth() - p.width_minus() - 50 ) ) + 'px" title="' + t + (r ? '\n' + r : '') + '"><i class=f-vi></i><span class=f-va>' +
				( this.x.forbid ? '<s>' : '' ) + t + (r ? '<em class=_r>' + r + '</em>' : '') + ( this.x.forbid ? '</s>' : '' ) + '</span></cite><i class="_x" onclick=' + evw + '.close(event)>&times;</i></div>';
		}
	}
} ),
/* `linkbox` */
Linkbox = define.widget( 'linkbox', {
	Const: function( x ) {
		Combobox.apply( this, arguments );
		x.on && x.on.dblclick && (this.className += ' z-u');
	},
	Extend: 'combobox',
	Listener: {
		block: N,
		body: {
			click: {
				prop: T,
				method: function( e ) {
					if ( this.usa() ) {
						if ( e.srcElement && e.srcElement.tagName === 'U' && ! e.srcElement.getAttribute( 'data-value' ) ) {
							this.suggest( e.srcElement );
						} else
							this.closePop();
					}
				}
			},
			dblclick: {
				prop: T,
				method: function( e ) {
					var v = e.srcElement.getAttribute( 'data-value' ), d = this.x.on && this.x.on.dblclick;
					v && d && Function( '$0', d ).call( this, v );
					return F;
				}
			},
			blur: {
				prop: T,
				method: AbsForm.Listener.body.blur.method
			},
			keydown: {
				prop: T,
				method: function( e ) {
					if ( this.usa() ) {
						if ( e.keyCode === 13 )
							return $.stop( e );
					}
					this._KC = e.keyCode;
				}
			},
			keyup: {
				prop: T,
				method: function( e ) {
					if ( this.usa() && ! this._imeMode ) {
						/*var m = this.x.validate && this.x.validate.maxlength, v = this.$( 't' ).innerText;
						if ( m && $.strLen( v ) >= m ) {
							console.log(v);
							return $.stop( e );
						}*/
						var k = this._KC = e.keyCode;
						if ( k === 13 || k === 38 || k === 40 || k === 17 ) { // 38:up, 40:down, 17:ctrl
							$.stop( e );
							var d = this.pop();
							if ( d.isShow() )
								d.contentView.combo && d.contentView.combo.keyup( k );
							else if ( k === 13 )
								this.fixStyle();
						} else {
							//if ( ! (k === 39 || k === 37) ) // 39: right, 37: left
								this.fixStyle();
						}
						delete this._KC;
					}
				}
			},
			resize: function() {
				this.$( 't' ).style.width = ( this.innerWidth() - this.width_minus() ) + 'px';
			}
		}
	},
	Prototype: {
		width_minus: function() { return (this.x.dropsrc ? 20 : 0) + (this.x.picker ? 20 : 0) + _input_indent(); },
		init: function() {
			if ( ! this.$() )
				return;
			this._initOptions( this.x.value, this.x.text );
			this.save();
			this.usa() && (this.$( 't' ).contentEditable = T);
			$.classRemove( this.$(), 'z-loading' );
			_listen_ime( this, this.$( 't' ) );
		},
		// 根据value设置已选项, 初始化时调用 /@v -> value, t -> text
		_initOptions: function( v, t ) {
			if ( v && (v = v.split( ',' )) ) {
				for ( var i = 0, t = t && t.split( ',' ), o, s = [], l = v.length; i < l; i ++ ) {
					if ( v[ i ] ) {
						if ( t ) {
							var r = { value: v[ i ], text: t[ i ] };
							s.push( '<u class=_o data-value="' + v[ i ] + '">' + $.strEscape( t[ i ] ) + '</u>' );
							this.store().merge( r );
						} else if ( o = this.store().getParamByValue( v[ i ] ) )
							s.push( '<u class=_o data-value="' + v[ i ] + '">' + $.strEscape( o.text ) + '</u>' );
						else if ( ! this.x.strict )
							s.push( '<u>' + $.strEscape( (t && t[ i ]) || v[ i ] ) + '</u>' );
					}
				}
				s.length && (this.$( 't' ).innerHTML = s.join( '<i>,</i>' ) + (this.x.multiple ? '<i>,</i>' : ''));
			}
		},
		// @a -> value
		val: function( a ) {
			if ( a == N ) {
				this.save();
				return this._val();
			}
			this.empty();
			this._val( '' );
			a ? this.match( { value: a }, function() {
				this._initOptions( a );
				//var o = this.$( 't' ).lastChild;
				//o && $.rngCursor( o );
				this.save();
				this.resetEffect();
			} ) : this.resetEffect();;
		},
		isEmpty: function() {
			return !(this.val() || this.text());
		},
		cursorEnd: function() {
			this._rng_text( this.$( 't' ) );
		},
		// 选项上的光标移动到指定位置 /@a -> elem, b -> cursor point, c -> text?
		_rng_text: function( a, b, c ) {
			var n = $.rngSelection();
			c != N && (a.innerText = c);
			n.moveToElementText( a );
			$.rngCursor( n, b );
		},
		text: function( a ) {
			var e = this.$( 't' );
			if ( a == N )
				return e ? $.strTrim( e.innerText ) : '';
			e && (e.innerText = a);
		},
		inputText: function() {
			return this._input_text || '';
		},
		// 校订样式
		fixStyle: function() {
			var c = $.rngElement(), g = F, t;
			if ( ! this.$( 't' ).contains( c ) )
				c = this.$( 't' );
			t = c.innerText;
			if( this._paste_rng )
				c = this._paste_rng.parentElement();
			if ( c.id === this.id )
				c = this.$( 't' );
			if ( c.tagName === 'VAR' ) {
				c.innerHTML = '<u></u>';
				if ( t ) {
					(c = c.children[ 0 ]).innerText = t;
					$.rngCursor( c );
				} else
					return this.closePop();
			}
			// 输入过程中浏览器可能会自动生成 <font> 标签，需要去除它
			if ( c.tagName === 'FONT' ) {
				if ( c.parentNode.tagName === 'U' ) {
					var d = c.parentNode.previousSibling.nodeValue, c = c.parentNode.parentNode, t = c.innerText;
					this._rng_text( c, t.indexOf( d ) + d.length + 1, t );
				} else if ( c.parentNode.tagName === 'VAR' ) {
					t = c.parentNode.innerText;
					(c = $.replace( c, '<u></u>' )).innerText = t;
				}
			}
			// U标签后面跟的标签如果不是 <i>,</i> 就要合并
			if ( c.tagName !== 'I' && c.nextSibling && c.nextSibling.tagName !== 'I' ) {
				if ( c.nextSibling.nodeType === 3 ) {
					$.remove( c.nextSibling );
				} else {
					t = c.innerText;
					this._rng_text( c, t.length, t + c.nextSibling.innerText );
					$.remove( c.nextSibling );
					g = T; // 有更新
				}
			}
			! br.ms && Q( 'u:has(br)', this.$( 't' ) ).remove();
			t = c.innerText;
			// match text
			var n = [], r = /[,\s]+/g;
			// 文本中如果包含分隔符 , 则分成若干选项
			if ( this.x.multiple && t.length > 1 && r.test( t ) ) {
				for ( var i = 0, d = [], f = t.length - $.rngSelection().startOffset, g, t = t.split( r ), m = []; i < t.length; i ++ ) {
					if ( t[ i ] ) {
						d.push( '<u' + ((g = this.store().getParam( t[ i ] )) ? ' class=_o data-value="' + g.value + '"' : '') + '>' + t[ i ] + '</u>' );
						g ? m.push( 'u[data-value="' + g.value + '"]' ) : n.push( t[ i ] );
					} else
						d.push( '' );
				}
				m.length && (m = Q( m.join( ',' ), this.$( 't' ) ).next( 'i' ).addBack()); // 收集重复数据，以备删除
				var o = $.replace( c, d.join( '<i>,</i>' ) ), k = 0;
				if ( ! this._paste_rng || this._KC === 188 ) { // 保留原有光标位置
					do {
						if ( (k += o.innerText.length) >= f ) {
							this._rng_text( o, k - f );
							break;
						}
					} while ( o = o.previousSibling );
				}
				m.length && (m.remove(), Q( 'i + i, i:first-child', this.$( 't' ) ).remove());// 删除重复数据
				g = T;
				if ( (c = $.rngElement()) && c.tagName === 'U' && ! c.getAttribute( 'data-value' ) )
					this.suggest( c );
			} else {
				this.closePop();
				if ( t ) {
					if ( $.classAny( c, '_o' ) && ! this.store().getParam( t ) ) {
						$.classRemove( c, '_o' );
						c.removeAttribute( 'data-value' );
						g = T;
					}
					this.suggest( c );
				} else
					g = T;
			}
			if ( g ) {
				this.save();
				if ( this.x.suggest ) {
					n.length > 1 && this.match( { text: n.join() } );
				}	
			}
			delete this._paste_rng;
		},
		// @a -> uElem
		suggest: function( a ) {
			var self = this, t = a.innerText.replace( /^[\s,]+|[\s,]+$/g, '' );
			clearTimeout(this._sug_timer);
			if ( t ) {
				this._sug_timer = setTimeout( function() { self.doSuggest( a ) }, 200 );
			} else
				this.closePop();
			this._input_text = t;
		},
		// 弹出模糊匹配的选项窗口  /@ a -> uElem
		doSuggest: function( a ) {
			this._currU = a;
			var t = a.innerText.replace( /^[\s,]+|[\s,]+$/g, '' ), u = this.x.suggest && this.x.src,
				f = function( m ) {
					var c = m.contentView.combo, d = c.getXML( t );
					d && this.store().merge( d );
					this.closePop();
					if ( c.isKeepShow() || (u ? c.getLength() : c.filter( t )) ) {
						m.render();
						if ( a.x ) {
							m.addEvent( 'close',  t = function() { a.tabFocus( F ) } );
							a.addEvent( 'remove', function() { m.removeEvent( 'close', t ) } );
						}
					}
				};
			if ( u && (u = this.parseSrc( u, { text: t } )) ) {
				var self = this;
				(this.sugger || (this.sugger = this.createPop( u ))).reload( u, function() { ! self._disposed && f.call( self, this ) } );
			} else
				f.call( this, this.more );
		},
		// 精确匹配，在隐藏状态下进行 /@ a -> replaceObject, b -> fn?
		match: function( a, b ) {
			if ( this.x.suggest ) {
				var d = this.createPop( this.x.src || this.x.more, a.x || a ), self = this;
				d.preload( function() {
					if ( ! self._disposed ) {
						self.store().merge( this.contentView.combo );
						self.fixOpt();
						b && b.call( self );
					}
					this.remove();
				} );
			} else {
				this.fixOpt();
				b && b.call( this );
			}
		},
		fixOpt: function() {
			var self = this;
			Q( 'u:not([data-value])', this.$( 't' ) ).each( function() {
				var g = self.store().getParam( this.innerText );
				if ( g ) {
					$.classAdd( u, '_o' );
					u.setAttribute( 'data-value', g.value );
				}
			} );
			this.save();
		},
		// @r -> range, s -> text
		_paste: function( r, s ) {
			this.focus();
			$.rngCursor( r );
			r.text = s;
			! this._KC && this.fixStyle();
		},
		//@public(用于 combo 窗口的点击事件) 完成正在输入的文本，或是没有匹配成功的项  / @a -> tr|leaf|xml
		complete: function( a ) {
			this.store().merge( a );
			this.focus();
			var d = this.store().getParam( a ), u = this._currU || $.rngElement();
			if ( d && u ) {
				if ( u.tagName === 'U' ) {
					this._rng_text( u, 0, d.text );
				} else {
					if ( u.tagName === 'I' ) {
						if ( u.nextSibling && u.nextSibling.tagName === 'U' ) {
							u = u.nextSibling;
						} else {
							u = $.after( u, '<u></u>' );
							this.x.multiple && $.after( u, '<i>,</i>' );
						}
					} else
						u = $.append( this.$( 't' ), '<u></u>' );
					this._rng_text( u, 0, d.text );
				}
				$.classAdd( u, '_o' );
				u.setAttribute( 'data-value', d.value );
				var n = u.nextSibling;
				$.rngCursor( n && ! n.nextSibling ? n : u );
				this.x.multiple && ! n && $.rngCursor( $.after( u, '<i>,</i>' ) ); // 光标在末尾则自动添加逗号分隔符
				this.save();
			}
		},
		empty: function() {
			this._currText = this.$( 't' ).innerHTML = '';
		},
		save: function() {
			if ( this.loading )
				return;
			var v = this._val();
			for ( var i = 0, q = Q( 'u', this.$() ), l = q.length, s = [], d; i < l; i ++ ) {
				d = q[ i ].getAttribute( 'data-value' );
				if ( this.x.strict )
					d && s.push( d );
				else
					s.push( d || q[ i ].innerText );
			}
			this._val( s = s.join( ',' ) );
			if ( this.x.on && this.x.on.change && v != s )
				this.triggerHandler( 'change' );
		},
		drop: function() {
			if ( this.usa() ) {
				this.closePop();
				this.focus();
				this._input_text = N;
				(this.dropper || (this.dropper = this.createPop( this.x.dropsrc || this.x.more ))).show();
			}
		},
		bookmark: function() {
			this._currU = $.rngElement();
		},
		getValidError: function( a ) {
			if ( ! this.usa() )
				return;
			var b = _valid_opt.call( this, a ), v = this.val();
			if ( this.x.strict && Q( 'u:not([data-value])', this.$() ).length )
				return _form_err.call( this, b, 'invalid_obj' );
			return _valid_err.call( this, b, v );
		},
		html_nodes: function() {
			var s = '<input type=hidden id=' + this.id + 'v name="' + (this.x.name || '') + '" value="' + (this.x.value || '') + '"' + (this.x.disabled ? ' disabled' : '') + '><var class="f-inbl _t" id=' + this.id + 't' +
			( this.usa() ? ' contenteditable' : '' ) + _html_on( this ) + ' style="width:' + ( this.innerWidth() - this.width_minus() ) + 'px"></var>';
			if ( this.x.dropsrc )
				s += '<em class="f-boxbtn _drop" onmousedown=' + evw + '.bookmark() onclick=' + evw + '.drop()><i class=f-vi></i>' + $.arrow( 'b2' ) + '</em>';
			if ( this.x.picker )
				s += '<em class="f-boxbtn _dot" onclick=' + evw + '.pick()></em>';
			return s;
		}
	}
} ),
/* `onlinebox` */
Onlinebox = define.widget( 'onlinebox', {
	Extend: [ Text, Combobox ],
	Listener: {
		body: {
			ready: function() {
				_listen_ime( this );
			},
			keyup: {
				prop: T,
				method: function( e ) {
					if ( ! this._imeMode && ! this.x.disabled && ! this._disposed && this.x.src ) {
						var k = e.keyCode;
						if ( k === 13 || k === 38 || k === 40 ) { // 上下键
							var d = this.pop(), t;
							if ( k === 13 && (t = this.cursorText()) != this._currText ) {
								this.suggest( t );
							} else if ( d.isShow() && d.contentView.combo ) {
								k === 13 && ! d.contentView.combo.getFocus() ? _enter_submit( k, this ) : d.contentView.combo.keyup( k );
							} else
								_enter_submit( k, this );
						} else if ( ! e.ctrlKey && k !== 17 ) { // 17: Ctrl
							var self = this, t = this.cursorText();
							clearTimeout( this._sug_timer );
							this.suggest( t );
						}
					}
				}
			},
			keydown: N,
			click: N,
			paste: N
		}
	},
	Prototype: {
		formType: 'text',
		width_minus: function() { return (this.x.dropsrc ? 20 : 0) + (this.x.picker ? 20 : 0) + _input_indent(); },
		// @a -> text /读/写光标所在的有效文本(以逗号为分隔符)
		cursorText: function( a ) {
			var b = this.val(),
				c = this.getSelectionStart(),
				i = c, j = c, l = b.length;
			while ( i -- && b[ i ] !== ',' );
			while ( j < l && b[ j ] !== ',' ) j ++;
			if ( a )
				this.val( d = b.slice( 0, i + 1 ) + a + ( j === l && this.x.multiple ? ',' : '' ) + b.slice( j ) );
			else
				return this.x.multiple ? b.substring( i + 1, j ) : b;
		},
		inputText: function() {
			return this._input_text || '';
		},
		getSelectionStart: function() {
			var e = this.$( 't' ), o;
			if ( o = e.selectionStart ) {
				return o;
			} else if ( o = document.selection ) {
				e.focus();
				var r = o.createRange(), d = r.duplicate();
				d.moveToElementText( e );
				d.setEndPoint( 'EndToEnd', r );
				return d.text.length - r.text.length;
			}
			return 0;
		},
		complete: function( a ) {
			var d = this.pop().contentView.combo.getParam( a );
			this.cursorText( d.text || d.value );
			this.closePop();
			this.focus();
		},
		suggest: function( t ) {
			this._input_text = t;
			this.search( t );
		},
		search: function( t ) {
			var u = $.urlParse( this.x.src, { text: t, value: t } );
			if ( ! this.more )
				this.more = this.createPop.call( this, u );
			this.more.reload( u );
			this.more.show();
		},
		html_nodes: function() {
			var s = Text.prototype.html_nodes.apply( this, arguments );
			if ( this.x.dropsrc )
				s += '<em class="f-boxbtn _drop" onclick=' + evw + '.drop()><i class=f-vi></i>' + $.arrow( 'b2' ) + '</em>';
			if ( this.x.picker )
				s += '<em class="f-boxbtn _dot" onclick=' + evw + '.pick()></em>';
			return s;
		}
	}
} ),
/* `rate` */
Rate = define.widget( 'rate', {
	Extend: AbsForm,
	Default: {
		width: -1, height: -1
	},
	Prototype: {
		className: 'w-rate',
		disable: function( a ) { this.x.disabled = this.$().disabled = a == N || a },
		val: function( a ) {
			if ( a === U )
				return (this.$( 'v' ) || this.x).value;
			if ( this._value === U )
				this._value = this.x.value;
			this._val( a );
			if ( a != this._value ) {
				this._value = a;
				this.trigger( 'change' );
			}
		},
		_val: function( a ) {
			if ( this.$() ) {
				this.star( a );
				this.$( 'v' ).value = a;
			} else
				this.x.value = a;
		},
		star: function( a ) {
			var a = _number( a ), b = Math.floor( a / 2 ), c = this.$( b * 2 );
			(c = c && Q( c )) && c.prevAll().addBack().addClass( 'z-on' ).removeClass( 'z-in' );
			(c ? c.nextAll() : Q( 'i', this.$() )).removeClass( 'z-on z-in' );
			(c && (a % 2)) && c.next().addClass( 'z-in' );
		},
		click: function( a ) {
			this.usa() && this.val( a );
		},
		over: function( a ) {
			this.usa() && this.star( a );
		},
		out: function() {
			this.usa() && this._val( this.val() );
		},
		getValidError: function( a ) {
			if ( this.usa() ) {
				var v = this.val();
				return _valid_err.call( this, _valid_opt.call( this, a ), v == '0' ? '' : v );
			}
		},
		html_nodes: function() {
			for ( var i = 2, s = '', v = _number( this.x.value ); i <= 10; i += 2 ) {
				s += '<i id=' + this.id + i + ' class="_i' + (v >= i ? ' z-on' : v > i - 2 ? ' z-in' : '') + '" onmouseover=' + evw + '.over(' + i + ') onclick=' + evw + '.click(' + i + ')></i>';
			}
			return '<span onmouseout=' + evw + '.out()>' + s + '</span><input type=hidden id=' + this.id + 'v name=' + this.x.name + ' value="' + (v || '0') + '">';
		}
	}
} ),
// 树搜索过滤器
TreeCombo = $.createClass( {
	Const: function( a ) {
		this.cab = a;
		this.xml  = this.node2xml( a );
		this._keep_show = a.x.combo.keepshow;
	},
	Prototype: {
		isCombo: T,
		node2xml: function( a ) {
			for ( var i = 0, b = (a.rootNode || a).x.combo.field, c = [], d, e, f = b.search && b.search.split( ',' ), g = f && f.length, l = a.length, s; i < l; i ++ ) {
				e = a[ i ].x, d = e.data || F, r = d[ b.remark ] || e[ b.remark ], s = d[ b.search ] || e[ b.search ];
				s = '<d v="' + (d[ b.value ] || e[ b.value ] || '') + '" t="' + $.strEscape(d[ b.text ] || e[ b.text ]) + '" i="' + a[ i ].id + '"';
				r && (s += ' r="' + $.strEscape( r ) + '"');
				(d[ b.forbid ] || e[ b.forbid ]) && (s += ' x="1"');
				if ( f ) {
					for ( j = 0; j < g; j ++ )
						s += ' s' + j + '="' + $.strEscape( d[ f[ j ] ] ) + '"';
				}
				c.push( s + '>' );
				a[ i ].length && c.push( arguments.callee( a[ i ] ) );
				c.push( '</d>' );
			}
			this._sch = g;
			return $.xmlParse( '<doc>' + c.join( '' ) + '</doc>' );
		},
		first: function() {
			return this.cab._filter_leaves ? this.cab._filter_leaves[ 0 ] : this.cab[ 0 ];
		},
		keyup: function( a ) {
			this.cab.keyup( a );
		},
		isKeepShow: function() {
			return this._keep_show;
		},
		getFocus: function() {
			return this.cab.getFocus();
		},
		// 根据文本返回一个combobox/option参数 /@a -> text|xml|leaf
		getParam: function( a, b ) {
			var d = a.nodeType === 1 ? a : this.getXML( a, b );
			return d && { value: d.getAttribute( 'v' ), text: d.getAttribute( 't' ), remark: d.getAttribute( 'r' ), forbid: d.getAttribute( 'x' ) === '1', data: (b = $.all[ d.getAttribute( 'i' ) ]) && b.x.data };
		},
		// 根据文本返回一个combobox/option参数 /@a -> text
		getParamByValue: function( a ) {
			return this.getParam( a, 'v' );
		},
		// /@a -> text|value|leaf, b -> attrname
		getXML: function( a, b ) {
			return $.xmlQuery( (a.isWidget ? a.ownerView.combo : this).xml, './/d[' + ( typeof a === _STR ? '@' + ( b || 't' ) + '="' + $.strTrim( a ).replace(/\"/g,'\\x34') : '@i="' + a.id ) + '"]' );
		},
		// 合并来自另一个grid的某一行的combo xml /@a -> tr|xml|treeCombo
		merge: function( a ) {
			a.isWidget && (a = a.ownerView.combo.getXML( a ) || F);
			if ( a.nodeType === 1 ) {
				if ( ! $.xmlQuery( this.xml, './/d[@v="' + a.getAttribute( 'v' ) + '"]' ) )
					this.xml.appendChild( a.cloneNode( T ) );
			} else if ( a.isCombo ) {
				for ( var i = 0, b = $.xmlQueryAll( a.xml, './/d' ), l = b.length; i < l; i ++ )
					this.merge( b[ i ] );
			} else if ( a.value ) {
				if ( ! $.xmlQuery( this.xml, './/d[@v="' + a.value + '"]' ) ) {
					var d = this.xml.ownerDocument.createElement( 'd' );
					d.setAttribute( 'v', a.value ), d.setAttribute( 't', a.text );
				}
			}
		},
		_filter: function( a ) {
			if ( a ) {
				var b = $.strSplitword( a, this.cab._matchlength ), e = [];
				for ( var i = 0, c; i < b.length; i ++ ) {
					c = $.strQuot( b[ i ] );
					e.push( 'contains(@t,"' + c + '")', 'contains(@r,"' + c + '")' );
					if ( this._sch ) {
						for ( var j = 0; j < this._sch; j ++ )
							e.push( 'contains(@s' + j + ',"' + c + '")' );
					}
				}
				for ( var i = 0, f = [], d = $.xmlQueryAll( this.xml, './/d[(' + e.join( ' or ' ) + ') and @v!=""]' ), l = d.length; i < l; i ++ ) //translate(@t,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')
					f.push( $.all[ d[ i ].getAttribute( 'i' ) ] );
				return f;
			}
		},
		filter: function( t ) {
			var a = this.cab, f;
			if ( a.length )
				a.setFilter( this._filter( t ) );
			return a._filter_leaves && a._filter_leaves.length;
		},
		getKey: function() {
			var d = Dialog.get( this.cab.ownerView );
			return d && d.commander.inputText();
		},
		getLength: function() {
			return this.cab.length;
		}
	}
} ),
/* `absleaf` */
AbsLeaf = define.widget( 'abs/leaf', {
	Prototype: {
		_pad_left: 5,
		_pad_level: 12,
		// @implement
		insertHTML: function( a, b ) {
			var c = a.isWidget && a.$(), d = c && a.$( 'c' );
			$[ b || 'append' ]( this.$( b === 'before' ? N : 'c' ), c || a );
			if ( d ) {
				$.after( a.$(), d );
				a.reset_level();
			}
		},
		attrSetter: function( a, b ) {
			switch( a ) {
				case 'text':
					this.$( 't' ) && $.html( this.$( 't' ), this.html_text() );
				break;
				case 'icon': case 'openicon':
					this.$( 'i' ) && $.replace( this.$( 'i' ), this.html_icon() );
				break;
				case 'focus':
					this.focus( b );
				break;
			}
		},
		reset_level: function() {
			this.level = this.parentNode.level + 1;
			this.$().style.paddingLeft = (this.level * this._pad_level + this._pad_left) + 'px';
			for ( var i = 0; i < this.length; i ++ )
				this[ i ].reset_level();
		},
		render_nodes: function( x ) {
			for ( var j = 0, l = x.length; j < l; j ++ )
				this.add( x[ j ] );
			this.$( 'c' ) && (this.$( 'c' ).innerHTML = _proto.html_nodes.call( this ));
			if ( (this.rootNode || this).x.combo ) {
				var o = new TreeCombo( this ).xml, m = this.ownerView.combo.getXML( this );
				while ( o.firstChild )
					m.appendChild( o.firstChild );
			}
			this.loaded = T;
			for ( j = 0; j < l; j ++ )
				this[ j ].triggerAll( 'ready' );
			this.trigger( 'nodechange' );
		},
		toggle_nodes: function( a ) {
			this.$( 'c' ) && $.classAdd( this.$( 'c' ), 'f-none', ! a );
		},
		// @a -> sync? b -> fn?
		request: function( a, b ) {
			this.loading = T;
			var s = this.x.src;
			s.indexOf( '$' ) > -1 && (s = $.urlParse(this, s));
			_view( this ).ajax( s, function( x ) { // onsuccess
				var n = x.nodes || x;
				n.length && this.render_nodes( n );
				this.trigger( 'load' );
				b && b.call( this );
			}, this, a, N, N, function( x ) { // oncomplete
				this.loading = F;
				! this.loaded && this.toggle( F );
				W.isCmd( x ) && this.cmd( x );
				if ( this.$( 'o' ) ) {
					(this.$( 'o' ).style.visibility = this.loaded ? '' : 'hidden');
					if ( x = this.html_icon() ) {
						$.classRemove( this.$(), 'z-loading' );
						$.replace( this.$( 'i' ), x );
					}
				}
			} );
		},
		// 展开或收拢 /@a -> T/F/event, b -> sync?, f -> fn?
		toggle: function( a, b, f ) {
			var c = typeof a === _BOL ? a : ! this.x.open, d,
				e = this.id, i = e + 'i', r = e + 'r';
			this.x.open = c;
			this.toggle_nodes( c );
			if ( this.x.src ) {
				if ( c && ! this.loaded && ! this.loading ) 
					this.request( b, f );
			}
			if ( $( r ) )
				$.arrow( $( r ), c ? 'b1' : 'r1' );
			if ( $( i ) && (d = this.html_icon()) ) {
				if ( this.loading ) {
					$.append( $( i ), '<i class=_ld></i>' );
					$.classAdd( this.$(), 'z-loading' );
				} else
					$.replace( $( i ), d );
			}
			a && a.type && $.stop( a );
			$.classAdd( this.$(), 'z-open', !! this.x.open );
			this.trigger( this.x.open ? 'expand' : 'collapse' );
		},
		// 当前节点展开时，其他兄弟节点全部收起 /@a -> T/F/event, b -> sync?, f -> fn?
		toggleOne: function( a, b, f ) {
			this.toggle.apply( this, arguments );
			if ( this.isOpen() ) {
				for ( var i = 0, p = this.parentNode; i < p.length; i ++ ) {
					p[ i ] !== this && p[ i ].toggle( F );
				}
			}
		},
		compare: function( x ) {
			if ( x.text ) {
				this.init_x( x );
				for ( var k in x )
					this.attr( k, x[ k ] );
			}
			var n = x.nodes, l = n && n.length;
			if ( l && ! this.loading ) {
				if ( ! this.length ) {
					this.render_nodes( n );
					x.open && this.toggle( T );
				} else {
					for ( var i = 0, a = this.ownerView, b, c; i < l; i ++ ) {
						b = n[ i ];
						if ( this[ i ] && b.id == this[ i ].x.id ) {
							this[ i ].compare( b );
						} else {
							c = (c = a.find( b.id )) ? c.compare( b ) : b;
							if ( this[ i ] ) {
								this[ i ].before( c );
							} else {
								this[ i - 1 ] ? this[ i - 1 ].after( c ) : this.append( c );
							}
						}
					}
					for ( i = this.length - 1; i >= l; i -- ) {
						this[ i ].remove();
					}
				}
			}
			return this;
		},
		// 深度展开。leaf需要有id进行对比  /@a -> src, b -> sync?, c -> fn
		openTo: function( a, b, c ) {
			if ( typeof b === _FUN ) {
				c = b, b = N;
			}	
			var f = (this.rootNode || this).getFocus();
			this.cmd( { type: 'ajax', src: a, success: function( x ) {
				if ( ! this._disposed ) {
					var d = x.id ? this.ownerView.find( x.id ) : this;
					d && d.compare( x );
				}
			}, complete: function() {
				 if ( ! this._disposed ) {
				 	var d = (this.rootNode || this).getFocus();
					d && d !== f && d.scrollIntoView();
					c && c.call( this );
				}
			}, sync: b === T } );
		},
		// @a -> sync?
		reload: function( a ) {
			if ( ! this.loading && this.x.src ) {
				this.toggle( F );
				$.ajaxAbort( this );
				var d = this.focusNode && this.focusNode.id;
				this.empty();
				this.loaded = this.loading = F;
				this.toggle( T, a, function() { d && (d = this.ownerView.find( d )) && d.focus() } );
			}
		},
		// 获取最新的子节点数据，对比原有数据，如果有新增节点就显示出来 / @a -> sync?, b -> fn?
		reloadForAdd: function( a, b ) {
			if ( this._disposed || this.loading )
				return;
			if ( typeof a === _FUN ) {
				b = a, a = N;
			}
			if ( this.x.src ) {
				this.openTo( this.x.src, function() { b && b.call( this ); } );
			} else {
				this.reloadForModify( a, function() { this.x.src && this.toggle( T, b ) } );
			}
		},
		// 获取父节点的所有子节点数据，取出id相同的项进行更新 / @a -> sync?, b -> fn?
		reloadForModify: function( a, b ) {
			if ( this._disposed )
				return;
			if ( this.loading )
				$.ajaxAbort( this );
			if ( this.parentNode.x.src && ! this.parentNode.loading ) {
				this.parentNode.openTo( this.parentNode.x.src, function() { b && b.call( this ); } );
			}
		},
		removeElem: function( a ) {
			$.remove( this.$( 'c' ) );
			_proto.removeElem.call( this, a );
		}
	}
} ),
/* `leaf` */
Leaf = define.widget( 'leaf', {
	Const: function( x, p ) {
		this.level = p.level + 1;
		W.apply( this, arguments );
		this.loaded  = this.length ? T : F;
		this.loading = F;
		this.x.focus && this.tabFocus();
	},
	Extend: AbsLeaf,
	Child: 'leaf',
	Rooter: 'tree',
	Default: { width: -1, height: -1 },
	Listener: {
		body: {
			ready: function() {
				this.x.src && this.x.open && ! this.loaded && this.toggle( T );
				this.x.focus && this.focus();
			},
			mouseover: {
				prop: T,
				method: function() { $.classAdd( this.$(), 'z-hv' ); }
			},
			mouseout: {
				prop: T,
				method: function() { $.classRemove( this.$(), 'z-hv' ); }
			},
			click: {
				prop: T,
				method: function( e ) {
					if ( this.box && this.box.x.sync && (! e.srcElement || e.srcElement.id !== this.box.id + 't') )
						this.box.check( ! this.box.isChecked() );
					e.srcElement ? this._focus() : this.focus();
					if( this.rootNode && this.rootNode.x.combo ) {
						$.dialog( this ).commander.complete( this );
						$.close( this );
					}
				}
			},
			dblclick: {
				prop: T,
				method: function( e ) {
					if ( ! ( this.$( 'o' ) && this.$( 'o' ).contains( e.srcElement ) ) )
						this.toggle();
				}
			},
			nodechange: function() {
				this.$( 'o' ).style.visibility = this.length ? '' : 'hidden';
				if ( this.$( 'o' ) && ! this.$( 'r' ) )
					$.prepend( this.$( 'o' ), $.arrow( this.id + 'r', this.isOpen() ? 'b1' : 'r1' ) );
			}
		}
	},
	Prototype: {
		className: 'w-leaf',
		// @a 设为 true 时，获取视觉范围内可见的相邻的下一个节点
		next: function( a ) {
			if ( a == N )
				return _proto.next.call( this );
			if ( a && this.rootNode ) {
				if ( this.length && this.x.open )
					return this[ 0 ];
				if ( this.nodeIndex === this.parentNode.length - 1 ) {
					var p = this.parentNode;
					while ( p.rootNode && ! p.next() ) p = p.parentNode;
					return p.rootNode && p.next();
				} else
					return _proto.next.call( this );
			}
		},
		// @a 设为 true 时，获取视觉范围内可见的相邻的下一个节点
		prev: function( a ) {
			var b = _proto.prev.call( this );
			if ( a ) {
				if ( ! b && this.parentNode !== this.rootNode )
					return this.parentNode;
				while ( b && b.length && b.x.open )
					b = b[ b.length - 1 ];
			}
			return b;
		},
		focus: function( a ) {
			this._focus( a );
			this.scrollIntoView( 'auto' );
		},
		_focus: function( a ) {
			this.tabFocus( a );
			this.triggerHandler( 'focus' );
		},
		scrollIntoView: function( a ) {
			var n = this;
			while ( (n = n.parentNode) && n.type === this.type )
				n.toggle( T );
			_scrollIntoView( this, T, a );
		},
		isFocus: function() {
			return this.rootNode.focusNode === this;
		},
		isOpen: function() {
			return this.x.open;
		},
		checkBox: function( a ) {
			this.box && this.box.click( a == N || a );
		},
		isBoxChecked: function() {
			return this.box && this.box.isChecked();
		},
		// triplebox 级联勾选
		_triple: function() {
			var p = this;
			while ( (p = p.parentNode) && p.rootNode === this.rootNode ) {
				if ( p.box ) {
					for ( var i = 0, b, m = [ 0, 0, 0 ], l = p.length; i < l; i ++ )
						(b = p[ i ].box) && m[ b.status() ] ++;
					p.box.status( m[ 0 ] === l ? 0 : m[ 1 ] === l ? 1 : 2 );
				}
			}
			this._tripleAll( this.box.status() == 1 );
		},
		_tripleAll: function( a ) {
			for ( var i = 0, b, l = this.length; i < l; i ++ ) {
				(b = this[ i ].box) && b.check( a );
				this[ i ]._tripleAll( a );
			}
		},
		html_icon: function() {
			var c = (this.x.open && this.length && this.x.openicon) || this.x.icon;
			return c ? $.image( c, { id: this.id + 'i', cls: 'w-leaf-i' } ) : '';
		},
		html_text: function() {
			var r = this.rootNode, t = this.x.text;
			if ( typeof t !== _OBJ && r && r.x.format )
				t = _grid_format.call( this, r.x.format, r.x.escape );
			else if ( typeof t === _STR && r && r.x.escape )
				t = $.strEscape( t );
			if ( typeof t === _OBJ )
				t = this.add( t, -1 ).html();
			return t;
		},
		html_self: function( l ) {
			var x = this.x, r = this.rootNode, c = this.html_icon(), d = x.data, e = '<i class=f-vi></i>', f = this.level * this._pad_level + this._pad_left, h = this.innerHeight(), s = '';
			if ( x.box ) {
				this.box = Checkbox.parseOption( this );
				$.classAdd( this.box, 'w-leaf-b' );
				this.box.type === 'triplebox' && this.box.addEvent( 'click', this._triple, this );
			}
			h != N  && (s += 'height:' + h + 'px;');
			x.style && (s += x.style );
			l == N && (l = this.length);
			return '<dl class="' + this.className + ( x.cls ? ' ' + x.cls : '' ) + ( x.disabled ? ' z-ds' : '' ) + ( x.open ? ' z-open' : '' ) + '" id=' + this.id + (x.tip ? ' title="' + $.strQuot( x.tip === T ? (typeof x.text === _OBJ ? '' : x.text) : x.tip ) + '"' : '') + _html_on_child( this ) +
				(x.id ? ' w-id="' + x.id + '"' : '') + ' style="padding-left:' + f + 'px;' + s + '">' + this.html_before() + '<dt class="w-leaf-a f-nobr">' +
				(x.hidetoggle ? '' : '<b class=w-leaf-o id=' + this.id + 'o onclick=' + evw + '.toggle(event)>' + ( x.src || l ? $.arrow( this.id + 'r', x.open ? 'b1' : 'r1' ) : '' ) + e + '</b>') +
				( this.box ? this.box.html() : '' ) + c + '<cite class="w-leaf-t f-omit"><span class=w-leaf-s id=' + this.id + 't>' + this.html_text() + '</span><i class=f-vi></i></cite></dt>' + this.html_after() + '</dl>';
		},
		html: function() {
			var f = this.rootNode._filter_leaves, b = ! f, s = this.html_nodes();
			if ( f ) {
				for ( var i = 0; i < f.length; i ++ ) {
					if ( this.contains( f[ i ] ) ) {
						b = T; break;
					}
				}
				this.x.disabled = ! $.arrIn( f, this );
				$.classAdd( this, 'z-notg', !! (this.length && ! s) ); // 子节点都被过滤时，隐藏tg
			}
			return b ? this.html_self() + '<div class="w-leaf-cont' + ( this.x.open ? '' : ' f-none' ) + '" id=' + this.id + 'c>' + s + '</div>' : '';
		}
	}
} ),
/* `tree` */
Tree = define.widget( 'tree', {
	Const: function( x, p ) {
		W.apply( this, arguments );
		if ( x.combo )
			this.ownerView.combo = new TreeCombo( this );
		if ( x.hiddens )
			this._hiddens = this.add( { type: 'hiddens', nodes: x.hiddens }, -1 );
		this.loaded  = this.length ? T : F;
		this.loading = F;
	},
	Extend: [ Scroll, AbsLeaf ],
	Child: 'leaf',
	Listener: {
		body: {
			ready: function() {
				_scrollIntoView( this.getFocus() );
				if ( this.x.src && ! this.length )
					Leaf.prototype.request.call( this );
			}
		}
	},
	Prototype: {
		NODE_ROOT: T,
		className: 'w-tree',
		level: -1,
		focus: function() {	this[ 0 ] && this[ 0 ].focus(); },
		getFocus: function() { return this.focusNode },
		// @f -> filter leaves(经过筛选的行)
		setFilter: function( f ) { this._filter_leaves = f },
		// @k -> keycode
		keyup: function( k ) {
			var f = this._filter_leaves, d = k === 40, a;
			if ( d || k === 38 ) { // key down/up
				var a = this.getFocus();
				 b = a ? ( f ? f[ $.arrIndex( f, a ) + ( d ? 1 : -1 ) ] : ( d ? a.next( T ) : a.prev( T ) ) ) : this[ d ? 0 : r.length - 1 ];
				b ? b.focus() : (a && a.focus( F ));
			} else if ( k === 13 ) {
				(a = this.getFocus()) && a.click();
			}
		},
		reloadForModify: $.rt_null,
		html_nodes: function() { return '<div id=' + this.id + 'c class=w-tree-gut>' + _proto.html_nodes.call( this ) + '</div>' + (this._hiddens ? this._hiddens.html() : '') }
	}
} ),
Hiddens = define.widget( 'hiddens', {
	Prototype: { html: _proto.html_nodes },
	Default: { width: 0, height: 0 },
	Child: 'hidden'
} ),
/* grid 辅助方法和专用类 */
// @a -> content|js, b -> escape?, k -> key, s -> key style
_grid_format = function( a, b ) {
	if ( (typeof a === _FUN && (a = a.toString())) || a.indexOf( 'javascript:' ) === 0 )
		return _jsformat.call( this, a, [], [] );
	var x = this.x;
	return a.replace( /\$(\w+|\{[\w.]+\})/g, function( $0, $1 ) {
		$1 = $1.replace( /[\{\}]/g, '' );
		var c = $1.indexOf( '.' ) > 0, k = $1, v, t;
		if ( c ) {
			k = $.strTo( k, '.' );
			t = $.strFrom( $1, k );
		}
		v = (typeof x.data === _OBJ && (k in x.data) ? x.data : x)[ k ];
		if ( t && v != N ) {
			try { eval( 'v = v' + t ); } catch( ex ) { v = N; }
		}
		return v && b ? $.strEscape( v ) : (v == N ? '' : v);
	} );
},
/* `gridleaf` */
GridLeaf = define.widget( 'grid/leaf', {
	Const: function( x, p ) {
		Leaf.apply( this, arguments );
		var r = this.tr();
		this.level = r.level;
		x.src && (this.loaded = !!r.length);
		x.open == N && (x.open = !!r.length);
		r.tgl = this;
	},
	Extend: Leaf,
	Child: 'grid/leaf',
	Rooter: N,
	Prototype: {
		className: 'w-leaf w-grid-leaf f-omit',
		_pad_left: 0,
		tr: function() {
			return this.closest( TR.type );
		},
		// leaf接口
		toggle_nodes: function( a ) {
			this.tr().toggle_rows( a );
			this.tr().x.open = a;
		},
		// leaf接口
		render_nodes: function( x ) {
			for ( var i = 0, l = x.length, r = this.tr(); i < l; i ++ )
				r.add( x[ i ] );
			l && Q( r.$() ).after( r.html_nodes() );
			this.loaded = T;
		},
		html: function() {
			var r = this.tr(), s = this.html_self( r.length );
			return this.x.hr ? '<table class=w-hr-table cellspacing=0 cellpadding=0><tr><td>' + s + '<td width=100%><hr class=w-hr-line noshade></table>' : s;
		}
	}
} ),
/* `gridtoggle` */
GridToggle = define.widget( 'grid/toggle', {
	Const: function( x, p ) {
		W.apply( this, arguments );
		p.parentNode.parentNode.tgl = this;
	},
	Extend: Toggle,
	Listener: {
		body: { click: N }
	},
	Prototype: {
		toggle: function( a ) {
			var a = a == N ? ! (this.x.open == N ? T : this.x.open) : a, t = this.closest( TR.type );
			this.x.open = a;
			t.toggle_rows( a );
			for ( var i = t.$().rowIndex + 1, b = t.$().parentNode.rows, c, l = b.length; i < l; i ++ ) {
				c = _widget( b[ i ] );
				if ( c.tgl && c.tgl.type === this.type )
					break;
				c.display( this );
			}
			return Toggle.prototype.toggle.apply( this, arguments );
		}
	}
} ),
/* `gridrow` tr 和 hr 的基础类 */
GridRow = define.widget( 'grid/row', {
	Const: function( x, p, n ) {
		this.rootNode = p.rootNode;
		this.level = p.level == N ? 0 : p.level + 1;
		if ( typeof x.data !== _OBJ )
			x = { data: x };
		W.call( this, x, p, n );
		x.focus && $.classAdd( this, 'z-on' );
	},
	Prototype: {
		className: 'w-tr',
		// x -> widget option, i -> colIndex
		addCell: function( x, i ) {
			var n = ( this.tcell || (this.tcell = new TCell( {}, this )) ).add( x );
			n.colIndex = i;
			return n;
		},
		cellElem: function( i ) {
			var c = this.$().cells;
			if ( c.length === this.rootNode.colgrps[ 0 ].length )
				return c[ i ];
			for ( var i = 0, l = c.length, n = 0; i < l; i ++ ) {
				if ( n == i )
					return c[ i ];
				n += c[ i ].colSpan;
			}
		},
		// 高亮某个字段的关键字 /@ a -> colIndex, b -> key, c -> matchlength, d -> keycls
		highlight: function( a, b, c, d ) {
			var f = this.cellElem( a );
			if ( f ) {
				f.innerHTML = $.strHighlight( (f._innerhtml || (f._innerhtml = f.innerHTML)), b, c, d );
			}
			for ( var i = 0; i < this.length; i ++ ) {
				this[ i ].highlight( a, b, c, d );
			}
		},
		html_cells: function( i, l ) {
			var a = this.nodeIndex, b = [], u = this.rootNode, c = u.colgrps[ 0 ], d = this.x.data, h = u.x.escape,
				r = this.parentNode._rowspan;
			for ( var i = i == N ? 0 : i, e, t, k, L = c.length - 1, l = l == N ? L : l; i <= l; i ++ ) {
				if ( r && r[ a ] && r[ a ][ i ] ) {
					i += r[ a ][ i ] - 1;
					continue;
				}
				var s = t = '', f = c[ i ].x, v = d && d[ f.field ];
				if ( v != N && typeof v === _OBJ && ! f.box ) {
					k = i;
					if ( v.rowspan > 1 ) {
						for ( var j = 1; j < v.rowspan; j ++ )
							$.jsonChain( v.colspan || 1, r, a + j, i );
					}
					if ( v.colspan > 1 )
						i += v.colspan - 1;
					t = this.addCell( v, k );
				} else {
					if ( f.box ) {
						var n = this.type_hr && f.box.type === 'checkbox', g = f.box.field,
							o = $.extend( {}, f.box, { name: 'selectItem', width: -1, value: v, data: d } );
						n && (o._name = o.name, o.name = this.id + 'hdbox');
						if ( g ) {
							for ( var j in g )
								d && (g[ j ] in d) && (o[ j ] = d[ g[ j ] ]);
						}
						if ( (this.type_tr && o.value) || n ) { // value 为空时不创建 checkbox 实例
							this.box = (t = this.addCell( o, i ))[ 0 ];
							this.box.addEvent( 'click', this.checkBox, this );
						} else if ( this.type_tr && ! o.value ) {
							v = '';
						}
					} else if ( e = this.type_tr && f.format ) {
						var m = _grid_format.call( this, e, h );
						if ( typeof m === _OBJ )
							t = this.addCell( m, i );
						else
							v = m;
					} else {
						h && (v = $.strEscape( v ));
					}
					if ( v && this.type_tr && f.highlight ) {
						v = $.strHighlight( v, f.highlight.key == N ? u._combo.getKey() : f.highlight.key, f.highlight.matchlength, f.highlight.keycls );
					}
				}
				f.align  && (s += ' align='  + f.align);
				f.valign && (s += ' valign=' + f.valign);
				if ( t ) {
					b.push( t.html( i === L ) );
				} else {
					v = v || '';
					var g = '';
					if ( this.type_hr || u.x.nobr )
						g += ' class="w-td-t f-fix"';
					if ( this.type_tr && f.tipfield )
						g += ' title="' + $.strQuot( (d && d[ f.tipfield ]) || '' ) + '"';
					g && (v = '<div' + g + '>' + v + '</div>');
					b.push( '<td class="w-td-' + u._face + (i === L ? ' z-last' : '') + (this.type_hr ? ' w-th' + (f.sort ? ' w-th-sort z-' + f.sort : '') : '') +
						(f.cls ? ' ' + f.cls : '') + '"' + s + (f.style ? ' style="' + f.style + '"' : '') + '>' + (v || (ie7 ? '&nbsp;' : '')) + '</td>' );
				}
			}
			return b.join( '' );
		},
		html: function( i ) {
			var a = '', s, r = this.rootNode.x.pub, c = this.x.cls || (r && r.cls), h = this.x.height || (r && r.height),
				s = '<tr id=' + this.id + ' class="' + this.className;
			if ( h ) {
				ie7 && (h -= this.rootNode._pad * 2 - (this.rootNode._face === 'none' ? 0 : 1));
				a += ' style="height:' + h + 'px"';
			}
			this.type_tr && (s += ' z-' + ((i == N ? this.nodeIndex : i) % 2));
			this.x.id && (s += ' w-id="' + this.x.id + '"');
			c && (s += ' ' + c);
			s += '"' + a + _html_on_child( this ) + '>' + this.html_cells() + '</tr>';
			return this.length ? s + this.html_nodes() : s;
		},
		remove: function() {
			var i = this.length;
			while ( i -- ) this[ i ].remove();
			_proto.remove.call( this );
		}
	}
} ),
_td_wg = { leaf: T, toggle: T },
/* `td` tcell 的子节点。当字段是一个 widget 时会先产生一个 TD 实例，包裹这个 widget 子节点。 */
TD = define.widget( 'td', {
	Const: function( x, p ) {
		this.rootNode = p.rootNode;
		W.call( this, x.type && x.type !== 'td' ? { node: x } : x, p );
	},
	Prototype: {
		x_type: function( t ) {
			return _td_wg[ t ] ? 'grid/' + t : t;
		},
		html: function( a ) {
			var r = this.parentNode.parentNode, g = this.rootNode, c = g.colgrps[ 0 ][ this.colIndex ].x, s = '<td id=' + this.id, t = '', v;
			this.className = 'w-td-' + g._face + ( a ? ' z-last' : '' ) + (r.type_hr ? ' w-th' + (c.sort ? ' w-th-sort z-' + c.sort : '') : '');
			s +=  ' class="' + _html_cls( this ) + (c.cls ? ' ' + c.cls : '') + '"';
			if ( this.x.on || this.Const.Listener )
				s += _html_on( this );
			if ( c.align || this.x.align )
				s += ' align='  + (this.x.align || c.align);
			if ( c.valign || this.x.valign )
				s += ' valign=' + (this.x.valign || c.valign);
			this.x.colspan > 1 && (s += ' colspan=' + this.x.colspan);
			this.x.rowspan > 1 && (s += ' rowspan=' + this.x.rowspan);
			c.style && (t += c.style);
			this.x.style && (t += this.x.style);
			t && (s += ' style="' + t + '"');
			this.x.id && (s += ' w-id="' + this.x.id + '"');
			s += '>' + this.html_before() + this.html_nodes();
			if ( t = this.x.text ) {
				g.x.escape && (t = $.strEscape( t ));
				s += g.x.nobr && r.type_tr ? '<div class=f-fix>' + t + '</div>' : t;
			} else if ( ie7 && ! this.length ) {
				s += '&nbsp;';
			}
			return s + this.html_after() + '</td>';
		}
	}
} ),
/* `tr` tbody 的子节点 */
TR = define.widget( 'tr', {
	Extend: GridRow,
	Child: 'tr',
	Rooter: 'grid',
	Listener: {
		body: {
			click: {
				prop: T,
				block: function( e ) {	return this.isExpandRow || (this.tgl && this.tgl.type === 'grid/toggle') || (this.box && e.srcElement && e.srcElement.id === this.box.id + 't') },
				method: function( e ) {
					if ( this.box ) {
						if ( e.srcElement && e.srcElement.id === this.box.id + 't' )
							return;
						this.box.x.sync && this.checkBox( ! this.isBoxChecked() );
					}
					(this.tgl && this.tgl.type === 'grid/toggle') ? this.toggle() : this.focus();
					if( this.rootNode.x.combo ) {
						$.dialog( this ).commander.complete( this );
						$.close( this );
					}
				}
			},
			mouseover: {
				prop: T,
				method: function() { this.rootNode.x.hoverable && $.classAdd( this.$(), 'z-hv' ) }
			},
			mouseout: {
				prop: T,
				method: function() { this.rootNode.x.hoverable && $.classRemove( this.$(), 'z-hv' ) }
			},
			focus: function() {
				var r = this.rootNode, f;
				if ( r.x.focusable && this.$() ) {
					if ( r.x.focusmultiple ) {
						$.classToggle( this.$(), 'z-on' );
					} else {
						(f = r.getFocus()) && f.focus( F );
						$.classAdd( this.$(), 'z-on' );
					}
				}
			},
			blur: function() {
				$.classRemove( this.$(), 'z-on' );
			},
			nodechange: function() {
				var g = this.tgl;
				if ( g && g.type === 'grid/leaf' ) {
					g.$( 'o' ).style.visibility = this.length ? '' : 'hidden';
					if ( ! g.$( 'r' ) )
						$.append( g.$( 'o' ), $.arrow( g.id + 'r', this.x.open ? 'b1' : 'r1' ) );
				}
			}
		}
	},
	Prototype: {
		type_tr: T,
		x_nodes: function() {
			return this.x.rows;
		},
		focus: function( a ) {
			this.trigger( a === F ? 'blur' : 'focus' );
		},
		isFocus: function( a ) {
			return $.classAny( this.$(), 'z-on' );
		},
		// 勾选  /@ a -> T/F|event
		checkBox: function( a ) {
			if ( this.box ) {
				typeof a === _OBJ ? $.cancel( a ) : this.box.check( a );
				if ( this.box.type === 'radio' )
					Q( '>.z-checked', this.rootNode.tbody().$() ).removeClass( 'z-checked' );
				$.classAdd( this.$(), 'z-checked', this.box.isChecked() );
				if ( this.box.type === 'checkbox' ) {
					var b = Q( '[name="' + this.box.x.name + '"]', this.rootNode.$() ), h = this.rootNode.thr();
					h && h.box.check( b.length === b.filter( ':checked' ).length );
				}
			}
		},
		isBoxChecked: function() {
			return this.box && this.box.isChecked();
		},
		next: function( n ) {
			if ( this.rootNode._echo_rows ) {
				var b = this.rootNode.tbody().$().rows[ this.$().rowIndex + ( n === F ? -1 : 1 ) ];
				return b && _widget( b );
			} else
				return this.parentNode[ this.nodeIndex + ( n === F ? -1 : 1 ) ];
		},
		prev: function() {
			return this.next( F );
		},
		// 计算所有子孙节点共有多少行
		_rowlen: function() {
			for ( var l = this.length, i = 0, j = 0; j < l; j ++ )
				this[ j ].$() && (i += this[ j ]._rowlen() + 1);
			return i;
		},
		// @a -> index|"+=index"
		move: function( a ) {
			var c = a;
			if ( typeof a === _STR && a.charAt( 1 ) === '=' )
				eval( 'c=this.nodeIndex;c' + a );
			if ( (c = this.parentNode[ c ]) && c !== this )
				c[ c.nodeIndex > this.nodeIndex ? 'after' : 'before' ]( this );
		},
		// @implement tr 子节点的特殊处理
		insertHTML: function( a, b ) {
			if ( ! this.$() )
				return;
			var s = a;
			if ( a.isWidget ) {
				s = [];
				var i = a.$().rowIndex, p = a.$().parentNode, j = a._rowlen();
				do { s.push( p.rows[ i ] ) } while ( j -- );
			}
			if ( b === 'before' )
				Q( this.$() )[ b ]( s );
			else
				Q( b === 'prepend' ? this.$() : this.$().parentNode.rows[ this.$().rowIndex + this._rowlen() ] ).after( s );
		},
		// @a -> T/F, b -> src
		toggle: function( a, b ) {
			if ( this.tgl ) {
				this.tgl.toggle( a );
			} else {
				if ( this.length ) {
					a == N && (a = ! this.x.open);
					this.toggle_rows( a );
				} else if ( this.x.src ) {
					var c = this.rootNode.colgrps[ 0 ], d = {}, r;
					d[ c[ 0 ].x.field ] = { colspan: c.length, node: { type: 'view', src: this.x.src } };
					this.append( d ).isExpandRow = T;
					this.x.open = T;
				}
				if ( this.length ) {
					$.classAdd( this.$(), 'z-open', this.x.open );
					this.trigger( this.x.open ? 'expand' : 'collapse' );
				}
			}
		},
		toggle_rows: function( a ) {
			for ( var i = 0; i < this.length; i ++ ) {
				this[ i ].$().style.display = a ? '' : 'none';
				( this[ i ].tgl ? this[ i ].tgl.x.open : this[ i ].x.open ) && this[ i ].toggle_rows( a );
			}
			this.x.open = a;
		}
	}
} ),
/* `thr`  thead 的子节点 */
THR = define.widget( 'thead/tr', {
	Extend: GridRow,
	Prototype: {
		type_hr: T,
		// a -> T/F|event
		checkBox: function( a ) {
			if ( this.box ) {
				typeof a === _OBJ ? $.cancel( a ) : this.box.check( a );
				if ( this.box.type === 'checkbox' )
					Q( '[name="' + this.box.x._name + '"]', this.rootNode.$() ).prop( 'checked', this.box.isChecked() );
			}
		}
	}
} ),
// `TCell` 是 tr 的离散节点。当 tr 添加 td 时，先创建一个 tcell ，然后 tcell 添加这个 td
TCell = define.widget( 'tcell', {
	Const: function( x, p ) {
		this.rootNode = p.rootNode;
		W.call( this, x, p, -1 );
	},
	Child: 'td',
	Prototype: {
		scaleWidth: function( a ) {
			var w = 0, l = a.x.colspan || 1, r = this.rootNode, c = r.colgrps[ 0 ][ a.colIndex ], d = r._pad, e;
			while ( l -- )
				(e = r.colgrps[ 0 ][ a.colIndex + l ]) != N && (w += e.width());
			if ( isNaN( w ) )
				return N;
			if ( r._face === 'cell' && a.colIndex < r.colgrps[ 0 ].length - 1 )
				w -= 1;
			w -= c.x.wmin != N ? c.x.wmin : c.x.style ? _size_fix( N, 'padding:0 ' + d + 'px 0 ' + d + 'px;' + c.x.style ).wmin : d * 2;
			return w;
		},
		scaleHeight: function( a ) {
			return N;
			var r = this.outerHeight();
			return r == N ? N : r - this.rootNode._pad * 2 - (this.rootNode._face === 'none' ? 0 : 1);
		},
		html: $.rt_empty
	}
} ),
/* `tbody` */
TBody = define.widget( 'tbody', {
	Const: function( x, p ) {
		this.rootNode = p.rootNode;
		W.apply( this, arguments );
		this._rowspan = {};
	},
	Child: 'tr',
	Listener: {
		body: {
			nodechange: function() {
				this.rootNode.resetRowCls();
			}
		}
	},
	Prototype: {
		// @implement
		insertHTML: function( a, b ) {
			this.$() && Q( this.$() )[ b || 'append' ]( a.isWidget ? a.$() : a );
		},
		// @a -> rows json, b -> index  /fixme: colspan rowspan
		insertCol: function( a, b ) {
			var r = this.rootNode, g = r.colgrps[ 0 ];
			b = b == N || ! g[ b ] ? g.length - 1 : b;
			for( var i = 0, l = a.length; i < l; i ++ ) {
				$.extendDeep( this[ i ].x, typeof a[ i ].data !== _OBJ ? { data: a[ i ] } : a[ i ] );
			}
			for( var i = 0, l = this.length; i < l; i ++ ) {
				var c = this[ i ].$().cells[ b ], d = Q( this[ i ].html_cells( b, b ) );
				c ? d.insertBefore( c ) : d.appendTo( Q( this[ i ].$() ) );
				! d.next().length && d.prev().removeClass( 'z-last' );
			}
		},
		deleteCol: function( a ) {
			for( var i = 0, l = this.length; i < l; i ++ ) {
				Q( this[ i ].$().cells[ a ] ).remove();
				Q( this[ i ] ).last().addClass( 'z-last' );
			}
		},
		x_nodes: TR.prototype.x_nodes,
		html_nodes: function() {
			for ( var i = 0, r = this.rootNode.getEchoRows(), l = r.length, s = []; i < l; i ++ )
				s.push( r[ i ].html( i ) );
			return s.join( '' );
		},
		html: function() { return '<tbody id=' + this.id + '>' + this.html_nodes() + '</tbody>' }
	}
} ),
/* `thead` */
THead = define.widget( 'thead', {
	Extend: TBody,
	Child: 'thead/tr',
	Listener: {
		body: {
			ready: function() {
				// 拖动表头调整大小
				var r = this.rootNode;
				if ( r.x.resizable ) {
					Q( 'td', this.$() ).append( '<div class=w-th-rsz></div>' );
					Q( '.w-th-rsz' ).height( this.height() ).on( 'mousedown', function( e ) {
						var c = this, d = c.parentNode, x = e.pageX,
							o = $.db( '<div style="position:absolute;width:1px;height:' + r.height() + 'px;top:' + $.bcr( c ).top + 'px;background:#aaa;"></div>' );
						$.moveup( function( e ) {
							o.style.left = e.pageX + 'px';
						}, function( e ) {
							var i = d.cellIndex, g = r.colgrps, j = g.length;
							while ( j -- )
								g[ j ][ i ].width( g[ j ][ i ].width() + (e.pageX - x) );
						}, o );
					} );
				}
				// 排序
				for ( var i = 0, c = r.colgrps[ 0 ], d = F; i < c.length; i ++ ) {
					if ( c[ i ].x.sort ) {
						Q( '.w-th-sort', this.$() ).each( function() {
							var o = this, n = Col.index( o ), x = c[ n ].x, s = x.sortsrc;
							x.sort !== 'default' && Q( '.w-td-t', o ).append( $.arrow( x.sort === 'asc' ? 't1' : 'b1' ) );
							s && Q( o ).click( function() {
								if ( s.indexOf( 'javascript:' ) == 0 )
									s = Function( s ).call( r, o );
								if ( s && typeof s === _STR && ! d ) {
									d = T;
									Q( '.w-td-t', o ).append( $.image( '.f-i-loading' ) );
									Q( '.f-arw', o ).hide();
									r.cmd( { type: 'ajax', src : s, complete: function() { d = F; Q( '.f-arw', o ).show(); Q( '.f-i-loading', o ).remove(); } } );
								}
							} );
						} );
						break;
					}
				}
			}
		}
	},
	Prototype: {
		html_nodes: _proto.html_nodes
	}
} ),
/* `col` */
Col = define.widget( 'col', {
	Default: { wmin: 0 },
	Helper: {
		index: function( a ) {
			var i = a.cellIndex;
			while ( a = a.previousSibling )
				i += a.colSpan - 1;
			return i;
		}
	},
	Prototype: {
		html: function() {
			var w = this.innerWidth();
			if ( ie7 ) {
				var r = this.parentNode.parentNode.rootNode, d = r._pad;
				w -= this.x.style ? _size_fix( N, 'padding:0 ' + d + 'px 0 ' + d + 'px;' + this.x.style ).wmin : d * 2;
			}
			return '<col id=' + this.id + ' style=width:' + w + 'px>';
		}
	}
} ),
/* `colgroup` */
Colgroup = define.widget( 'colgroup', {
	Extend: 'horz/scale',
	Child: 'col',
	Prototype: {
		insertCol: function( a, b ) {
			 b == N || ! this[ b ] ? this.append( a ) : this[ b ].before( a );
		},
		deleteCol: function( a ) {
			this[ a ] && this[ a ].remove();
		},
		html: function() { return '<colgroup id=' + this.id + '>' + this.html_nodes() + '</colgroup>' }
	}
} ),
/* `table` */
Table = define.widget( 'table', {
	Const: function( x, p ) {
		this.rootNode = p.rootNode;
		W.apply( this, arguments );
		p.rootNode.colgrps.push( new Colgroup( { nodes: x.columns }, this ) );
		if ( x.thead )
			this.thead = new THead( x.thead, this );
		else
			this.tbody = new TBody( { rows: x.rows }, this );
	},
	Listener: {
		body: {
			resize: function() {
				if ( br.ms && this.$() ) {
					var w = this.innerWidth();
					this.$().style.width = w == N ? 'auto' : w + 'px';
				}
			}
		}
	},
	Prototype: {
		html: function() {
			var s = '<table id=' + this.id + ' class="w-grid-table w-grid-face-' + this.rootNode._face + '" cellspacing=0 cellpadding=' + this.rootNode._pad;
			if ( br.ms ) {
				var w = this.innerWidth();
				w != N && (s += ' style="width:' + w + 'px"');
			}
			s += '>' + this.html_nodes();
			if ( br.ms ) {
				for ( var t = '<tfoot class=_ie_tfoot><tr>', i = 0, l = this.rootNode.colgrps[ 0 ].length; i < l; i ++ )
					t += '<td>';
				s += t + '</tfoot>';
			}
			return s + '</table>';
		}
	}
} ),
/* `gridlist` */
GridList = define.widget( 'grid/list', {
	Const: function( x, p ) {
		this.rootNode = p;
		W.apply( this, arguments );
		this.table = new Table( x.table, this );
	},
	Extend: 'vert',
	Listener: {
		body: {
			scroll: function() {
				Scroll.Listener.body.scroll.apply( this, arguments );
				var d = this.rootNode.head;
				if ( d ) {
					d.$().style.overflow = 'hidden';
					d.$().scrollLeft = this.scrollLeft();
				}
			}
		}
	},
	Prototype: {
		className: 'w-grid-tbody'
	}
} ),
/* `gridhead` */
GridHead = define.widget( 'grid/head', {
	Extend: GridList,
	Listener: {
		body: {
			ready: function() {
				// 表头固定
				if ( this.x.table.thead.fix ) {
					var a = Scroll.get( this.rootNode ), b, f;
					a && a.addEvent( 'scroll', function() {
						var e = this.$(),
							c = b || (b = $.after( e, '<div style=height:' + e.offsetHeight + ';display:none>&nbsp;</div>' )),
							m = $.bcr( a.$( 'ovf' ) ),
							n = $.bcr( this.rootNode.$() ),
							f = n.top < m.top;
						e.style.position = f ? 'fixed' : '';
						e.style.zIndex = f ? 1 : '';
						c.style.display = f ? 'block' : 'none';
						$.classAdd( e, 'f-oh f-white f-shadow-bottom', f );
						e.scrollLeft = f ? a.scrollLeft() : 0;
					}, this );
				}
			}
		}
	},
	Prototype: {
		className: 'w-grid-thead'
	}
} ),
// 表格搜索过滤器
GridCombo = $.createClass( {
	Const: function( a ) {
		this.cab = a;
		this.xml  = this.node2xml( a );
		this._keep_show = a.x.combo.keepshow;
	},
	Extend: TreeCombo,
	Prototype: {
		node2xml: function( a ) {
			for ( var i = 0, j, b = a.x.combo.field, c = [], d, t = a.tbody(), e = b.search && b.search.split( ',' ), f = e && e.length, l = t && t.length, r, s; i < l; i ++ ) {
				d = t[ i ].x.data, r = d[ b.remark ];
				s = '<d v="' + d[ b.value ] + '" t="' + $.strEscape( d[ b.text ] ) + '" i="' + t[ i ].id + '"';
				r && (s += ' r="' + $.strEscape( r ) + '"');
				d[ b.forbid ] && (s += ' x="1"');
				if ( f ) {
					for ( j = 0; j < f; j ++ )
						s += ' s' + j + '="' + $.strEscape( d[ e[ j ] ] ) + '"';
				}
				c.push( s + '/>' );
			}
			this._sch = f;
			return $.xmlParse( '<doc>' + c.join( '' ) + '</doc>' );
		},
		first: function() {
			return this.cab.getEchoRows()[ 0 ];
		},
		filter: function( t, s ) {
			var a = this.cab;
			a.tbody() && a.setFilter( this._filter( t ) );
			return a.getEchoRows().length;
		},
		getLength: function() {
			return this.cab.getEchoRows().length;
		}
	}
} ),
/* `grid` */
Grid = define.widget( 'grid', {
	Const: function( x, p ) {
		this._pad  = x.cellpadding != N ? x.cellpadding : 5;
		this._face = x.face || 'none';
		W.apply( this, arguments );
		this.colgrps = [];
		var l, r;
		if ( x.thead && x.thead.rows && (l = x.thead.rows.length) ) {
			for ( var i = 0, c, h = 0; i < l; i ++ )
				h += $.number( x.thead.rows[ i ].height );
			if ( ! h && x.thead.height )
				h = $.number( x.thead.height );
			if ( ! h && ( c = x.pub && x.pub.height ) )
				h = l * $.number( c );
			this.head = new GridHead( $.extend( { table: { thead: x.thead, columns: x.columns } }, x.thead, { width: '*', height: h || 32 } ), this );
		}
		if ( (r = x.rows) && r.length ) {
			var y = { table: { rows: r, columns: x.columns }, width: '*', height: '*', scroll: x.scroll, on: { scroll: 'this.parentNode.trigger(event)' } };
			// 为适应滚动条的位置，当没有head时把grid的样式转到list上。如果有head，这样转移样式可能会出问题，暂不做
			! this.head && $.jsonCut( y, x, 'wmin,hmin,cls,style' );
			this.list = new GridList( y, this );
		}
		if ( x.hiddens )
			new Hiddens( { type: 'hiddens', nodes: x.hiddens }, this );
		if ( x.combo ) {
			this.ownerView.combo = this._combo = new GridCombo( this );
			if ( r = $.dialog( this ) )
				this._matchlength = r.parentNode.x.matchlength;
			x.focusable = x.focusable !== F;
		}
		x.limit && this.limit();
		if ( x.width == -1 )
			this.className += ' z-auto';
	},
	Extend: 'vert/scale',
	Child: 'tr',
	Listener: {
		body: {
			ready: function() {
				var a = this.getFocus(), b = this.tbody();
				a && _scrollIntoView();
				if ( b ) {
					var c = b.$().rows, l = c.length - 1;
					c[ 0 ] && $.classAdd( c[ 0 ], 'z-first' );
					c[ l ] && $.classAdd( c[ l ], 'z-last' );
				}
			},
			scroll: function( e ) {
				if ( this.head && this.list )
					this.head.$().scrollLeft = this.list.$( 'ovf' ).scrollLeft;
			},
			resize: function() {
				this.$() && $.classAdd( this.$(), 'z-auto', this.innerWidth() == N );
			}
		}
	},
	Prototype: {
		NODE_ROOT: T,
		className: 'w-grid',
		thr: function() { return this.head && this.head.table.thead[ 0 ] },
		tbody: function() { return this.list && this.list.table.tbody },
		// 获取符合条件的某一行  /@ a -> condition?
		row: function( a ) {
			return this.rows( a == N ? 0 : a, T )[ 0 ];
		},
		// 获取符合条件的所有行  /@ a -> condition?, b -> one?
		rows: function( a, b ) {
			var d = this.tbody(), r = [];
			if ( d ) {
				if ( a == N ) {
					r = _slice.call( d );
				} else if ( typeof a === _NUM )
					d[ a ] && r.push( d[ a ] );
				else if ( a.isWidget ) {
					var g = a.closest( 'tr' );
					g && r.push( g );
				} else
					try {
						var r = this._rows( a, b, d );
					} catch( ex ) {
						r.push( ex );
					}
			}
			return r;
		},
		_rows: function( a, b, d ) {
			R: for ( var i = 0, k, l = d.length, c, r = []; i < l; i ++ ) {
				for ( k in a ) if ( d[ i ].x.data[ k ] !== a[ k ] ) {
					d[ i ].length && r.push.apply( r, this._rows( a, b, d[ i ] ) );
					continue R;
				}
				if ( b ) { throw d[ i ]; }
				r.push( d[ i ] );
			}
			return r;
		},
		// 获取显示中的tbody的所有行
		getEchoRows: function() {
			return this._echo_rows || this.tbody() || [];
		},
		// 获取符合条件的所有行的 data json  /@ a -> condition?, b -> one?
		rowsData: function( a, b ) {
			for ( var i = 0, d = this.rows( a, b ), l = d.length, r = []; i < l; i ++ )
				r.push( d[ i ].x.data );
			return r;
		},
		// a -> data, b -> index
		_addRow: function( a, b ) {
			if ( this.list ) {
				var p = this.tbody();
				p._rowspan = {};
				b == N && (b = p.length);
				p[ b ] ? p[ b ].before( a ) : p.append( a );
			} else {
				this.list = new GridList( { table: { rows : $.arrIs( a ) ? a : [ a ], columns: this.x.columns }, width: '*', height: '*', scroll: this.x.scroll, on: { scroll: 'this.parentNode.trigger(event)' } }, this );
				this.list.render();
			}
		},
		prepend: function( a ) {
			this._addRow( a, 0 );
		},
		append: function( a ) {
			this._addRow( a );
		},
		// 获取焦点行
		getFocus: function() {
			return this.getFocusAll()[ 0 ];
		},
		// 获取所有焦点行
		getFocusAll: function() {
			var b = this.tbody(), r = [];
			b && Q( '>.z-on', b.$() ).each( function() { r.push( _widget( this ) ) } );
			return r;
		},
		resetRowCls: function() {
			var b = this.tbody();
			if ( b ) {
				var c = Q( '>tr', b.$() ), l = c.length - 1;
				c.each( function( i ) {
					$.classRemove( this, 'z-0 z-1 z-first z-last' );
					$.classAdd( this, 'z-' + (i % 2) + ( i === 0 ? ' z-first' : i === l ? ' z-last' : '' ) );
				} );
			}
		},
		// a -> data|index
		focusRow: function( a ) {
			(a = this.row( a )) && (a.focus(), _scrollIntoView( a ));
		},
		// a -> data, b -> data|index
		insertRow: function( a, b ) {
			if ( b == N )
				return this.append( a );
			(b = this.row( b )) && b.before( a );
			this.resetRowCls();
		},
		// a -> data, b -> data|index
		updateRow: function( a, b ) {
			b != N && (b = this.row( b )) && b.replace( a );
			this.resetRowCls();
		},
		// a -> data|index
		deleteRow: function( a ) {
			if ( a != N && (a = this.rows( a )) ) {
				var i = a.length;
				while ( i -- ) a[ i ].remove();
			}
			this.resetRowCls();
		},
		deleteAllRows: function() {
			var a = this.rows(), i = a.length;
			while ( i -- ) a[ i ].remove();
		},
		//@public 移动行  /@ a -> data|index, b -> index
		moveRow: function( a, b ) {
			if ( a != N && (a = this.rows( a )) ) {
				var i = a.length;
				if ( typeof a === _STR && a.charAt( 0 ) === '-' ) {
					for ( var j = 0; j < i; j ++ )
						a[ j ].move( b );
				} else
					while ( i -- ) a[ i ].move( b );
			}
		},
		//@public 选中某行的checkbox /@a -> data|index, b -> T/F
		checkRow: function( a, b ) {
			if ( a != N && (a = this.rows( a )) ) {
				var i = a.length;
				while ( i -- ) a[ i ].checkBox( b );
			}
		},
		checkAllRows: function( a, b ) {
			var b = b || this.rows(), i = b.length;
			while ( i -- ) {
				b[ i ].checkBox( a );
				if ( b[ i ].length )
					arguments.callee.call( this, a, b[ i ] );
			}
		},
		_col_parse: function( a ) {
			if ( a != N && isNaN( a ) ) {
				for ( var j = 0, g = this.colgrps[ 0 ]; j < g.length; j ++ )
					if ( g[ j ].x.field === a ) { a = j; break; }
			}
			return a;
		},
		//@public 插入一列 / @a -> 一列的数据grid json, b -> colIndex|colField
		insertColumn: function( a, b ) {
			b = this._col_parse( b );
			for ( var j = 0; j < this.colgrps.length; j ++ )
				this.colgrps[ j ].insertCol( a.columns[ 0 ], b );
			this.head && this.head.table.thead.insertCol( a.thead.rows, b );
			this.list && this.list.table.tbody.insertCol( a.rows, b );
			this.x.scroll && this.list.checkScroll();
		},
		//@public 删除一列 / @a -> colIndex|colField
		deleteColumn: function( a ) {
			a = this._col_parse( a );
			for ( var j = 0; j < this.colgrps.length; j ++ )
				this.colgrps[ j ].deleteCol( a );
			this.head && this.head.table.thead.deleteCol( a );
			this.list && this.list.table.tbody.deleteCol( a );
			this.x.scroll && this.list.checkScroll();
		},
		//@public 更新一列 / @a -> 一列的数据grid json, b -> colIndex|colField
		updateColumn: function( a, b ) {
			b = this._col_parse( b );
			if ( this.colgrps[ 0 ][ b ] ) {
				this.deleteColumn( b );
				this.insertColumn( a, b );
			}
		},
		// 高亮某个字段的关键字 /@ a -> field name, b -> key, c -> matchlength, d -> keycls
		highlight: function( a, b, c, d ) {
			for ( var k = 0, e = this.colgrps[ 0 ], l = e.length; k < l; k ++ ) {
				if ( e[ k ].x.field == a ) break;
			}
			if ( k < l ) {
				for ( var i = 0, r = this.getEchoRows(), l = r.length, f; i < l; i ++ ) {
					r[ i ].highlight( k, b, c, d );
				}
			}
		},
		// @a -> page num
		page: function( a ) {
			if ( a != N ) {
				this.x.page = a;
				this.limit();
				this.$() && this.render();
			}
			return { currentpage: this.x.page, sumpage: Math.ceil((this._filter_rows || this.tbody() || []).length / this.x.limit) };
		},
		limit: function() {
			if ( this.x.limit && this.tbody() ) {
				var g = this.x.page || 1, i = (g - 1) * this.x.limit, j = g * this.x.limit;
				this._echo_rows = _slice.call( this._filter_rows || this.tbody(), i, j );
			}
		},
		// @f -> filter rows(经过筛选的行)
		setFilter: function( f ) {
			this._filter_rows = this._echo_rows = f;
			this.x.page = 1;
			this.x.limit && this.limit();
		},
		// @k -> keycode
		keyup: function( k ) {
			if ( ! this.tbody() )
				return;
			var r = this.getEchoRows(), d = k === 40, a;
			if ( d || k === 38 ) { // key down/up
				var a = this.getFocus(), b = a ? ( d ? a.next() : a.prev() ) : r[ d ? 0 : r.length - 1 ];
				b ? b.focus() : (a && a.focus( F ));
			} else if ( k === 13 ) {
				(a = this.getFocus()) && a.click();
			}
		},
		isScrollBottom: function() {
			return this.list.isScrollBottom();
		}
	}
});

// 附件上传模块
require( './upload/upload' );

// 本文件的导出
module.exports = W;