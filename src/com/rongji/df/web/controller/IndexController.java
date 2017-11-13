package com.rongji.df.web.controller;

import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

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
	private IndexView view;
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
		String type = request.getParameter("type");
		
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
				mainView.setSrc("portrelatived/welcome");
				break;
			case "4"://跨境电商
				mainView.setSrc("crossbroder/welcome");
				break;
			case "5"://备案监管
				mainView.setSrc("regulation/welcome");
				break;
			case "6"://车辆检疫
				mainView.setSrc("cardquarantine/welcome");
				break;
			case "7"://通知通告
				mainView.setSrc("notemessage/welcome");
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
		cg.add(rc);
		
		View mainView = new View("main").setStyle("margin:0px 10px 10px 10px;");
		ReplaceCommand rc2 = new ReplaceCommand();
		switch(type)
		{
			case "101"://用户管理
				mainView.setSrc("userManager/index");
				rc2.setNode(mainView);
				cg.add(rc2);
				break;
			case "102"://系统日志
				
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
}