package com.rongji.df.web.controller;

import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.rongji.df.web.view.RoleGroupView;
import com.rongji.dfish.base.Page;
import com.rongji.dfish.framework.FrameworkHelper;
import com.rongji.dfish.framework.controller.BaseController;
/**
 * 角色组管理
 * @author RJ-006
 *
 */
@Controller
@RequestMapping("/roleGroupMgt")
public class RoleGroupController extends BaseController {

	@Resource
	private RoleGroupView roleGroupView;
	
	@RequestMapping("/index")
	@ResponseBody
	public Object index(HttpServletRequest request)
	{
		String loginId = FrameworkHelper.getLoginUser(request);
		request.getSession().removeAttribute("searchParameter");
		Page page = FrameworkHelper.createPersonalPage("", null);
//		List<SmRoleGroup>
		return roleGroupView.buildIndex();
	}
}
