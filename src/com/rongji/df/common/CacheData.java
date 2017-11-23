package com.rongji.df.common;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.rongji.df.dao.StaticGenericDao;
import com.rongji.df.dao.StaticGenericDaoUtil;
import com.rongji.df.util.RoleAndPermsUtils;
import com.rongji.dfish.base.Utils;

public class CacheData {
	private static CacheData instance;
	
	public static CacheData getInstance()
	{
		if(instance == null)
		{
			synchronized (CacheData.class)
			{
				if(instance == null)
				{
					instance = new CacheData();
				}
			}
		}
		return instance;
	}
	
	private static final byte[] SESSION_TEMP_SET = new byte[0];
	private static Map<String, String> tempSetMap = null;
	private static final byte[] SESSION_DEPT_UUID = new byte[0];
	private static Map<String, String> deptUuidMap = null;
	private static final byte[] SESSION_USER_INFO = new byte[0];
	private static Map<String,List<Object>> userInfo = new HashMap<String,List<Object>>();
	private static final byte[] SESSION_SM_CROSSING_NAME = new byte[0];
	private static Map<String,String> smCrossingNameMap = null;
	private static final byte[] ORG_CODE_DEP_ID = new byte[0];
	private static Map<String,String> orgCodeDepIdMap = null;
	private static Map<String,Object[]> tempExceMap = new HashMap<String,Object[]>();
	
	public List<Object> getUserInfo(String userId)
	{
		if(userId == null)
		{
			return null;
		}
		ensureUserInfo(userId,null);
		return userInfo.get(userId);
	}
	
	public List<Object> getUserInfo(String userId,String isRoot)
	{
		if(userId == null)
		{
			return null;
		}
		ensureUserInfo(userId,isRoot);
		return userInfo.get(userId);
	}
	
	@SuppressWarnings("unchecked")
	public void ensureUserInfo(String userId,String isRoot)
	{
		if(userInfo.get(userId)==null)
		{
			synchronized(SESSION_USER_INFO)
			{
				if(userInfo.get(userId)==null)
				{
					StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
					Object object = dao.getObject("select u.userId,u.empName,u.depId,u.depName from SmUser u where u.userId=?", userId);
					List<Object> result = new ArrayList<Object>();
					Integer uId = null;
					String empName = null;
					Integer depId = null;
					String depName = null;
					if(object != null)
					{
						Object[] b = (Object[]) object;
						uId = (Integer)b[0];
						empName = (String)b[1];
						depId = (Integer)b[2];
						depName = (String)b[3];
					}
					Integer orgId = null;
					String orgName = null;
					String orgUuid = null;
					String orgLevelCode = null;
					
					if(depId != null)
					{
						Object[] obj = (Object[]) dao.getObject("select uuid,levelCode from SmDepartment where depId=?", depId);
						if(obj != null)
						{
							if((String)obj[0] != null && ((String) obj[0]).length() == 6)
							{
								orgId = depId;
								orgName = depName;
								orgUuid = (String)obj[0];
								orgLevelCode = (String)obj[1];
							}else if((String)obj[0] != null && ((String)obj[0]).length()>6)
							{
								String u = ((String)obj[0]).substring(0,6);
								Object o = dao.getObject("select depId,depName,uuid,levelCode from SmDepartment where uuid=?", u);
								if(o != null)
								{
									Object[] b = (Object[]) o;
									orgId = (Integer)b[0];
									orgName = (String)b[1];
									orgUuid = (String)b[2];
									orgLevelCode = (String)b[3];
								}
							}
						}
					}
					
					List<Object[]> perms = null;
					if(isRoot == null)
					{
						List<Integer> roleIds = (List<Integer>)dao.getQueryList("select pk.roleId from SmUserRole where pk.userId = ?", userId);
						List<Integer> groups = (List<Integer>)dao.getQueryList("select pk.roleGroupId from SmUserRoleGroup where pk.userId=?", userId);
						Set<Integer> roles = new HashSet<Integer>();
						if(groups != null && groups.size() > 0)
						{
							for(Integer gid:groups)
							{
								List<Integer> rIds = (List<Integer>)dao.getQueryList("select pk.roleId from SmRoleGroup where pk.roleGroupId=?", gid);
								if(rIds != null && rIds.size() > 0)
								{
									for(Integer id:rIds)
									{
										roles.add(id);
									}
								}
							}
						}
						if(roleIds != null && roleIds.size() > 0)
						{
							for(Integer id:roleIds)
							{
								roles.add(id);
							}
						}
						if(roles.size() == 0)
						{
							perms = null;
						}else{
							String con = "";
							StringBuilder sb = new StringBuilder("");
							sb.append(" and pk.roleId in (");
							for(Integer id:roles)
							{
								sb.append(id+",");
							}
							con = sb.substring(0,sb.length()-1);
							con = con+" )";
							perms = (List<Object[]>)dao.getQueryList("select pk.permId, resourceId from SmRolePerm where 1=1 "+con);
						}
					}else{
						perms = (List<Object[]>)dao.getQueryList("select permId,resourceId from SmPermissions where status =1");
					}
					result.add(uId);result.add(empName);result.add(depId);result.add(depName);
					result.add(orgId);result.add(orgName);
					result.add(perms);result.add(orgUuid);result.add(orgLevelCode);
					userInfo.put(userId+"", result);
				}
			}
		}
	}
	
