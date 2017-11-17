package com.rongji.df.web.controller;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.rongji.df.web.view.NoteMessage;
import com.rongji.dfish.base.Page;
import com.rongji.dfish.base.Utils;
import com.rongji.dfish.framework.FrameworkHelper;
import com.rongji.dfish.framework.controller.BaseController;

/**
 * 通知公告
 * @author RJ-006
 *
 */
@Controller
@RequestMapping("/notemessage")
public class NoteMessageController extends BaseController {
		@Resource
		private NoteMessage view;
		
		@RequestMapping(value = "/welcome")
		@ResponseBody
		public Object welcome(HttpServletRequest request) throws Exception
		{
			return view.buildWelcomeView();
		}
		
		@RequestMapping("/buildIndex")
		@ResponseBody
		public Object buildIndex(HttpServletRequest request)
		{
			String loginId = FrameworkHelper.getLoginUser(request);
//			String deptName = (String)CacheDataService
			request.getSession().removeAttribute("searchParameter");
			String flag = Utils.getParameter(request, "flag");
			request.getSession().setAttribute("notice_info_flag", flag);
			Page page = FrameworkHelper.createPersonalPage(loginId, null);
			
			return view.buildView(page,flag);
		}
}
