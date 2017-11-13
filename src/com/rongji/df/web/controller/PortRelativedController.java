package com.rongji.df.web.controller;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.rongji.df.web.view.PortRelatived;
import com.rongji.dfish.framework.controller.BaseController;

/**
 * 口岸卫检
 * @author RJ-006
 *
 */
@Controller
@RequestMapping("/portrelatived")
public class PortRelativedController extends BaseController {
		@Resource
		private PortRelatived view;
		
		@RequestMapping("/welcome")
		@ResponseBody
		public Object welcome(HttpServletRequest request) throws Exception
		{
			return view.buildWelcomeView();
		}
}