	public void clearUserInfo(String userId)
	{
		if(userId == null)
		{
			return;
		}
		synchronized(SESSION_USER_INFO)
		{
			if(userInfo != null)
			{
				userInfo.remove(userId);
			}
		}
	}
	
	private static final byte[] CACHE_ID_TO_NAME_DEP = new byte[0];
	private static Map<String, String> depDataId2Name = null;
	
	public String getDepNameById(String depId)
	{
		ensureDepDataId2Name();
		return depDataId2Name.get(depId);
	}
	
	@SuppressWarnings("unchecked")
	public void ensureDepDataId2Name()
	{
		if(depDataId2Name == null)
		{
			synchronized(CACHE_ID_TO_NAME_DEP)
			{
				if(depDataId2Name == null)
				{
					depDataId2Name = new HashMap<String,String>();
					StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
					List<Object> ls = (List<Object>)dao.getQueryList("select depId,depName from SmDepartment");
					if(ls != null && ls.size() > 0)
					{
						for(Object ob : ls)
						{
							Object[] o = (Object[]) ob;
							depDataId2Name.put(((Integer) o[0])+"", (String) o[1]);
						}
					}
				}
			}
		}
	}
	
	public void clearDepDataId2Name()
	{
		if(depDataId2Name != null)
		{
			synchronized(CACHE_ID_TO_NAME_DEP)
			{
				if(depDataId2Name != null)
				{
					depDataId2Name = null;
				}
			}
		}
	}
	
	private static final byte[] CACHE_ID_TO_NAME_ROLE = new byte[0];
	private static Map<String,String> roleDataId2Name = null;
	
	public String getRoleNameById(String roleId)
	{
		ensureRoleDataId2Name();
		return roleDataId2Name.get(roleId);
	}
	
	@SuppressWarnings("unchecked")
	public void ensureRoleDataId2Name()
	{
		if(roleDataId2Name == null)
		{
			synchronized(CACHE_ID_TO_NAME_ROLE)
			{
				if(roleDataId2Name == null)
				{
					roleDataId2Name = new HashMap<String,String>();
					StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
					List<Object> ls = (List<Object>)dao.getQueryList("select roleId,roleName from SmRole");
					if(ls != null && ls.size() > 0)
					{
						for(Object ob : ls)
						{
							Object[] o = (Object[]) ob;
							roleDataId2Name.put(((Integer) o[0])+"",(String)o[1]);
						}
					}
				}
			}
		}
	}
	
	public void clearRoleDataId2Name()
	{
		if(roleDataId2Name != null)
		{
			synchronized(CACHE_ID_TO_NAME_ROLE)
			{
				if(roleDataId2Name != null)
				{
					roleDataId2Name = null;
				}
			}
		}
	}
	
