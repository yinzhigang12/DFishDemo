package com.rongji.df.dao;

import java.io.Serializable;
import java.util.List;

import org.hibernate.Session;

import com.rongji.df.entity.EntityObject;
import com.rongji.dfish.base.Page;

public interface GenericDao {
	Serializable save(EntityObject object);
	<T extends EntityObject> T getObject(Class<T> clazz,Serializable id);
	Object getObject(final String hql,final Object... object);
	void update(EntityObject object);
	EntityObject merge(EntityObject object);
	void evict(EntityObject object);
	void delete(EntityObject object);
	int delete(String hql,Object... object);
	int executeUpdate(String hql,Object... args);
	List<?> getQueryList(final String hql,final Object... args);
	List<?> getQueryList(final Page page,boolean autoGetRowCount,final String hql,final Object... args);
	Session getSession();
	Object findDataBySql(String sql);
	int executeUpdateBySql(String sql,Object... args);

}
