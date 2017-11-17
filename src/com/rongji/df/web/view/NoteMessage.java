package com.rongji.df.web.view;

import org.springframework.stereotype.Service;

import com.rongji.dfish.base.Page;
import com.rongji.dfish.ui.Scrollable;
import com.rongji.dfish.ui.command.AjaxCommand;
import com.rongji.dfish.ui.command.CommandGroup;
import com.rongji.dfish.ui.command.ConfirmCommand;
import com.rongji.dfish.ui.command.JSCommand;
import com.rongji.dfish.ui.command.ReplaceCommand;
import com.rongji.dfish.ui.command.SubmitCommand;
import com.rongji.dfish.ui.form.Text;
import com.rongji.dfish.ui.helper.FormPanel;
import com.rongji.dfish.ui.helper.GridPanel;
import com.rongji.dfish.ui.layout.ButtonBar;
import com.rongji.dfish.ui.layout.HorizontalLayout;
import com.rongji.dfish.ui.layout.VerticalLayout;
import com.rongji.dfish.ui.layout.View;
import com.rongji.dfish.ui.layout.grid.GridColumn;
import com.rongji.dfish.ui.layout.grid.Tr;
import com.rongji.dfish.ui.plugin.ueditor.Ueditor;
import com.rongji.dfish.ui.widget.Button;
import com.rongji.dfish.ui.widget.Html;
import com.rongji.dfish.ui.widget.PageBar;
import com.rongji.dfish.ui.widget.Split;
import com.rongji.dfish.ui.widget.SubmitButton;

/**
 * 通知公告页面
 * @author RJ-006
 *
 */
@Service
public class NoteMessage {
	public static View buildWelcomeView()
	{
		View view = new View("main");
		view.setNode(new Html("<div class='x-welcome'>欢迎来到通知公告系统</div>").setStyle("background-color:#dceef3;"));
		return view;
	}
	
	public View buildView(Page page,String flag)
	{
		View view = new View().setCls("index_view");
		HorizontalLayout root = new HorizontalLayout("root");
		view.add(root);
		
		VerticalLayout left = new VerticalLayout("left_content");
		root.add(left,"430");
		HorizontalLayout search = new HorizontalLayout("search_body").setValign(HorizontalLayout.VALIGN_MIDDLE);
		fillSearchForm(search);
		left.add(search,"55");
		left.add(new Split().setStyle("background:lightgray;"),"1");
		GridPanel grid = new GridPanel("info_grid");
		fillGrid(grid,flag);
		left.add(grid,"*");
		HorizontalLayout pa = new HorizontalLayout("myself_page_bar");
		fillPageBar(pa,page);
		left.add(pa,"28");
		left.add(new Html(""),"10");
		
		root.add(new Split().setCls("split_view"),"10");
		VerticalLayout hp = new VerticalLayout("info_body");
		root.add(hp,"*");
		FormPanel form = new FormPanel("info_form");
		fillForm(form);
		hp.add(form,"*");
		
		ButtonBar btnBar = new ButtonBar("btnBar").setCls("b_bar");
		fillButton(btnBar,flag);
		hp.add(btnBar,"50");
		fillCommand(view,flag);
		return view;
	}
	
	public void fillCommand(View view,String flag)
	{
		if("1".equals(flag)){
			//新建
			AjaxCommand newInfo = new AjaxCommand("notemessage/newInfo");
			view.addCommand("newInfo", newInfo);
			//置顶
			JSCommand setTopJS = new JSCommand("var ids = VM(this).f('infoIds').val(); if(ids.length==0||ids.split(',').length>1){"
					+ "$.alert('请选择要置顶的公告，只能选择一条公告！');return;} "
					+ "VM(this).cmd('setTop', ids.split(',')[0]);");
			view.addCommand("setTopJS", setTopJS);
			AjaxCommand setTop = new AjaxCommand("noticeInfo/setTop?infoId=$0");
			view.addCommand("setTop", setTop);
			//下架
			JSCommand revokeJS = new JSCommand("var ids = VM(this).f('infoIds').val(); if(ids.length==0){"
					+ "$.alert('请选择要下架的公告，至少选择一条公告！');return;}VM(this).cmd('sureRevoke');");
			view.addCommand("revokeJS", revokeJS);
			SubmitCommand revoke = new SubmitCommand("notemessage/releaseOrRevoke?type=0");
			revoke.setRange("info_grid, my_page");
			ConfirmCommand sureRevoke = new ConfirmCommand("确定要下架选中的公告信息？");
			sureRevoke.setYes(revoke);
			view.addCommand("sureRevoke", sureRevoke);
		}else{
			//发布
			JSCommand releaseJS = new JSCommand("var ids = VM(this).f('infoIds').val(); if(ids.length==0){"
					+ "$.alert('请选择要发布的公告，至少选择一条公告！');return;}VM(this).cmd('sureRelease');");
			view.addCommand("releaseJS", releaseJS);
			SubmitCommand release = new SubmitCommand("notemessage/releaseOrRevoke?type=1");
			release.setRange("info_grid,my_page");
			ConfirmCommand sureRelease = new ConfirmCommand("确定要发布选中的公告信息？");
			sureRelease.setYes(release);
			view.addCommand("sureRelease", sureRelease);
		}
		//保存
		SubmitCommand save = new SubmitCommand("notemessage/save?type=$0");
		save.setRange("info_form,my_page");
		view.addCommand("save", save);
		//条件查询
		SubmitCommand search = new SubmitCommand("notemessage/search");
		search.setRange("searchForm");
		view.addCommand("search", search);
		//显示信息
		AjaxCommand showInfo = new AjaxCommand("notemessage/showInfo?infoId=$0");
		view.addCommand("showInfo", showInfo);
		//删除公告
		JSCommand delJS = new JSCommand("var ids = VM(this).f('infoIds').val();"
				+ "if(ids.length==0){"
				+ "$.alert('请选择要删除的公告，至少选择一条！');"
				+ "return;} VM(this).cmd('sureDel');");
		view.addCommand("delJS", delJS);
		SubmitCommand del = new SubmitCommand("notemessage/deleteInfo");
		del.setRange("info_grid,my_page");
		ConfirmCommand sureDel = new ConfirmCommand("确定要删除选中的公告信息？");
		sureDel.setYes(del);
		view.addCommand("sureDel", sureDel);
	}
	
