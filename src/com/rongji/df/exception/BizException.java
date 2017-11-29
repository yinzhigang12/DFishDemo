package com.rongji.df.exception;

public class BizException extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = -4077984307979049433L;
	
	public BizException(String message)
	{
		super(message);
	}
	
	public BizException(String message,Throwable cause)
	{
		super(message,cause);
	}

}
