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
import com.rongji.df.entity.SmCommonLink;
import com.rongji.dfish.base.Page;

@Service
public class CommonLinkService {
	@Resource
	@Qualifier("GenericDao")
	private GenericDao dao;

	@SuppressWarnings("unchecked")
	public List<SmCommonLink> getUsableLinks()
	{
		return (List<SmCommonLink>) dao.getQueryList("from SmCommonLink where isRelease='1' order by orderNum, createDate desc ");
	}
	
	public SmCommonLink getLinkById(Long linkId)
	{
		return dao.getObject(SmCommonLink.class, linkId);
	}
	
	@SuppressWarnings("unchecked")
	public List<SmCommonLink> getLinksByPage(Page page,Map<String, Object> con)
	{
		StringBuilder sql = new StringBuilder("from SmCommonLink where 1=1 ");
		List<Object> args = new ArrayList<Object>();
		getSearchCondition(con,sql,args);
		sql.append(" order by orderNum,createDate desc ");
		return (List<SmCommonLink>) dao.getQueryList(page, true,sql.toString(),args.toArray());
	}
	
	public void saveOrUpdate(SmCommonLink link)
	{
		if(link.getLinkId() == null)
		{
			dao.save(link);
		}else{
			dao.update(link);
		}
	}
	
	public List<String> deleteLinkById(String[] linkIds)
	{
		if(linkIds != null && linkIds.length > 0)
		{
			StringBuilder sb = new StringBuilder(" and linkId in (");
			for(String id : linkIds)
			{
				sb.append(id + ",");
			}
			String con = sb.substring(0,sb.lastIndexOf(","));
			con = con +")";
			
			@SuppressWarnings("unchecked")
			List<String> paths = (List<String>) dao.getQueryList("select imagePath from SmCommonLink where 1=1 "+con);
			dao.delete("delete from SmCommonLink where 1=1"+con);
			return paths;
		}
		return null;
	}
	
	public void getSearchCondition(Map<String, Object> con,StringBuilder sql,List<Object> args)
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
				}
			}
		}
	}
}
