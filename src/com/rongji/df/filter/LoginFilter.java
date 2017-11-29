package com.rongji.df.filter;

import java.io.IOException;
import java.util.HashSet;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.rongji.dfish.framework.FrameworkHelper;

public class LoginFilter implements Filter {
	protected HashSet<String> exceptURIs;
	protected boolean checkLogin = true;

	public LoginFilter()
	{
		this.checkLogin = true;
	}
	
	@Override
	public void destroy() {
		// TODO 自动生成的方法存根

	}

	@Override
	public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
			throws IOException, ServletException {
		HttpServletRequest request = (HttpServletRequest) servletRequest;
		HttpServletResponse response = (HttpServletResponse) servletResponse;
		response.setHeader("Set-Cookie", "name=value;HttpOnly");
		response.addHeader("x-frame-options", "SAMEORIGIN");
		String loginUser = (String) request.getSession().getAttribute(FrameworkHelper.LOGIN_USER_KEY);
		if(!this.checkLogin)
		{
			chain.doFilter(request, response);
			return;
		}
		String requestURI = request.getRequestURI();
		if(loginUser != null)
		{
			chain.doFilter(request, response);
			return;
		}else{
			for(String uri : exceptURIs)
			{
				if(requestURI != null && (requestURI.indexOf(uri)>0 || requestURI.endsWith(".css") || requestURI.endsWith(".js")))
				{
					chain.doFilter(request, response);
					return;
				}
			}
			FrameworkHelper.outputJson(response, "window.location.replace(\"./login.jsp\");");
			return;
		}

	}

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
		String checkLogin = filterConfig.getInitParameter("checkLogin");
		if(checkLogin == null)
		{
			this.checkLogin = true;
		}else if(checkLogin.equalsIgnoreCase("true"))
		{
			this.checkLogin = true;
		}else if(checkLogin.equalsIgnoreCase("yes"))
		{
			this.checkLogin = true;
		}else{
			this.checkLogin = false;
		}
		this.exceptURIs = new HashSet<String>();
		String uris = filterConfig.getInitParameter("exceptURI");
		if(uris != null)
		{
			for(String uri:uris.trim().split(","))
			{
				this.exceptURIs.add(uri);
			}
		}
	}
	
	public void setCheckLogin(boolean checkLogin)
	{
		this.checkLogin = checkLogin;
	}

}
