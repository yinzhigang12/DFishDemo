package com.rongji.df.web.controller;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.rongji.df.entity.SmDepartment;
import com.rongji.df.web.view.UserManagerView;
import com.rongji.dfish.framework.FrameworkHelper;
import com.rongji.dfish.framework.controller.BaseController;
/**
 * 用户管理
 * @author RJ-006
 *
 */
@Controller
@RequestMapping("/userManager")
public class UserManagerController extends BaseController {

	@Resource
	private UserManagerView userManagerView;
	
	private DepartmentService
	
	@RequestMapping(value = "/index")
	@ResponseBody
	public Object index(HttpServletRequest request)
	{
		String loginId = FrameworkHelper.getLoginUser(request);
		SmDepartment rootDep = departmentService
		return userManagerView.index();
	}
}
