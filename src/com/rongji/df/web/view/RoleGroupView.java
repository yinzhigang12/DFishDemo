package com.rongji.df.web.view;

import java.util.List;

import org.springframework.stereotype.Component;

import com.rongji.dfish.base.Page;
import com.rongji.dfish.ui.Scrollable;
import com.rongji.dfish.ui.command.AjaxCommand;
import com.rongji.dfish.ui.command.ConfirmCommand;
import com.rongji.dfish.ui.command.JSCommand;
import com.rongji.dfish.ui.command.SubmitCommand;
import com.rongji.dfish.ui.form.Text;
import com.rongji.dfish.ui.helper.GridLayoutFormPanel;
import com.rongji.dfish.ui.helper.GridPanel;
import com.rongji.dfish.ui.layout.ButtonBar;
import com.rongji.dfish.ui.layout.HorizontalLayout;
import com.rongji.dfish.ui.layout.VerticalLayout;
import com.rongji.dfish.ui.layout.View;
import com.rongji.dfish.ui.layout.grid.GridColumn;
import com.rongji.dfish.ui.layout.grid.Tr;
import com.rongji.dfish.ui.widget.Button;
import com.rongji.dfish.ui.widget.Html;
import com.rongji.dfish.ui.widget.PageBar;
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
		JSCommand choiceJS = new JSCommand("var focus=VM(this).find('role_grid').getFocus();if(focus==undefined){"
				+"return -1;} var rgId = focus.x.data.rgIdItem;return rgId;");
		view.addCommand("choiceJS", choiceJS);
		AjaxCommand delete = new AjaxCommand("roleGroupMgt/deleteRole?cp=$0&rgId=$1");
		view.addCommand("deleteRole", delete);
		ConfirmCommand deleteCfm = new ConfirmCommand("确定要删除该行群组信息？");
		deleteCfm.setYes(delete);
		view.addCommand("deleteCfm", deleteCfm);
		JSCommand beforeDel = new JSCommand("var rgId = VM(this).cmd('choiceJS');if(rgId==-1){"
				+"$.alert('请选择要删除的行！');return;};VM(this).cmd('deleteCfm',VM(this).fv('cp'),rgId);");
		view.addCommand("beforeDel", beforeDel);
		SubmitCommand newOrEdit = new SubmitCommand("roleGroupMgt/newOrEditDialog?type=$0&rgId=$1");
		newOrEdit.setRange("role_grid,my_page");
		view.addCommand("newOrEdit", newOrEdit);
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
		edit.setCls("normal_button");
		bar.add(edit);
		SubmitButton del = new SubmitButton("","删除").setOn(ButtonBar.EVENT_CLICK, "VM(this).cmd('beforeDel')");
		del.setCls("normal_button");
		bar.add(del);
		SubmitButton role = new SubmitButton("","分配用户").setOn(ButtonBar.EVENT_CLICK, "VM(this).cmd('setUserJS')");
		role.setCls("normal_button");
		bar.add(role);
		SubmitButton roltLimit = new SubmitButton("","分配角色").setOn(ButtonBar.EVENT_CLICK,"VM(this).cmd('setRolesJS')");
		roltLimit.setCls("normal_button");
		bar.add(roltLimit);
		
	}
	
	public void fillGridPanel(GridPanel grid,String rgs)
	{
		grid.setScroll(true);
		grid.setEscape(false);
		grid.setScrollClass(Scrollable.SCROLL_AUTO);
//		grid.setCls(UICssUtil.GRID_CLS);
		grid.setFocusable(true);
		grid.setNobr(true);
		grid.setResizable(true);
		grid.setFace("line");
//		grid.setGridData(datas);
		grid.addColumn(GridColumn.hidden(0, "rgIdItem"));
		grid.addColumn(new GridColumn(6,"index","序号","40"));
		grid.addColumn(new GridColumn(1,"roleGroupName","群组名称","200"));
		grid.addColumn(new GridColumn(2,"remark","描述","*"));
		grid.addColumn(new GridColumn(3,"isShared","是否共享","100"));
		grid.addColumn(new GridColumn(4,"fullDepName","创建部分","200"));
		grid.addColumn(new GridColumn(5,"createName","创建人","200"));
		grid.setPub(new Tr().setOn(GridPanel.EVENT_DBLCLICK, "VM(this).cmd('showInfo',$rgIdItem)"));
//		grid.getPrototype().getThead().setStyle(UICssUtil.CSS_GRID_THEAD_BACK_IMG)
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
		bar.setSrc("roleGroupMgt/changePage?cp=$0");
		bar.setSumpage(page.getPageCount());
		pa.add(bar,"345");
	}
	
}
