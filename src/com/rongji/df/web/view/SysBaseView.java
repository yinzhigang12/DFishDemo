package com.rongji.df.web.view;

import java.util.List;

import com.rongji.dfish.ui.command.JSCommand;
import com.rongji.dfish.ui.command.SubmitCommand;
import com.rongji.dfish.ui.form.Hidden;
import com.rongji.dfish.ui.form.Text;
import com.rongji.dfish.ui.helper.GridLayoutFormPanel;
import com.rongji.dfish.ui.layout.ButtonBar;
import com.rongji.dfish.ui.layout.HorizontalLayout;
import com.rongji.dfish.ui.layout.VerticalLayout;
import com.rongji.dfish.ui.layout.View;
import com.rongji.dfish.ui.widget.Button;
import com.rongji.dfish.ui.widget.Html;
import com.rongji.dfish.ui.widget.Leaf;
import com.rongji.dfish.ui.widget.SubmitButton;
import com.rongji.dfish.ui.widget.TreePanel;

/**
 * 系统管理公共界面视图类
 * @author RJ-006
 *
 */
public class SysBaseView {
	public void fillTreeBoxView(View view,boolean hasSearch,String searchSrc,VerticalLayout root,boolean isDep,List<Object[]> allData,List<Object[]> ownData,String hiddenValue,String cp)
	{
		HorizontalLayout con = new HorizontalLayout("tx_content");
		root.add(con,"*");
		VerticalLayout left = new VerticalLayout("tx_left");
		Html leftTitle = new Html("left_title","<b>可选项</b>").setStyle("padding-top:5px;padding-left:5px;");
		left.add(leftTitle,"30");
		TreePanel tree = new TreePanel("tx_tree");
		left.add(tree,"*");
		loadTreeBoxPanel(tree,isDep,allData);
		con.add(left,"*");
		VerticalLayout middle = new VerticalLayout("middle");
		ButtonBar mbar = new ButtonBar("m_bar");
		mbar.setDir(ButtonBar.DIR_VERTICAL).setSpace(10).setAlign("center");
		SubmitButton rBtn = new SubmitButton("img/b/left.png","").setOn(Button.EVENT_CLICK, "VM(this).cmd('rBtn')").setCls("f-button");
		SubmitButton lBtn = new SubmitButton("img/b/right.png","").setOn(Button.EVENT_CLICK, "VM(this).cmd('lBtn')").setCls("f-button");
		mbar.add(rBtn).add(lBtn);
		middle.add(mbar);
		con.add(middle,"60");
		VerticalLayout right = new VerticalLayout("tx_right");
		Html rTitle = new Html("right_title","<b>已选项</b>").setStyle("padding-top:5px;padding-left:5px;");
		right.add(rTitle,"30");
		Html form = new Html("");
		StringBuilder sb =  new StringBuilder("<div style=\"overflow-y:auto;height:99%;\">"
				+ "<form id='tx_f_form'><input type='hidden' name='tx_id' value='"+hiddenValue+"'/>"
				+ "<input type='hidden' name='cp' value='"+cp+"'/>");
		if(ownData != null && ownData.size()>0){
			StringBuilder oldIdStr = new StringBuilder("");
			for(Object[] ob : ownData){
				String id = ob[0].toString();
				oldIdStr.append(id+",");
				String name = ob[1].toString();
				sb.append("<label name='ttxName' style='padding:4px 10px;display:block;' id='ttx"+id+"' "
				+ "onclick=\"VM(this).cmd('choiceLabel','ttx"+id+"')\""
				+ "ondblclick=\"VM(this).cmd('removeL','ttx"+id+"')\" >"
				+ "<input type='text' style='display:none;'  name='treeBox' value='"+id+"'/>"+name+"</label>");
			}
			String oldIds = oldIdStr.substring(0, oldIdStr.lastIndexOf(","));
			sb.append("<input type='hidden' name='oldIds' value='"+oldIds+"' />");
		}
		sb.append("</form></div>");
		form.setText(sb.toString()).setStyle("padding-top:10px;padding-left:10px;background:#ffffff;");
		right.add(form, "*");
		con.add(right, "*");
		fillTreeBoxCommand(view);
		if(hasSearch){
			HorizontalLayout sf = new HorizontalLayout("tx_search");
			GridLayoutFormPanel searchForm = new GridLayoutFormPanel("search_form");
			Text search = new Text("search", "", "", 32).setHideLabel(true);
			search.setPlaceholder("请输入查询条件");
			SubmitButton sbtn = new SubmitButton("", "查询").setOn(Button.EVENT_CLICK, "VM(this).cmd('search')").setCls("normal_button");
			HorizontalLayout hor = new HorizontalLayout("search_hor");
			hor.add(search, "*").add(new Hidden("search_id", hiddenValue), "10");
			searchForm.add(0, 0, hor).add(0, 1, sbtn);
			sf.add(searchForm, "*");
			root.add(sf, "40");
			//条件查询
			SubmitCommand searchCmd = new SubmitCommand(searchSrc);
			searchCmd.setRange("search_form");
			view.addCommand("search", searchCmd);
		}
	}
	
