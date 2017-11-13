$(function() {
	var tab_cen_h,scroll_h,top_h,scroll_top,top_var;
	var	top_var=0;
    h_nav();
    $(window).resize(function() {
        h_nav();
    });
    function h_nav() {
        var h_top = $(".top").outerHeight();
        var win_h = $(window).height() - h_top;
        var tab_top_h = $(".tab_top").outerHeight();
        var tab_top_w = $(".tab_top").outerWidth();
        var h3_h = $(".h3").outerHeight();
        $(".head").height(win_h);
        $(".head_body").width($('.head').width());
		tab_cen_h= win_h-h3_h-tab_top_h-30>200?win_h-h3_h-tab_top_h-30:200;
       
        $(".tab_cen_body").css({width:tab_top_w});
		if(top_var==0){
			$(".tab_cen").css({height:tab_cen_h});
		}else{
			$(".tab_cen").css({height:'auto'});
		}
		
		
		scroll_h = $(".tab_cen_body").height();
		top_h = tab_cen_h*tab_cen_h/scroll_h;
		
		var th_one_w = $(".td_lef_w").outerWidth()
        $(".td_lef_w2").width(th_one_w);
		
		
		th_th();//表格取宽
		
    }
    $(".top .lef").click(function() {
		if($(this).hasClass('hover')){
			top_var=1;
			$(this).removeClass('hover');
			$(".tab_cen").css({height:'auto'});
		}else{
			top_var=0;
			$(this).addClass('hover');
			$(".tab_cen").css({height:tab_cen_h});
		}
    });
	$(".tab_cen_scroll").scroll(function() {
		scroll_top = scroll_h>tab_cen_h ? $(this).scrollTop()*tab_cen_h/scroll_h : 0;
	  	$(".rig_scroll").css({top:scroll_top,height:top_h})
	});
	
	
    $(".tab_cen").hover(function(){
		if(scroll_h>tab_cen_h){
			$(this).find(".rig_scroll").height(top_h);
		}else{
			$(this).find(".rig_scroll").height(0);
		}
		if(top_var==0){
			$(this).find(".rig_scroll").show();
		}else{
			$(this).find(".rig_scroll").hide();
		}
    },function(){
        $(this).find(".rig_scroll").hide();
    });
	
	function th_th() {
		var h1_top_ten = $(".tab_top .h1 th").length;
		var h1_ten = $(".tab_cen .h1 th").length;
		for(var i=1;i<h1_top_ten;i++){
			var w_th = $(".tab_top .h1 th").eq(i).width()
			if(i<h1_ten+1){
				$(".tab_cen .h1 th").eq(i-1).width(w_th)
			}else if(i<h1_ten+2){
				$(".tab_cen .td_lef_h2").eq(i-h1_ten-1).width(w_th)
			}else{
				$(".tab_cen .h2 th").eq(i-h1_ten-2).width(w_th)
			}
		}; 
	} 
	
});

