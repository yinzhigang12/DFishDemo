package com.rongji.df.web.view;

import java.text.SimpleDateFormat;

import org.springframework.stereotype.Component;

import com.rongji.dfish.ui.command.AjaxCommand;
import com.rongji.dfish.ui.command.ConfirmCommand;
import com.rongji.dfish.ui.command.JSCommand;
import com.rongji.dfish.ui.command.SubmitCommand;
import com.rongji.dfish.ui.form.DatePicker;
import com.rongji.dfish.ui.form.Period;
import com.rongji.dfish.ui.form.Select;
import com.rongji.dfish.ui.form.Text;
import com.rongji.dfish.ui.helper.GridLayoutFormPanel;
import com.rongji.dfish.ui.layout.ButtonBar;
import com.rongji.dfish.ui.layout.HorizontalLayout;
import com.rongji.dfish.ui.layout.VerticalLayout;
import com.rongji.dfish.ui.layout.View;
import com.rongji.dfish.ui.widget.Button;
import com.rongji.dfish.ui.widget.SubmitButton;

import edu.emory.mathcs.backport.java.util.Arrays;
/**
 * 登陆日志
 * @author RJ-006
 *
 */
@Component
public class LoginLogView {
	public SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	public View buildIndex()
	{
		View view = new View().setCls("index_view");
		VerticalLayout root = new VerticalLayout("root");
		view.add(root);
		HorizontalLayout hp = new HorizontalLayout("searchPanel").setValign(HorizontalLayout.VALIGN_MIDDLE);
		root.add(hp,"55");
		GridLayoutFormPanel searchForm = new GridLayoutFormPanel("searchForm");
		buildSearchForm(searchForm);
		hp.add(searchForm,"1150");
		ButtonBar searchBar = new ButtonBar("searchBar").setStyle("margin-left:8px;");
		searchBar.add(new SubmitButton("","查询").setOn(SubmitButton.EVENT_CLICK, "VM(this).cmd('search')").setCls("normal_button"));
		searchBar.add(new Button("","重置").setOn(Button.EVENT_CLICK,"VM(this).cmd('reset')").setCls("cancle_button"));
		hp.add(searchBar,"*");
		ButtonBar buttonBar = new ButtonBar("buttonBar");
		fillButtons(buttonBar);
		root.add(buttonBar,"30");
		fillCommands(view);
		
		return view;
	}
	
	public void buildSearchForm(GridLayoutFormPanel form)
	{
		form.setStyle("padding-top:7px;");
		Text loginName = new Text("loginName","登陆账户",null,30);
		form.add(0, 0, loginName);
		Text ip = new Text("ip","主机IP",null,16);
		form.add(0, 1, ip);
		DatePicker start = new DatePicker("start", "", null, DatePicker.DATE_TIME_FULL);
		DatePicker end = new DatePicker("end","",null,DatePicker.DATE_TIME_FULL);
		Period operateDate = new Period("操作时间",start,end);
		operateDate.setWidth("100%");
		form.add(0, 2, 0,3,operateDate);
		Select status = new Select("status","执行方式",new String[]{"-1"},Arrays.asList(new String[][]{{"-1","不限"},{"1","登录"},{"0","登录失败"},{"2","退出"}}));
		status.setWidth("100%");
		form.add(0, 4, status);
		form.getPrototype().getColumns().get(0).setWidth("65");
	}
	
	public void fillButtons(ButtonBar bar)
	{
		bar.setCls("t_bar");
		SubmitButton deleteUser = new SubmitButton("","删除").setOn(SubmitButton.EVENT_CLICK, "VM(this).cmd('beforeDel')").setCls("normal_button");
		bar.add(deleteUser);
	}
	
	public void fillCommands(View view)
	{
		AjaxCommand delete = new AjaxCommand("loginLogMgt/deleteLog?cp=$0&logId=$1");
		view.addCommand("deleteLog", delete);
		ConfirmCommand deleteCfm = new ConfirmCommand("确定要删除选中的行？");
		deleteCfm.setYes(delete);
		view.addCommand("deleteCfm", deleteCfm);
		JSCommand beforeDel = new JSCommand("var sel=VM(this).f('selected').val();var cp=VM(this).f('cp').val();"
				+" if(sel&&sel.split(',').length>=1){VM(this).cmd('deleteCfm',cp,sel);}else{$.alert('请至少选择一条记录进行删除！');");
		view.addCommand("beforeDel", beforeDel);
		SubmitCommand search = new SubmitCommand("loginLogMgt/search");
		search.setRange("searchForm");
		view.addCommand("search", search);
		JSCommand reset = new JSCommand("VM(this).fv('loginName','');VM(this).fv('ip','');"
				+"VM(this).fv('start','');VM(this).fv('end','');VM(this).fv('status','-1');");
		view.addCommand("reset", reset);
	}
}