	private static final byte[] CACHE_ID_TO_NAME_USER = new byte[0];
	private static Map<String, String> userDataId2Name = null;
	private static final byte[] CACHE_ID_V_DEPT = new byte[0];
	private static Map<String, String[]> userDeptMap = null;
	public String[] getUserDeptById(String userId)
	{
		ensureUserDept(userId);
		return userDeptMap.get(userId);
	}
	
	@SuppressWarnings("unchecked")
	private void ensureUserDept(String userId)
	{
		if(userDeptMap == null || userDeptMap.get(userId) == null)
		{
			synchronized(CACHE_ID_V_DEPT)
			{
				if(userDeptMap == null)
				{
					userDeptMap = new HashMap<String, String[]>();
					StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
					List<Object> ls = (List<Object>)dao.getQueryList("select userId,depId,depName from SmUser");
					if(ls != null && ls.size() > 0)
					{
						for(Object ob:ls)
						{
							Object[] o = (Object[]) ob;
							userDeptMap.put(((Integer)o[0])+"", new String[]{((Integer)o[1])+"",(String)o[2]});
						}
					}
				}else{
					StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
					Object[] o = (Object[])dao.getObject("select userId,depId,depName from SmUser where userId=?", userId);
					if(o != null)
					{
						userDeptMap.put(((Integer)o[0])+"", new String[]{((Integer)o[1])+"",(String)o[2]});
					}
				}
			}
		}
	}
	
	public void clearUserDept()
	{
		if(userDeptMap != null)
		{
			synchronized(CACHE_ID_V_DEPT)
			{
				if(userDeptMap != null)
				{
					userDeptMap.clear();
					userDeptMap = null;
				}
			}
		}
	}
	
	public String getUserNameById(String roleId)
	{
		ensureUserDataId2Name();
		return userDataId2Name.get(roleId);
	}
	
	@SuppressWarnings("unchecked")
	public void ensureUserDataId2Name()
	{
		if(userDataId2Name == null)
		{
			synchronized(CACHE_ID_TO_NAME_USER)
			{
				if(userDataId2Name == null)
				{
					userDataId2Name = new HashMap<String, String>();
					StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
					List<Object> ls = (List<Object>)dao.getQueryList("select userId,empName from SmUser");
					if(ls != null && ls.size() > 0)
					{
						for(Object ob : ls)
						{
							Object[] o = (Object[]) ob;
							userDataId2Name.put(((Integer) o[0])+"",(String) o[1]);
						}
					}
				}
			}
		}
	}
	
	public void clearUserDataId2Name()
	{
		if(userDataId2Name != null)
		{
			synchronized(CACHE_ID_TO_NAME_USER)
			{
				if(userDataId2Name != null)
				{
					userDataId2Name = null;
				}
			}
		}
	}
	
	private static final byte[] SESSION_CARD_INFO = new byte[0];
	private static Map<String, String> cardMap = null;
	private static final byte[] CACHE_ID_TO_NAME_PERM = new byte[0];
	private static Map<String,String> PermDataId2Name = null;
	
	public String getPermNameById(String permId)
	{
		ensurePermDataId2Name();
		return PermDataId2Name.get(permId);
	}
	
	@SuppressWarnings("unchecked")
	public void ensurePermDataId2Name()
	{
		if(PermDataId2Name == null)
		{
			synchronized(CACHE_ID_TO_NAME_PERM)
			{
				if(PermDataId2Name == null)
				{
					PermDataId2Name = new HashMap<String, String>();
					StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
					List<Object> ls = (List<Object>)dao.getQueryList("select permId,operate from SmPermissions");
					if(ls != null && ls.size() > 0)
					{
						for(Object ob : ls)
						{
							Object[] o = (Object[]) ob;
							PermDataId2Name.put(((String) o[0])+"", (String) o[1]);
						}
					}
				}
			}
		}
	}
	
	public void clearPermDataId2Name()
	{
		if(PermDataId2Name != null)
		{
			synchronized(CACHE_ID_TO_NAME_PERM)
			{
				if(PermDataId2Name != null)
				{
					PermDataId2Name = null;
				}
			}
		}
	}
	
