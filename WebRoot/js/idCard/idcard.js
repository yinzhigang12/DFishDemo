var ic_config = {
		userId:'53174805200132795468',
		headImgSrc:"C:\\idCardHead.jpg",
		cardImgSrc:"C:\\idCard.jpg",
		//判断是否启动循环，0启动，1不启动
		ocxFlag:0,
		//停止循环的标识
		stopLoop:-1,
		//视图所在路径
		viewPath:"/index/main",
		//0：识别基本信息、证件照、头像照；1:识别基础信息和证件照； 2：只识别基础信息和头像照片、3：只识别基本信息；
		sb_flag:1,
		//回调更新界面的url标志，1：更新人工登记；2、更新备案砝码；3、更新核辐射界面； 4、证书打印界面；5、流调登记；6、人工智能通道
		viewFlag:1,
		//是否开启二维码扫描1：开启，0：不开起
		qRSwitch:1
};
function startOCX(path, p_flag, viewType){
	var QRSwitch = fobj("QRSwitch");
	if(QRSwitch){
		ic_config.qRSwitch = QRSwitch.val();
	}
	if(ic_config.stopLoop != -1){//如果有循环，则释放证件识别机核心，同时终止当前循环。
		stopOCX();
	}
	ic_config.viewPath = path;
	ic_config.sb_flag = p_flag;
	ic_config.viewFlag = viewType;
	//初始化证件识别机
	var re = initIdCard();
	if(re==0){
		return;
	}
	if(ic_config.ocxFlag == 0){
		ic_config.stopLoop = setInterval("AutoClassifyCard()", 300);
		ic_config.ocxFlag = 1;
	}
}
function stopOCX(){
	//终止循环
	clearInterval(ic_config.stopLoop);
	FreeRecogKenal();
	ic_config.ocxFlag = 0;
}
//加载核心
function initIdCard(){
	//判断证件识别机运行环境是否注册，没注册则不执行。
	if("undefined" == typeof objIDCard){
		var htmlStr = "<OBJECT classid=\"clsid:10EC554B-357B-4188-9E5E-AC5039454D8B\" id=\"objIDCard\" width=\"0\" height=\"0\"></OBJECT>";
		objIDCard = new DOMParser().parseFromString(htmlStr,"text/xml");
	}
	if("undefined" == typeof objIDCard){
		return 0;
	}
	if("undefined" == typeof objIDCard.IsLoaded){
		$.alert("未安装注册证件识别机的运行环境，无法启动证件识别机！", 5, 1);
		return 0;
	}
	if(!objIDCard.IsLoaded()){
		var nRet = objIDCard.InitIDCard(ic_config.userId,1);
		if(nRet !=0 ){
			var errorMsg="证件识别机：无法初始化设备";
			if(nRet == 1){
				errorMsg = "证件识别机：用户ID错误";
			}else if(nRet==2){
				errorMsg = "证件识别机：设备初始化失败";
			}else if(nRet==3){
				errorMsg = "证件识别机：启动STI服务失败";
			}else if(nRet == -1){
				errorMsg = "证件识别机：核心库加载失败";
			}
			$.alert(errorMsg, 5, 1);
			return 0;
		}
	}
	return 1;
}

