package com.rongji.df.web.controller;

import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.rongji.df.web.view.LoginView;
import com.rongji.df.entity.SmMenu;
import com.rongji.df.entity.SmUser;
import com.rongji.df.util.Md5Util;
import com.rongji.df.web.service.MenuService;
import com.rongji.df.web.service.UserManagerService;
import com.rongji.df.web.view.IndexView;
import com.rongji.dfish.framework.FrameworkHelper;
import com.rongji.dfish.framework.controller.BaseController;
import com.rongji.dfish.ui.command.CommandGroup;
import com.rongji.dfish.ui.command.DialogCommand;
import com.rongji.dfish.ui.command.JSCommand;
import com.rongji.dfish.ui.command.ReplaceCommand;
import com.rongji.dfish.ui.helper.Label;
import com.rongji.dfish.ui.widget.Html;

@Controller
@RequestMapping("/first")
public class LoginController extends BaseController{

	@Resource
	private UserManagerService userManagerService;
	
	@Resource
	private MenuService menuService;
	
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
		
		SmUser user = userManagerService.getUserByLoginName(loginName);
		String epwd = Md5Util.getMD5ofStr(password);
		
		if(user == null)
		{
			ReplaceCommand rc = new ReplaceCommand();
			Label tip = new Label("","");
			tip.setId("tip").setText("用户名或密码错误").setStyle("color:red;");
			rc.setNode(tip);
			return rc;
		}else if(!user.getPassword().equals(epwd))
		{
			ReplaceCommand rc = new ReplaceCommand();
			Label tip = new Label("","");
			tip.setId("tip").setText("用户名或密码错误").setStyle("color:red;");
			rc.setNode(tip);
			return rc;
		}
		if(0 == user.getUserStatu() || user.getUserStatu() == 0)
		{
			ReplaceCommand rc = new ReplaceCommand();
			Label tip = new Label("","");
			tip.setId("tip").setText("该账号已被禁用").setStyle("color:red;");
			rc.setNode(tip);
			return rc;
		}
		CommandGroup cg = new CommandGroup();
		request.getSession().setAttribute(FrameworkHelper.LOGIN_USER_KEY, user.getUserId()+"");
		JSCommand redirect = new JSCommand("window.location.replace(\"./index.jsp\")");
		cg.add(redirect);
		return cg;
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
		String loginUser = (String)request.getSession().getAttribute(FrameworkHelper.LOGIN_USER_KEY);
		SmUser user = userManagerService.getUserById(Integer.parseInt(loginUser));
		List<SmMenu> menus = menuService.getRootMenus(loginUser);
		return indexView.buildIndexView(user,menus);
	}
	
	
}