	public String getDeptUUID(String depId)
	{
		ensureDeptUUID(depId);
		return deptUuidMap.get(depId);
	}
	
	@SuppressWarnings("unchecked")
	public void ensureDeptUUID(String depId)
	{
		if(deptUuidMap == null || deptUuidMap.get(depId)== null)
		{
			synchronized(SESSION_DEPT_UUID)
			{
				if(deptUuidMap == null || deptUuidMap.get(depId) == null)
				{
					String hql = "select depId,uuid from SmDepartment where status = 1 and uuid is not null";
					if(deptUuidMap == null)
					{
						deptUuidMap = new HashMap<String,String>();
					}else{
						hql = "select depId,uuid from SmDepartment where status = 1 and uuid is not null and depId="+depId;
					}
					StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
					List<Object[]> list = (List<Object[]>)dao.getQueryList(hql);
					for(Object[] arr:list)
					{
						deptUuidMap.put(arr[0].toString(), arr[1].toString());
					}
				}
			}
		}
	}
	
	public void clearDeptUUID()
	{
		synchronized(SESSION_DEPT_UUID)
		{
			if(deptUuidMap != null)
			{
				deptUuidMap.clear();
				deptUuidMap = null;
			}
		}
	}
	
	private static final byte[] CACHE_ID_TO_Name_ROLEGROUP = new byte[0];
	private static Map<Integer, String> roleGroupID2Name = null;
	public String getRoleGroupNameById(Integer roleGroupId)
	{
		ensureRoleGroupID2Name();
		return roleGroupID2Name.get(roleGroupId);
	}
	
	@SuppressWarnings("unchecked")
	private void ensureRoleGroupID2Name()
	{
		if(roleGroupID2Name == null)
		{
			synchronized(CACHE_ID_TO_Name_ROLEGROUP)
			{
				if(roleGroupID2Name == null)
				{
					roleGroupID2Name = new HashMap<Integer, String>();
					StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
					List<Object> ls = (List<Object>) dao.getQueryList("select roleGroupId,roleGroupName from SmRoleGroup");
					if(ls != null && ls.size() > 0)
					{
						for(Object ob : ls)
						{
							Object[] o = (Object[]) ob;
							roleGroupID2Name.put((Integer) o[0],(String) o[1]);
						}
					}
				}
			}
		}
	}
	
	public void clearRoleGroupId2Name()
	{
		if(roleGroupID2Name != null)
		{
			synchronized(CACHE_ID_TO_Name_ROLEGROUP)
			{
				if(roleGroupID2Name != null)
				{
					roleGroupID2Name = null;
				}
			}
		}
	}
	
	public String getSmCrossingName(String crossingCode)
	{
		ensureSmCrossingName(crossingCode);
		return smCrossingNameMap.get(crossingCode);
	}
	
	@SuppressWarnings("unchecked")
	private void ensureSmCrossingName(String crossingCode)
	{
		if(smCrossingNameMap == null || smCrossingNameMap.get(crossingCode) == null)
		{
			synchronized(SESSION_SM_CROSSING_NAME)
			{
				if(smCrossingNameMap == null || smCrossingNameMap.get(crossingCode) == null)
				{
					String hql = "select crossingCode,crossingName from SmCrossing where crossingCode like '53%'";
					if(smCrossingNameMap == null)
					{
						smCrossingNameMap = new HashMap<String,String>();
					}else{
						hql = "select crossingCode,crossingName from SmCrossing where crossingCode ="+crossingCode;
					}
					StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
					List<Object[]> ls = (List<Object[]>) dao.getQueryList(hql);
					if(ls != null && ls.size() > 0)
					{
						for(Object o[] : ls)
						{
							smCrossingNameMap.put(o[0].toString(), o[1].toString());
						}
					}
				}
			}
		}
	}
	
	public void clearSmCrossingName()
	{
		if(smCrossingNameMap != null)
		{
			synchronized(SESSION_SM_CROSSING_NAME)
			{
				if(smCrossingNameMap != null)
				{
					smCrossingNameMap.clear();
					smCrossingNameMap = null;
				}
			}
		}
	}
	
