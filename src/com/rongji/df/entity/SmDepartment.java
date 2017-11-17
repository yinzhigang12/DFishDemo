package com.rongji.df.entity;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "SM_DEPARTMENT")
public class SmDepartment extends EntityObject implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 7000915534423001321L;

	@Id
	@Column(name="DEP_ID",precision=10)
	private Integer depId;
	
	@Column(name="DEP_NAME",length=50,nullable=false)
	private String depName;
	@Column(name="PARENT_ID")
	private Integer parentId;
	@Column(name="PARENT_DEP_NAME",length=50)
	private String parentDepName;
	@Column(name="LEVEL_CODE",length=60)
	private String levelCode;
	@Column(name="DEP_TYPE",length=4)
	private String depType;
	@Column(name="ADDRESS",length=60)
	private String address;
	@Column(name="PHONE",length=60)
	private String phone;
	@Column(name="FAX",length=30)
	private String fax;
	@Column(name="EMALL",length=60)
	private String email;
	@Column(name="WEB",length=60)
	private String web;
	@Column(name="ORDER_NUM",precision=13)
	private Long orderNum;
	@Column(name="STATUS",precision=3,nullable=false)
	private Integer status;
	@Column(name="REMARK",length=255)
	private String remark;
	@Column(name="CORP_ID",precision=10)
	private Integer corpId;
	@Column(name="UUID",length=16)
	private String uuid;
	@Column(name="DEP_CATEGORY",precision=3)
	private Integer depCategory;
	public Integer getDepId() {
		return depId;
	}
	public void setDepId(Integer depId) {
		this.depId = depId;
	}
	public String getDepName() {
		return depName;
	}
	public void setDepName(String depName) {
		this.depName = depName;
	}
	public Integer getParentId() {
		return parentId;
	}
	public void setParentId(Integer parentId) {
		this.parentId = parentId;
	}
	public String getParentDepName() {
		return parentDepName;
	}
	public void setParentDepName(String parentDepName) {
		this.parentDepName = parentDepName;
	}
	public String getLevelCode() {
		return levelCode;
	}
	public void setLevelCode(String levelCode) {
		this.levelCode = levelCode;
	}
	public String getDepType() {
		return depType;
	}
	public void setDepType(String depType) {
		this.depType = depType;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public String getFax() {
		return fax;
	}
	public void setFax(String fax) {
		this.fax = fax;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getWeb() {
		return web;
	}
	public void setWeb(String web) {
		this.web = web;
	}
	public Long getOrderNum() {
		return orderNum;
	}
	public void setOrderNum(Long orderNum) {
		this.orderNum = orderNum;
	}
	public Integer getStatus() {
		return status;
	}
	public void setStatus(Integer status) {
		this.status = status;
	}
	public String getRemark() {
		return remark;
	}
	public void setRemark(String remark) {
		this.remark = remark;
	}
	public Integer getCorpId() {
		return corpId;
	}
	public void setCorpId(Integer corpId) {
		this.corpId = corpId;
	}
	public String getUuid() {
		return uuid;
	}
	public void setUuid(String uuid) {
		this.uuid = uuid;
	}
	public Integer getDepCategory() {
		return depCategory;
	}
	public void setDepCategory(Integer depCategory) {
		this.depCategory = depCategory;
	}
	public static long getSerialversionuid() {
		return serialVersionUID;
	}
	@Override
	public String toString() {
		return "SmDepartment [depId=" + depId + ", depName=" + depName + ", parentId=" + parentId + ", parentDepName="
				+ parentDepName + ", levelCode=" + levelCode + ", depType=" + depType + ", address=" + address
				+ ", phone=" + phone + ", fax=" + fax + ", email=" + email + ", web=" + web + ", orderNum=" + orderNum
				+ ", status=" + status + ", remark=" + remark + ", corpId=" + corpId + ", uuid=" + uuid
				+ ", depCategory=" + depCategory + "]";
	}
	
	
	
}