	public void fillButton(ButtonBar bar,String flag)
	{
		bar.setAlign("right");
		if("1".equals(flag))
		{
			SubmitButton newInfo = new SubmitButton("","新建").setOn(Button.EVENT_CLICK, "VM(this).cmd('newInfo')").setCls("normal_button");
			bar.add(newInfo);
			SubmitButton saveRelease = new SubmitButton("","保存并发布").setOn(Button.EVENT_CLICK, "VM(this).cmd('save','r')").setCls("normal_button");
			bar.add(saveRelease);
			SubmitButton setTop = new SubmitButton("","置顶").setOn(Button.EVENT_CLICK, "VM(this).cmd('setTopJS')").setCls("normal_button");
			bar.add(setTop);
			SubmitButton xiajia = new SubmitButton("","下架").setOn(Button.EVENT_CLICK, "VM(this).cmd('revokeJS')").setCls("normal_button");
			bar.add(xiajia);
		}else{
			SubmitButton release = new SubmitButton("","发布").setOn(Button.EVENT_CLICK, "VM(this).cmd('releaseJS')").setCls("normal_button");
			bar.add(release);
		}
		SubmitButton saveDraft = new SubmitButton("","1".equals(flag)?"保存草稿":"保存").setOn(Button.EVENT_CLICK, "VM(this).cmd('save','d')").setCls("normal_button");
		bar.add(saveDraft);
		SubmitButton del = new SubmitButton("","删除").setOn(Button.EVENT_CLICK, "VM(this).cmd('delJS')").setCls("normal_button");
		bar.add(del);
		SubmitButton reload = new SubmitButton("","刷新").setOn(Button.EVENT_CLICK, "VM(this).reload()").setCls("normal_button");
		bar.add(reload);
	}
	
	public void fillGrid(GridPanel grid,String flag)
	{
		String name = "1".equals(flag)?"发布时间":"创建时间";
		grid.setScroll(true);
		grid.setScrollClass(Scrollable.SCROLL_AUTO);
		grid.setFocusable(true);
		grid.setPub(new Tr().setFocus(true));
		grid.setNobr(true);
		grid.setResizable(true);
		grid.setFace("line");
//		grid.setGridData(datas);
		grid.addColumn(GridColumn.hidden(0, "infoId"));
		grid.addColumn(GridColumn.checkbox(0, "infoId","40","infoIds",null,false));
		grid.addColumn(new GridColumn(1,"title","公告名称","*"));
		grid.addColumn(new GridColumn(2,"time",name,"150"));
		grid.setPub(new Tr().setOn(GridPanel.EVENT_CLICK, "VM(this).cmd('showInfo',$infoId)"));
//		grid.getPrototype().getThead().setStyle(style);
	}
	
	public void fillForm(FormPanel form)
	{
		Text title = new Text("title","标题",null,150);
		title.setRequired(true);
		form.add(title);
		Ueditor content = new Ueditor("content","详细内容",null);
		content.setRequired(true);
		content.setHeight(350);
		form.add(content);
		
	}
	
	public void fillSearchForm(HorizontalLayout search)
	{
		FormPanel searchForm = new FormPanel("searchForm");
		searchForm.setHeight(40);
		Text con = new Text("search",null,null,150).setPlaceholder("请输入公告名称").setHideLabel(true);
		searchForm.add(con);
		search.add(searchForm,"*");
		SubmitButton submit = new SubmitButton("img/b/search.png","").setOn(SubmitButton.EVENT_CLICK,"VM(this).cmd('search')").setCls("normal_button").setStyle("margin-right:10px;");
		search.add(submit,"70");
	}
	