	private static final byte[] SESSION_SM_CROSSING_ALL = new byte[0];
	private static List<Object[]> smCrossingMap = null;
	public List<Object[]> getSmCrossing()
	{
		ensureSmCrossing();
		return smCrossingMap;
	}
	
	@SuppressWarnings("unchecked")
	private void ensureSmCrossing()
	{
		if(smCrossingMap == null)
		{
			smCrossingMap = new ArrayList<Object[]>();
			synchronized(SESSION_SM_CROSSING_ALL)
			{
				String hql = "select crossingCode,crossingName from SmCrossing where crossingCode like '53%'";
				StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
				List<Object[]> ls = (List<Object[]>) dao.getQueryList(hql);
				if(ls != null && ls.size() > 0)
				{
					for(Object o[] : ls)
					{
						smCrossingMap.add(o);
					}
				}
			}
		}
	}
	
	public void clearSmCrossing()
	{
		if(smCrossingMap != null)
		{
			synchronized(SESSION_SM_CROSSING_ALL)
			{
				if(smCrossingMap != null)
				{
					smCrossingMap.clear();
					smCrossingMap = null;
				}
			}
		}
	}
	
	public String getOrgCodeDepId(String orgCode)
	{
		ensureOrgCodeDepId(orgCode);
		return orgCodeDepIdMap.get(orgCode);
	}
	
	@SuppressWarnings("unchecked")
	private void ensureOrgCodeDepId(String orgCode)
	{
		if(orgCodeDepIdMap == null || orgCodeDepIdMap.get(orgCode)== null)
		{
			synchronized(ORG_CODE_DEP_ID)
			{
				if(orgCodeDepIdMap == null || orgCodeDepIdMap.get(orgCode)== null)
				{
					String hql = "select depId,uuid from SmDepartment where uuid is not null ";
					if(orgCodeDepIdMap == null)
					{
						orgCodeDepIdMap = new HashMap<String, String>();
					}else{
						hql = "select depId,uuid from SmDepartment where uuid="+orgCode;
					}
					StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
					List<Object[]> ls = (List<Object[]>) dao.getQueryList(hql);
					if(ls != null && ls.size() > 0)
					{
						for(Object o[] : ls)
						{
							orgCodeDepIdMap.put(o[1].toString(), o[0].toString());
						}
					}
				}
			}
		}
	}
	
	public void clearOrgCodeDepId()
	{
		if(orgCodeDepIdMap != null)
		{
			synchronized(ORG_CODE_DEP_ID)
			{
				if(orgCodeDepIdMap != null)
				{
					orgCodeDepIdMap.clear();
					orgCodeDepIdMap = null;
				}
			}
		}
	}
	
	private static final byte[] CACHE_ID_TO_MENU = new byte[0];
	private static Map<String,String[]> MenuInfo = null;
	public String[] getMenuInfoById(String menuId)
	{
		ensureMenuInfoById();
		return MenuInfo.get(menuId);
	}
	
	@SuppressWarnings("unchecked")
	public void ensureMenuInfoById()
	{
		if(MenuInfo == null)
		{
			synchronized(CACHE_ID_TO_MENU)
			{
				if(MenuInfo == null)
				{
					MenuInfo = new HashMap<String, String[]>();
					StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
					List<Object[]> ls = (List<Object[]>) dao.getQueryList("select menuId,menuName,menuUrl,scImageUrl,parentId from SmMenu where status=1");
					if(ls != null && ls.size() > 0)
					{
						for(Object[] ob:ls)
						{
							String menuId = (String) ob[0];
							menuId = menuId == null ? menuId : menuId.trim();
							String menuName = (String) ob[1];
							menuName = menuName == null ? menuName : menuName.trim();
							String menuUrl = (String) ob[2];
							menuUrl = menuUrl == null ? menuUrl : menuUrl.trim();
							String image = (String) ob[3];
							image = image == null ? image : image.trim();
							String parentId = (String) ob[4];
							parentId = parentId == null ? parentId : parentId.trim();
							MenuInfo.put(menuId, new String[]{menuName,menuUrl,image,parentId});
						}
					}
				}
			}
		}
	}
	
