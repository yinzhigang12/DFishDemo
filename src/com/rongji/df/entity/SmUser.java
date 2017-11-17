package com.rongji.df.entity;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import org.springframework.format.annotation.DateTimeFormat;
/**
 * 员工表
 * @author qzc
 *
 */
@Entity
@Table(name="SM_USER")
public class SmUser extends EntityObject {
	/**
	 *主键id 
	 */
//	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="SEQ_SM_USER")
//	@SequenceGenerator(name="SEQ_SM_USER", sequenceName="SEQ_SM_USER")
	@Id
	@Column(name="USER_ID", precision=10)
	private Integer userId;
	/**
	 * 登录名
	 */
	@Column(name="LOGIN_NAME", length=30, nullable=false, unique=true)
	private String loginName;
	/***
	 *登录密码 
	 */
	@Column(name="PASSWORD", length=32, nullable=false)
	private String password;
	/**
	 *员工名 
	 */
	@Column(name="EMP_NAME", length=30, nullable=false)
	private String empName;
	@Column(name="SEX", length=10)
	private String sex;
	/**
	 * 机构或部门id
	 */
	@Column(name="DEP_ID", precision = 10)
	private Integer depId;
	
	@Column(name="DEP_NAME", length= 50)
	private String depName;
	//电话
	@Column(name="TEL", length=30)
	private String tel;
	//手机
	@Column(name="PHONE", length=30)
	private String phone;
	
	@Column(name="EMAIL", length=30)
	private String email;
	/**
	 *排序号 
	 */
	@Column(name="ORDER_NUM", precision=10)
	private Integer orderNum;
	/**
	 *身份证号码 
	 */
	@Column(name="IDENTITY_CARD", length=20)
	private String identityCard;
	/**
	 * 职务职称
	 */
	@Column(name="JOB_TITLE", length=50)
	private String jobTitle;
	
	@Temporal(TemporalType.DATE)
	@DateTimeFormat(pattern="yyyy-MM-dd")
	@Column(name="CREATE_DATE")
	private Date createDate;
	
	@Temporal(TemporalType.DATE)
	@DateTimeFormat(pattern="yyyy-MM-dd")
	@Column(name="UPDATE_DATE")
	private Date updateDate;
	/**
	 * 是否是内置管理员账号，1：是；0：否；默认值为0；
	 * 是root账号，表示为系统初始超级管理员账号。
	 */
	@Column(name="IS_ROOT", length=1)
	private String isRoot = "0";
	/**
	 * 该人员状态： 0：内置； 1：在岗； 2：离职
	 */
	@Column(name="STATUS", length=1)
	private String status;
	/**
	 * 使用状态： 0：禁用； 1：启用
	 */
	@Column(name="USE_STATU", length=1)
	private Integer useStatu=1;
	/**
	 * 2017-10-12 新增本系统的用户使用状态，上面的useStatus表示是从
	 * 局里oa办公系统同步过来的使用状态，useStatu优先级要高,所以先判断useStatu的值，
	 * 在判断userstatu的值。
	 * 使用状态： 0：禁用； 1：启用，默认值为：0；
	 */
	@Column(name="ynbiq_user_statu", length=1)
	private Integer userStatu=0;
	
	@Column(name="REMARK", length=255)
	private String remark;
	
	/**
	 * app客户端ID
	 */
	@Column(name="CLIENT_ID", length=128)
	private String clientId;
	/**
	 * 是否新增，用户数据来源可为该系统新增，也可以是从其他系统同步过来的
	 * 值： 0：同步；1：新增
	 */
	@Column(name="NEWSWIN", length=1)
	private String newswin = "1";
	/**
	 *角色名称，多个角色用逗号隔开。 
	 */
	@Column(name="ROLE_NAMES", length=500)
	private String roleNames;
	/**
	 * 角色组名称，多个角色组用逗号隔开
	 */
	@Column(name="ROLE_GROUP_NAMES", length=500)
	private String roleGroupNames;
//	/**
//	 * 用户的多个角色
//	 */
//    @ManyToMany(fetch=FetchType.LAZY, cascade=CascadeType.MERGE)
//    @JoinTable(name="SM_USER_ROLE",joinColumns=@JoinColumn(name="USER_ID"),
//    inverseJoinColumns=@JoinColumn(name="ROLE_ID"))
//	private List<SmRole> roles;
//    /**
//     * 用户的多个角色组
//     */
//    @ManyToMany(fetch=FetchType.LAZY)
//    @JoinTable(name="SM_USER_ROLE_GROUP",joinColumns=@JoinColumn(name="USER_ID"),
//    inverseJoinColumns=@JoinColumn(name="ROLE_GROUP_ID"))
//	private List<SmRoleGroup> roleGroups;
    
