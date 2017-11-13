package com.rongji.df.web.view;

import org.springframework.stereotype.Service;

import com.rongji.dfish.ui.command.SubmitCommand;
import com.rongji.dfish.ui.form.Checkbox;
import com.rongji.dfish.ui.form.Password;
import com.rongji.dfish.ui.form.Text;
import com.rongji.dfish.ui.helper.GridLayoutFormPanel;
import com.rongji.dfish.ui.helper.HorizontalGroup;
import com.rongji.dfish.ui.helper.Label;
import com.rongji.dfish.ui.layout.HorizontalLayout;
import com.rongji.dfish.ui.layout.VerticalLayout;
import com.rongji.dfish.ui.layout.View;
import com.rongji.dfish.ui.widget.Button;
import com.rongji.dfish.ui.widget.DialogTemplate;
import com.rongji.dfish.ui.widget.Html;
import com.rongji.dfish.ui.widget.TemplateTitle;
import com.rongji.dfish.ui.widget.TemplateView;

/**
 * 登陆页面
 * @author RJ-006
 *
 */
@Service
public class LoginView {
	
	public Object buildFirstView(String msg)
	{
		View view = new View();
		VerticalLayout root = new VerticalLayout("f_root");
		root.setStyle("background-image:url(img/login2/login_other_bg.png);background-repeat:repate-x;background-size:100% 100%;");
		view.setNode(root);
		
		HorizontalLayout hlCenter = new HorizontalLayout("f_hlCenter");
		root.add(new Html(""),"*");
		root.add(hlCenter,"768");
		root.add(new Html(""),"*");
		
		VerticalLayout vlMain = new VerticalLayout("f_vlMain");
		vlMain.setStyle("");
		hlCenter.add(new Html(""),"*");
		hlCenter.add(vlMain,"1366");
		hlCenter.add(new Html(""),"*");
		
		HorizontalLayout hlMain = new HorizontalLayout("f_hlMain");
		vlMain.add(new Html("<img src='img/login2/login_logo.png'/>").setStyle("padding:40px 0 0 260px;"),"160");
		vlMain.add(hlMain,"400");
		vlMain.add(new Html("<font color='#5da2c2'>推荐浏览器：IE8及以上、FireFox、Chrome、Safari&nbsp;&nbsp;&nbsp;&nbsp;技术支持：1234567890</font>").setStyle("padding:20px 0 0 380px;"),"*");
		VerticalLayout vlLoginForm = new VerticalLayout("f_vlLoginForm");
		hlMain.add(new Html("<img src='img/login2/login_main_21.png'/>").setStyle("padding:0 0 0 140px;"),"55%");
		hlMain.add(vlLoginForm,"25%");
		hlMain.add(new Html(""),"*");
		vlLoginForm.add(new Html("<img src='img/login2/ynbiq2017.png'/>").setStyle("padding:30px 0 0 85px;"),"120");
		GridLayoutFormPanel gridLayout = new GridLayoutFormPanel("login_form");
		vlLoginForm.add(gridLayout);
		
		HorizontalGroup hgLoginName = new HorizontalGroup("hg_login_name");
		hgLoginName.setLabel("").setHideLabel(true);
		Label loginNameLabel = new Label("","<font color='#FFFFFF'>用户名:</font>");
		loginNameLabel.setWidth(80).setStyle("padding:8px 0 0 16px;").setEscape(false);
		Text loginName = new Text("loginName","","");
		loginName.setId("loginName").setHeight(30).setRequired(true).setWidth(215);
		loginName.setLabel("用户名");
		hgLoginName.add(loginNameLabel).add(loginName);
		gridLayout.add(0, 0, hgLoginName);
		
		HorizontalGroup hgPwd = new HorizontalGroup("hg_pwd");
		hgPwd.setLabel("").setHideLabel(true);
		Label pwdLabel = new Label("","<font color='#FFFFFF'>密&nbsp;&nbsp;&nbsp;&nbsp;码:</font>");
		pwdLabel.setWidth(80).setStyle("padding:8px 0 0 16px;").setEscape(false);
		Password password = new Password("password","密码","");
		password.setId("password").setHeight(30).setRequired(true).setWidth(215);
		hgPwd.add(pwdLabel).add(password);
		gridLayout.add(1, 0, hgPwd);
		
		HorizontalGroup hg = new HorizontalGroup("hg_login");
		hg.setLabel("");
		Checkbox remindUName = new Checkbox("remindUName","",false,"1","<font color='#FFFFFF'>记住用户名</font>").setEscape(false).setTip(false);
		remindUName.setTarget("remindPwd");
		Checkbox remindPwd = new Checkbox("remindPwd","",false,"1","<font color='#FFFFFF'>记住密码</font>").setId("remindPwd").setEscape(false).setTip(false);
		hg.add(remindUName).add(remindPwd);
		gridLayout.add(2, 0, hg);
		
		Button loginBtn = new Button("","");
		loginBtn.setId("loginBtn").setIcon(".login-btn-icon").setStyle("padding-left:70px;");
		loginBtn.setOn(Button.EVENT_CLICK, "VM(this).cmd('commit');");
		gridLayout.add(3, 0, loginBtn);
		
		Label tip = new Label("","");
		tip.setId("tip").setText(msg).setStyle("color:red;padding-top:10px;");
		gridLayout.add(4, 0, tip);		
		
		gridLayout.getPrototype().getColumns().get(0).setWidth("80");
		SubmitCommand commit = new SubmitCommand("first/toIndex");
		view.addCommand("commit", commit);
		
		view.setOn(View.EVENT_LOAD, "VM(this).f('loginName').focus();");
		view.addTemplate("std", getStdTemplate());
		view.addTemplate("prong", getProngTemplate());
		view.addTemplate("alert", getAlertTemplate());
		return view;
	}
	