	public void clearMenuInfo()
	{
		if(MenuInfo != null)
		{
			synchronized(CACHE_ID_TO_MENU)
			{
				if(MenuInfo != null)
				{
					MenuInfo = null;
				}
			}
		}
	}
	
	private static final byte[] BT_INSPECTION_ENT_ALL = new byte[0];
	private static List<Object[]> BtInspectionEntAllInfo = null;
	public List<Object[]> getBtInspectionEntAllInfo()
	{
		btInspectionEntAllInfo();
		return BtInspectionEntAllInfo;
	}
	
	@SuppressWarnings("unchecked")
	public void btInspectionEntAllInfo()
	{
		if(BtInspectionEntAllInfo == null)
		{
			synchronized(BT_INSPECTION_ENT_ALL)
			{
				if(BtInspectionEntAllInfo == null)
				{
					BtInspectionEntAllInfo = null;
				}
			}
		}
	}
	
	public void clearBtInspectionEntAllInfo()
	{
		if(BtInspectionEntAllInfo != null)
		{
			synchronized(BT_INSPECTION_ENT_ALL)
			{
				if(BtInspectionEntAllInfo != null)
				{
					BtInspectionEntAllInfo = null;
				}
			}
		}
	}
	
	private static final byte[] BT_INSPECTION_ENT = new byte[0];
	private static Map<String,List<Object>> BtInspectionEntInfo = null;
	public List<Object> getBtInspectionEntInfoById(String id)
	{
		btInspectionEntInfoById(id);
		return BtInspectionEntInfo.get(id);
	}
	
	@SuppressWarnings("unchecked")
	public void btInspectionEntInfoById(String id)
	{
		if(BtInspectionEntInfo == null || BtInspectionEntInfo.get(id)== null)
		{
			synchronized(BT_INSPECTION_ENT)
			{
				if(BtInspectionEntInfo == null)
				{
					BtInspectionEntInfo = new HashMap<String,List<Object>>();
				}
				StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
				List<Object[]> ls = (List<Object[]>) dao.getQueryList("select entId,entCode,entCname,contactor,telephone,originalOrgCode,entCertTypeCode,certNo,chargingMethod from BtInspectionEnt where entId=?", id);
				List<Object> result = new ArrayList<Object>();
				if(ls != null && ls.size() > 0)
				{
					for(Object[] ob:ls)
					{
						Long entId = (Long) ob[0];
						String entOrgCode = (String) ob[1];
						String unitNameCn = (String) ob[2];
						String orgContactPersn = (String) ob[3];
						String contTel = (String) ob[4];
						String originalOrgCode = (String) ob[5];
						String entCertTypeCode = (String) ob[6];
						String certNo = (String) ob[7];
						String chargingMethod = (Long) ob[8]+"";
						result.add(entId);
						result.add(entOrgCode);
						result.add(unitNameCn);
						result.add(orgContactPersn);
						result.add(contTel);
						result.add(originalOrgCode);
						result.add(entCertTypeCode);
						result.add(certNo);
						result.add(chargingMethod);
						BtInspectionEntInfo.put(entId+"", result);
					}
				}
			}
		}
	}
	
	public void clearBtInspectionEntInfo()
	{
		if(BtInspectionEntInfo != null)
		{
			synchronized(BT_INSPECTION_ENT)
			{
				if(BtInspectionEntInfo != null)
				{
					BtInspectionEntInfo = null;
				}
			}
		}
	}
	
	private static final byte[] BT_INSPECTION_OWNER_ALL = new byte[0];
	private static List<Object[]> BtInspectionOwnerAllInfo = null;
	public List<Object[]> getBtInspectionOwnerAllInfo()
	{
		btInspectionOwnerAllInfo();
		return BtInspectionOwnerAllInfo;
	}
	
