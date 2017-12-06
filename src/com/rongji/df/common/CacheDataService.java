package com.rongji.df.common;

import java.util.List;

import com.rongji.dfish.base.Utils;

public class CacheDataService {
	public static List<Object> getUserInfo(String loginId)
	{
		return CacheData.getInstance().getUserInfo(loginId);
	}
	public static List<Object> getUserInfo(String loginId,String isRoot)
	{
		return CacheData.getInstance().getUserInfo(loginId,isRoot);
	}
	
	public static void clearUserInfo(String loginId)
	{
		CacheData.getInstance().clearUserInfo(loginId);
		CacheData.getInstance().clearQueryOrgCode(loginId);
	}
	
	public static String getRoleNameById(String roleId)
	{
		return CacheData.getInstance().getRoleNameById(roleId);
	}
	
	public static void clearRoleDataId2Name()
	{
		CacheData.getInstance().clearRoleDataId2Name();
	}
	
	public static String getDepNameById(String depId)
	{
		return CacheData.getInstance().getDepNameById(depId);
	}
	
	public static String getUserNameById(String userId)
	{
		return CacheData.getInstance().getUserNameById(userId);
	}
	
	public static void clearUserDataId2Name()
	{
		CacheData.getInstance().clearUserDataId2Name();
	}
	
	public static String[] getUserDeptById(String userId)
	{
		return CacheData.getInstance().getUserDeptById(userId);
	}
	
	public static void clearUserDept()
	{
		CacheData.getInstance().clearUserDept();
	}
	
	public static String getOperateByPermId(String permId)
	{
		return CacheData.getInstance().getPermNameById(permId);
	}
	
	public static void clearPermDataId2Name()
	{
		CacheData.getInstance().clearPermDataId2Name();
	}
	
	public static String getDeptUUID(String depId)
	{
		return CacheData.getInstance().getDeptUUID(depId);
	}
	
	public static void clearDeptUUID()
	{
		CacheData.getInstance().clearDeptUUID();
	}
	
	public static String getRoleGroupNameById(Integer roleGroupId)
	{
		return CacheData.getInstance().getRoleGroupNameById(roleGroupId);
	}
	
	public static void clearRoleGroupId2Name()
	{
		CacheData.getInstance().clearRoleDataId2Name();
	}
	
	public static String getSmCrossingName(String crossingCode)
	{
		return CacheData.getInstance().getSmCrossingName(crossingCode);
	}
	
	public static void clearSmCrossingName()
	{
		CacheData.getInstance().clearSmCrossingName();
	}
	
	public static List<Object[]> getSmCrossing()
	{
		return CacheData.getInstance().getSmCrossing();
	}
	
	public static void clearSmCrossing()
	{
		CacheData.getInstance().clearSmCrossing();
	}
	
	public static String getOrgCodeDepId(String orgCode)
	{
		return CacheData.getInstance().getOrgCodeDepId(orgCode);
	}
	
	public static void clearOrgCodeDepId()
	{
		CacheData.getInstance().clearOrgCodeDepId();
	}
	
	public static String[] getMenuInfoById(String menuId)
	{
		if(Utils.isEmpty(menuId))
		{
			return null;
		}
		return CacheData.getInstance().getMenuInfoById(menuId);
	}
	
	public static void clearMenuInfo()
	{
		CacheData.getInstance().clearMenuInfo();
	}
	
	public static List<Object[]> getBtInspectionEntAllInfo()
	{
		return CacheData.getInstance().getBtInspectionEntAllInfo();
	}
	
	public static void clearBtInspectionEntAllInfo()
	{
		CacheData.getInstance().clearBtInspectionEntAllInfo();
	}
	
	public static List<Object> getBtInspectionEntInfo(String id)
	{
		return CacheData.getInstance().getBtInspectionEntInfoById(id);
	}
	
	public static void clearBtInspectionEntInfo()
	{
		CacheData.getInstance().clearBtInspectionEntInfo();
	}
	
	public static List<Object[]> getBtInspectionOwnerAllInfo()
	{
		return CacheData.getInstance().getBtInspectionOwnerAllInfo();
	}
	
	public static void clearBtInspectionOwnerAllInfo()
	{
		CacheData.getInstance().clearBtInspectionOwnerAllInfo();
	}
	
	public static List<Object> getBtInspectionOwnerInfo(String id)
	{
		return CacheData.getInstance().getBtInspectionOwnerInfoById(id);
	}
	
	public static void clearBtInspectionOwnerInfo()
	{
		CacheData.getInstance().clearBtInspectionOwnerInfo();
	}
	
	public static List<Object[]> findSmCountryRegion()
	{
		return CacheData.getInstance().findSmCountryRegion();
	}
	
	public static Object[] getCodeByAlias3(String alias3)
	{
		return CacheData.getInstance().getCountryByCodeOrAlias(alias3);
	}
	
	public static void clearUserCountryCrossing(String orgId,boolean isClearAll)
	{
		CacheData.getInstance().clearUserCountryCrossing(orgId, isClearAll);
	}
	
	public static void setTempExceInfos(String orgCode,Object[] arr)
	{
		CacheData.getInstance().setTempExceInfos(orgCode, arr);
	}
	
	public static Object[] getTempExceInfos(String orgCode)
	{
		return CacheData.getInstance().getTempExceInfos(orgCode);
	}
	
	public static List<String> getQueryOrgCode(String userId)
	{
		return CacheData.getInstance().getQueryOrgCode(userId);
	}

}