	public void loadTreeBoxPanel(TreePanel tree,boolean isDep,List<Object[]> allData)
	{
		tree.setScroll(true).setStyle("background:#ffffff");
		if(allData != null && allData.size()>0){
			for(Object[] ob : allData){
				String id = ob[0].toString();
				String text = ob[1].toString();
				Leaf root = null;
				if(isDep){//用部门树结构展开
					root = new Leaf("d"+id, text);
					root.setIcon("img/b/dept.png");
					root.setOpen(true);
					root.setSrc("roleManager/treeOpen?parentId="+id);
				}else{//直接展开数据
					root =  new Leaf(id, text);
					root.setOn(Leaf.EVENT_DBLCLICK, "VM(this).cmd('addR','"+id+"', '"+text+"')");
				}
				tree.add(root);
			}
		}
	}
	
	public void fillTreeBoxCommand(View view)
	{
		JSCommand choiceLabel = new JSCommand("var ln = $0; var labels=document.getElementsByTagName('label');"
				+ "for(var i=0;i<labels.length;i++){"
				+ "if(labels[i].id==ln){"
				+ "labels[i].style.backgroundColor='#BCE0FF';"
				+ "}else{labels[i].style.backgroundColor='';}"
				+ "}");
		view.addCommand("choiceLabel", choiceLabel);
		//按钮添加用户
		JSCommand rBtn = new JSCommand("var focus =VM(this).find('tx_tree').getFocus();"
				+ "if(focus==undefined || focus.x.id == 'r'){return;}"
				+ "var id=focus.x.id; var uname = focus.x.text;VM(this).cmd('addR', id, uname)"
				+ "");
		view.addCommand("rBtn", rBtn);
		//按钮清除用户
		JSCommand lBtn = new JSCommand("var labels=document.getElementsByTagName('label');"
				+ "for(var i=0;i<labels.length;i++){"
				+ "var cv=labels[i].style.backgroundColor;"
				+ "if(cv!=''){"
				+ "var uid = labels[i].id;VM(this).cmd('removeL', uid);"
				+ "}"
				+ "}"
				+ "");
		view.addCommand("lBtn", lBtn);
		//清除已选用户
		JSCommand removeL = new JSCommand("var uid=$0; var label = document.getElementById(uid);"
				+ "var form = document.getElementById('tx_f_form');"
				+ "if(form){form.removeChild(label);};");
		view.addCommand("removeL", removeL);
		//添加已选用户
		JSCommand addR = new JSCommand("var uid= $0;if(uid.substring(0,1)=='d'){return;}; var uname=$1; var form = document.getElementById('tx_f_form');"
				+ "if(document.getElementById('ttx'+uid)){return;}var label = document.createElement('label');"
				+ "form.appendChild(label);"
				+ "label.setAttribute('id','ttx'+uid);label.setAttribute('name', 'ttxName');"
    			+ "label.setAttribute('style','padding:4px 10px;display:block;');"
    			+ "label.setAttribute('ondblclick',\"VM(this).cmd('removeL', 'ttx\"+uid+\"')\");"
    			+ "label.setAttribute('onclick',\"VM(this).cmd('choiceLabel', 'ttx\"+uid+\"')\");"
    			+ "label.appendChild(document.createTextNode(uname));"
    			+ "var hi = document.createElement('input');label.appendChild(hi);"
    			+ "hi.setAttribute('style','display:none;');"
    			+ "hi.setAttribute('name', 'treeBox');"
    			+ "hi.setAttribute('value', uid);");
		view.addCommand("addR", addR);
	}
}
