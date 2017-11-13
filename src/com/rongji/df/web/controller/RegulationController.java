package com.rongji.df.web.controller;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.rongji.df.web.view.Regulation;
import com.rongji.dfish.framework.controller.BaseController;

/**
 * 备案监管
 * @author RJ-006
 *
 */
@Controller
@RequestMapping("/regulation")
public class RegulationController extends BaseController {
		@Resource
		private Regulation view;
		
		@RequestMapping("/welcome")
		@ResponseBody
		public Object welcome(HttpServletRequest request) throws Exception
		{
			return view.buildWelcomeView();
		}

}
