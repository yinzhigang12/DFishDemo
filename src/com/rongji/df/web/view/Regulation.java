package com.rongji.df.web.view;

import org.springframework.stereotype.Service;

import com.rongji.dfish.ui.layout.View;
import com.rongji.dfish.ui.widget.Html;

/**
 * 备案监管页面
 * @author RJ-006
 *
 */
@Service
public class Regulation {
	public static View buildWelcomeView()
	{
		View view = new View("main");
		view.setNode(new Html("<div class='x-welcome'>欢迎来到备案监管系统</div>").setStyle("background-color:#dceef3;"));
		return view;
	}
}
