var EloamGlobal;
var DeviceMain;
var VideoMain;
var PicPath;
var hasLoadSuccess = 0;
var gpyViewPath = "";
var gpyIsCheck;

function addEvent(obj, name, func){
    if (obj.attachEvent){
    	console.log("绑定事件1");
        obj.attachEvent(name, func);
    } else {
    	console.log("绑定事件2");
        obj.addEventListener(name, func, false); 
    }
    console.log("绑定事件完成");
}

function gpyStart(viewPath){
	gpyViewPath = viewPath;
	gpyIsCheck = 1;
	EloamGlobal = document.getElementById("EloamGlobal_ID");
	EloamGlobal.attachEvent("DevChange", initViewMain);
//	addEvent(EloamGlobal,"DevChange", initViewMain);
	/*EloamGlobal.addEventListener("DevChange", initViewMain);*/

	var ret;
	ret = EloamGlobal.InitDevs();
	if(ret){
		OpenVideoMain();
	}else{
		$.alert("高拍仪初始化失败");
	}
	hasLoadSuccess = 1;
}
function initViewMain(type, idx, dbt){
	//设备接入和丢失
	//type设备类型， 1 表示视频设备， 2 表示音频设备
	//idx设备索引
	//dbt设备动作类型
	if (1 == type){
		if (1 == dbt){//dbt 1 表示设备到达
			var deviceType = EloamGlobal.GetEloamType(1, idx);
			if(1 == deviceType){//主摄像头
				if(null == DeviceMain){
					DeviceMain = EloamGlobal.CreateDevice(1, idx);
					if (DeviceMain){
						var label =  document.getElementById('lab1');
						label.innerHTML = DeviceMain.GetFriendlyName();	
						var mode = document.getElementById('selMode1');
						var subType = DeviceMain.GetSubtype();
						if(0 != (subType & 1)){
							mode.add(new Option("YUY2"));
						}
						if(0 != (subType & 2)){
							mode.add(new Option("MJPG"));
						}
						if(0 != (subType & 4)){
							mode.add(new Option("UYVY"));
						}
						mode.selectedIndex = 0;
						
						var scanSize = document.getElementById('selScanSize');
						scanSize.add(new Option("原始尺寸"));
						scanSize.add(new Option("中等尺寸"));
						scanSize.add(new Option("较小尺寸"));
						scanSize.add(new Option("自定义尺寸"));
						scanSize.selectIndex = 0;
						changesubType1();
						if(0 != hasLoadSuccess){
							OpenVideoMain();
						}
					}
				}
			}
		}
		if (2 == dbt){//dbt 2 表示设备丢失
			if (DeviceMain){
				if(idx == DeviceMain.GetIndex()){
					if(VideoMain){
						VideoMain.Destroy();
						VideoMain = null;
						ViewMain.SetText("", 0);
					}
					DeviceMain.Destroy();
					DeviceMain = null;
					document.getElementById('selMode1').options.length = 0; 
					document.getElementById('selScanSize').options.length = 0; 
					document.getElementById('selRes1').options.length = 0; 
				}
			}			
		}
	}
}
function OpenVideoMain(){
	CloseVideoMain();
	if(DeviceMain){
		var mode = document.getElementById('selMode1');
		var modeText = mode.options[mode.options.selectedIndex].text;
		var subtype = (modeText == "YUY2"? 1:(modeText == "MJPG"? 2:(modeText == "UYVY"? 4:-1)));
	
		var select1 = document.getElementById('selRes1'); 
		var nResolution1 = select1.selectedIndex;
		
		VideoMain = DeviceMain.CreateVideo(nResolution1, subtype);
		if (VideoMain){
			ViewMain.SelectVideo(VideoMain);
			ViewMain.SetText("打开视频中，请等待...", 0);
		}
	}
}
function CloseVideoMain(){
	if (VideoMain){
		VideoMain.Destroy();
		VideoMain = null;	
		ViewMain.SetText("", 0);	
	}
}
function changesubType1(){
	document.getElementById('selRes1').options.length = 0; 
	var mode = document.getElementById('selMode1');
	var modeText = mode.options[mode.options.selectedIndex].text;
	var subtype = (modeText == "YUY2"? 1:(modeText == "MJPG"? 2:(modeText == "UYVY"? 4:-1)));
	if((-1 != subtype) && (null != DeviceMain)){
		var select = document.getElementById('selRes1');
		var nResolution = DeviceMain.GetResolutionCountEx(subtype);
		for(var i = 0; i < nResolution; i++){
			var width = DeviceMain.GetResolutionWidthEx(subtype, i);
			var heigth = DeviceMain.GetResolutionHeightEx(subtype, i);
			select.add(new Option(width.toString() + "*" + heigth.toString())); 
		}
		select.selectedIndex = select.options.length-1;
		if(0 != hasLoadSuccess){
			OpenVideoMain();
		}
	}
}
function gpyStop(){
	if (VideoMain){
		ViewMain.SetText("", 0);
		VideoMain.Destroy();
		VideoMain = null;
	}
	if(DeviceMain){
		DeviceMain.Destroy();
		DeviceMain = null;
	}
	EloamGlobal.DeinitDevs();
	
	EloamGlobal = null;
}
function changeScanSize(){
	if(VideoMain){
		var scanSize = document.getElementById('selScanSize').options.selectedIndex;
		if(0 == scanSize){//原始尺寸
			ViewMain.SetState(1);
		}
		else if(1 == scanSize || 2 == scanSize){
			var rect;
			var width = VideoMain.GetWidth();
			var heigth = VideoMain.GetHeight();	
				
			if(1 == scanSize){//中等尺寸
				rect = EloamGlobal.CreateRect(width/6, heigth/6, width*2/3, heigth*2/3);
			}
			if(2 == scanSize){//较小尺寸
				rect = EloamGlobal.CreateRect(width/3, heigth/3, width/3, heigth/3);
			}
			
			ViewMain.SetState(2);
			ViewMain.SetSelectRect(rect);
		}
		else if(3 == scanSize){//自定义尺寸
			//切换状态，清空框选区域
			ViewMain.SetState(1);
			ViewMain.SetState(2);
			alert("在主摄像头界面中，按住鼠标拖动即可框选尺寸!");
		}
	}
	else{
		alert("主摄像头视频未打开！");
	}
}
function Scan(){
	if (VideoMain){
		var date = new Date();
		var yy = date.getFullYear().toString();
		var mm = (date.getMonth() + 1).toString();
		var dd = date.getDate().toString();
		var hh = date.getHours().toString();
		var nn = date.getMinutes().toString();
		var ss = date.getSeconds().toString();
		var mi = date.getMilliseconds().toString();
		PicPath = "C:\\" + yy + mm + dd + hh + nn + ss + mi + ".jpg";	
		var image1 = VideoMain.CreateImage(0, ViewMain.GetView());
		if (image1){
				var w1 = image1.GetWidth();
				var w = w1;
				var h1 = image1.GetHeight();
				var h = h1 + 100;
				var imageSave = EloamGlobal.CreateImage(w, h, 3);
				if (imageSave){
					var rcDest1 = EloamGlobal.CreateRect(0, 0, w1, h1);
					var rcSrc1 = EloamGlobal.CreateRect(0, 0, w1, h1);
					imageSave.Blend(rcDest1, image1, rcSrc1, 0, 0);
					rcDest1.Destroy();
					rcDest1 = null;
					rcSrc1.Destroy();
					rcSrc1 = null;
					imageSave.Save(PicPath, 0);
					EloamThumbnail.Add(PicPath);
					imageSave.Destroy();
					imageSave = null;								
				}
			image1.Destroy();
			image1 = null;
		}
	}
}
function RotateLeft(){
	if (VideoMain)
		VideoMain.RotateLeft();
}
function Property(){
	if (DeviceMain)
		DeviceMain.ShowProperty(ViewMain.GetView());
}
function RotateRight(){
	if (VideoMain)
		VideoMain.RotateRight();	
}

function Mirror(){
	if (VideoMain)
		VideoMain.Mirror();
}
function Flip(){
	if (VideoMain)
		VideoMain.Flip();
}
function gpyRemoveImgAll(){
	EloamThumbnail.clear(true);
}
function gpyRemoveImg(){
	var count = EloamThumbnail.GetCount();
	if(count){
		for(var i=0;i<count;){
			var isc = EloamThumbnail.GetCheck(i);
			if(isc){
				EloamThumbnail.Remove(i, true);
				i= 0;
				count = EloamThumbnail.GetCount();
				continue;
			}
			i++;
		}
	}else{
		$.alert("未发现可删除的图片！");
	}
}