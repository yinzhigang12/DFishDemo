package com.rongji.df.util;

import java.util.ArrayList;
import java.util.List;

import com.rongji.df.common.CacheDataService;
import com.rongji.df.common.UserInfoForm;
import com.rongji.dfish.base.Utils;

public class RoleAndPermsUtils {
	public static final String ALL="all";
	public static final String ORG_AND_CHILD="orgChild";
	public static final String ORG="org";
	public static final String DEP="dep";
	public static final String OWNER="owner";
	
	/**
	 * 后台管理查询处理范围
	 */
	public static final String query_sys = "q00010100";
	public static final String handle_sys = "h00010200";
	/**
	 * 车辆检疫查询处理范围
	 */
	public static final String query_vehicle = "q00030100";
	public static final String handle_vehicle = "h00030200";
	
	/**
	 * 入境施检资源ID与权限ID
	 */
	public static final String V_INSP_RES_I = "r03030100";
	public static final String V_INSP_PERM_I = "p03030101";
	/**
     * 入境撤单资源ID与权限ID
     */
    public static final String V_INSP_DEL_RES_I = "r03030100";
    public static final String V_INSP_DECL_PERM_I = "p03030102";
	/**
     * 出境施检资源ID与权限ID
     */
    public static final String V_INSP_RES_E = "r03030200";
    public static final String V_INSP_PERM_E = "p03030201";
    /**
     * 出境撤单源ID与权限ID
     */
    public static final String V_INSP_DEL_RES_E = "r03030100";
    public static final String V_INSP_DECL_PERM_E = "p03030102";
    /**
     * 施检查询撤销施检资源ID与权限ID
     */
    public static final String V_INSP_REV_RES = "r03030300";
    public static final String V_INSP_REV_PERM = "p03030301";
    
    /**
     * 手工计费计费资源ID与权限ID
     */
    public static final String V_BILL_RES = "r03040000";
    public static final String V_BILL_PERM = "p03040001";
    
    /**
     * 收费管理收费权限资源ID与权限ID
     */
    public static final String V_CHARGE_RES = "r03050000";
    public static final String V_CHARGE_PERM = "p03050001";

    /**
     * 收费管理段结收费短信催缴权限资源ID与权限ID
     */
    public static final String V_S_CHARGE_MES_RES = "r03050100";
    public static final String V_S_CHARGE_MES_PERM = "p03050102";
    
    /**
     * 收费管理收费查询退费限资源ID与权限ID
     */
    public static final String V_REV_CHARGE_RES = "r03050300";
    public static final String V_REV_CHARGE_PERM = "p03050301";
    
	/**
	 * 口岸卫检查询处理范围
	 */
	public static final String query_port = "q00020100";
	public static final String handle_port = "h00020200";
	
	public static String getQueryScope(String loginId,String resourceId)
	{
		List<Object[]> perms = (List<Object[]>) CacheDataService.getUserInfo(loginId).get(6);
		if(perms == null || perms.size() == 0)
		{
			return "";
		}
		if(resourceId == null)
		{
			return "";
		}
		List<String> result = new ArrayList<String>();
		for(Object[] ob : perms)
		{
			String rId = (String) ob[1];
			if(resourceId.equals(rId))
			{
				String permId = (String) ob[0];
				result.add(CacheDataService.getOperateByPermId(permId));
			}
		}
		
		if(result.size() == 0)
		{
			return "";
		}
		if(result.contains(ALL))
		{
			return ALL;
		}else if(result.contains(ORG_AND_CHILD))
		{
			return ORG_AND_CHILD;
		}else if(result.contains(ORG))
		{
			return ORG;
		}else if(result.contains(DEP))
		{
			return DEP;
		}else if(result.contains(OWNER))
		{
			return OWNER;
		}else{
			return "";
		}		
	}
	
