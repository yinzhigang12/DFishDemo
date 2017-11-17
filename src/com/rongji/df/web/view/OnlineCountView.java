package com.rongji.df.web.view;

import org.springframework.stereotype.Component;

import com.rongji.dfish.base.Page;
import com.rongji.dfish.ui.Scrollable;
import com.rongji.dfish.ui.command.CommandGroup;
import com.rongji.dfish.ui.command.JSCommand;
import com.rongji.dfish.ui.command.ReplaceCommand;
import com.rongji.dfish.ui.command.SubmitCommand;
import com.rongji.dfish.ui.form.DatePicker;
import com.rongji.dfish.ui.form.Period;
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
import com.rongji.dfish.ui.widget.Split;
import com.rongji.dfish.ui.widget.SubmitButton;

@Component
public class OnlineCountView {
	public View index(Page page)
	{
		View view = new View().setCls("index_view");
		VerticalLayout root = new VerticalLayout("root");
		view.add(root);
		
		HorizontalLayout hp = new HorizontalLayout("searchPanel").setValign(HorizontalLayout.VALIGN_MIDDLE);
		root.add(hp,"55");
		GridLayoutFormPanel searchForm = new GridLayoutFormPanel("searchForm");
		fillSearchForm(searchForm);
		hp.add(searchForm,"400");
		
		ButtonBar searchButton = new ButtonBar("searchButton").setStyle("margin-left:20px;");
		fillSearchButton(searchButton);
		hp.add(searchButton,"*");
		root.add(new Split().setStyle("background:lightgray;"),"1");
		GridPanel grid = new GridPanel("count_grid");
		fillGridPanel(grid,null);
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
		SubmitCommand search = new SubmitCommand("onlineCount/search");
		search.setRange("searchForm");
		view.addCommand("search", search);
		view.addCommand("resetF", new JSCommand("VM(this).f('start').val('');VM(this).f('end').val('');"));
	}
	
	public void fillSearchForm(GridLayoutFormPanel form)
	{
		form.setHeight(40);
		DatePicker start = new DatePicker("start","",null,DatePicker.DATE);
		DatePicker end = new DatePicker("end","",null,DatePicker.DATE);
		Period operateDate = new Period("记录时间",start,end);
		operateDate.setWidth("100%");
		form.add(0, 0, operateDate);
		form.getPrototype().getColumns().get(0).setWidth("65");
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
	
	public void fillGridPanel(GridPanel grid,String str)
	{
		grid.setScroll(true);
		grid.setEscape(false);
		grid.setScrollClass(Scrollable.SCROLL_AUTO);
//		grid.setCls(UICssUtil)
		grid.setFocusable(true);
		grid.setNobr(true);
		grid.setResizable(true);
		grid.setFace("line");
//		grid.setGridData(datas);
		grid.addColumn(GridColumn.hidden(0, "countId"));
		grid.addColumn(new GridColumn(3,"index","序号","40"));
		grid.addColumn(new GridColumn(1,"countNum","在线量","100"));
		grid.addColumn(new GridColumn(2,"time","记录时间","*"));
//		grid.getPrototype().getThead().setStyle()
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
		bar.setSrc("onlineCount/changePage?cp=$0");
		bar.setSumpage(page.getPageCount());
		pa.add(bar,"345");
	}
	
	public CommandGroup reloadcountGrid(Page page)
	{
		CommandGroup cg = new CommandGroup();
		cg.setPath("/index/main");
		GridPanel grid = new GridPanel("count_grid");
		fillGridPanel(grid,null);
		ReplaceCommand rc = new ReplaceCommand(grid);
		cg.add(rc);
		HorizontalLayout pa = new HorizontalLayout("myself_page_bar");
		fillPageBar(pa,page);
		cg.add(new ReplaceCommand(pa));
		return cg;
	}
	
}