package com.rongji.df.dao.impl;

import java.io.Serializable;
import java.util.List;

import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import com.rongji.df.dao.GenericDao;
import com.rongji.df.entity.EntityObject;
import com.rongji.dfish.base.Page;

@Repository("GenericDao")
public class GenericDaoImpl implements GenericDao {
	private static final boolean DEBUG = false;
	
	@Autowired
	@Qualifier("sessionFactory")
	private SessionFactory sessionFactory;

	@Override
	public Serializable save(EntityObject object) {
		if(object != null)
		{
			return getSession().save(object);
		}
		return null;
	}

	@SuppressWarnings("unchecked")
	public <T extends EntityObject> T getObject(Class<T> clazz, Serializable id) {
		// TODO 自动生成的方法存根
		return (T) getSession().get(clazz, id);
	}

	@Override
	public Object getObject(String hql, Object... object) {
		List<?> list = this.getQueryList(hql, object);
		if(list != null && list.size() > 0)
		{
			return list.get(0);
		}
		return null;
	}

	@Override
	public void update(EntityObject object) {
		if(object != null)
		{
			getSession().update(object);
		}
	}

	@Override
	public EntityObject merge(EntityObject object) {
		if(object != null)
		{
			return (EntityObject) getSession().merge(object);
		}
		return null;
	}

	@Override
	public void evict(final EntityObject object) {
		if(object != null)
		{
			getSession().evict(object);
		}
	}

	@Override
	public void delete(EntityObject object) {
		if(object != null)
		{
			getSession().delete(object);
		}
	}

	@Override
	public int delete(String hql, Object... object) {
		return executeUpdate(hql,object);
	}

	@Override
	public int executeUpdate(String hql, Object... args) {
		Query query = getSession().createQuery(hql);
		if(args != null)
		{
			for(int i = 0;i < args.length;i++)
			{
				setHqlQueryArguments(query,i,args[i]);
			}
		}
		int result = query.executeUpdate();
		getSession().flush();
		return result;
	}

	@Override
	public List<?> getQueryList(final String hql, final Object... args) {
		long beginTimeMillis = 0;
		if(DEBUG)
		{
			beginTimeMillis = System.currentTimeMillis();					
		}
		Query query = getSession().createQuery(hql);
		if(args != null)
		{
			for(int i = 0;i < args.length;i++)
			{
				setHqlQueryArguments(query,i,args[i]);
			}
		}
		
		List<?> list = query.list();
		if(DEBUG)
		{
			long endTimeMillis = System.currentTimeMillis();
			System.out.println("查询使用的HQL为："+hql+"\r\n查询时间为："+(endTimeMillis - beginTimeMillis)+"ms");
		}
		return list;
	}

	@Override
	public List<?> getQueryList(Page page, boolean autoGetRowCount, String hql, Object... args) {
		Session session = getSession();
		Query q = session.createQuery(hql);
		
		if(args != null)
		{
			for(int i = 0;i < args.length;i++)
			{
				setHqlQueryArguments(q,i,args[i]);
			}
		}
		
		if(autoGetRowCount)
		{
			hql = hql.trim();
			String upperHQL = hql.toUpperCase();
			if(upperHQL.indexOf("DISTINCT") < 0)
			{
				String hql4Count = hql;
				int i = 0;
				if((i = upperHQL.indexOf("FROM"))>= 0)
				{
					hql4Count = hql.substring(i);
					upperHQL = upperHQL.substring(i);
				}
				i = upperHQL.indexOf(" ORDER ");
				if( i > 0)
				{
					int j = upperHQL.indexOf(" BY ",i);
					if(j > 0)
					{
						if(upperHQL.substring(i+6,j).trim().length() == 0)
						{
							hql4Count = hql4Count.substring(0,i);
						}
					}
				}
				
				Query countQuery = session.createQuery("select count(*) "+hql4Count);
				if(args != null)
				{
					for(int k = 0;k < args.length;k++)
					{
						setHqlQueryArguments(countQuery,k,args[k]);
					}
				}
				page.setRowCount(((Number)countQuery.list().get(0)).intValue());
			}else{
				page.setRowCount(q.list().size());
			}
		}
		
		if(page != null && page.getCurrentPage() > 0)
		{
			int pageno = page.getCurrentPage();
			q.setFirstResult((pageno -1) * (page.getPageSize()));
			q.setMaxResults(page.getPageSize());
		}
		
		return q.list();
	}
	
	protected static final void setHqlQueryArguments(Query query,int index,Object arg)
	{
		if (arg instanceof java.lang.String) {
            query.setString(index, (String) arg);
        } else if (arg instanceof java.lang.Integer) {
            query.setInteger(index, ((Integer) arg).intValue());
        } else if (arg instanceof java.util.Date) {
            query.setTimestamp(index, (java.util.Date) arg);
        } else if (arg instanceof java.lang.Boolean) {
            query.setBoolean(index, ((Boolean) arg).booleanValue());
        } else if (arg instanceof java.lang.Byte) {
            query.setByte(index, ((Byte) arg).byteValue());
        } else if (arg instanceof java.lang.Long) {
            query.setLong(index, ((Long) arg).longValue());
        } else if (arg instanceof java.lang.Double) {
            query.setDouble(index, ((Double) arg).doubleValue());
        } else if (arg instanceof java.lang.Float) {
            query.setFloat(index, ((Float) arg).floatValue());
        } else if (arg instanceof java.lang.Number) {
            query.setBigDecimal(index, new java.math.BigDecimal(((Number) arg).doubleValue()));
        } else {
            query.setEntity(index, arg);
        }
	}

	@Override
	public Session getSession() {
		// TODO 自动生成的方法存根
		return sessionFactory.getCurrentSession();
	}

	@Override
	public Object findDataBySql(String sql) {
		// TODO 自动生成的方法存根
		return getSession().createSQLQuery(sql).list();
	}

	@Override
	public int executeUpdateBySql(String sql, Object... args) {
		Query query = getSession().createSQLQuery(sql);
		if(args != null)
		{
			for(int i = 0;i < args.length;i++)
			{
				setHqlQueryArguments(query,i,args[i]);
			}
		}
		int result = query.executeUpdate();
		getSession().flush();
		return result;
	}

}
