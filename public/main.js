var Chara = function(id, x, y, chartxt, name){
	this.x = x;
	this.y = y;
	this.addStyle = "";

	if(chartxt.trim() == '' || chartxt == undefined || chartxt == null){
		this.chartxt = '☺';
	} else {
		this.chartxt = chartxt;	
		this.addStyle = "font-size:130%;";
	}

	if(chartxt.trim().length <= 2){
		this.addStyle = "font-size:280%;";
	}

	if(name.trim() == '' || name == undefined || name == null){
		this.name = 'player';
	} else {
		this.name = name;
	}

	this.image =    "<div id='" + id + "' style='position:absolute;top:" + this.y + "px; left:" + this.x + "px;'>" + 
					"<div id='text_" + id + "' style='height:20px;' ></div>" + 
					"<div id='char_"+ id + "' style='padding:10px 0;padding-left:3px;" + this.addStyle + "'>" + this.chartxt + "</div>" +
					"<div>" + this.name + " :[" + id + "]</div>"+
					"</div>";

	this.id = id;
}

var socket;
var mychar = '';
function random_code()
{
	function ri(min, max)
	{
		return Math.floor(Math.random() * (max-min))+min;
	}
	return ri(1,10);
}

$(function(){
    $('#chatStage').click(function(event) {

		mychar.x = event.clientX;
		mychar.y = event.clientY;
    	$('#'+mychar.id).animate({'top':event.clientY,'left':event.clientX},500);
		socket.emit('position send', mychar.x, mychar.y);
    });
});


var characters = {};
window.onload=function(){
	//初期表示制御
	notDisplayChatStage();
}

function notDisplayChatStage(){
	$("#chatStage").css("display", "none");
	$("#inputStage").css("display", "block");
	$("#messageArea").css("display", "none");
	$("#logArea").css("display", "none");
	$("#toolArea").css("display", "none");
}

function showDisplayChatStage(){
	$("#chatStage").css("display", "block");
	$("#inputStage").css("display", "none");
	$("#messageArea").css("display", "block");
	$("#logArea").css("display", "block");
	$("#toolArea").css("display", "block");
}

function startSmileChat(){
	this.socket = io.connect(location.href);
	var socket = this.socket;
	var chartxt = $("#inputCharText").val();
	var playername = $("#inputPlayerName").val();


	socket.on('connect', function() { 

		socket.emit('init', 0, 10, 10, chartxt, playername);

		socket.on('ready', function (id) {
			// console.log("ready " + id);
			mychar = new Chara(id, 10, 10, chartxt, playername);
			$("#chatStage").append(mychar.image);
		});

		socket.on('msg push', function (id, name, msg) {
			// EVENT:ユーザからメッセージが届いた時に通知される
			// console.log("msg push:"+msg);
			showMessage('#text_' + id, name, msg);
		});
		socket.on('new character', function (other_char) {
			// EVENT:ユーザがアクセス時に通知される
			// console.log("new character:"+other_char.id);
			// other user add - 他のユーザがアクセス時に新規追加
			if(mychar.id != other_char.id){
				var new_other_char = new Chara(other_char.id, other_char.x, other_char.y, other_char.chartxt, other_char.playername);
				$("#chatStage").append(new_other_char.image);
			}
		});
		socket.on('position push', function (id, x, y) {
				// EVENT:ユーザーが動いた時に通知される
				// console.log("position push" + id + ": " + x + "," + y);
				updatePosition(id, x, y);
		});
		socket.on('delete character', function (id) {
			// EVENT:ユーザー退出時に通知される
			// console.log("delete character");
			$("#"+id).remove();
		});

	});

	showDisplayChatStage();
}

function sendMsg(){
	//console.log(mychar.name + mychar.id + mymsg);

	var mymsg = $('#text').val();
	socket.emit("msg send", mymsg);

	showMessage('#text_'+mychar.id, mychar.name, mymsg);

	if($("#clearChk").prop('checked')){
		$('#text').val("");
	}
}

function showMessage(selecter, playername, msg){
	$(selecter).text(msg);
	$(selecter).css("background", "#333");
	$(selecter).css("color", "#fff");
	$(selecter).css("padding", "3px");

  	setTimeout(function(){
		$(selecter).text(''); 
		$(selecter).css("background", "none");
		$(selecter).css("padding", "0px");
	}, 3000);

	//ログに追加
	$('#logArea ul').prepend('<li>'+ playername + ' : ' + msg +'</li>');
}

function showLog(selecter){
	var height = $("#" + selecter).height();	
	if(height <= 300){
		$("#" + selecter).height(height+50);
	} else {
		$("#" + selecter).height(30);
	}
}

function updatePosition(id, x, y){
    $('#'+id).animate({'top':y,'left':x},500);
}

