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
@Table(name = "SM_SHORTCUT_APP")
public class SmShortcutApp extends EntityObject implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -3992604994350286599L;

	@Id
	@GeneratedValue(strategy=GenerationType.SEQUENCE,generator="SEQ_SM_SHORTCUT_APP")
	@SequenceGenerator(name="SEQ_SM_SHORTCUT_APP",sequenceName="SEQ_SM_SHORTCUT_APP")
	@Column(name="ID",precision=10)
	private Long id;
	
	@Column(name="MENU_ID",length=30)
	private String menuId;
	
	@Column(name="USER_ID",length=10)
	private String userId;
	
	@Column(name="MENU_PATH",length=40)
	private String menuPath;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getMenuId() {
		return menuId;
	}

	public void setMenuId(String menuId) {
		this.menuId = menuId;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getMenuPath() {
		return menuPath;
	}

	public void setMenuPath(String menuPath) {
		this.menuPath = menuPath;
	}
	
}
