package com.rongji.df.web.view;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.rongji.dfish.base.Page;
import com.rongji.dfish.ui.Scrollable;
import com.rongji.dfish.ui.command.CommandGroup;
import com.rongji.dfish.ui.command.JSCommand;
import com.rongji.dfish.ui.command.ReplaceCommand;
import com.rongji.dfish.ui.command.SubmitCommand;
import com.rongji.dfish.ui.form.Password;
import com.rongji.dfish.ui.helper.FormPanel;
import com.rongji.dfish.ui.helper.Label;
import com.rongji.dfish.ui.helper.GridLayoutFormPanel;
import com.rongji.dfish.ui.helper.GridPanel;
import com.rongji.dfish.ui.layout.AlbumLayout;
import com.rongji.dfish.ui.layout.ButtonBar;
import com.rongji.dfish.ui.layout.HorizontalLayout;
import com.rongji.dfish.ui.layout.VerticalLayout;
import com.rongji.dfish.ui.layout.View;
import com.rongji.dfish.ui.layout.grid.GridColumn;
import com.rongji.dfish.ui.widget.Button;
import com.rongji.dfish.ui.widget.DialogTemplate;
import com.rongji.dfish.ui.widget.Html;
import com.rongji.dfish.ui.widget.Img;
import com.rongji.dfish.ui.widget.PageBar;
import com.rongji.dfish.ui.widget.Split;
import com.rongji.dfish.ui.widget.TemplateTitle;
import com.rongji.dfish.ui.widget.TemplateView;

/**
 * 主页
 * @author RJ-006
 *
 */
@Service
public class IndexView {