	@SuppressWarnings("unchecked")
	public void btInspectionOwnerAllInfo()
	{
		if(BtInspectionOwnerAllInfo == null)
		{
			synchronized(BT_INSPECTION_OWNER_ALL)
			{
				if(BtInspectionOwnerAllInfo == null)
				{
					BtInspectionOwnerAllInfo = new ArrayList<Object[]>();
					StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
					List<Object[]> ls = (List<Object[]>)dao.getQueryList("select ownerId,ownerCode,ownerName,certTypeCode,certNo,telephone from BtInspectionOwner t where status not in(2,3,4)");
					if(ls != null && ls.size() > 0)
					{
						for(Object[] ob:ls)
						{
							BtInspectionOwnerAllInfo.add(ob);
						}
					}
				}
			}
		}
	}
	
	public void clearBtInspectionOwnerAllInfo()
	{
		if(BT_INSPECTION_OWNER_ALL != null)
		{
			synchronized(BT_INSPECTION_ENT_ALL)
			{
				if(BtInspectionOwnerAllInfo != null)
				{
					BtInspectionOwnerAllInfo = null;
				}
			}
		}
	}
	
	private static final byte[] BT_INSPECTION_OWNER = new byte[0];
	private static Map<String,List<Object>> BtInspectionOwnerInfo = null;
	public List<Object> getBtInspectionOwnerInfoById(String id)
	{
		btInspectionOwnerInfoById(id);
		return BtInspectionOwnerInfo.get(id);
	}
	
	@SuppressWarnings("unchecked")
	public void btInspectionOwnerInfoById(String id)
	{
		if(BtInspectionOwnerInfo == null || BtInspectionOwnerInfo.get(id) == null)
		{
			synchronized(BT_INSPECTION_OWNER)
			{
				if(BtInspectionOwnerInfo == null)
				{
					BtInspectionOwnerInfo = new HashMap<String, List<Object>>();
				}
				StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
				List<Object[]> ls = (List<Object[]>) dao.getQueryList("select ownerId,ownerCode,ownerName,certTypeCode,certNo,telephone,chargingMethod,cntRgnId from BtInspectionOwner where status in (0,1) and ownerId=?", id);
				List<Object> result = new ArrayList<Object>();
				if(ls != null && ls.size() > 0)
				{
					for(Object[] ob:ls)
					{
						Long ownerId = (Long) ob[0];
						String declPersonCode = (String) ob[1];
						String declPersonName = (String) ob[2];
						String certTypeName = (String) ob[3];
						String idCartNo = (String) ob[4];
						String mobile = (String) ob[5];
						String chargingMethod = (Long) ob[6]+"";
						String cntRgnId = (String) ob[7];
						
						result.add(ownerId);
						result.add(declPersonCode);
						result.add(declPersonName);
						result.add(certTypeName);
						result.add(idCartNo);
						result.add(mobile);
						result.add(chargingMethod);
						result.add(cntRgnId);
						BtInspectionOwnerInfo.put(ownerId+"", result);
					}
				}
			}
		}
	}
	
	public void clearBtInspectionOwnerInfo()
	{
		if(BtInspectionOwnerInfo != null)
		{
			synchronized(BT_INSPECTION_OWNER)
			{
				if(BtInspectionOwnerInfo != null)
				{
					BtInspectionOwnerInfo = null;
				}
			}
		}
	}
	
	private static final byte[] SM_COUNTRY_REGION = new byte[0];
	private static Map<String,Object[]> smCountryName = null;
	private static List<Object[]> smCountryRegion = null;
	public List<Object[]> findSmCountryRegion()
	{
		ensureSmCountryRegion(null);
		return smCountryRegion;
	}
	
	public Object[] getCountryByCodeOrAlias(String value)
	{
		ensureSmCountryRegion(value);
		return smCountryName.get(value);
	}
	
