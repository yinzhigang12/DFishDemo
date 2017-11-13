package com.rongji.df.web.controller;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.rongji.df.web.view.CardQuarantine;
import com.rongji.dfish.framework.controller.BaseController;

/**
 * 车辆检疫
 * @author RJ-006
 *
 */
@Controller
@RequestMapping("/cardquarantine")
public class CardQuarantineController extends BaseController {
		@Resource
		private CardQuarantine view;
		
		@RequestMapping(value="/welcome")
		@ResponseBody
		public Object welcome(HttpServletRequest request) throws Exception
		{
			return view.buildWelcomeView();
		}
}
