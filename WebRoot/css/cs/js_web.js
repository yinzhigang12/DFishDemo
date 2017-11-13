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
		tab_cen_h= win_h-h3_h-tab_top_h-30>220?win_h-h3_h-tab_top_h-30:220;
       
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
		var h1_ten = $(".tab_cen .h1 th").length;
		for(var i=0;i<h1_ten;i++){
			var w_th = $(".tab_top .h1 th").eq(i+1).width()
			$(".tab_cen .h1 th").eq(i).width(w_th)
		};
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
		$(this).find(".rig_scroll").height(top_h);
		if(top_var==0){
			$(this).find(".rig_scroll").show();
		}else{
			$(this).find(".rig_scroll").hide();
		}
    },function(){
        $(this).find(".rig_scroll").hide();
    });
});