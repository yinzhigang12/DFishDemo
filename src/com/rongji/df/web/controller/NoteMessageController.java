package com.rongji.df.web.controller;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.rongji.df.web.view.NoteMessage;
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
}
