package com.rongji.df.web.view;

import org.springframework.stereotype.Service;

import com.rongji.dfish.ui.layout.View;
import com.rongji.dfish.ui.widget.Html;

/**
 * 口岸卫检页面
 * @author RJ-006
 *
 */
@Service
public class PortRelatived {
	public static View buildWelcomeView()
	{
		View view = new View("main");
		view.setNode(new Html("<div class='x-welcome'>欢迎来到口岸卫检系统</div>").setStyle("background-color:#dceef3;"));
		return view;
	}
}