var tempValue = "";
var regTag = /T\d+\.\w+\|\w+|T\d+\.\(\w+\|\w+\)|\w+\|\w+|X\d+/g;//表达式待提取对象元素判断用正则
var regOp =/T\d+\.\w+\|\w+|[\w|.]+/g;//表达式分割用正则
$(function(){
	setTimeout(function(){
		//将changeValueCn中记录的修改过的单元格及原值分解，找到对应ID输入框，字体变色并加入title
		var value = $("#changeValueCn").val();
		//alert($("#changeValueCn").val());
		if(value!=""){
			var items = value.split(",");
			var itemId = "";
			for(i=0;i<items.length;i++){
				if(items[i]!=""){
					ids = items[i].split("|");
					var item;
					if(itemId!=""&&itemId!=(ids[0]+"|"+ids[1])&&itemId!=ids[0]){
						item = document.getElementById(itemId);
						item.title+=",修改为："+item.value;
					}
					if(ids[0].indexOf("X")<0){
						itemId = ids[0]+"|"+ids[1];
						item = document.getElementById(ids[0]+"|"+ids[1]);
						//var item = $("input[id='"+ids[0]+"|"+ids[1]+"']");
					}else{
						itemId = ids[0];
						item = document.getElementById(ids[0]);
					}
					item.style.color="#FF0000";
					if(item.title.length<=0)
						item.title="原值="+ids[2]+"\n修改人："+ids[3]+",所属组织："+ids[4];
					else
						item.title+=",修改为："+ids[2]+"\n修改人："+ids[3]+",所属组织："+ids[4];
					//alert(ids[0]);
				}
			}
			if(itemId!=""){
				item = document.getElementById(itemId);
				item.title+=",修改为："+item.value;
			}
		}
	},200);
	var explain =  $("#explainMap").val();
	var explainMap = eval("(" + explain + ")");
	$("input[type='text']").each(function(){
		 var id = $(this).attr("id");
		 if(id.indexOf("X")<0){
			 var ids = id.split("|");
			 var row = ids[0];
			 var col = ids[1].substr(1);
			 var value = $(this).val();
			 if(explainMap[row]!=null){
				 if(explainMap[row][col]!=null){
					 var menu = [];
					 for(var i=0; i<explainMap[row][col].length; i++){
						 menu.push(
						 {
	                         text: explainMap[row][col][i].fitemname,
	                         func: function(index) {
	                        	 var id = $(this).children().eq(0).attr("id");
	                        	 var ids = id.split("|");
	                			 var row = ids[0];
	                			 var col = ids[1].substr(1);
	                			 var value = $(this).children().eq(0).val();
	                			 var itemType = explainMap[row][col][index].fitemType;
            					 var FChildTjbid = explainMap[row][col][index].fchildTjbid;
	                        	 if(itemType=='1'){
	                      			var url = "demoReport/illustrate?FRepmakeid="+ $("#FRepmakeid").val()+"&FTjbid="+$("#reportKey").val()
	                      				+"&FVersionid="+$("#version").val()+"&dataRow="+ids[0]+"&colNum="+ids[1].substr(1)+"&FFilldzz="+$("#scope").val();
	                      			parent.VM().cmd({type:'dialog',id: 'mydialog', template:'std', width: 800, height: 300, src: url,title:'报表说明' });
	        					 }else{
	        						 var FBegdate = $("#FBegdate").val();
	        						 var FEnddate = $("#FEnddate").val();
	        						 var FYear = $("#FYear").val();
	            					 
	        						 var url = "demoReport/reportInfo?FChildTjbid="+FChildTjbid+"&FBegdate="+FBegdate+"&FEnddate="+FEnddate+"&FYear="+FYear+"&sumNum="+value;
	        						 parent.VM().cmd({type:'dialog',id: 'mydialog', template:'std', width: 1180, height: 650, src: url,title:'报表说明' });
	        					 }
	                        	 
	                         }
	                     });
						 
					 }
					 $(this).parent().smartMenu([menu],{textLimit:10});
					 
					
				 }
			 }
		 }
	  });
	
	$("input[type='text']").dblclick(function(){
		var id = $(this).attr("id");
		if(id.indexOf("X")<0){
			//console.log(parent.VM().cmd);
			//980x560//127.0.0.1:8888/pam/
			var ids = id.split("|");
			var url = "demoReport/drill?FRepmakeid="+ $("#FRepmakeid").val()+"&FTjbid="+$("#reportKey").val()
				+"&FVersionid="+$("#version").val()+"&dataRow="+ids[0]+"&colNum="+ids[1].substr(1);
			//console.log(url);
			//console.log('val=='+$(this).val());
			var val_ = $(this).val();
			if(val_ && val_ > 0){
				//parent.VM().cmd({type:'dialog',id: 'mydialog', template:'std', width: 980, height: 650, src: 'index/index' });
				parent.VM().cmd({type:'dialog',id: 'mydialog', template:'std', width: 980, height: 650, src: url });
			}

		}
	}).bind("blur",function(){//失去焦点
		return validateCell(this);
	}).bind("keydown",function() {//按键按下事件，保留原值
		var reg = /^([1-9]\d{0,10}|0)$/g;
		if(reg.test($(this).val())){
			tempValue = Number($(this).val());
		}
	});
});

