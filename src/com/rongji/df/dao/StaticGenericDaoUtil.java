package com.rongji.df.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.rongji.dfish.framework.SystemData;

public class StaticGenericDaoUtil {
	public static StaticGenericDao getDAO()
	{
		return (StaticGenericDao) SystemData.getInstance().getBeanFactory().getBean("StaticGenericDao");
	}
	
	private static Map<String, String> cachedIds = new HashMap<String, String>();
	public static String getNewId(String clzName,String idName,String initId)
	{
		clzName = clzName.intern();
		synchronized(clzName)
		{
			String storedId = cachedIds.get(clzName);
			if(storedId != null)
			{
				String newId = getNextId(storedId,initId,10);
				cachedIds.put(clzName, newId);
				return newId;
			}
			String dataBaseMaxId = getMaxIdFromDataBase(clzName,idName);
			if(dataBaseMaxId != null && !dataBaseMaxId.equals(""))
			{
				String newId = getNextId(dataBaseMaxId,initId,10);
				cachedIds.put(clzName, newId);
				return newId;
			}
			cachedIds.put(clzName, initId);
			return initId;
		}
	}
	
	@SuppressWarnings({"rawtypes"})
	private static String getMaxIdFromDataBase(String clzName,String idName)
	{
		List list = getDAO().getQueryList("select max(t."+idName+") from "+clzName+" t");
		if(list != null && list.size() > 0 && list.get(0) != null)
		{
			return (String)list.get(0);
		}
		return null;
	}
	
	private static String getNextId(String id,String initId,int radix)
	{
		String nextId = initId;
		int _id = Integer.parseInt(id);
		int _initId = Integer.parseInt(initId);
		if(_id >= _initId)
		{
			nextId = getNextId(id,radix);
		}else{
			nextId = getNextId(initId,radix);
		}
		return nextId;
	}
	
	private static String getNextId(String id,int radix)
	{
		long l = Long.parseLong(id,radix);
		l++;
		String targetValue = Long.toString(l,radix);
		int idLen = id.length();
		int nowLen = targetValue.length();
		if(idLen == nowLen)
		{
			return targetValue;
		}else if(idLen < nowLen)
		{
			throw new RuntimeException("can not get next id for ["+id+"].");
		}
		StringBuilder sb = new StringBuilder();
		for(int i = nowLen;i < idLen;i++)
		{
			sb.append("0");
		}
		sb.append(targetValue);
		return sb.toString();
	}

}