	public void fillPageBar(HorizontalLayout pa,Page page)
	{
		pa.setValign(HorizontalLayout.VALIGN_TOP);
		pa.add(new Html(""),"*");
		pa.add(new Html("<div style='position:relative;width:73px;height:23px;padding-top:3px;text-align:center;border:1px solid #D3D3D3;'>"
				+"<div style='position:relative;top:2px;'><small>共"+page.getPageCount()+"页</small></div></div>"),"80");
		PageBar bar = new PageBar("my_page",PageBar.TYPE_TEXT);
		bar.setBtncount(1);
		bar.setJump(true);
		bar.setNofirstlast(false);
		bar.setCurrentpage(page.getCurrentPage());
		bar.setName("cp");
		bar.setSrc("notemessage/changePage?cp=$0");
		bar.setSumpage(page.getPageCount());
		pa.add(bar,"345");
	}
	
	public CommandGroup reloadGrid(Page page,String flag)
	{
		CommandGroup cg = new CommandGroup();
		cg.setPath("/index/main");
		GridPanel grid = new GridPanel("info_grid");
		fillGrid(grid,flag);
		ReplaceCommand rc1 = new ReplaceCommand(grid);
		cg.add(rc1);
		HorizontalLayout pa = new HorizontalLayout("myself_page_bar");
		fillPageBar(pa,page);
		ReplaceCommand rc2 = new ReplaceCommand(pa);
		cg.add(rc2);
		return cg;
	}
	
	public ReplaceCommand reloadForm()
	{
		ReplaceCommand rc = new ReplaceCommand();
		FormPanel form = new FormPanel("info_form");
		
		rc.setNode(form);
		return rc;
	}
	
	public View showRelease(Page page)
	{
		View view = new View();
		VerticalLayout root = new VerticalLayout("root").setStyle("background-color:#ffffff;margin:0px 5px 5px 5px;border:1px solid blue;");
		view.add(root);
		Html top = new Html("当前位置：<a href=\"javascript:void(0)\" onclick=\"VM(this).reload('index/penddingwelcome')\">首页</a>&gt;&gt;通知公告<br/><hr/>");
		root.add(top,"30");
		HorizontalLayout info = new HorizontalLayout("info_body");
		root.add(info,"*");
		VerticalLayout left = new VerticalLayout("info_left");
		info.add(left,"300");
		Html leftTitle = new Html("<div style='background:#5AAAF6;height:50px;text-align:center;padding-top:10px;font-size:18px;'><b>通知公告</b></div>");
		left.add(leftTitle,"50");
		Html leftbody = new Html("<div style='background:#BFBFBF;height:30px;text-align:center;padding-top:7px;margin:10px 10px 10px 10px;'>"
				+"<a href=\"javascript:void(0)\" onclick=\"VM('/index/main').reload('noticeInfo/showRelease')\"><font size=3><b>通知公告</b></font></a></div>");
		left.add(leftbody,"*");
		info.add(new Split().setStyle("background:#5AAAF6;"),"3");
		VerticalLayout right = new VerticalLayout("info_right");
		info.add(right,"*");
		Html rtitle = new Html("<div style='background:#5AAAF6;height:30px;text-align:center;padding-top:6px;'><b>通知公告</b></div>");
		right.add(rtitle,"30");
		GridPanel grid = new GridPanel("release_info");
		fillGrid2(grid);
		right.add(grid,"*");
		PageBar pageBar = new PageBar();
		fillPage(pageBar,page);
		right.add(pageBar,"30");
		return view;
	}
	
	public void fillGrid2(GridPanel grid)
	{
		grid.setStyle("margin:10px;");
		grid.setScroll(true);
		grid.getHeadRow().setStyle("text-align:right;font-family:SimHei;");
		grid.setNobr(true);
		grid.setFace("dot");
//		grid.setGridData(datas);
		grid.addColumn(GridColumn.hidden(0, "infoId"));
		grid.addColumn(new GridColumn(1,"title","<b>公告标题</b>","*"));
		grid.addColumn(new GridColumn(2,"time","发布时间","150"));
	}
	
	public void fillPage(PageBar bar,Page page)
	{
		bar.setId("my_page");
		bar.setAlign("right");
		bar.setBtncount(1);
		bar.setCurrentpage(page.getCurrentPage());
		bar.setJump(true);
		bar.setName("cp");
		bar.setNofirstlast(false);
		bar.setSrc("noticeInfo/changePage2?cp=$0");
		bar.setSumpage(page.getPageCount());
	}
	
	public CommandGroup reloadGrid(Page page)
	{
		CommandGroup cg = new CommandGroup();
		cg.setPath("/index/main");
		GridPanel grid = new GridPanel("release_info");
		ReplaceCommand rc1 = new ReplaceCommand(grid);
		cg.add(rc1);
		PageBar pagebar = new PageBar();
		fillPage(pagebar,page);
		ReplaceCommand rc2 = new ReplaceCommand(pagebar);
		cg.add(rc2);
		return cg;
	}
}
