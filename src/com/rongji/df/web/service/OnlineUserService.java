package com.rongji.df.web.service;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.rongji.df.dao.GenericDao;
import com.rongji.df.entity.SmOnlineCount;
import com.rongji.df.entity.SmOnlineTime;
import com.rongji.dfish.base.Page;

@Service
public class OnlineUserService {
	@Resource
	@Qualifier("GenericDao")
	private GenericDao dao;
	
	@SuppressWarnings("unchecked")
	public List<SmOnlineTime> getOnlineTimeByPage(Page page,Map<String,Object> con)
	{
		String sql = "from SmOnlineTime where 1=1 ";
		StringBuilder condition = new StringBuilder("");
		List<Object> args = new ArrayList<Object>();
		getSearchCondition(con,condition,args);
		sql = sql + condition.toString()+"order by sumTime desc";
		return (List<SmOnlineTime>) dao.getQueryList(page, true, sql, args.toArray());
	}
	
	
	public List<SmOnlineCount> getOnlineCountByPage(Page page,Map<String,Object> con)
	{
		String sql = "from SmOnlineCount where 1=1 ";
		StringBuilder condition = new StringBuilder("");
		List<Object> args = new ArrayList<Object>();
		getSearchCondition(con,condition,args);
		sql = sql + condition.toString()+"order by updateDate desc,countNum desc,updateTime desc";
		return (List<SmOnlineCount>) dao.getQueryList(page, true, sql, args.toArray());
	}
	
	public void getSearchCondition(Map<String,Object> con,StringBuilder sql,List<Object> args)
	{
		if(con != null && con.size() > 0)
		{
			Iterator<Entry<String,Object>> it = con.entrySet().iterator();
			while(it.hasNext())
			{
				Entry<String,Object> entry = it.next();
				String key = entry.getKey();
				Object v = entry.getValue();
				String k = key.substring(1);
				if(key.startsWith("A"))
				{
					sql.append(" and "+k+" = ?");
					args.add(v);
				}else if(key.startsWith("B"))
				{
					sql.append(" and "+k+" like ?");
					args.add("%"+v+"%");
				}else if(key.startsWith("M"))
				{
					sql.append(" and "+k+" <= ?");
					args.add(v);
				}else if(key.startsWith("S"))
				{
					sql.append(" and "+k+" >= ?");
					args.add(v);
				}
			}
		}
	}

}