	public Object buildIndexView()
	{
		View view = new View();
		VerticalLayout root = new VerticalLayout("f_root");
		root.setStyle("background-image:url(img/login2/login_bg.png);background-repeat:repate-x repate-y;background-size:100% 100%;");
		view.setNode(root);
		
		VerticalLayout top = new VerticalLayout("f_main_top").setStyle("background-image:url(img/menu/b_menu.png);background-repeat:repate-x;");
		root.add(top,"100");
		HorizontalLayout topBanner = new HorizontalLayout("f_top");
		
		String topLogoHtml = "<img style='float:left;padding:3px 0 0 40px;' src='img/menu/ynbiq2017_logo_1.png' height='85%'/>";
		topBanner.add(new Html(topLogoHtml),"450");
		
		ButtonBar userProfileBar = new ButtonBar("loginBar").setStyle("color:#FFF;").setWmin(10);
		Button btnLogin = new Button(".user-profile","显示用户名").setTip("显示用户名").setWidth(110);
		userProfileBar.add(btnLogin);
		btnLogin.setHoverdrop(true);
		btnLogin.add(new Button("个人信息").setOn(Button.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/personInfo'});"));
		btnLogin.add(new Button("密码修改").setOn(Button.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/editPwd'});"));
		topBanner.add(userProfileBar,"115");
		
		Html logout = new Html("<a href=\"javascript:void(0);\" onclick=\"VM(this).cmd({type:'ajax',src:'index/logout'})\">"+"<img src='img/b/quit.png' title='安全退出'/></a>").setStyle("margin-left:30px;padding-top:5px;");
		topBanner.add(logout,"75");
		top.add(topBanner,"25");
		
		VerticalLayout menuOne = new VerticalLayout("menuOne").setStyle("padding-left:20px;");
		AlbumLayout menuBar = new AlbumLayout("f_menu").setCls("w-album-ynbiq");
		menuBar.setHoverable(true);
		menuBar.setFocusable(true);
		menuBar.add(new Img("img/menu/sys_mgt.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/appJump?type=1'});").setHeight(60).setWidth(60));
		menuBar.add(new Img("img/menu/billing.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/appJump?type=2'});").setHeight(60).setWidth(60));
		menuBar.add(new Img("img/menu/h_iq.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/appJump?type=3'});").setHeight(60).setWidth(60));
		menuBar.add(new Img("img/menu/kjds.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/appJump?type=4'});").setHeight(60).setWidth(60));
		menuBar.add(new Img("img/menu/s_record_sup.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/appJump?type=5'});").setHeight(60).setWidth(60));
		menuBar.add(new Img("img/menu/v_iq.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/appJump?type=6'});").setHeight(60).setWidth(60));
		menuBar.add(new Img("img/menu/s_notice.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/appJump?type=7'});").setHeight(60).setWidth(60));
		
		menuOne.add(menuBar);
		top.add(menuOne,"75");
		
		fillIndexCommand(view);
		View mainView = new View("main");
		root.add(mainView.setSrc("index/penddingwelcome"));
		
		view.addTemplate("std", getStdTemplate());
		view.addTemplate("prong",getProngTemplate());
		view.addTemplate("alert", getAlertTemplate());
		return view;
	}
	
	public void fillIndexCommand(View view)
	{
		JSCommand clickMenu = new JSCommand("");
		view.addCommand("clickMenu", clickMenu);
		JSCommand mouseOver = new JSCommand("var mId=$0;var menu=document.getElementById(mId);"
				+"menu.style.backgroundImage='url(img/menu/menu_back3.png)'");
		view.addCommand("mouseOver", mouseOver);
		JSCommand mouseOut = new JSCommand("var mId=$0;var menu = document.getElementById(mId);"
				+"menu.style.backgroundImage=''");
		view.addCommand("mouseOut", mouseOut);
	}
	
	public Object buildPenddingWelcomeView()
	{
		View view = new View("main");
		HorizontalLayout hrPtMain = new HorizontalLayout("hrPtMain");
		hrPtMain.setStyle("margin:10px;");
		view.setNode(hrPtMain);
		
		VerticalLayout ptLeftVL = new VerticalLayout("ptLeftVL").setStyle("background:#ffffff;");
        String titleSyle = "font-size:14px;color:#333333; background-image:url(img/menu/b_notic.png);background-repeat:repate-x;";
        HorizontalLayout hrPenddingHead = new HorizontalLayout("hrPenddingHead");
        hrPenddingHead.setStyle(titleSyle);
        hrPenddingHead.add(new Html("通知公告").setStyle("padding:5px 10px;"));
        ptLeftVL.add(hrPenddingHead, "32");

        ptLeftVL.setMinwidth(300);
        ptLeftVL.setWmin(1);
        //通知公告信息
//        GridPanel noticeGrid = new GridPanel("index_notice_grid");
//        fillNoticeGrid(noticeGrid, null);
//        ptLeftVL.add(noticeGrid, "*");
//        PageBar bar = new PageBar();
//        fillNoticePage(bar, null);
//        ptLeftVL.add(bar, "30");
//
        hrPtMain.add(ptLeftVL, "70%");
        hrPtMain.add(new Split(),"10");
        VerticalLayout penddingRight = new VerticalLayout("penddingRight");
        penddingRight.setMinwidth(200);
        hrPtMain.add(penddingRight,"*");
        
        VerticalLayout ptNotifyRoot = new VerticalLayout("ptNotifyRoot");
        ptNotifyRoot.setMinheight(160);
        
        VerticalLayout ptChannelRoot = new VerticalLayout("ptChannelRoot").setStyle("background-color:#ffffff");
        ptChannelRoot.setMinheight(160);
        
        ptChannelRoot.add(new Html("快捷通道").setStyle(titleSyle+"padding:5px 10px;"),"32");
//        AlbumLayout channelBar = new AlbumLayout("f_channel").setScroll(true);
//        fillPtChannelRoot()
//        ptChannelRoot.add(channelBar);
        
        VerticalLayout ptLinkRoot = new VerticalLayout("ptLinkRoot").setStyle("background-color:#ffffff;");
        ptLinkRoot.setMinheight(160);
        ptLinkRoot.add(new Html("常用链接").setStyle(titleSyle+"padding:5px 10px;"),"32");
		
        penddingRight.add(ptChannelRoot,"*").add(new Html(""),"10").add(ptLinkRoot,"*");
		return view;
	}
	
	public void fillNoticeGrid(GridPanel grid,List<Object[]> notices)
	{
		grid.setStyle("padding:10px 10px 0px 10px;");
		List<Object[]> datas = new ArrayList<Object[]>();
		if(notices != null && notices.size() > 0)
		{
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			
		}
		grid.setScroll(true);
		grid.setEscape(false);
		grid.setScrollClass(Scrollable.SCROLL_AUTO);
		grid.setNobr(true);
		grid.setHasTableHead(false);
		grid.setFocusable(true);
		grid.setFace("none");
		grid.setGridData(datas);
		grid.addColumn(GridColumn.hidden(0, "infoId"));
		grid.addColumn(new GridColumn(1,"title","标题","*"));
		grid.addColumn(new GridColumn(2,"releaseDate","发布时间","90"));
	}
	public void fillNoticePage(PageBar bar,Page page)
	{
		bar.setId("my_page");
		bar.setAlign("right");
		bar.setCurrentpage(page.getCurrentPage());
		bar.setName("cp");
		bar.setNofirstlast(false);
		bar.setSrc("index/changePage?cp=$0");
		bar.setSumpage(page.getPageCount());
	}
	
	public CommandGroup updateNoticeGridAfterPage(Page page,List<Object[]> notices)
	{
		CommandGroup cg = new CommandGroup();
		GridPanel noticeGrid = new GridPanel("index_notice_grid");
		fillNoticeGrid(noticeGrid,notices);
		ReplaceCommand rc = new ReplaceCommand(noticeGrid);
		cg.add(rc);
		PageBar bar = new PageBar();
		fillNoticePage(bar,page);
		ReplaceCommand rc1 = new ReplaceCommand(bar);
		cg.add(rc1);
		return cg;
	}
	
	private static DialogTemplate getStdTemplate()
	{
		DialogTemplate std = new DialogTemplate().setCls("dlg-std");
		VerticalLayout vp = new VerticalLayout(null);
		std.setNode(vp);
		HorizontalLayout head = new HorizontalLayout(null).setCls("dlg-std-head");
		vp.add(head,"40");
		head.add(new TemplateTitle(null).setCls("dlg-std-title").setWmin(10),"*");
		head.add(new Html(null,"<i class=ico-dlg-max></i>").setCls("dlg-max").setAlign("center").setValign("middle").setOn(Html.EVENT_CLICK, "$.dialog(this).max(this)"),"40");
		head.add(new Html(null,"<i class=ico-dlg-close></i>").setCls("dlg-close").setAlign("center").setValign("middle").setOn(Html.EVENT_CLICK, "$.dialog(this).close()"),"40");
		TemplateView cont = new TemplateView(null);
		vp.add(cont,"*");
		return std;
	}
	
	private static DialogTemplate getProngTemplate()
	{
		DialogTemplate std = new DialogTemplate().setCls("dlg-prong").setIndent(-10);
		VerticalLayout vp = new VerticalLayout(null);
		std.setNode(vp);
		vp.setAftercontent("<div class=dlg-prong-arrow-out></div><div class=dlg-prong-arrow-in></div>");
		
		HorizontalLayout head = new HorizontalLayout(null).setCls("dlg-prong-head");
		vp.add(head,"36");
		head.add(new TemplateTitle(null).setCls("dlg-prong-title"),"*");
		head.add(new Html(null,"<i onclick=$.close(this) class='dlg-close'>&times;</i><i class=f-vi></i>").setAlign(Html.ALIGN_CENTER).setValign(Html.VALIGN_MIDDLE),"40");
		TemplateView cont = new TemplateView(null);
		vp.add(cont,"*");
		return std;
	}
	
	private static DialogTemplate getAlertTemplate()
	{
		DialogTemplate std = new DialogTemplate().setCls("dlg-std");
		VerticalLayout vp = new VerticalLayout(null);
		std.setNode(vp);
		HorizontalLayout head = new HorizontalLayout(null).setCls("dlg-std-head");
		vp.add(head,"40");
		head.add(new TemplateTitle(null).setCls("dlg-std-title").setWmin(10),"*");
		head.add(new Html(null,"<i class=ico-dlg-close></i>").setCls("dlg-close").setAlign("center").setValign("middle").setOn(Html.EVENT_CLICK, "$.dialog(this).close()"),"40");
		TemplateView cont = new TemplateView(null);
		vp.add(cont,"*");
		return std;
	}
	
	public View editPwdView()
	{
		View view = new View();
		FormPanel form = new FormPanel("pwd_form");
		view.add(form);
		Password old = new Password("oldPwd","原密码",null,32);
		old.setRequired(true);
		form.add(old);
		Password newP = new Password("newPwd","新密码",null,32);
		newP.setRequired(true);
		form.add(newP);
		Password sure = new Password("surePwd","确认密码",null,32);
		sure.setRequired(true);
		form.add(sure);
		Button btn = new Button("","确定").setOn(Button.EVENT_CLICK, "VM(this).cmd('checkJS')").setCls("normal_button");
		btn.setStyle("margin-left:160px;");
		form.add(btn);
		view.addCommand("checkJS", new JSCommand("var np=VM(this).f('newPwd').val();"
				+"var sp=VM(this).f('surePwd').val();if(np && np.length<4){$.alert('新密码位数不能少于4位！');return;}"
				+"if(np != sp){$.alert('两次输入的密码不一致！');VM(this).f('surePwd').val('');return;}"
				+"VM(this).cmd('submit');"));
		view.addCommand("submit", new SubmitCommand("index/savePwd"));
		return view;
	}
	
	public View showPersonInfo()
	{
		View view = new View();
		VerticalLayout root = new VerticalLayout("root");
		view.add(root);
		GridLayoutFormPanel grid = new GridLayoutFormPanel("grid_info");
		root.add(grid,"130");
		grid.setStyle("margin:5px 10px 0px 10px;");
		grid.setFace("dot");
		grid.add(0, 0, new Label("<b>基本信息</b>",""));
		grid.add(1, 0, new Label("账号：",""));
		grid.add(1, 1, new Label("身份证：",""));
		grid.add(1, 2, new Label("性别：",""));
		grid.add(2, 0, new Label("姓名：",""));
		grid.add(2, 1, new Label("职务：",""));
		grid.add(2, 2, new Label("电话：",""));
		grid.add(3, 0, new Label("机构/部门：",""));
		grid.add(3, 1, 3,2,new Label("角色：",""));
		root.add(new Split().setStyle("background:#0068B7"),"3");
		
		return view;
	}
	
	public static View buildWelcomeView()
	{
		View view = new View("main");
		view.setNode(new Html("<div class='x-welcome'>欢迎使用DFish框架系统</div>").setStyle("background-color:#dceef3;"));
		return view;
	}
}
