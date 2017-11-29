package com.rongji.df.entity;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name="SM_TASK_DEFINITION")
public class SmTaskDefinition extends EntityObject implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 3661352209441954160L;
	
	@Id
	@GeneratedValue(strategy=GenerationType.SEQUENCE,generator="SEQ_SM_TASK_DEFINITION")
	@SequenceGenerator(name="SEQ_SM_TASK_DEFINITION",sequenceName="SEQ_SM_TASK_DEFINITION")
	@Column(name="DEF_ID",precision=10)
	private Long defId;
	
	@Column(name="DEF_CODE",length=200,nullable=false)
	private String defCode;
	
	@Column(name="DEF_NAME",length=50)
	private String defName;
	
	@Column(name="EXECUTE_METHOD",length=255,nullable=false)
	private String executeMethod;
	
	@Column(name="EXECUTE_TYPE",length=4)
	private String executeType;

	@Column(name="EXECUTE_MONTH_DATE",precision=10)
	private Long executeMonthDate;
	
	@Column(name="EXECUTE_WEEK_DATE",precision=10)
	private Long executeWeekDate;
	
	@Column(name="EXECUTE_TIME",length=8)
	private String executeTime;
	
	@Column(name="STATUS",precision=1,nullable=false)
	private Long status;
	
	@Column(name="REMARK",length=255)
	private String remark;
	
	@Column(name="TIME_OUT",precision=10)
	private Long timeOut;

	public Long getDefId() {
		return defId;
	}

	public void setDefId(Long defId) {
		this.defId = defId;
	}

	public String getDefCode() {
		return defCode;
	}

	public void setDefCode(String defCode) {
		this.defCode = defCode;
	}

	public String getDefName() {
		return defName;
	}

	public void setDefName(String defName) {
		this.defName = defName;
	}

	public String getExecuteMethod() {
		return executeMethod;
	}

	public void setExecuteMethod(String executeMethod) {
		this.executeMethod = executeMethod;
	}

	public String getExecuteType() {
		return executeType;
	}

	public void setExecuteType(String executeType) {
		this.executeType = executeType;
	}

	public Long getExecuteMonthDate() {
		return executeMonthDate;
	}

	public void setExecuteMonthDate(Long executeMonthDate) {
		this.executeMonthDate = executeMonthDate;
	}

	public Long getExecuteWeekDate() {
		return executeWeekDate;
	}

	public void setExecuteWeekDate(Long executeWeekDate) {
		this.executeWeekDate = executeWeekDate;
	}

	public String getExecuteTime() {
		return executeTime;
	}

	public void setExecuteTime(String executeTime) {
		this.executeTime = executeTime;
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

	public Long getTimeOut() {
		return timeOut;
	}

	public void setTimeOut(Long timeOut) {
		this.timeOut = timeOut;
	}
	
	public String toString()
	{
		StringBuffer sb = new StringBuffer();
		sb.append("{");
		sb.append("'defId':'"+this.getDefId()+"',");
		sb.append("'defCode':'"+this.getDefCode()+"',");
		sb.append("'defName':'"+this.getDefName()+"',");
		sb.append("'executeMethod':'"+this.getExecuteMethod()+"',");
		sb.append("'executeType':'"+this.getExecuteType()+"',");
		sb.append("'executeMonthDate':'"+this.getExecuteMonthDate()+"',");
		sb.append("'executeWeekDate':'"+this.getExecuteWeekDate()+"',");
		sb.append("'executeTime':'"+this.getExecuteTime()+"',");
		sb.append("'status':'"+this.getStatus()+"',");
		sb.append("'remark':'"+this.getRemark()+"',");
		sb.append("'timeout':'"+this.getTimeOut()+"',");
		sb.append("}");
		return sb.toString();
	}
	
	public final static String UNKNOWN = "0";
	public final static String MONTHLY = "0001";
	public final static String WEEKLY = "0002";
	public final static String DAILY = "0003";
	public final static String DAEMON = "0004";
	public final static String CRONEXP = "0005";
}
