package com.rongji.df.web.controller;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.rongji.df.web.view.LoginLogView;
import com.rongji.dfish.framework.controller.BaseController;

/**
 * 登录日志控制
 * @author RJ-006
 *
 */
@Controller
@RequestMapping("/loginLogMgt")
public class LoginLogController extends BaseController {

		@Resource
		private LoginLogView loginLogView;
		
		@RequestMapping("/index")
		@ResponseBody
		public Object index(HttpServletRequest request)
		{
			return loginLogView.buildIndex();
		}
}
