package com.rongji.df.web.view;

import org.springframework.stereotype.Component;

import com.rongji.dfish.base.Page;
import com.rongji.dfish.ui.Scrollable;
import com.rongji.dfish.ui.command.AjaxCommand;
import com.rongji.dfish.ui.command.CommandGroup;
import com.rongji.dfish.ui.command.ConfirmCommand;
import com.rongji.dfish.ui.command.JSCommand;
import com.rongji.dfish.ui.command.ReplaceCommand;
import com.rongji.dfish.ui.command.SubmitCommand;
import com.rongji.dfish.ui.form.Text;
import com.rongji.dfish.ui.helper.GridLayoutFormPanel;
import com.rongji.dfish.ui.helper.GridPanel;
import com.rongji.dfish.ui.layout.ButtonBar;
import com.rongji.dfish.ui.layout.HorizontalLayout;
import com.rongji.dfish.ui.layout.VerticalLayout;
import com.rongji.dfish.ui.layout.View;
import com.rongji.dfish.ui.layout.grid.GridColumn;
import com.rongji.dfish.ui.widget.Button;
import com.rongji.dfish.ui.widget.Html;
import com.rongji.dfish.ui.widget.PageBar;
import com.rongji.dfish.ui.widget.SubmitButton;

@Component
public class OnlineUserView {
	public View index(Page page)
	{
		View view = new View().setCls("index_view");
		VerticalLayout root = new VerticalLayout("root");
		view.add(root);
		HorizontalLayout hp = new HorizontalLayout("searchPanel").setValign(HorizontalLayout.VALIGN_MIDDLE);
		root.add(hp,"55");
		GridLayoutFormPanel searchForm = new GridLayoutFormPanel("searchForm");
		fillSearchForm(searchForm);
		hp.add(searchForm,"800");
		
		ButtonBar searchButton = new ButtonBar("searchButton").setStyle("margin-left:20px");
		fillSearchButton(searchButton);
		hp.add(searchButton,"*");
		
		ButtonBar bar = new ButtonBar("online_button").setStyle("t_bar");
		fillGridButton(bar);
		root.add(bar,"28");
		
		GridPanel grid = new GridPanel("online_grid");
		fillGridPanel(grid);
		root.add(grid,"*");
		
		HorizontalLayout pa = new HorizontalLayout("myself_page_bar");
		fillPageBar(pa,page);
		root.add(pa,"28");
		root.add(new Html(""),"5");
		fillCommands(view);
		return view;
	}
	
	public void fillCommands(View view)
	{
		AjaxCommand stopSession = new AjaxCommand("onlineUser/stopSession?userId=$0&cp=$1");
		view.addCommand("stopSession", stopSession);
		JSCommand choiceJS = new JSCommand("var focus=VM(this).find('online_grid').getFocus();if(focus==undefined){"
				+"$.alert('执行此操作前，请先选中一条记录！');return;}  var userId=focus.x.data.loginId;"
				+" var cp = VM(this).f('cp').val();VM(this).cmd('sureStop',userId,cp)");
		view.addCommand("choiceJS", choiceJS);
		ConfirmCommand sureStop = new ConfirmCommand("确定中断该员工的会话？");
		sureStop.setYes(stopSession);
		view.addCommand("sureStop", sureStop);
		SubmitCommand search = new SubmitCommand("onlineUser/search");
		search.setRange("searchForm");
		view.addCommand("search", search);
		view.addCommand("resetF", new JSCommand("VM(this).f('q_userName').val('');VM(this).f('q_depName').val('');"));
	}
	
	public void fillSearchForm(GridLayoutFormPanel form)
	{
		form.setHeight(40);
		Text userName = new Text("q_userName","在线人",null,30);
		form.add(0, 0, userName);
		Text fullDepName = new Text("q_depName","所属部门",null,90);
		form.add(0, 1, fullDepName);
		form.getPrototype().getColumns().get(0).setWidth("60");
	}
	
	public void fillSearchButton(ButtonBar bar)
	{
		SubmitButton search = new SubmitButton("","查询").setOn(Button.EVENT_CLICK, "VM(this).cmd('search')");
		search.setCls("normal_button");
		bar.add(search);
		Button reset = new Button("","重置").setOn(ButtonBar.EVENT_CLICK, "VM(this).cmd('resetF')");
		reset.setCls("cancle_button");
		bar.add(reset);
	}
	
	public void fillGridButton(ButtonBar bar)
	{
		SubmitButton view = new SubmitButton("","中断会话").setOn(ButtonBar.EVENT_CLICK, "VM(this).cmd('choiceJS')");
		view.setCls("normal_button");
		bar.add(view);
	}
	
	public void fillGridPanel(GridPanel grid)
	{
		grid.setScroll(true);
		grid.setEscape(false);
		grid.setScrollClass(Scrollable.SCROLL_AUTO);
		
		grid.setFocusable(true);
		grid.setNobr(true);
		grid.setResizable(true);
		grid.setFace("line");
//		grid.setGridData(datas);
		grid.addColumn(GridColumn.hidden(0, "loginId"));
		grid.addColumn(new GridColumn(1,"index","序号","40"));
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
		bar.setSrc("onlineUser/changePage?cp=$0");
		bar.setSumpage(page.getPageCount());
		pa.add(bar,"345");
	}
	
	public CommandGroup reloadonlineGrid(Page page)
	{
		CommandGroup cg = new CommandGroup();
		cg.setPath("/index/main");
		GridPanel grid = new GridPanel("online_grid");
		fillGridPanel(grid);
		ReplaceCommand rc = new ReplaceCommand(grid);
		cg.add(rc);
		HorizontalLayout pa = new HorizontalLayout("myself_page_bar");
		fillPageBar(pa,page);
		cg.add(new ReplaceCommand(pa));
		return cg;
	}

}
