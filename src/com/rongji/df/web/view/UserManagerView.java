package com.rongji.df.web.view;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.rongji.df.entity.SmDepartment;
import com.rongji.df.entity.SmUser;
import com.rongji.dfish.ui.Scrollable;
import com.rongji.dfish.ui.form.Checkbox;
import com.rongji.dfish.ui.form.Select;
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
import com.rongji.dfish.ui.widget.Leaf;
import com.rongji.dfish.ui.widget.Split;
import com.rongji.dfish.ui.widget.SubmitButton;
import com.rongji.dfish.ui.widget.TreePanel;

import edu.emory.mathcs.backport.java.util.Arrays;

@Component
public class UserManagerView {

	public View index(String loginId,SmDepartment dept,List<SmUser> users)
	{
		View view = new View().setCls("index_view");
		HorizontalLayout treeRoot = new HorizontalLayout("tree_user_root");
		view.add(treeRoot);
		VerticalLayout left = new VerticalLayout("dept_left");
		treeRoot.add(left,"300");
		TreePanel tree = new TreePanel("dept_user_tree");
		buildDeptTree(tree,dept);
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
		fillButtons(buttonBar,loginId);
		root.add(buttonBar,"28");
		fillCommands(view);
		GridPanel grid = new GridPanel("user_grid");
		String depId = dept == null ? "":dept.getDepId()+"";
		fillGrid(grid,users,depId);
		root.add(grid,"*");
		root.add(new Html("&nbsp;&nbsp;注意：灰色数据表示该用户在局端OA办公系统上已被禁用，要想启用该用户，必须先在OA办公系统上启用，然后在本系统上启用即可。"),"25");
		
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
	
	public void fillButtons(ButtonBar bar,String loginId)
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
	
	public void fillGrid(GridPanel grid,List<SmUser> users,String depId)
	{
		grid.setCls("grid_panel");
		List<Object[]> datas = new ArrayList<Object[]>();
		if(users != null && users.size()>0)
		{
			int index = 1;
			for(SmUser user : users)
			{
				Integer useStatu = user.getUserStatu();
				String status = user.getStatus();
				String showStatus = "0".equals(status) ? "内置":"1".equals(status)?"在岗":"离职";
				if(useStatu == 0)
				{
					datas.add(new Object[]{user.getUserId(),cc(showStatus),cc(user.getLoginName()),cc(user.getEmpName()),cc(user.getSex()),cc(user.getJobTitle()),cc(user.getRoleNames()),cc(user.getTel()),cc(user.getUserStatu()=1?"启用":"禁用"),user.getDepId(),cc("<b>"+index+"</b>")});
				}else{
					datas.add(new Object[]{user.getUserId(),showStatus,user.getLoginName(),user.getEmpName(),user.getSex(),user.getJobTitle(),user.getRoleNames(),user.getTel(),user.getUserStatu()==1?"启用":"禁用",user.getDepId(),"<b>"+index+"</b>"});
				}
				index++;
			}
		}
		
		grid.setScroll(true);
		grid.setEscape(false);
		grid.setScrollClass(Scrollable.SCROLL_AUTO);
		grid.setFocusable(true);
		grid.setNobr(true);
		grid.setResizable(true);
		grid.setFace("line");
		grid.setGridData(datas);
		grid.addColumn(GridColumn.hidden(0, "userId"));
		grid.addColumn(new GridColumn(11,"index","序号","40"));
		grid.addColumn(new GridColumn(1,"status","状态","60"));
		grid.addColumn(new GridColumn(2,"loginName","账号","100"));
		grid.addColumn(new GridColumn(3,"empName","姓名","100"));
		grid.addColumn(new GridColumn(4,"sex","性别","60"));
		grid.addColumn(new GridColumn(5,"depart","所属部门","160"));
		grid.addColumn(new GridColumn(6,"jobTitle","职务","150"));
		grid.addColumn(new GridColumn(7,"roleName","角色","*"));
		grid.addColumn(new GridColumn(8,"tel","电话","110"));
		grid.addColumn(new GridColumn(9,"useStatu","启用/禁用","100"));
		grid.addColumn(GridColumn.hidden(10, "depId"));
		
		grid.setPub(new Tr().setOn(GridPanel.EVENT_DBLCLICK,"VM(this).cmd('showUser',$userId)"));
		grid.getPrototype().getThead().setCls("grid_panel_head");
	}
	
	public String cc(String v)
	{
		if(v == null || "".equals(v))
		{
			return "";
		}
		return "<font style='color:lightgray;'>"+v+"</font>";
	}
	
	public void buildDeptTree(TreePanel tree,SmDepartment rootDep)
	{
		tree.setStyle("margin:6px;border:1px solid #CCC;").setScroll(true).setHmin(14).setWmin(14);
		if(rootDep != null)
		{
			Leaf root = new Leaf(rootDep.getDepId()+"",rootDep.getDepName());
			root.setOpen(true);
			root.setSrc("userManager/treeOpen?parentId="+rootDep.getDepId());
			root.setOn(Leaf.EVENT_CLICK, "VM(this).cmd('showUsers','"+rootDep.getDepId()+"')");
		}
	}
}
