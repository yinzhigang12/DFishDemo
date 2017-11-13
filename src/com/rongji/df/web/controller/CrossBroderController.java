package com.rongji.df.web.controller;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.rongji.df.web.view.CrossBroder;
import com.rongji.dfish.framework.controller.BaseController;

/**
 * 跨境电商
 * @author RJ-006
 *
 */
@Controller
@RequestMapping("/crossbroder")
public class CrossBroderController extends BaseController {
		@Resource
		private CrossBroder view;
		
		@RequestMapping(value = "/welcome")
		@ResponseBody
		public Object welcome(HttpServletRequest request) throws Exception
		{
			return view.buildWelcomeView();
		}
}
