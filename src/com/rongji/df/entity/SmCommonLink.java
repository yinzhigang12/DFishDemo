package com.rongji.df.entity;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import org.springframework.format.annotation.DateTimeFormat;

@Entity
@Table(name="SM_COMMON_LINK")
public class SmCommonLink extends EntityObject implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -1195441434684486232L;

	@Id
	@GeneratedValue(strategy=GenerationType.SEQUENCE,generator="SEQ_SM_COMMON_LINK")
	@SequenceGenerator(name="SEQ_SM_COMMON_LINK",sequenceName="SEQ_SM_COMMON_LINK")
	@Column(name="LINK_ID",precision=10)
	private Long linkId;
	
	@Column(name="LINK_NAME",length=50)
	private String linkName;
	
	@Column(name="LINK_URL",length=255)
	private String linkUrl;
	
	@Column(name="IMAGE_PATH",length=200)
	private String imagePath;
	
	@Column(name="IS_RELEASE",length=1)
	private String isRelease;
	
	@Column(name="ORDER_NUM",precision=10)
	private Integer orderNum;
	
	@DateTimeFormat(pattern="yyyy-MM-dd")
	@Temporal(TemporalType.DATE)
	@Column(name="CREATE_DATE")
	private Date createDate;

	public Long getLinkId() {
		return linkId;
	}

	public void setLinkId(Long linkId) {
		this.linkId = linkId;
	}

	public String getLinkName() {
		return linkName;
	}

	public void setLinkName(String linkName) {
		this.linkName = linkName;
	}

	public String getLinkUrl() {
		return linkUrl;
	}

	public void setLinkUrl(String linkUrl) {
		this.linkUrl = linkUrl;
	}

	public String getImagePath() {
		return imagePath;
	}

	public void setImagePath(String imagePath) {
		this.imagePath = imagePath;
	}

	public String getIsRelease() {
		return isRelease;
	}

	public void setIsRelease(String isRelease) {
		this.isRelease = isRelease;
	}

	public Integer getOrderNum() {
		return orderNum;
	}

	public void setOrderNum(Integer orderNum) {
		this.orderNum = orderNum;
	}

	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}
	
	
}
