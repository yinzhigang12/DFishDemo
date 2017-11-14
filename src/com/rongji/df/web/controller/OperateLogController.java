package com.rongji.df.web.controller;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.rongji.df.web.view.OperateLogView;
import com.rongji.dfish.framework.controller.BaseController;
/**
 * 操作日志
 * @author RJ-006
 *
 */
@Controller
@RequestMapping("/operateLogMgt")
public class OperateLogController extends BaseController {
		@Resource
		private OperateLogView operateLogView;
		
		@RequestMapping("/index")
		@ResponseBody
		public Object index(HttpServletRequest request)
		{
			return operateLogView.buildIndex();
		}
}
