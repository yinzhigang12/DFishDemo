package com.rongji.df.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name="SM_MENU")
public class SmMenu extends EntityObject {
	
	@Id
	@Column(name="MENU_ID",length=50)
	private String menuId;
	@Column(name="PARENT_ID",length=50)
	private String parentId;
	@Column(name="MENU_TYPE",length=10)
	private String menuType;
	@Column(name="MENU_NAME",length=50)
	private String menuName;
	@Column(name="MENU_URL",length=200)
	private String menuUrl;
	@Column(name="RESOURCE_ID",length=10)
	private String resourceId;
	@Column(name="STATUS",precision=3)
	private Integer status=1;
	@Column(name="IMAGE_URL",length=200)
	private String imageUrl;
	@Column(name="SC_IMAGE_URL",length=200)
	private String scImageUrl;
	@Column(name="ORDER_NUM",precision=10)
	private Integer orderNum;
	public String getMenuId() {
		return menuId;
	}
	public void setMenuId(String menuId) {
		this.menuId = menuId;
	}
	public String getParentId() {
		return parentId;
	}
	public void setParentId(String parentId) {
		this.parentId = parentId;
	}
	public String getMenuType() {
		return menuType;
	}
	public void setMenuType(String menuType) {
		this.menuType = menuType;
	}
	public String getMenuName() {
		return menuName;
	}
	public void setMenuName(String menuName) {
		this.menuName = menuName;
	}
	public String getMenuUrl() {
		return menuUrl;
	}
	public void setMenuUrl(String menuUrl) {
		this.menuUrl = menuUrl;
	}
	public String getResourceId() {
		return resourceId;
	}
	public void setResourceId(String resourceId) {
		this.resourceId = resourceId;
	}
	public Integer getStatus() {
		return status;
	}
	public void setStatus(Integer status) {
		this.status = status;
	}
	public String getImageUrl() {
		return imageUrl;
	}
	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}
	public String getScImageUrl() {
		return scImageUrl;
	}
	public void setScImageUrl(String scImageUrl) {
		this.scImageUrl = scImageUrl;
	}
	public Integer getOrderNum() {
		return orderNum;
	}
	public void setOrderNum(Integer orderNum) {
		this.orderNum = orderNum;
	}
	@Override
	public String toString()
	{
		return "SmMenu [menuId="+menuId+", parentId="+parentId+", menuType="+menuType+",menuName="+menuName+", menuUrl="
				+menuUrl+", resourceId="+resourceId+", status="+status+", imageUrl="+imageUrl+", orderNum"+orderNum+"]";
	}

}
