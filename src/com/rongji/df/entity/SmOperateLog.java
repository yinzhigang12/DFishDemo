package com.rongji.df.entity;

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
@Table(name = "SM_OPERATE_LOG")
public class SmOperateLog extends EntityObject {
	@Id
	@GeneratedValue(strategy=GenerationType.SEQUENCE,generator="SEQ_SM_OPERATE_LOG")
	@SequenceGenerator(name="SEQ_SM_OPERATE_LOG",sequenceName="SEQ_SM_OPERATE_LOG")
	@Column(name="LOG_ID",precision=10)
	private Integer logId;
	
	@Column(name="USER_ID",precision=10,nullable=false)
	private Integer userId;
	
	@Column(name="USER_NAME",length=30)
	private String userName;
	
	@Column(name="DEP_NAME",length=50)
	private String depName;
	
	@Column(name="CONTENT",length=252)
	private String content;
	
	@Temporal(TemporalType.TIMESTAMP)
	@DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss")
	@Column(name="OPERATE_DATE")
	private Date operateDate;

	public Integer getLogId() {
		return logId;
	}

	public void setLogId(Integer logId) {
		this.logId = logId;
	}

	public Integer getUserId() {
		return userId;
	}

	public void setUserId(Integer userId) {
		this.userId = userId;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getDepName() {
		return depName;
	}

	public void setDepName(String depName) {
		this.depName = depName;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public Date getOperateDate() {
		return operateDate;
	}

	public void setOperateDate(Date operateDate) {
		this.operateDate = operateDate;
	}
	
	
}
