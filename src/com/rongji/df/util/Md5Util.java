/*******************************************************************************
 * Copyright (c) 2004, 2007 Actuate Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *  Actuate Corporation  - initial API and implementation
 *******************************************************************************/

package com.rongji.df.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.Calendar;

public class Md5Util
{

	private static final String MD5 = "MD5";
	private static char[] code = new char[]{
			'0',
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
			'8',
			'9',
			'A',
			'B',
			'C',
			'D',
			'E',
			'F'
	};

	/**
	 * 
	 * @param rawString
	 * @return
	 */
	public static String getMD5( String rawString )
	{
		if ( rawString == null )
			return null;
		MessageDigest md = null;
		try
		{
			md = MessageDigest.getInstance( MD5 );
			byte[] bytes = md.digest( rawString.getBytes( ) );
			char[] md5 = new char[32];
			byte index = 0;
			for ( byte i = 0; i < bytes.length; i++ )
			{
				int n = bytes[i] + 128;
				md5[index++] = code[( n & 0x000000f0 ) >> 4];
				md5[index++] = code[n & 0x0000000f];
			}
			return new String( md5 );
		}
		catch ( NoSuchAlgorithmException e )
		{
		}
		return null;
	}
	
	/** 
     * 获得MD5加密密码的方法 
     */  
    public static String getMD5ofStr(String origString) {  
        String origMD5 = null;  
        try {  
           MessageDigest md5 = MessageDigest.getInstance("MD5");  
            byte[] result = md5.digest(origString.getBytes());  
            origMD5 = byteArray2HexStr(result);  
        } catch (Exception e) {  
            e.printStackTrace();  
        }  
        return origMD5;  
    }  
    /** 
     * 处理字节数组得到MD5密码的方法 
     */  
    private static String byteArray2HexStr(byte[] bs) {  
        StringBuffer sb = new StringBuffer();  
        for (byte b : bs) {  
            sb.append(byte2HexStr(b));  
        }  
        return sb.toString();  
    }  /** 
     * 字节标准移位转十六进制方法 
     */  
    private static String byte2HexStr(byte b) {  
        String hexStr = null;  
        int n = b;  
        if (n < 0) {  
            // 若需要自定义加密,请修改这个移位算法即可  
            n = b & 0x7F + 128;  
        }  
        hexStr = Integer.toHexString(n / 16) + Integer.toHexString(n % 16);  
        return hexStr;  
    } 
    
    
	public static void main(String[] args){
	    System.out.println(Md5Util.getMD5ofStr("123456"));
		System.out.println(Md5Util.getMD5("123456"));
		//获取当前时间  
        Calendar cal = Calendar.getInstance(); 
      //调到上个月  
        //调到上个月  
          cal.add(Calendar.MONTH, -1); 
          
          SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM");
          
          System.out.println(sdf.format(cal.getTime()));
        
		for(int i=1;i<65;i++){
//		    System.out.println(i);
		    cal.add(Calendar.MONTH, +1); 
		    System.out.println("PARTITION P_"+i+"  values less than (TO_DATE('"+sdf.format(cal.getTime())+"', 'YYYY-MM')),");
		}
	}
}
