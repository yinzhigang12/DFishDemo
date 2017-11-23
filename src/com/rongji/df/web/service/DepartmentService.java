package com.rongji.df.web.service;

import java.util.List;

import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.rongji.df.common.CacheDataService;
import com.rongji.df.dao.GenericDao;
import com.rongji.df.entity.SmDepartment;
import com.rongji.df.util.RoleAndPermsUtils;
import com.rongji.dfish.base.Utils;

@Service
public class DepartmentService {
	@Resource
	@Qualifier("GenericDao")
	private GenericDao dao;
	
	public SmDepartment getDepartById(Integer id)
	{
		if(id == null)
		{
			return null;
		}
		return dao.getObject(SmDepartment.class, id);
	}
	
	public String queryScope(String loginId,String resourceId)
	{
		String[] dep = CacheDataService.getUserDeptById(loginId);
		String depId = dep[0];
		String scope = RoleAndPermsUtils.getQueryScope(loginId, resourceId);
		String uuid = CacheDataService.getDeptUUID(depId);
		if(RoleAndPermsUtils.ALL.equals(scope))
		{
			return " and parentId = 0 ";
		}else if(RoleAndPermsUtils.ORG_AND_CHILD.equals(scope))
		{
			if("530000".equals(uuid))
			{
				return "and t.uuid = '530000'";
			}
			if(uuid.length() > 6)
			{
				uuid = uuid.substring(0,6);
			}
			return " and t.uuid = "+uuid;
		}else if(RoleAndPermsUtils.ORG.equals(scope))
		{
			if(uuid.length() > 6)
			{
				uuid = uuid.substring(0,6);
			}
			return " and t.uuid= "+uuid;
		}else if(RoleAndPermsUtils.DEP.contentEquals(scope))
		{
			return " and t.uuid= "+uuid;
		}
		return "error";
	}
	
	public SmDepartment getRootDepts(String loginId,String resourceId)
	{
		if(resourceId == null)
		{
			resourceId = RoleAndPermsUtils.query_sys;
		}
		String scope = queryScope(loginId,resourceId);
		if("error".equals(scope))
		{
			return null;
		}
		SmDepartment root = (SmDepartment) dao.getObject("from SmDepartment t where 1=1"+scope);
		return root;
	}
	
	@SuppressWarnings("unchecked")
	public List<SmDepartment> getAllDepts()
	{
		return (List<SmDepartment>) dao.getQueryList("from SmDepartment t ");
	}
	
	@SuppressWarnings("unchecked")
	public List<SmDepartment> getUsableDepts(Integer id)
	{
		return (List<SmDepartment>) dao.getQueryList("from SmDepartment t where t.parentId=? and t.status=1 ");
	}
	
	@SuppressWarnings("unchecked")
	public List<Object[]> getUsableAllDepts(){
		return (List<Object[]>) dao.getQueryList("select depId,depName,uuid from SmDepartment where status=1 order by uuid");
	}
	
	public SmDepartment getDeptByCode(String code)
	{
		if(code == null)
		{
			return null;
		}
		return (SmDepartment) dao.getObject("  from SmDepartment t where t.uuid=? ", code);
	}
	
	public boolean checkUuid(String uuid,Integer depId)
	{
		Long num = null;
		if(depId == null)
		{
			num = (Long) dao.getObject("select count(depId) from SmDepartment where uuid= ? ", uuid);
		}else{
			num = (Long) dao.getObject("select count(depId) from SmDepartment where uuid=? and depId != ? ", uuid,depId);
		}
		if(num != null)
		{
			if(num.intValue() == 0)
			{
				return false;
			}
		}
		return true;
	}
	
	public void saveOrEdit(SmDepartment dept,boolean isNew)
	{
		if(isNew)
		{
			dao.save(dept);
		}else{
			dao.update(dept);
		}
	}
	public void deleteDeptById(Integer id)
	{
		dao.delete("delete from SmDepartment t where t.depId=? ",id);
	}
	
	@SuppressWarnings("unchecked")
	public List<SmDepartment> getSubDeptByParentId(Integer parentId)
	{
		if(parentId == null)
		{
			return null;
		}
		return (List<SmDepartment>) dao.getQueryList(" from SmDepartment t where t.parentId=? order by t.uuid", parentId);
	}
	
	public int getSubDeptNum(Integer parentId)
	{
		Long n = (Long) dao.getObject("select count(t.depId) from SmDepartment t where t.parentId=? ", parentId);
		if(n == null)
		{
			return 0;
		}
		return n.intValue();
	}
	
	public int getSubOrgNum(Integer parentId)
	{
		Long n = (Long) dao.getObject("select count(t.depId) from SmDepartment t where t.parentId=? and depType=0 ", parentId);
		if(n == null)
		{
			return 0;
		}
		return n.intValue();
	}
	
	public int getUserCountByDepId(Integer depId)
	{
		Long n = (Long) dao.getObject("select count(t.userId) from SmUser t where t.depId=? ", depId);
		if( n == null)
		{
			return 0;
		}
		return n.intValue();
	}
	
	public SmDepartment getUpOrg(String uuid)
	{
		SmDepartment org = (SmDepartment) dao.getObject(" from SmDepartment where uuid=? and status=1", uuid);
		Integer parentId = org.getParentId();
		SmDepartment dept = dao.getObject(SmDepartment.class, parentId);
		return dept;
	}
	
	@SuppressWarnings("unchecked")
	public List<SmDepartment> getDeptListByUuid(String uuid)
	{
		if(Utils.notEmpty(uuid))
		{
			SmDepartment dept = (SmDepartment) dao.getObject("from SmDepartment where depType=0 and status=1 and uuid=?", uuid);
			List<SmDepartment> list = (List<SmDepartment>) dao.getQueryList("from SmDepartment where depType=0 and status=1 and parentId=? ", dept.getDepId());
			return list;
		}
		return null;
	}
	
	@SuppressWarnings("unchecked")
	public List<SmDepartment> getOrgins(Integer rootId)
	{
		if(rootId != null)
		{
			return (List<SmDepartment>) dao.getQueryList("from SmDepartment where depType=0 and status=1 and (levelCode like ? or levelCode like ? or levelCode like ? or levelCode like ?)", rootId+"",rootId+"/%","%/"+rootId+"/%","%/"+rootId);
		}
		return null;
	}
	
	public SmDepartment getRootOrgs(String loginId,String resourceId)
	{
		if(resourceId == null)
		{
			resourceId = RoleAndPermsUtils.query_sys;
		}
		String scope = queryScope(loginId,resourceId);
		if("error".equals(scope))
		{
			return null;
		}
		SmDepartment root = (SmDepartment) dao.getObject("from SmDepartment t where 1=1 and depType=0 and status=1 "+scope);
		return root;
	}
	
	@SuppressWarnings("unchecked")
	public List<SmDepartment> getSubOrgByParentId(Integer parentId)
	{
		if(parentId == null)
		{
			return null;
		}
		return (List<SmDepartment>) dao.getQueryList(" from SmDepartment t where 1=1 and depType = 0 and status=1 and t.parentId=? order by t.uuid ", parentId);
	}

}
