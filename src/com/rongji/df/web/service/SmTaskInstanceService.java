package com.rongji.df.web.service;

import java.util.Calendar;
import java.util.Date;

import org.springframework.stereotype.Service;

import com.rongji.df.dao.StaticGenericDao;
import com.rongji.df.dao.StaticGenericDaoUtil;
import com.rongji.df.entity.SmTaskDefinition;
import com.rongji.df.entity.SmTaskInstance;
import com.rongji.df.entity.SmUser;

@Service
public class SmTaskInstanceService {

	public SmTaskInstance createTaskInstance(SmUser user,SmTaskDefinition data,Date startTime) throws Exception
	{
		StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
		SmTaskInstance entity = null;
		if(data.getExecuteType().equals(SmTaskDefinition.DAEMON))
		{
			entity = (SmTaskInstance) dao.getObject("from SmTaskInstance where defId=?", data.getDefId());
		}
		if(entity == null)
		{
			entity = new SmTaskInstance();
		}
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(new Date());
		int thisyear = calendar.get(Calendar.YEAR);
		int thismonth = calendar.get(Calendar.MONTH)+1;
		int thisday = calendar.get(Calendar.DAY_OF_MONTH);
		int thisweek = calendar.get(Calendar.WEEK_OF_MONTH);
		
		entity.setDefId(data.getDefId());
		entity.setStartTime(startTime);
		entity.setEndTime(null);
		entity.setExecuteStatus(SmTaskInstance.NOT_EXECUTE);
		entity.setExecutePerson(null);
		entity.setThisYear(Integer.valueOf(thisyear).longValue());
		entity.setThisMonth(Integer.valueOf(thismonth).longValue());
		entity.setThisWeek(Integer.valueOf(thisweek).longValue());
		if(data.getExecuteType().equalsIgnoreCase(SmTaskDefinition.MONTHLY))
		{
			entity.setThisDay(data.getExecuteMonthDate());
		}else{
			entity.setThisDay(Integer.valueOf(thisday).longValue());
		}
		if(data.getExecuteType().equalsIgnoreCase(SmTaskDefinition.WEEKLY))
		{
			entity.setThisWeekDate(data.getExecuteWeekDate());
		}else{
			entity.setThisWeekDate(data.getExecuteWeekDate());
		}
		if(data.getExecuteType().equalsIgnoreCase(SmTaskDefinition.DAILY))
		{
			entity.setThisTime(data.getExecuteTime());
		}else{
			entity.setThisTime(data.getExecuteTime());
		}
		entity.setStatus(0L);
		entity.setRemark(data.getRemark());
		entity.setStartTime(new Date());
		entity.setExecuteStatus(SmTaskInstance.RUNNING);
		
		if(user != null)
		{
			Integer userId = user.getUserId();
			entity.setExecutePerson(userId.longValue());
		}
		if(entity.getTaskId() != null)
		{
			dao.update(entity);
		}else{
			dao.save(entity);
		}
		return entity;
	}
	
	public SmTaskInstance getTaskInstance(Long taskInstanceId) throws Exception
	{
		StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
		return dao.getObject(SmTaskInstance.class, taskInstanceId);
	}
	
	public SmTaskInstance updateTaskInstance(SmTaskInstance data,Date time) throws Exception
	{
		StaticGenericDao dao = StaticGenericDaoUtil.getDAO();
		data.setEndTime(time);
		dao.update(data);
		return data;
	}
}
