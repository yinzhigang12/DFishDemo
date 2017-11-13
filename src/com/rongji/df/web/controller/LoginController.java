package com.rongji.df.web.controller;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.rongji.df.web.view.LoginView;
import com.rongji.df.web.view.IndexView;
import com.rongji.dfish.framework.controller.BaseController;
import com.rongji.dfish.ui.command.DialogCommand;
import com.rongji.dfish.ui.command.JSCommand;
import com.rongji.dfish.ui.command.ReplaceCommand;
import com.rongji.dfish.ui.helper.Label;
import com.rongji.dfish.ui.widget.Html;

@Controller
@RequestMapping("/first")
public class LoginController extends BaseController{

	@Resource
	private LoginView loginView;
	
	@Resource
	private IndexView indexView;
	
	/**
	 * 加载登陆页
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/login")
	@ResponseBody
	public Object firstview(HttpServletRequest request,HttpServletResponse response) throws Exception
	{
		String msg = "";
		
		return loginView.buildFirstView(msg);
	}
	
	/**
	 * 跳转到主页
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/toIndex")
	@ResponseBody
	public Object redirectIndex(HttpServletRequest request,HttpServletResponse response) throws Exception
	{
		String loginName = request.getParameter("loginName");
		String password = request.getParameter("password");
		String remindUName = request.getParameter("remindUName");
		String remindPwd = request.getParameter("remindPwd");
		
		showPreInfo(loginName,password);

		if(loginName.equals("admin")  && password.equals("123456"))
		{
			JSCommand redirect = new JSCommand("window.location.replace(\"./index.jsp\")");
			return redirect;
		}else{
			ReplaceCommand rc = new ReplaceCommand();
			Label tip = new Label("","");
			tip.setId("tip").setText("用户名或密码错误").setStyle("color:red;padding-top:10px;");
			rc.setNode(tip);
			return rc;
		}
	}
	
	private Object showPreInfo(String user,String password)
	{
		DialogCommand dialog = new DialogCommand("showInfo","std","查看登陆信息","400","200",0,null);
		dialog.setCover(true);
		dialog.setMaxheight(200);
		dialog.setMaxwidth(400);
		dialog.setNode(new Html("用户名："+user+",密码："+password));
		return dialog;
	}
	
	/**
	 * 加载主页
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/index")
	@ResponseBody
	public Object indexView(HttpServletRequest request,HttpServletResponse response) throws Exception
	{
		return indexView.buildIndexView();
	}
	
	
}