//提交校验
function checkAllTable(){
	var result = true;
	var inputs = $("input[type='text']");
	if(inputs!=undefined && inputs.size()>0){
		for(var i=0; i < inputs.size();i++){
			result = validateCell(inputs[i]);
			if(!result){
				break;
			}
		}
	}
	return result;
}

//单元格 校验
function validateCell($this){
	var v = $this;
	var reg = /^([1-9]\d{0,10}|0)$/g;
	if(reg.test($(v).val())){//验证是否是数字，11位以内，是否真的有修改
		if($(v).attr("formula")==undefined || $(v).attr("formula")==""){
			return true;
		}else{
			var formula = $(v).attr("formula");
			var formulaInfo = $(v).attr("formulaInfo");
			var id = $(v).attr("id");
			if(formula.indexOf(",") < 0){
				return validateFormula(formula, formulaInfo);
			}else{
				//单元格，多个表达式遍历校验,提示对应的表达式信息
				var formulaSplit =  formula.split(",");
				var formulaInfoSplit =  formulaInfo.split(",");
				var flag = true;
				for(var i=0; i < formulaSplit.length; i++){
					if(!validateFormula(formulaSplit[i], formulaInfoSplit[i])){
						flag = false;
						break;
					}
				}
				return flag;
			}
		}
	}else{
		$(v).val(tempValue);
		$(v).focus();
		parent.$.alert("您输入的数值有误或超出规定长度，请输入正整数!");
		return false;
	}
	
}

//校验公式
function validateFormula(formula, formulaInfo){
	//从公式提取相应要取值的对象元素
	var tags = formula.match(regTag);
	//从公式提取运算符
	var ops = formula.split(regOp);
	var values = new Array(tags.length);
	var expstr = "";
	//通过js、ajax操作取得对应值
	for(var i=0;i<tags.length;i++){
		//跨表，ajax操作中间表去取得对应值
		if(tags[i].indexOf("T")==0){
			values[i]=getTableValue(tags[i]);
		}else{
		//报表内单元格的对应值
			values[i]=getTagValue(tags[i]);
		}
	}
	//替换公式为数字表达形式
	for(var i=0;i<ops.length;i++){
		if(i<values.length)
			expstr += ops[i]+values[i];
		else
			expstr += ops[i];
	}
	//输入解释器计算
	var exp = igame.Expression;
	var fm = new exp.Formula( "="+expstr );
	var val = fm.evaluate();
	//匹配计算结果
	if(val.toString()=="false"){
		parent.$.alert("报表数据检验错误："+formulaInfo);
		return false;
	}else{
		return true;
	}
	
}

//获取报表页面上的单元格的值
function getTagValue(tag){
	var result ;
	if(tag.indexOf("X")==0){
		result = $("input[id='"+tag+"']").val();
	}else{
		var obj = $("input[id='"+tag.substring(1).toLowerCase()+"']");
		if(obj.size()==1){
			result = obj.get(0).value;
		}else{
			
			result = obj.get(obj.size()-1).value;
		}
	}
    if(result=="-"||result==""){
    	result = "0";
    }
	return result;
}

//同步查询从后台中间表获取 跨表数据
function getTableValue(tag){
    var tags = tag.split(".");
	var dataRow = "";
	var colNum = "";
	var result ;
	if(tags[1].indexOf("X")==0){
		dataRow = tags[1];
		colNum = "C1";
	}else if(tags[1].indexOf("R")==0){
	    dataRow=tags[1].substring(1,tags[1].indexOf("|"));
	    colNum = tags[1].substring(tags[1].indexOf("|")+1,tags[1].length);
	}
	$.ajax({ 
	  		async : false,
        	type: 'POST',
            url : 'statisticData/queryCellValue',  
            data : {"reportNo":tags[0].substring(1),"version":$("#version").val(),"scope":$("#scope").val(),"dataRow":dataRow,"colNum":colNum,"isSum":$("#isSum").val()},  
            dataType : 'json',  
            success : function(data) { 
                result = data;
            }
    });  
	//末查询到，当零处理
	if(result=="-"||result=="" || result=="null" || result==null){
    	result = "0";
    }
    return result;
	
}