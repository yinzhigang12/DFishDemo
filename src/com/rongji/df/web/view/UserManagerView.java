package com.rongji.df.web.view;

import org.springframework.stereotype.Component;

import com.rongji.dfish.ui.form.Checkbox;
import com.rongji.dfish.ui.form.Select;
import com.rongji.dfish.ui.form.Text;
import com.rongji.dfish.ui.helper.GridLayoutFormPanel;
import com.rongji.dfish.ui.helper.GridPanel;
import com.rongji.dfish.ui.layout.ButtonBar;
import com.rongji.dfish.ui.layout.HorizontalLayout;
import com.rongji.dfish.ui.layout.VerticalLayout;
import com.rongji.dfish.ui.layout.View;
import com.rongji.dfish.ui.widget.Button;
import com.rongji.dfish.ui.widget.Html;
import com.rongji.dfish.ui.widget.Split;
import com.rongji.dfish.ui.widget.SubmitButton;
import com.rongji.dfish.ui.widget.TreePanel;

import edu.emory.mathcs.backport.java.util.Arrays;

@Component
public class UserManagerView {

	public View index()
	{
		View view = new View().setCls("index_view");
		HorizontalLayout treeRoot = new HorizontalLayout("tree_user_root");
		view.add(treeRoot);
		VerticalLayout left = new VerticalLayout("dept_left");
		treeRoot.add(left,"300");
		TreePanel tree = new TreePanel("dept_user_tree");
		buildDeptTree(tree,null);
		left.add(tree,"*");
		treeRoot.add(new Split().setCls("split_view"),"10");
		VerticalLayout root = new VerticalLayout("root");
		treeRoot.add(root,"*");
		HorizontalLayout searchPanel = new HorizontalLayout("searchPanel").setValign(HorizontalLayout.VALIGN_MIDDLE);
		root.add(searchPanel,"55");
		GridLayoutFormPanel searchForm = new GridLayoutFormPanel("searchForm");
		buildSearchForm(searchForm);
		searchPanel.add(searchForm,"800");
		ButtonBar searchBar = new ButtonBar("searchBar").setStyle("margin-left:10px;");
		searchBar.add(new SubmitButton("","查询").setOn(Button.EVENT_CLICK,"VM(this).cmd('search')").setCls("normal_button"));
		searchBar.add(new Button("","重置").setOn(Button.EVENT_CLICK, "VM(this).cmd('reset')").setCls("cancle_button"));
		searchPanel.add(searchBar,"*");
		ButtonBar buttonBar = new ButtonBar("buttonBar").setCls("t_bar");
		fillButtons(buttonBar,1);
		root.add(buttonBar,"28");
		fillCommands(view);
		GridPanel grid = new GridPanel("user_grid");
		
		root.add(grid,"*");
				
		return view;
	}
	
	public void buildSearchForm(GridLayoutFormPanel form)
	{
		form.setStyle("padding-top:7px;");
		Text loginName = new Text("q_loginName","账号",null,30);
		form.add(0, 0, loginName);
		Text empName = new Text("q_empName","姓名",null,30);
		form.add(0, 1, empName);
		Select status = new Select("q_status","状态","",Arrays.asList(new String[][]{{"-1","----"},{"0","内置"},{"1","在岗"},{"2","离职"}}));
		status.setWidth("100%");
		form.add(0, 2, status);
		
		Checkbox isall = new Checkbox("isAll","",false,"1","全局查询");
		form.add(0, 3, isall);
		form.getPrototype().getColumns().get(0).setWidth("40");
	}
	
	public void fillButtons(ButtonBar bar,int loginId)
	{
		SubmitButton setRole = new SubmitButton("","用户授权").setOn(SubmitButton.EVENT_CLICK, "VM(this).cmd('setRoleJS')").setCls("normal_button");
		bar.add(setRole);
		SubmitButton useable = new SubmitButton("","启用").setOn(SubmitButton.EVENT_CLICK, "VM(this).cmd('isUsable','Y')").setCls("normal_button");
		bar.add(useable);
		SubmitButton unuseable = new SubmitButton("","禁用").setOn(SubmitButton.EVENT_CLICK, "VM(this).cmd('isUsable','N')").setCls("normal_button");
		bar.add(unuseable);
	}
	
	public void fillCommands(View view)
	{
		
	}
	
	public void buildDeptTree(TreePanel tree,String str)
	{
		tree.setStyle("margin:6px;border:1px solid #CCC;").setScroll(true).setHmin(14).setWmin(14);
	}
}