	public Integer getUserId() {
		return userId;
	}
	public void setUserId(Integer userId) {
		this.userId = userId;
	}
	public String getLoginName() {
		return loginName;
	}
	public void setLoginName(String loginName) {
		this.loginName = loginName;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getEmpName() {
		return empName;
	}
	public void setEmpName(String empName) {
		this.empName = empName;
	}
	public String getSex() {
	    
		return sex.equals("1") ? "女" : "男";
	}
	public void setSex(String sex) {
		this.sex = sex;
	}
	public String getTel() {
		return tel;
	}
	public void setTel(String tel) {
		this.tel = tel;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public Integer getOrderNum() {
		return orderNum;
	}
	public void setOrderNum(Integer orderNum) {
		this.orderNum = orderNum;
	}
	public String getIdentityCard() {
		return identityCard;
	}
	public void setIdentityCard(String identityCard) {
		this.identityCard = identityCard;
	}
	public String getJobTitle() {
		return jobTitle;
	}
	public void setJobTitle(String jobTitle) {
		this.jobTitle = jobTitle;
	}
	public Date getCreateDate() {
		return createDate;
	}
	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}
	public Date getUpdateDate() {
		return updateDate;
	}
	public void setUpdateDate(Date updateDate) {
		this.updateDate = updateDate;
	}
	public String getIsRoot() {
		return isRoot;
	}
	public void setIsRoot(String isRoot) {
		this.isRoot = isRoot;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getRemark() {
		return remark;
	}
	public void setRemark(String remark) {
		this.remark = remark;
	}
	public String getNewswin() {
		return newswin;
	}
	public void setNewswin(String newswin) {
		this.newswin = newswin;
	}
	public String getRoleNames() {
		return roleNames;
	}
	public void setRoleNames(String roleNames) {
		this.roleNames = roleNames;
	}
	public String getRoleGroupNames() {
		return roleGroupNames;
	}
	public void setRoleGroupNames(String roleGroupNames) {
		this.roleGroupNames = roleGroupNames;
	}
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
	public Integer getUseStatu() {
		return useStatu;
	}
	public void setUseStatu(Integer useStatu) {
		this.useStatu = useStatu;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	
	public String getClientId() {
		return clientId;
	}
	public void setClientId(String clientId) {
		this.clientId = clientId;
	}
	public Integer getUserStatu() {
		return userStatu;
	}
	public void setUserStatu(Integer userStatu) {
		this.userStatu = userStatu;
	}
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((userId == null) ? 0 : userId.hashCode());
		return result;
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		SmUser other = (SmUser) obj;
		if (userId == null) {
			if (other.userId != null)
				return false;
		} else if (!userId.equals(other.userId))
			return false;
		return true;
	}
	@Override
	public String toString() {
		return "SmUser [userId=" + userId + ", loginName=" + loginName
				+ ", password=" + password
				+ ", empName=" + empName + ", sex=" + sex + ", depId=" + depId
				+ ", depName=" + depName + ", tel=" + tel + ", email=" + email
				+ ", orderNum=" + orderNum + ", identityCard=" + identityCard
				+ ", jobTitle=" + jobTitle + ", createDate=" + createDate
				+ ", updateDate=" + updateDate + ", isRoot=" + isRoot
				+ ", status=" + status + ", remark=" + remark
				+ ", newswin=" + newswin + ", roleNames=" + roleNames
				+ ", roleGroupNames=" + roleGroupNames + "]";
	}
	
}
