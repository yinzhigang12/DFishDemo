package com.rongji.df.web.service;

import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.rongji.df.dao.GenericDao;
import com.rongji.df.entity.SmDepartment;

@Service
public class DepartmentService {
	@Resource
	@Qualifier("GenericDao")
	private GenericDao dao;
	
	public SmDepartment getDepartById(Integer id)
	{
		if(id == null)
		{
			return null;
		}
		return dao.getObject(SmDepartment.class, id);
	}
	
	public String queryScope(String loginId,String resourceId)
	{
		String[] dep = CacheDataService
	}

}
