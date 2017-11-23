package com.rongji.df.web.service;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.rongji.df.common.CacheDataService;
import com.rongji.df.dao.GenericDao;
import com.rongji.df.entity.SmUser;
import com.rongji.df.util.RoleAndPermsUtils;
import com.rongji.dfish.base.Page;
import com.rongji.dfish.base.Utils;

@Service
public class UserManagerService {
	@Resource
	@Qualifier("GenericDao")
	private GenericDao dao;
	
	public SmUser getUserById(Integer id)
	{
		if(id == null)
		{
			return null;
		}
		return dao.getObject(SmUser.class, id);
	}
	
	@SuppressWarnings("unchecked")
	public List<SmUser> getUsers()
	{
		return (List<SmUser>) dao.getQueryList(" from SmUser u where u.isRoot=0 ");
	}
	
	@SuppressWarnings("unchecked")
	public List<SmUser> getUsers(Page page,String loginId)
	{
		String scope = queryScope(loginId);
		if("error".equals(scope))
		{
			return null;
		}
		return (List<SmUser>) dao.getQueryList(page, true, " from SmUser u where u.isRoot=0 "+scope);
	}
	
	public String queryScope(String loginId)
	{
		String[] dep = CacheDataService.getUserDeptById(loginId);
		String depId = dep[0];
		String scope = RoleAndPermsUtils.getQueryScope(loginId, RoleAndPermsUtils.query_sys);
		String uuid = CacheDataService.getDeptUUID(depId);
		if(uuid.length() > 6)
		{
			uuid = uuid.substring(0,5);
		}
		if(RoleAndPermsUtils.ALL.equals(scope))
		{
			return "";
		}else if(RoleAndPermsUtils.ORG_AND_CHILD.equals(scope))
		{
			if("530000".equals(uuid))
			{
				return "";
			}
			return "and u.depId in( select d.depId from SmDepartment d where d.uuid like '%"+uuid+"%')";
		}else if(RoleAndPermsUtils.ORG.equals(scope))
		{
			return " and u.depId in( select d.depId from SmDepartment d where d.uuid like '%"+uuid+"%')";
		}else if(RoleAndPermsUtils.DEP.equals(scope))
		{
			return " and u.depId="+depId;
		}
		return "error";
	}
	
	@SuppressWarnings("unchecked")
	public List<SmUser> getUsersByCondition(String loginId,Map<String,Object> con,Page page)
	{
		String scope = queryScope(loginId);
		if("error".equals(scope))
		{
			return null;
		}
		String sql = " from SmUser u where u.isRoot=0 "+scope;
		StringBuilder condition = new StringBuilder("");
		List<Object> args = new ArrayList<Object>();
		getSearchCondition(con,condition,args);
		sql = sql + condition.toString();
		return (List<SmUser>)dao.getQueryList(page, true,sql,args.toArray());
	}
	
	@SuppressWarnings("unchecked")
	public List<SmUser> getUsersByCondition(String loginId,Map<String,Object> con)
	{
		String scope = queryScope(loginId);
		if("error".equals(scope))
		{
			return null;
		}
		String sql = " from SmUser u where u.isRoot=0 "+scope;
		StringBuilder condition = new StringBuilder("");
		List<Object> args = new ArrayList<Object>();
		getSearchCondition(con,condition,args);
		sql = sql + condition.toString();
		return (List<SmUser>) dao.getQueryList(sql, args.toArray());
	}
	
	public void getSearchCondition(Map<String,Object> con, StringBuilder sql,List<Object> args)
	{
		if(con != null && con.size() > 0)
		{
			Iterator<Entry<String,Object>> it = con.entrySet().iterator();
			while(it.hasNext())
			{
				Entry<String,Object> entry = it.next();
				String key = entry.getKey();
				Object v = entry.getValue();
				String k = key.substring(1);
				if(key.startsWith("A"))
				{
					sql.append(" and "+k+" = ?");
					args.add(v);
				}else if(key.startsWith("B"))
				{
					sql.append(" and "+k+" like ? ");
					args.add("%"+v+"%");
				}
			}
		}
	}
	
	public SmUser saveOrUpdateUser(SmUser user,boolean isNew)
	{
		if(isNew)
		{
			dao.save(user);
		}else{
			dao.update(user);
		}
		return user;
	}
	
	public void deleteUserById(Integer id)
	{
		dao.executeUpdate("delete from SmUserRole where pk.userId=?", id);
		dao.executeUpdate("delete from SmUserRoleGroup where pk.userId=?", id);
		dao.executeUpdate("delete from SmUser u where u.userId=?", id);
	}
	
