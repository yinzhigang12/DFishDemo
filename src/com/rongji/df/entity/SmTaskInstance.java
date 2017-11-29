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
@Table(name="SM_TASK_INSTANCE")
public class SmTaskInstance extends EntityObject implements Serializable {

	@Id
	@GeneratedValue(strategy=GenerationType.SEQUENCE,generator="SEQ_SM_TASK_INSTANCE")
	@SequenceGenerator(name="SEQ_SM_TASK_INSTANCE",sequenceName="SEQ_SM_TASK_INSTANCE")
	@Column(name = "TASK_ID", precision=10)
	private Long taskId;
	
	@Column(name="DEF_ID",precision=10,nullable=false)
	private Long defId;
	
	@Temporal(TemporalType.TIMESTAMP)
	@DateTimeFormat(pattern="yyyy-MM-dd hh:mm:ss")
	@Column(name="START_TIME")
	private Date startTime;
	
	@Temporal(TemporalType.TIMESTAMP)
	@DateTimeFormat(pattern="yyyy-MM-dd hh:mm:ss")
	@Column(name="END_TIME")
	private Date endTime;
	
	@Column(name="EXECUTE_STATUS",length=4)
	private String executeStatus;
	
	@Column(name="EXECUTE_PERSON",precision=10)
	private Long executePerson;
	
	@Column(name="THIS_YEAR",precision=10)
	private Long thisYear;
	
	@Column(name="THIS_MONTH",precision=10)
	private Long thisMonth;
	
	@Column(name="THIS_WEEK",precision=10)
	private Long thisWeek;
	
	@Column(name="THIS_WEEK_DATE",precision=10)
	private Long thisWeekDate;
	
	@Column(name="THIS_DAY",precision=10)
	private Long thisDay;
	
	@Column(name="THIS_TIME",length=8)
	private String thisTime;
	
	@Column(name="STATUS",precision=1,nullable=false)
	private Long status;
	
	@Column(name="REMARK",length=255)
	private String remark;

	public Long getTaskId() {
		return taskId;
	}

	public void setTaskId(Long taskId) {
		this.taskId = taskId;
	}

	public Long getDefId() {
		return defId;
	}

	public void setDefId(Long defId) {
		this.defId = defId;
	}

	public Date getStartTime() {
		return startTime;
	}

	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}

	public Date getEndTime() {
		return endTime;
	}

	public void setEndTime(Date endTime) {
		this.endTime = endTime;
	}

	public String getExecuteStatus() {
		return executeStatus;
	}

	public void setExecuteStatus(String executeStatus) {
		this.executeStatus = executeStatus;
	}

	public Long getExecutePerson() {
		return executePerson;
	}

	public void setExecutePerson(Long executePerson) {
		this.executePerson = executePerson;
	}

	public Long getThisYear() {
		return thisYear;
	}

	public void setThisYear(Long thisYear) {
		this.thisYear = thisYear;
	}

	public Long getThisMonth() {
		return thisMonth;
	}

	public void setThisMonth(Long thisMonth) {
		this.thisMonth = thisMonth;
	}

	public Long getThisWeek() {
		return thisWeek;
	}

	public void setThisWeek(Long thisWeek) {
		this.thisWeek = thisWeek;
	}

	public Long getThisWeekDate() {
		return thisWeekDate;
	}

	public void setThisWeekDate(Long thisWeekDate) {
		this.thisWeekDate = thisWeekDate;
	}

	public Long getThisDay() {
		return thisDay;
	}

	public void setThisDay(Long thisDay) {
		this.thisDay = thisDay;
	}

	public String getThisTime() {
		return thisTime;
	}

	public void setThisTime(String thisTime) {
		this.thisTime = thisTime;
	}

	public Long getStatus() {
		return status;
	}

	public void setStatus(Long status) {
		this.status = status;
	}

	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}
	
	@Override
	public String toString() {
		StringBuffer sb = new StringBuffer();
		sb.append("{");
		sb.append("'taskId':'" + this.getTaskId() + "',");
		sb.append("'defId':'" + this.getDefId() + "',");
		sb.append("'startTime':'" + this.getStartTime() + "',");
		sb.append("'endTime':'"+this.getEndTime() +"',");
		sb.append("'executeStatus':'" + this.getExecuteStatus() + "',");
		sb.append("'executePerson':'" + this.getExecutePerson() + "',");
		sb.append("'thisYear':'"+this.getThisYear() + "',");
		sb.append("'thisMonth':'" + this.getThisMonth() + "',");
		sb.append("'thisWeek':'" + this.getThisWeek() + "',");
		sb.append("'thisWeekDate':'" + this.getThisWeekDate()+"',");
		sb.append("'thisDay':'" + this.getThisDay() +"',");
		sb.append("'thisTime':'" + this.getThisTime() +"',");
		sb.append("'status':'" + this.getStatus()+"',");
		sb.append("'remark':'" + this.getRemark() + "',");
		sb.append("}");
		return sb.toString();
	}
	
	public final static String NOT_EXECUTE = "0001";
	public final static String RUNNING = "0002";
	public final static String ABORT = "0003";
	public final static String FINISHED = "0004";
}