	@SuppressWarnings("unchecked")
	public void ensureSmCountryRegion(String value)
	{
		if(smCountryRegion == null || smCountryName == null || (value != null && smCountryName.get(value) == null))
		{
			synchronized(SM_COUNTRY_REGION)
			{
				if(smCountryRegion == null)
				{
					smCountryRegion = new ArrayList<Object[]>();
				}
				if(smCountryName == null)
				{
					smCountryName = new HashMap<String, Object[]>();
				}
				StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
				smCountryRegion = (List<Object[]>) dao.getQueryList("select itemcode,cname,alias3 from SmCountryRegion t where flag = 0 and itemcode<>00 order by t.orderNum desc");
				Object[] obj = null;
				for(int i = 0;i < smCountryRegion.size();i++)
				{
					obj = smCountryRegion.get(i);
					smCountryName.put(String.valueOf(obj[0]), new Object[]{obj[1],obj[2]});
					smCountryName.put(String.valueOf(obj[2]), new Object[]{obj[1],obj[0]});
				}
			}
			if(Utils.notEmpty(value) && smCountryName.get(value) == null)
			{
				StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
				Object[] obj = (Object[]) dao.getObject("select itemcode,cname,alias3 from SmCountryRegion t where flag=0 and (alias3=? or itemcode=?) order by t.orderNum desc",value,value);
				if(obj != null)
				{
					smCountryRegion.add(obj);
					smCountryName.put(String.valueOf(obj[0]), new Object[]{obj[1],obj[2]});
					smCountryName.put(String.valueOf(obj[2]), new Object[]{obj[1],obj[0]});
				}
			}
		}
	}
	
	private static Map<String, List<String>> userDefInfo = null;
	private static String USER_DEF_INFO = "userDefInfo";
	
	public void clearUserCountryCrossing(String orgId,boolean isClearAll)
	{
		if(userDefInfo != null)
		{
			synchronized(USER_DEF_INFO)
			{
				if(userDefInfo != null)
				{
					if(isClearAll)
					{
						userDefInfo.clear();
					}else{
						userDefInfo.remove(orgId);
					}
				}
			}
		}
	}
	
	public void setTempExceInfos(String orgCode,Object[] arr)
	{
		tempExceMap.put(orgCode, arr);
	}
	
	public Object[] getTempExceInfos(String orgCode)
	{
		return tempExceMap.get(orgCode);
	}
	
	private static String QUERY_ORG_CODE = "query_org_code";
	private Map<String,List<String>> queryOrgCode = new HashMap<String,List<String>>();
	public List<String> getQueryOrgCode(String userId)
	{
		ensureQueryOrgCode(userId);
		return queryOrgCode.get(userId);
	}
	
	public void ensureQueryOrgCode(String userId)
	{
		if(queryOrgCode == null || queryOrgCode.get(userId) == null)
		{
			synchronized(QUERY_ORG_CODE)
			{
				if(queryOrgCode == null || queryOrgCode.get(userId) == null)
				{
					StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
					String queryRange = RoleAndPermsUtils.getQueryScope(userId,RoleAndPermsUtils.query_port);
					String hql = "";
					if(RoleAndPermsUtils.ALL.equals(queryRange))
					{
						hql = "select uuid from SmDepartment where depType ='0' order by depId desc";
					}else if(RoleAndPermsUtils.ORG.equals(queryRange))
					{
						String userOrgCode = CacheDataService.getDeptUUID(CacheDataService.getUserDeptById(userId)[0].toString());
						userOrgCode = userOrgCode.substring(0,6);
						hql = "select uuid from SmDepartment where depType='0' and uuid='"+userOrgCode+"'";
					}else if(RoleAndPermsUtils.ORG_AND_CHILD.equals(queryRange))
					{
						List<Object> userInfo = CacheDataService.getUserInfo(userId);
						String orgId = String.valueOf(userInfo.get(4));
						hql = "select uuid from SmDepartment where depType='0' and levelCode like '%/"+orgId+"/%' or levelCode like '%/"+orgId+"' or levelCode like '"+orgId+"/%' or depId ='"+orgId+"'";
					}
					List<String> queryList = (List<String>) dao.getQueryList(hql);
					queryOrgCode.put(userId, queryList);
				}
			}
		}
	}
	
	public void clearQueryOrgCode(String userId)
	{
		if(queryOrgCode != null || queryOrgCode.get(userId) != null)
		{
			synchronized(QUERY_ORG_CODE)
			{
				if(queryOrgCode != null || queryOrgCode.get(userId) != null)
				{
					queryOrgCode.remove(userId);
				}
			}
		}
	}

}