//显示识别结果
function DisplayResult(idCardType){	
	var obj = createDishInput();
    var nFieldNum = objIDCard.GetRecogFieldNum();
    var strResult ="";
    if(nFieldNum>0){
    	var nameCh = "";
		var firstNameCh = "";
		var lastNameCh = "";
		var nameEn = "";
		var fnen = "";
		var lnen = "";
		var country = "";
		var sex = "";
		var birth = "";
		var cardType = "";
		var cardNo = "";
		var validDate = "";
		if(idCardType == 2){
			nameCh = objIDCard.GetRecogResult(1);
			sex = objIDCard.GetRecogResult(2);
			birth = objIDCard.GetRecogResult(4);
			cardType = "1";
			cardNo = objIDCard.GetRecogResult(6);
		}else if(idCardType == 13){
			//由于通行证和护照都是采用的13类型，所以比较子类型，257表示通行证
			cardType = "2";
			var subId = objIDCard.GetSubID();
			if(subId == 257){
				cardType = "3";
			}
			nameCh = objIDCard.GetRecogResult(2);
			fnen = objIDCard.GetRecogResult(8);
			lnen = objIDCard.GetRecogResult(9);
			country = objIDCard.GetRecogResult(12);
			sex = objIDCard.GetRecogResult(4);
			birth = objIDCard.GetRecogResult(5);
			cardNo = objIDCard.GetRecogResult(1);
			firstNameCh = objIDCard.GetRecogResult(29);
			lastNameCh = objIDCard.GetRecogResult(30);
			validDate = objIDCard.GetRecogResult(6);
		}else if(idCardType == 23){
			nameCh = objIDCard.GetRecogResult(1);
			fnen = objIDCard.GetRecogResult(2);
			lnen = objIDCard.GetRecogResult(2);
			country = objIDCard.GetRecogResult(16);
			sex = objIDCard.GetRecogResult(3);
			birth = objIDCard.GetRecogResult(4);
			cardType = "4";
			cardNo = objIDCard.GetRecogResult(15);
			validDate = objIDCard.GetRecogResult(8);
		}
		if(obj.nameCh){
			obj.nameCh.val(nameCh);
		}
		if(obj.fnen){
			obj.fnen.val(fnen);
		}
		if(obj.lnen){
			obj.lnen.val(lnen);
		}
		if(obj.country){
			obj.country.val(country);
		}
		if(sex == "男"){
			sex = "M"
		}else{
			sex = "F";
		}
		if(obj.sex){
			obj.sex.val(sex);
		}
		if(obj.birth){
			obj.birth.val(birth);
		}
		if(obj.cardType){
			obj.cardType.val(cardType);
		}
		if(obj.cardNo){
			obj.cardNo.val(cardNo);
		}
		if(obj.firstNameCh){
			obj.firstNameCh.val(firstNameCh);
		}
		if(obj.lastNameCh){
			obj.lastNameCh.val(lastNameCh);
		}
		if(obj.validDate){
			obj.validDate.val(validDate);
		}
		if(ic_config.sb_flag != 3){
			var imgPath = ic_config.cardImgSrc;
			if(ic_config.sb_flag == 2){
				imgPath = ic_config.headImgSrc;
			}
			var dataID = VM(ic_config.viewPath).f('id');
			var idv = "0";
			if(dataID){
				idv = dataID.val();
			}	
			var imgRes = picToBase64Code(imgPath);
			VM('/index/main').cmd({type:'ajax',src:'tempIdCard/idCardInfo', data:{imgData:imgRes,viewPath:ic_config.viewPath,dataID:idv,viewFlag:ic_config.viewFlag}});
		}
    }else{
    	$.alert("识别失败，请重试！", 5, 1);
    }
    return;
}