	public void updateUserPwd(Integer userId,String newPassword)
	{
		dao.executeUpdate("update SmUser u set u.password=?  where u.userId=?",newPassword,userId);
	}
	
	public int getUserCounts()
	{
		Long num = (Long) dao.getObject("select count(t.userId) from SmUser t");
		if(num == null)
		{
			return 0;
		}
		return num.intValue();
	}
	
	public SmUser getUserByLoginName(String loginName)
	{
		if(Utils.isEmpty(loginName))
		{
			return null;
		}
		return (SmUser) dao.getObject("from SmUser t where t.loginName=?", loginName);
	}
	
	public boolean isExistByLoginName(String loginName,Integer id)
	{
		Long num = null;
		if(id == null)
		{
			num = (Long) dao.getObject("select count(t.loginName) from SmUser t where t.loginName=?", loginName);
		}else{
			num = (Long) dao.getObject("select count(t.loginName) from SmUser t where t.loginName=? and t.userId !=?", loginName,id);
		}
		if(num == 0)
		{
			return false;
		}
		return true;
	}
	
	public void updateRoles(Integer userId,String[] ids)
	{
		dao.delete("delete from SmUserRole where pk.userId =?",userId);
		StringBuilder roleNames = new StringBuilder();
		String rns ="";
		if(ids != null && ids.length > 0)
		{
			for(String id : ids)
			{
//				SmUserRole ur = new SmUserRole();
				
			}
		}
	}
	
	@SuppressWarnings("unchecked")
	public List<SmUser> getUsersByDepId(Integer depId,Map<String, Object> con)
	{
		if(depId == null)
		{
			return null;
		}
		String sql = "from SmUser u where u.isRoot=0 and u.depId=? ";
		StringBuilder condition = new StringBuilder("");
		List<Object> args = new ArrayList<Object>();
		args.add(depId);
		getSearchCondition(con,condition,args);
		sql = sql+condition.toString();
		return (List<SmUser>) dao.getQueryList(sql, args.toArray());
	}
	
	public void updateUseStatu(Integer uId,String type)
	{
		int v = 0;
		if("Y".equals(type))
		{
			v = 1;
		}
		dao.executeUpdate("update SmUser set userStatu=? where userId=? ", v,uId);
	}
	
	public String handleScope(String loginId)
	{
		String[] dep = CacheDataService.getUserDeptById(loginId);
		String depId = dep[0];
		String scope = RoleAndPermsUtils.getQueryScope(loginId, RoleAndPermsUtils.handle_sys);
		String uuid = CacheDataService.getDeptUUID(depId);
		if(uuid.length() > 6)
		{
			uuid = uuid.substring(0,6);
		}
		
		if(RoleAndPermsUtils.ALL.equals(scope))
		{
			return "";
		}else if(RoleAndPermsUtils.ORG_AND_CHILD.equals(scope))
		{
			if("530000".equals(uuid))
			{
				return "";
			}
			return "and u.depId in (select d.depId from SmDepartment d where d.uuid like '%"+uuid+"%')";
		}else if(RoleAndPermsUtils.ORG.equals(scope))
		{
			return "and u.depId in (select d.depId from SmDepartment d where d.uuid like '%"+uuid+"%')";
		}else if(RoleAndPermsUtils.DEP.equals(scope))
		{
			return " and u.depId="+depId;
		}else if(RoleAndPermsUtils.OWNER.equals(scope))
		{
			return "error";
		}
		return "error";
	}
	
	@SuppressWarnings("unchecked")
	public List<Object[]> getOwnUserByRoleId(String loginId,Integer roleId)
	{
		List<Object[]> list = null;
		String con = handleScope(loginId);
		if("error".equals(con))
		{
			return list;
		}
		list = (List<Object[]>) dao.getQueryList("select u.userId,u.empName from SmUser u where u.isRoot=0"+con+" and u.userId in(select t.pk.userId from SmUserRole t where t.pk.roleId=?)", roleId);
		return list;
	}
	
	@SuppressWarnings("unchecked")
	public List<Object[]> getOwnUserByGroupId(String loginId,Integer roleGroupId)
	{
		List<Object[]> list = null;
		String con = handleScope(loginId);
		if("error".equals(con))
		{
			return list;
		}
		list = (List<Object[]>) dao.getQueryList("select u.userId,u.empName from SmUser u where u.isRoot=0 "+con+" and u.userId in(select t.pk.userId from SmUserRoleGroup t where t.pk.roleGroupId=?) ", roleGroupId);
		return list;
	}
	
}
