package com.rongji.df.web.controller;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.rongji.df.web.view.ChargeMakeInvoice;
import com.rongji.dfish.framework.controller.BaseController;

/**
 * 收费开票
 * @author RJ-006
 *
 */
@Controller
@RequestMapping("/chargemakeinvoice")
public class ChargeMakeInvoiceController extends BaseController {
		@Resource
		private ChargeMakeInvoice view;
		
		@RequestMapping(value="/welcome")
		@ResponseBody
		public Object welcome(HttpServletRequest request) throws Exception
		{
			return view.buildWelcomeView();
		}
}
