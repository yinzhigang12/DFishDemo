package com.rongji.df.web.service;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.rongji.df.common.CacheDataService;
import com.rongji.df.dao.GenericDao;
import com.rongji.df.entity.SmMenu;
import com.rongji.df.entity.SmShortcutApp;
import com.rongji.dfish.base.Utils;

import edu.emory.mathcs.backport.java.util.Collections;

@Service
public class MenuService {
	
	@Resource
	@Qualifier("GenericDao")
	private GenericDao dao;
	
	public List<SmMenu> getRootMenus(String userId)
	{
		String con = getConditionByPerms(userId);
		if(con == null)
		{
			return null;
		}
		List<SmMenu> datas = (List<SmMenu>) dao.getQueryList("from SmMenu where status=1 and menuType=?  "+con+" order by orderNum", "1");
		return datas;
	}
	
	public String getConditionByPerms(String userId)
	{
		StringBuilder sb = new StringBuilder();
		List<Object[]> perms = (List<Object[]>) CacheDataService.getUserInfo(userId).get(6);
		if(perms == null || perms.size() == 0)
		{
			return null;
		}
		sb.append(" and resourceId in ( ");
		for(Object[] ob:perms)
		{
			String resourceId = (String) ob[1];
			if(resourceId.startsWith("r"))
			{
				sb.append("'"+resourceId+"',");
			}
		}
		String con = sb.substring(0,sb.lastIndexOf(","));
		con = con+")";
		return con;
	}
	
	public List<SmMenu> getSubMenus(String userId,String parentId)
	{
		if(Utils.isEmpty(parentId))
		{
			return Collections.emptyList();
		}
		String con = getConditionByPerms(userId);
		if(con == null)
		{
			return null;
		}
		List<SmMenu> datas = (List<SmMenu>) dao.getQueryList("from SmMenu where status=1 and parentId=?"+con+"order by orderNum", parentId);
		return datas;
	}
	
	public SmMenu findAppByCode(String menuId)
	{
		if(Utils.isEmpty(menuId))
		{
			return null;
		}
		return (SmMenu) dao.getObject("from SmMenu where status =1 and menuId=? ", menuId);
	}
	
	public List<String> getOwnerMenu(String loginId)
	{
		if(Utils.isEmpty(loginId))
		{
			return null;
		}
		return (List<String>) dao.getQueryList("select menuId from  SmShortcutApp where userId=? order by menuId ", loginId);
	}
	
	public List<String> getUsableMenu(String loginId)
	{
		String con = getConditionByPerms(loginId);
		if(con == null)
		{
			return null;
		}
		List<String> all = (List<String>) dao.getQueryList("select menuId from SmMenu where status = 1 and menuType != 1"+con+" order by menuId");
		if(all != null && all.size() > 0)
		{
			List<String> owns = (List<String>) dao.getQueryList("select menuId from SmShortcutApp where userId=? order by menuId", loginId);
			if(owns != null && owns.size() > 0)
			{
				List<String> list = new ArrayList<String>();
				for(String id : all)
				{
					if(!owns.contains(id))
					{
						list.add(id);
					}
				}
				return list;
			}
			return all;
		}
		return null;
	}
	
	public void saveChannelMenu(String loginId,String[] ids)
	{
		dao.delete("delete from SmShortcutApp where userId=? ",loginId);
		if(ids == null || ids.length == 0)
		{
			return;
		}
		for(String id : ids)
		{
			SmShortcutApp m = new SmShortcutApp();
			m.setMenuId(id);
			m.setUserId(loginId);
			String menuPath = getParentId(id);
			menuPath = menuPath.substring(0,menuPath.lastIndexOf("/"));
			m.setMenuPath(menuPath);
			dao.save(m);
		}
	}
	
	public String getParentId(String id)
	{
		String parentId = CacheDataService.getMenuInfoById(id)[3];
		if(parentId == null)
		{
			return id;
		}
		return getParentId(parentId)+"/"+id;
	}
	
	public SmShortcutApp getChannelMenuByMenuId(String loginId,String menuId)
	{
		return (SmShortcutApp) dao.getObject(" from SmShortcutApp where menuId=? and userId=? ", menuId,loginId);
	}
	
	@SuppressWarnings("unchecked")
	public List<Object[]> getResourceClass()
	{
		return (List<Object[]>) dao.getQueryList("select resourceClassId,resourceClassName from SmResourceClass where status=1 order by orderNum");
	}

}
