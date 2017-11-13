package com.rongji.df.web.controller;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.rongji.df.web.view.BackManagement;
import com.rongji.dfish.framework.controller.BaseController;

/**
 * 后台管理
 * @author RJ-006
 *
 */
@Controller
@RequestMapping("/backmanagement")
public class BackManagementController extends BaseController {
		@Resource
		private BackManagement view;
		
		@RequestMapping(value = "/welcome")
		@ResponseBody
		public Object welcome(HttpServletRequest request) throws Exception
		{
			return view.buildWelcomeView();
		}
}
