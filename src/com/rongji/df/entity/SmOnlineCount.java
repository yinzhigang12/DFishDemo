package com.rongji.df.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name = "SM_ONLINE_COUNT")
public class SmOnlineCount extends EntityObject {
	@Id
	@GeneratedValue(strategy=GenerationType.SEQUENCE,generator="SEQ_SM_ONLINE_COUNT")
	@SequenceGenerator(sequenceName="SEQ_SM_ONLINE_COUNT",name="SEQ_SM_ONLINE_COUNT")
	@Column(name = "COUNT_ID",precision=10)
	private Long countId;
	
	@Column(name="COUNT_NUM",precision=10)
	private Integer countNum;
	
	@Column(name="UPDATE_DATE",length=10)
	private String updateDate;
	
	@Column(name="UPDATE_TIME",length=8)
	private String updateTime;

	public Long getCountId() {
		return countId;
	}

	public void setCountId(Long countId) {
		this.countId = countId;
	}

	public Integer getCountNum() {
		return countNum;
	}

	public void setCountNum(Integer countNum) {
		this.countNum = countNum;
	}

	public String getUpdateDate() {
		return updateDate;
	}

	public void setUpdateDate(String updateDate) {
		this.updateDate = updateDate;
	}

	public String getUpdateTime() {
		return updateTime;
	}

	public void setUpdateTime(String updateTime) {
		this.updateTime = updateTime;
	}
	
	
}
