package com.rongji.df.web.view;

import org.springframework.stereotype.Service;

import com.rongji.dfish.ui.layout.View;
import com.rongji.dfish.ui.widget.Html;

/**
 * 车辆检疫页面
 * @author RJ-006
 *
 */
@Service
public class CardQuarantine {
	public static View buildWelcomeView()
	{
		View view = new View("main");
		view.setNode(new Html("<div class='x-welcome'>欢迎来到车辆检疫系统</div>").setStyle("background-color:#dceef3;"));
		return view;
	}
}
