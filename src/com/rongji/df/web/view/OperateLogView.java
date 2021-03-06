package com.rongji.df.web.view;

import java.text.SimpleDateFormat;

import org.springframework.stereotype.Component;

import com.rongji.dfish.ui.command.AjaxCommand;
import com.rongji.dfish.ui.command.ConfirmCommand;
import com.rongji.dfish.ui.command.JSCommand;
import com.rongji.dfish.ui.command.SubmitCommand;
import com.rongji.dfish.ui.form.DatePicker;
import com.rongji.dfish.ui.form.Period;
import com.rongji.dfish.ui.form.Text;
import com.rongji.dfish.ui.helper.GridLayoutFormPanel;
import com.rongji.dfish.ui.helper.GridPanel;
import com.rongji.dfish.ui.layout.ButtonBar;
import com.rongji.dfish.ui.layout.HorizontalLayout;
import com.rongji.dfish.ui.layout.VerticalLayout;
import com.rongji.dfish.ui.layout.View;
import com.rongji.dfish.ui.widget.Button;
import com.rongji.dfish.ui.widget.SubmitButton;

/**
 * 操作日志
 * @author RJ-006
 *
 */
@Component
public class OperateLogView {
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
			hp.add(searchForm,"900");
			ButtonBar searchBar = new ButtonBar("searchBar").setStyle("margin-left:10px;");
			searchBar.add(new SubmitButton("","查询").setOn(SubmitButton.EVENT_CLICK, "VM(this).cmd('search')").setCls("normal_button"));
			searchBar.add(new Button("","重置").setOn(Button.EVENT_CLICK,"VM(this).cmd('reset')").setCls("cancle_button"));
			hp.add(searchBar,"*");
			ButtonBar buttonBar = new ButtonBar("buttonBar").setCls("t_bar");
			fillButtons(buttonBar);
			root.add(buttonBar,"30");
			fillCommands(view);
			GridPanel grid = new GridPanel("operate_log_grid");
			
			return view;
		}
		
		public void buildSearchForm(GridLayoutFormPanel form)
		{
			form.setHeight(40);
			Text userName = new Text("userName","操作人",null,30);
			form.add(0, 0, userName);
			DatePicker start = new DatePicker("start","",null,DatePicker.DATE_TIME_FULL);
			DatePicker end = new DatePicker("end","",null,DatePicker.DATE_TIME_FULL);
			Period operateDate = new Period("操作时间",start,end);
			operateDate.setWidth("100%");
			form.add(0, 1, 0,2,operateDate);
			form.getPrototype().getColumns().get(0).setWidth("60");
		}
		
		public void fillButtons(ButtonBar bar)
		{
			SubmitButton deleteUser = new SubmitButton("","删除").setOn(SubmitButton.EVENT_CLICK, "VM(this).cmd('beforeDel')").setCls("normal_button");
			bar.add(deleteUser);
		}
		
		public void fillCommands(View view)
		{
			AjaxCommand delete = new AjaxCommand("operateLogMgt/deleteLog?cp=$0&logId=$1");
			view.addCommand("deleteLog", delete);
			ConfirmCommand deleteCfm = new ConfirmCommand("确定要删除选中的行？");
			deleteCfm.setYes(delete);
			view.addCommand("deleteCfm", deleteCfm);
			JSCommand beforeDel = new JSCommand("var sel=VM(this).f('selected').val();var cp=VM(this).f('cp').val();"
					+" if(sel&&sel.split(',').length>=1){ VM(this).cmd('deleteCfm',cp,sel);} else { $.alert('请至少选择一条记录进行删除！');");
			view.addCommand("beforeDel", beforeDel);
			SubmitCommand search = new SubmitCommand("operateLogMgt/search");
			search.setRange("searchForm");
			view.addCommand("search", search);
			JSCommand reset = new JSCommand("VM(this).f('userName').val('');VM(this).f('type').val('');"
					+"VM(this).f('start').val('');VM(this).f('end').val('');VM(this).f('content').val('');");
			view.addCommand("reset", reset);
		}
}