	public static boolean getHandleScope(String loginId,String resourceId,String cUserId,String cDepId)
	{
		if(loginId == null)
		{
			return false;
		}
		if(resourceId == null)
		{
			return false;
		}
		if(Utils.isEmpty(cUserId) && Utils.isEmpty(cDepId))
		{
			return false;
		}
		String depId = CacheDataService.getUserDeptById(loginId)[0];
		if(Utils.isEmpty(cUserId) && Utils.notEmpty(cDepId))
		{
			if(depId.equals(cDepId))
			{
				return true;
			}
		}
		
		String uuid = CacheDataService.getDeptUUID(depId);
		String orgCode = uuid != null && uuid.length() >= 6 ? uuid.substring(0,6) : null;
		if(Utils.isEmpty(cDepId))
		{
			cDepId = CacheDataService.getUserDeptById(cUserId)[0];
		}
		String cUuid = CacheDataService.getDeptUUID(cDepId);
		String scope = getQueryScope(loginId,resourceId);
		if(ALL.equals(scope))
		{
			return true;
		}else if(ORG_AND_CHILD.equals(scope))
		{
			if("530000".equals(orgCode))
			{
				return true;
			}else if(cUuid != null && cUuid.startsWith(orgCode))
			{
				return true;
			}
		}else if(ORG.equals(scope))
		{
			if(cUuid != null && cUuid.startsWith(orgCode))
			{
				return true;
			}
		}else if(DEP.equals(scope))
		{
			if(cDepId != null && cDepId.equals(depId))
			{
				return true;
			}
		}else if(OWNER.equals(scope))
		{
			if(loginId != null && loginId.equals(cUserId))
			{
				return true;
			}
		}else{
			return false;
		}
		return false;
	}
	
	public static boolean checkIsUsable(String loginId,String resourceId,String permId)
	{
		if(loginId == null || resourceId == null || permId == null)
		{
			return false;
		}
		List<Object[]> perms = (List<Object[]>) CacheDataService.getUserInfo(loginId).get(6);
		if(perms == null || perms.size() == 0)
		{
			return false;
		}
		List<String> partPerms = new ArrayList<String>();
		for(Object[] o : perms)
		{
			String rId = (String) o[1];
			if(resourceId.equals(rId))
			{
				String pId = (String) o[0];
				partPerms.add(pId);
			}
		}
		if(partPerms.size() == 0)
		{
			return false;
		}
		return partPerms.contains(permId);
	}
	
	public static String getQueryHqlByACScope(String resourceId,UserInfoForm user,String orgIdFieldName,String depIdFieldName,String empIdFieldName)
	{
		if(user == null)
		{
			return "noPerm";
		}
		String acScope = getQueryScope(user.getUserId()+"",resourceId);
		String where ="";
		
		if(ALL.equals(acScope))
		{
			
		}else if(ORG.equals(acScope))
		{
			where = " and "+orgIdFieldName +" = "+user.getOrgId();
		}else if(ORG_AND_CHILD.equals(acScope))
		{
			String levelCode = (user.getOrgLevelCode() == null || user.getOrgLevelCode().length() == 0 ? "":user.getOrgLevelCode())+"/"+user.getOrgId();
			where = " and "+"("+orgIdFieldName+" in(select depId from SmDepartment where levelCode like '"+levelCode+"%') or "+orgIdFieldName+ "="+user.getOrgId()+")";
		}else if(DEP.equals(acScope))
		{
			if(Utils.notEmpty(depIdFieldName))
			{
				where = " and "+depIdFieldName+ " = "+user.getDepId();
			}else{
				where = "noPerm";
			}
		}else if(OWNER.equals(acScope))
		{
			if(Utils.notEmpty(empIdFieldName))
			{
				where = " and "+empIdFieldName+" = "+user.getUserId();
			}else{
				where = "noPerm";
			}
		}else if("".equals(acScope))
		{
			where = "noPerm";
		}
		return where;
	}

}