	private static DialogTemplate getStdTemplate()
	{
		DialogTemplate std = new DialogTemplate().setCls("dlg-std");
		VerticalLayout vp = new VerticalLayout(null);
		std.setNode(vp);
		HorizontalLayout head = new HorizontalLayout(null).setCls("dlg-std-head");
		vp.add(head,"40");
		head.add(new TemplateTitle(null).setCls("dlg-std-title").setWmin(10),"*");
		head.add(new Html(null,"<i class=ico-dlg-max></i>").setCls("dlg-max").setAlign("center").setValign("middle").setOn(Html.EVENT_CLICK, "$.dialog(this).max(this)"),"40");
		head.add(new Html(null,"<i class=ico-dlg-close></i>").setCls("dlg-close").setAlign("center").setValign("middle").setOn(Html.EVENT_CLICK, "$.dialog(this).close()"),"40");
		TemplateView cont = new TemplateView(null);
		vp.add(cont,"*");
		return std;
	}
	
	private static DialogTemplate getProngTemplate()
	{
		DialogTemplate std = new DialogTemplate().setCls("dlg-prong").setIndent(-10);
		VerticalLayout vp = new VerticalLayout(null);
		std.setNode(vp);
		vp.setAftercontent("<div class=dlg-prong-arrow-out></div><div class=dlg-prong-arrow-in></div>");
		
		HorizontalLayout head = new HorizontalLayout(null).setCls("dlg-prong-head");
		vp.add(head,"36");
		head.add(new TemplateTitle(null).setCls("dlg-prong-title"),"*");
		head.add(new Html(null,"<i onclick=$.close(this) class='dlg-close'>&times;</i><i class=f-vi>").setAlign(Html.ALIGN_CENTER).setValign(Html.VALIGN_MIDDLE),"40");
		TemplateView cont = new TemplateView(null);
		vp.add(cont,"*");
		return std;
	}
	
	private static DialogTemplate getAlertTemplate()
	{
		DialogTemplate std = new DialogTemplate().setCls("dlg-std");
		
		VerticalLayout vp = new VerticalLayout(null);
		std.setNode(vp);
		HorizontalLayout head = new HorizontalLayout(null).setCls("dlg-std-head");
		vp.add(head,"40");
		head.add(new TemplateTitle("弹出窗口信息").setCls("dlg-std-title").setWmin(10),"*");
		head.add(new Html(null,"<i class=ico-dlg-close></i>").setCls("dlg-close").setAlign("center").setValign("middle").setOn(Html.EVENT_CLICK, "$.dialog(this).close()"),"40");
		TemplateView cont = new TemplateView(null);
		vp.add(cont,"*");
		return std;
	}
	
}