function showImage(showImgSrc){  
	objIDCard.ShowImage(showImgSrc);
}
function picToBase64Code(imgPath){  
     if(objIDCard.IsLoaded()){
        var nResult=objIDCard.EncodeToBase64(imgPath);
        return nResult;
     }else{
    	 $.alert("证件识别机未加载。", 5, 1);
     }
}
//释放核心
function FreeRecogKenal(){
	if("undefined" != typeof objIDCard){
		if(objIDCard.IsLoaded()){
			objIDCard.FreeIdcard();
		}
    }
}
//自动识别证件
function AutoClassifyCard(){
	if("undefined" != typeof objIDCard){
		if(objIDCard.IsLoaded()){
			var nRet = objIDCard.GetGrabSignalType();
			if( nRet == 1){
				classifyOtherCard();
			}
		}else{
			var re = initIdCard();
			if(re == 0){
				stopOCX();
			}
		}
	}else{
		stopOCX();
	}
}
function classifyOtherCard(){
	 setIDCardType();
	  var nResult = objIDCard.ClassifyIDCard();
	  if( nResult < 0){
		  $.alert("证件种类自动识别失败："+nResult, 5, 1);
         return;
	  }
	  var nCardType = nResult;
	  var nImg = 9;
	  var nDG = 2063;
	  var nViz = 1;
	  if( nCardType == 1){
		 nImg = 17;
		 nResult = objIDCard.RecogChipCard(nDG, nViz, nImg);
	  }  
	  if( nCardType == 2){
		 nResult = objIDCard.RecogGeneralMRZCard(nViz, nImg);
	  }
     if( nCardType == 3){
	     nResult = objIDCard.RecogCommonCard(nImg);
	  }
	  if(nResult <= 0){
        $.alert("识别证件失败："+nResult, 5, 1);
        return;
     }
	  if(ic_config.sb_flag != 2){
		  objIDCard.SaveImageEx(ic_config.cardImgSrc,nImg);
	  }
     DisplayResult(nResult);
//     showImage(ic_config.cardImgSrc);
}
function setIDCardType(){
	objIDCard.SetIDCardType(2,0);
    objIDCard.AddIDCardType(3,0);
    objIDCard.AddIDCardType(4,0);
    objIDCard.AddIDCardType(5,0);
    objIDCard.AddIDCardType(6,0);
    objIDCard.AddIDCardType(7,0);
    objIDCard.AddIDCardType(9,0);
    objIDCard.AddIDCardType(10,0);
    objIDCard.AddIDCardType(11,0);
    objIDCard.AddIDCardType(12,0);
    objIDCard.AddIDCardType(13,0);
    objIDCard.AddIDCardType(14,0);
    objIDCard.AddIDCardType(15,0);
	objIDCard.AddIDCardType(16,0);
	objIDCard.AddIDCardType(22,0);
    objIDCard.AddIDCardType(23,0);
    objIDCard.AddIDCardType(25,0);
    objIDCard.AddIDCardType(26,0);
}
//只扫描一次的处理方法
function AutoClassifyCard2(){
	if("undefined" != typeof objIDCard){
		if(objIDCard.IsLoaded()){
			var nRet = objIDCard.GetGrabSignalType();
			if( nRet == 1){ 
				var aRev = objIDCard.AcquireImage(21);
				objIDCard.setAcquireImageType(1,1);
				if(aRev != 0){
					$.alert("采集图像失败，请重试！返回值："+aRev, 5, 1);
					return;
				}
				var qrStr = 1;
				if(ic_config.qRSwitch == 1){//判断是否开启扫描二维码
					qrStr=objIDCard.GetQRcode();
				}
				if(qrStr == 1){
					objIDCard.ProcessImage(2);
		          //设置要识别的证件类型
		          //0表示添加次主类型的所有子模板
		           objIDCard.SetIDCardType(2,0);
		           objIDCard.AddIDCardType(3,0);
		           objIDCard.AddIDCardType(13,0);
				   objIDCard.AddIDCardType(23,0);
				   objIDCard.AddIDCardType(1003,0);
				   objIDCard.AddIDCardType(1004,0);
				   objIDCard.AddIDCardType(15,0);
				   nRev = objIDCard.RecogIDCard(); 
			       if(nRev<=0){
		              $.alert("识别失败，请重试！返回值："+nRev, 5, 1);
		              return;
			       }
			       if(ic_config.sb_flag != 2){
			           //保存图像
			           objIDCard.SaveImage(ic_config.cardImgSrc);
			           //保存头像
			           objIDCard.SaveHeadImage(ic_config.headImgSrc);
			       }
		           DisplayResult(nRev);
				}else{
					if(qrStr.length<26){
						$.alert("识别二维码失败，请重新识别！", 5, 1);
						return;
					}
//					qrStr = Base64.decode(qrStr);
					var returnv = handleQRStr(qrStr);
					if(returnv != 0){//把二维码编号发到后台，获取图像
						VM('/index/main').cmd({type:'ajax',src:'tempIdCard/idCardInfo', data:{qrCode:returnv, viewFlag:ic_config.viewFlag}});
					}
				}
			}
		}else{
			var re = initIdCard();
			if(re == 0){
				stopOCX();
			}
		}
	}else{
		stopOCX();
	}
}
function handleQRStr(qrStr){
	var obj = createDishInput();
	//二维码编号0，国籍1，有效期2，性别3，出生日期4，证件类型5，证件号码6，英文姓7，英文名8，中文姓9，中文名10
	var str = handleQrcode(qrStr);
	if(str&&str.length>0){
		if(obj.nameCh){
			obj.nameCh.val(str[9]+''+str[10]);
		}
		if(obj.firstNameCh){
			obj.firstNameCh.val(str[9]);
		}
		if(obj.lastNameCh){
			obj.lastNameCh.val(str[10]);
		}
		if(obj.fnen){
			obj.fnen.val(str[7]);
		}
		if(obj.lnen){
			obj.lnen.val(str[8]);
		}
		if(obj.country){
			obj.country.val(str[1]);
		}
		if(obj.sex){
			obj.sex.val(str[3]);
		}
		if(obj.birth){
			obj.birth.val(str[4]);
		}
		if(obj.cardType){
			obj.cardType.val(str[5]);
		}
		if(obj.cardNo){
			obj.cardNo.val(str[6]);
		}
		if(obj.validDate){
			obj.validDate.val(str[2]);
		}
		return str[0];
	}
	return 0;
}
function strCastDate(str){
	   var re = "";
	   if(str && str.length >=6 ){
		   if(str.length==6){
			 str = "20"+str;  
		   }
		   re = str.substring(0,4)+"-"+str.substring(4,6)+"-"+str.substring(6);
	   }
	   return re;
}
function handleQrcode(str){
	   var va = new Array(11);
	   va[0] = "53"+str.substring(0, 11);
	   va[1] = str.substring(11, 14);
	   va[2] = strCastDate(str.substring(14, 20));
	   va[3] = str.substring(20, 21);
	   var baseStr = str.substring(21, str.indexOf("<", 21));
	   baseStr = Base64.decode(baseStr);
	   va[4] = strCastDate(baseStr.substring(0, 8));
	   va[5] = baseStr.substring(8, 9);
	   va[6] = baseStr.substring(9);
	   var nameStr = str.substring(str.indexOf("<")+1);
	   var arr = nameStr.split("<");
	   va[7] = arr[0];
	   va[8] = arr[1];
	   var nameCh = Base64.decode(arr[2]);
	   if(nameCh&&nameCh.length>0){
		   var names = nameCh.split("<");
		   va[9] = names[0];
		   va[10] = names[1];
	   }else{
		   va[9] = "";
		   va[10] = "";
	   }
	   return va;
}
function fobj(name){
	return VM(ic_config.viewPath).f(name);
}
function createDishInput(){
	var showValue = {
			nameCh : fobj("fullNameC"),
			firstNameCh : fobj("firstNameCh"),
			lastNameCh : fobj("lastNameCh"),
			fnen : fobj("firstNameSh"),
			lnen : fobj("lastNameSh"),
			country : fobj("nationality"),
			sex : fobj("psnSex"),
			birth : fobj("birthday"),
			cardType : fobj("cardType"),
			cardNo : fobj("cardNo"),
			validDate : fobj("validDate"),
	};
	return showValue;
}
//免驱二维码解析字符串
function updateViewByQrCode(event){
	 if(event.keyCode==13){
		 var nameCh = VM(ic_config.viewPath).f("fullNameC");
		 var qrStr = nameCh.val();
		 if(qrStr=="" || qrStr.length<1){
			 return;
		 }
		 var index=qrStr.search(/\d/);
		 qrStr = qrStr.substring(index);
		 var returnv = handleQRStr(qrStr);
		 if(returnv != 0){//把二维码编号发到后台，获取图像
			 VM('/index/main').cmd({type:'ajax',src:'tempIdCard/idCardInfo', data:{qrCode:returnv, viewFlag:ic_config.viewFlag}});
		 }
	 }  
}