<!doctype html>
<%@ page language="java" import="java.util.*" contentType="text/html; charset=utf-8" %> 
<html xmlns:d>
<head>
<meta charset=utf-8>
<meta http-equiv="X-UA-Compatible" content="IE=8" >
<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE8" >
<title>主页</title>
<script src="./dfish/dfish.js"></script>
<script>
dfish.init( {
	path: '/DFishDemo/', //工程目录。以下定义的目录如果不是以"/"开头，那么都基于本目录
	lib:  'dfish/',  //dfish包目录
	alias: { //自定义widget
		'echarts': 'pl/echarts/echarts.dfish.js',
		'ueditor': 'pl/ueditor/ueditor.dfish.js'
	},
	//表单验证效果 可选值: red,tip,alert
	validate_effect: 'red,tip',
	// 模板ID
	template: 'std',
	// alert和confirm的提示框模板ID
	template_alert: 'alert',
	// 皮肤
	skin: {
		dir: 'css/',
		theme: 'falt',
		color: 'man'
	},
	// 每个 widget 类都可以定义默认样式，以 widget type 作为 key
	default_option: {
		'alert': { btncls: 'x-btn' },
		'confirm': { btncls: 'x-btn' }
	},
	view: { // 如果配置了此参数，将生成全屏的view
		id: 'index',
     	src: 'index/index'
	},
	// 一个汉字算2个字节
	cn_bytes: 2,
	ver: '20171109',
	debug: true
} );
// 加载业务模块
dfish.use( './m/app.js' );
</script>

</head>
<body style="margin:0;overflow:hidden;font-size:12px;font-family:'Microsoft YaHei';" scroll="no">
</body>
</html>
