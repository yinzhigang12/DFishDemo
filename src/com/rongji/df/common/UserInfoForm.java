package com.rongji.df.common;

import java.util.List;

import com.rongji.dfish.base.Utils;

public class UserInfoForm {
	private Long userId;
	private String empName;
	private Long depId;
	private String depName;
	private Long orgId;
	private String orgName;
	private String orgUuid;
	private String orgLevelCode;
	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	public String getEmpName() {
		return empName;
	}
	public void setEmpName(String empName) {
		this.empName = empName;
	}
	public Long getDepId() {
		return depId;
	}
	public void setDepId(Long depId) {
		this.depId = depId;
	}
	public String getDepName() {
		return depName;
	}
	public void setDepName(String depName) {
		this.depName = depName;
	}
	public Long getOrgId() {
		return orgId;
	}
	public void setOrgId(Long orgId) {
		this.orgId = orgId;
	}
	public String getOrgName() {
		return orgName;
	}
	public void setOrgName(String orgName) {
		this.orgName = orgName;
	}
	public String getOrgUuid() {
		return orgUuid;
	}
	public void setOrgUuid(String orgUuid) {
		this.orgUuid = orgUuid;
	}
	public String getOrgLevelCode() {
		return orgLevelCode;
	}
	public void setOrgLevelCode(String orgLevelCode) {
		this.orgLevelCode = orgLevelCode;
	}
	
	public static UserInfoForm getUserInfo(String userId)
	{
		List<Object> list = null;
		UserInfoForm userInfo = null;
		if(Utils.notEmpty(userId))
		{
			list = CacheDataService.getUserInfo(userId);
			if(list.size() > 0 && list != null)
			{
				userInfo = new UserInfoForm();
				userInfo.setUserId(Integer.valueOf((Integer)list.get(0)).longValue());
				userInfo.setEmpName((String)list.get(1));
				userInfo.setDepId(Integer.valueOf((Integer)list.get(2)).longValue());
				userInfo.setDepName((String)list.get(3));
				userInfo.setOrgId(Integer.valueOf((Integer)list.get(4)).longValue());
				userInfo.setOrgName((String)list.get(5));
				userInfo.setOrgUuid((String)list.get(7));
				userInfo.setOrgLevelCode((String)list.get(8));
				return userInfo;
			}
		}
		return null;
	}

}
