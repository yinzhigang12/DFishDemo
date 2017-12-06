package com.rongji.df.web.controller;

import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.rongji.df.entity.SmMenu;
import com.rongji.df.entity.SmUser;
import com.rongji.df.web.service.MenuService;
import com.rongji.df.web.service.UserManagerService;
import com.rongji.df.web.view.IndexView;
import com.rongji.dfish.base.Page;
import com.rongji.dfish.base.Utils;
import com.rongji.dfish.framework.FrameworkHelper;
import com.rongji.dfish.framework.controller.BaseController;
import com.rongji.dfish.ui.command.AlertCommand;
import com.rongji.dfish.ui.command.CommandGroup;
import com.rongji.dfish.ui.command.DialogCommand;
import com.rongji.dfish.ui.command.ReplaceCommand;
import com.rongji.dfish.ui.helper.JSCmdLib;
import com.rongji.dfish.ui.layout.AlbumLayout;
import com.rongji.dfish.ui.layout.View;
import com.rongji.dfish.ui.widget.Html;
import com.rongji.dfish.ui.widget.Img;

@Controller
@RequestMapping("/index")
public class IndexController extends BaseController {

	@Resource
	private UserManagerService userService;
	
	@Resource
	private MenuService menuService;
	
	@Resource
	private IndexView view;
	
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
		SmUser user = userService.getUserById(Integer.parseInt(loginUser));
		List<SmMenu> menus = menuService.getRootMenus(loginUser);
		return view.buildIndexView(user,menus);
	}
	/**
	 * 加载菜单按钮
	 * @param request
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/appJump")
	@ResponseBody
	public Object appJump(HttpServletRequest request) throws Exception
	{
		String loginUser = (String) request.getSession().getAttribute(FrameworkHelper.LOGIN_USER_KEY);
		String type = request.getParameter("type");
		String menuCode = request.getParameter("menuCode");
		
		CommandGroup cg = new CommandGroup();
		ReplaceCommand rc = new ReplaceCommand();
		cg.add(rc);
		View mainView = new View("main").setStyle("margin:0px 10px 10px 10px;");
		
		ReplaceCommand rc2 = new ReplaceCommand();
		switch(type)
		{
			case "1"://后台管理
				AlbumLayout menuBar = new AlbumLayout("f_menu").setCls("w-album-ynbiq");
				menuBar.setHoverable(true);
				menuBar.setFocusable(true);
				menuBar.add(new Img("img/menu/sysmgt/back.png").setOn(Img.EVENT_CLICK,"this.cmd({type:'ajax',src:'index/appJump?type=0'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/sysmgt/s_sys_mgt.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=101'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/sysmgt/s_sys_log.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=102'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/sysmgt/s_online_mgt.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=103'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/sysmgt/s_bill_mgt.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=104'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/sysmgt/s_task_mgt.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=105'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/sysmgt/s_sys_cfg.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=106'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/sysmgt/s_data_syn.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=107'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/sysmgt/s_com_link.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=108'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/sysmgt/sys_enterprise_filing.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=109'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/sysmgt/sys_person_filing.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=110'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/sysmgt/s_switch_cfg.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=111'});").setHeight(60).setWidth(60));
				
				rc.setNode(menuBar);
				mainView.setSrc("backmanagement/welcome");
				break;
			case "2"://收费开票
				mainView.setSrc("chargemakeinvoice/welcome");
				break;
			case "3"://口岸卫检
				menuBar = new AlbumLayout("f_menu").setCls("w-album-ynbiq");
				menuBar.setHoverable(true);
				menuBar.setFocusable(true);
				menuBar.add(new Img("img/menu/sysmgt/back.png").setOn(Img.EVENT_CLICK,"this.cmd({type:'ajax',src:'index/appJump?type=0'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/h/imp_channel.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=301'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/h/exp_channel.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=302'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/h/m_reg.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=303'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/h/qrcode_mgt.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=304'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/h/trans_reg.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=305'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/h/nuclear.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=306'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/h/cert_print.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=307'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/h/q_stat.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=308'});").setHeight(60).setWidth(60));
				
				
				rc.setNode(menuBar);
				mainView.setSrc("portrelatived/welcome");
				break;
			case "4"://跨境电商
				mainView.setSrc("crossbroder/welcome");
				break;
			case "5"://备案监管
				mainView.setSrc("regulation/welcome");
				break;
			case "6"://车辆检疫
				menuBar = new AlbumLayout("f_menu").setCls("w-album-ynbiq");
				menuBar.setHoverable(true);
				menuBar.setFocusable(true);
				menuBar.add(new Img("img/menu/sysmgt/back.png").setOn(Img.EVENT_CLICK,"this.cmd({type:'ajax',src:'index/appJump?type=0'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/v/vehicle.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=601'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/v/i_channel.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=602'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/v/m_reg.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=603'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/v/iq_mgt.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=604'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/v/m_fee.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=605'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/v/fee_mgt.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=606'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/v/q_stat.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/sysJump?type=607'});").setHeight(60).setWidth(60));
				
				rc.setNode(menuBar);
				mainView.setSrc("cardquarantine/welcome");
				break;
			case "7"://通知通告
				mainView.setSrc("notemessage/buildIndex?flag=0");
				break;
			default://返回首页
				menuBar = new AlbumLayout("f_menu").setCls("w-album-ynbiq");
				menuBar.setHoverable(true);
				menuBar.setFocusable(true);
				menuBar.add(new Img("img/menu/sys_mgt.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/appJump?type=1'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/billing.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/appJump?type=2'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/h_iq.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/appJump?type=3'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/kjds.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/appJump?type=4'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/s_record_sup.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/appJump?type=5'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/v_iq.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/appJump?type=6'});").setHeight(60).setWidth(60));
				menuBar.add(new Img("img/menu/s_notice.png").setOn(Img.EVENT_CLICK, "this.cmd({type:'ajax',src:'index/appJump?type=7'});").setHeight(60).setWidth(60));
				rc.setNode(menuBar);
				
				mainView.setSrc("index/penddingwelcome");
				
				break;
		}
		rc2.setNode(mainView);
		cg.add(rc).add(rc2);
		
		return cg;
	}
	
	@RequestMapping(value = "/sysJump")
	@ResponseBody
	public Object showSysMenu(HttpServletRequest request) throws Exception
	{
		String type = request.getParameter("type");
		CommandGroup cg = new CommandGroup();
		ReplaceCommand rc = new ReplaceCommand();
		
		View mainView = new View("main").setStyle("margin:50px 10px 10px 10px;");
		ReplaceCommand rc2 = new ReplaceCommand();
		Html three = new Html("three_menu","").setStyle("margin-left:5px;margin-right:0px;");
		switch(type)
		{
			case "101"://用户管理
				String[] children = {"用户管理","角色管理","角色组管理"};
				String text = createThreeMenu(children);
				three.setText(text);
				three.setHeight("31");
				rc.setNode(three);
				cg.add(rc);
//				mainView.add(new Html(text).setStyle("margin-left:5px;margin-right:0px;"));
				mainView.setSrc("userManager/index");
				rc2.setNode(mainView);
				cg.add(rc2);
				break;
			case "102"://系统日志
				String[] children2 = {"登陆日志","操作日志"};
				String text2 = createThreeMenu(children2);
				three.setText(text2);
				three.setHeight("31");
				rc.setNode(three);
//				mainView.setSrc("loginLogMgt/index");
//				rc2.setNode(mainView);
				cg.add(rc2);
				break;
			case "103"://在线管理
				
				break;
			case "104"://开票管理
				
				break;
			case "105"://任务管理
				
				break;
			case "106"://系统配置
				
				break;
			case "107"://数据同步
				
				break;
			case "108"://常用链接
				
				break;
			case "109"://企业备案
				
				break;
			case "110"://人员备案
				
				break;
			case "111"://开关项
				
				break;
		}
		
		return cg;
	}
	
	@RequestMapping(value="/penddingwelcome")
	@ResponseBody
	public Object penddingwelcome(HttpServletRequest request) throws Exception
	{
		return view.buildPenddingWelcomeView();
	}
	
	@RequestMapping(value = "/welcome")
	@ResponseBody
	public Object welcome(HttpServletRequest request) throws Exception
	{
		return view.buildWelcomeView();
	}
	
	@RequestMapping(value="/changePage")
	@ResponseBody
	public Object changePage(HttpServletRequest request)
	{
		String loginId = FrameworkHelper.getLoginUser(request);
		String cp = Utils.getParameter(request, "cp");
		String currentPage = Utils.isEmpty(cp)? "1":cp;
		Page page = FrameworkHelper.createPersonalPage(loginId, currentPage);
//		List<Object[]> notices = noticeInfoService.getR
		return view.updateNoticeGridAfterPage(page,null);
	}
	
	@RequestMapping(value="/savePwd")
	@ResponseBody
	public Object savePwd(HttpServletRequest request)
	{
		String loginId = FrameworkHelper.getLoginUser(request);

		String old = Utils.getParameter(request,"oldPwd");
		String newPwd = Utils.getParameter(request, "newPwd");
		String surePwd = Utils.getParameter(request, "surePwd");
		
		CommandGroup cg = new CommandGroup();
		cg.setPath("/index/main");
		CommandGroup cg1 = new CommandGroup();
		cg1.setPath("/index/editPwd");
		cg1.add(JSCmdLib.dialogClose());
		cg.add(cg1);
		cg.add(new AlertCommand("密码修改成功！").setIcon("img/b/alert-info.gif").setTimeout(1));
		return cg;
	}
	
	/**
	 * 查看个人信息
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/personInfo")
	@ResponseBody
	public Object personInfoView(HttpServletRequest request) throws Exception
	{
		String loginId = FrameworkHelper.getLoginUser(request);
		
		DialogCommand dialog = new DialogCommand("showPersonInfo","std","个人信息","800","600",0,null);
		dialog.setCover(true);
		dialog.setPophide(true);
		dialog.setNode(view.showPersonInfo());
		return dialog;
	}
	
	/**
	 * 修改密码
	 * @param request
	 * @param resopnse
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/editPwd")
	@ResponseBody
	public Object editPwdView(HttpServletRequest request) throws Exception
	{
		DialogCommand dialog = new DialogCommand("editPwd","std","修改密码","400","200",0,null);
		dialog.setCover(true);
		dialog.setMaxheight(200);
		dialog.setMaxwidth(400);
		dialog.setNode(view.editPwdView());
		return dialog;
	}
	
	/**
	 * 登出
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/logout")
	@ResponseBody
	public Object logout(HttpServletRequest request,HttpServletResponse response) throws Exception
	{
		return null;
	}
	
	public String createThreeMenu(String[] menus)
	{
		StringBuilder sb = new StringBuilder();
		sb.append("<div id='three_menu_div' class='three_menu_bar_class'>");
		int index = 1;
		for(String m:menus)
		{
			sb.append("<div name='index_threeMenu' class='"+(index==1?"three_menu_check":"three_menu_class")+"' >");
			sb.append("<span class='three_menu_name'>"+m+"</span>");
			sb.append("</div>");
			index++;
		}
		sb.append("</div>");
		return sb.toString();
	}
}
