package com.rongji.df.web.view;

import java.util.List;

import org.springframework.stereotype.Component;

import com.rongji.dfish.base.Page;
import com.rongji.dfish.ui.form.Text;
import com.rongji.dfish.ui.helper.GridLayoutFormPanel;
import com.rongji.dfish.ui.helper.GridPanel;
import com.rongji.dfish.ui.layout.ButtonBar;
import com.rongji.dfish.ui.layout.HorizontalLayout;
import com.rongji.dfish.ui.layout.VerticalLayout;
import com.rongji.dfish.ui.layout.View;
import com.rongji.dfish.ui.widget.Button;
import com.rongji.dfish.ui.widget.Html;
import com.rongji.dfish.ui.widget.SubmitButton;

@Component
public class RoleGroupView extends SysBaseView {

	public View buildIndex()
	{
		View view = new View().setCls("index_view");
		VerticalLayout root = new VerticalLayout("root");
		view.add(root);
		HorizontalLayout hp = new HorizontalLayout("search_div").setValign(HorizontalLayout.VALIGN_MIDDLE);
		root.add(hp,"55");
		GridLayoutFormPanel searchForm = new GridLayoutFormPanel("searchForm");
		fillSearchForm(searchForm);
		hp.add(searchForm,"800");
		
		ButtonBar searchButton = new ButtonBar("searchButton").setStyle("margin-left:20px;");
		fillSearchButton(searchButton);
		hp.add(searchButton,"*");
		
		ButtonBar bar = new ButtonBar("role_button");
		fillGridButton(bar);
		root.add(bar,"28");
		
		GridPanel grid = new GridPanel("role_grid");
		fillGridPanel(grid,null);
		root.add(grid,"*");
		
		HorizontalLayout pa = new HorizontalLayout("myself_page_bar");
		fillPageBar(pa,null);
		root.add(pa,"28");
		root.add(new Html(""),"10");
		fillCommands(view);
		
		return view;
	}
	
	public void fillCommands(View view)
	{
		
	}
	
	public void fillSearchForm(GridLayoutFormPanel form)
	{
		form.setHeight(40);
		Text roleName = new Text("q_roleGropName","群组名称",null,30);
		form.add(0, 0, roleName);
		Text fullDepName = new Text("q_fullDepName","创建部分",null,90);
		form.add(0, 1, fullDepName);
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
		bar.setCls("t_bar");
		SubmitButton view = new SubmitButton("","查看").setOn(ButtonBar.EVENT_CLICK, "VM(this).cmd('showInfoJS')");
		view.setCls("normal_button");
		bar.add(view);
		SubmitButton newRole = new SubmitButton("","新建").setOn(ButtonBar.EVENT_CLICK, "VM(this).cmd('newOrEdit','new')");
		newRole.setCls("normal_button");
		bar.add(newRole);
		SubmitButton edit = new SubmitButton("","修改").setOn(ButtonBar.EVENT_CLICK, "VM(this).cmd('edit')");
	}
	
	public void fillGridPanel(GridPanel grid,String rgs)
	{
		
	}
	
	public void fillPageBar(HorizontalLayout pa,Page page)
	{
		
	}
	
}
