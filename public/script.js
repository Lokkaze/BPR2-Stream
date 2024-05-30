// window.onload = function() {
// connect_server();
// requestMedia();
// };
//	var constraints = navigator.mediaDevices.getSupportedConstraints();
//	console.log("constraints", constraints);
//	console.log("constraints", constraints.frameRate.value);

function fail(str){alert(str+"\nUnable to access the camera Please ensure you are on HTTPS and using Firefox or Chrome.");location.replace('http://mozilla.org/firefox');}
	
var output_console=document.getElementById('output_console'),
	output_message=document.getElementById('output_message'),
	output_video=document.getElementById('output_video'),
	button_start=document.getElementById('button_start');
	button_face_start=document.getElementById('button_face_start'),
	button_avatar=document.getElementById('button_avatar'),
	canvas=document.getElementById('canvas'),
	ctx=canvas.getContext('2d');

	
var height = 240,
	width = 320,
	framerate = 15,
	audiobitrate = 22050,
	option_url = 'rtmp://34.17.2.235/live/test?secret=4f25f5d270444eaca73954df438510ca',
	socketio_address = '/',
	backend_url = 'http://localhost:8080',
	detecting = true
	loadedImages = {};



	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const userId = urlParams.get('userid');
	const examId = urlParams.get('examId');
	const statusMode = urlParams.get('statusMode');

	if(statusMode === "shareCamera") {
		buttonFaceStart();
		connect_server();
		requestMedia();
	}

	// if(statusMode === "changeAvatar") {
	// 	avatarRecognize();
	// 	showMedia();
	// 	button_avatar.style.display = "block";
	// }

	if(userId) {
		const newUrl = `rtmp://34.17.2.235/live/${userId}?secret=4f25f5d270444eaca73954df438510ca`;
		option_url = newUrl;
	}


	var url=option_url;
	console.log(url)

console.log("framerate", framerate);

button_start.onclick=requestMedia;
button_stop.onclick=stopStream;
button_server.onclick=connect_server;
button_face_start.onclick=buttonFaceStart;
// button_avatar.onclick=catchAvatar;

var oo=document.getElementById("checkbox_Reconection");
	//just start the server
	//connect_server;
	var mediaRecorder;
 	var socket ;
 	var state ="stop";
	console.log("state initiated = " +state); 
 	var t;
	button_start.disabled=true;
	button_stop.disabled=true;

	function video_show(stream){
		if ("srcObject" in output_video) {
			output_video.muted = true;
			output_video.srcObject = stream;
			
		} else {
			output_video.src = window.URL.createObjectURL(stream);
		}
  	  output_video.addEventListener( "loadedmetadata", function (e) {
	  		//console.log(output_video);
			output_message.innerHTML="Local video source size:"+output_video.videoWidth+"x"+output_video.videoHeight ;
		}, false );
	}

	function show_output(str){
		output_console.value+="\n"+str;
		output_console.scrollTop = output_console.scrollHeight;
	};


	function timedCount(){
		var oo=document.getElementById("checkbox_Reconection");
		if(oo.checked) {
			console.log("timed count state = " +state);
 	   	 	if(state=="ready"  ){ 
				console.log("reconnecting and restarting the media stream");
 		  		//do I need to rerun the request media?
			 
				connect_server();
 		   		button_start.disabled=false;
				button_server.disabled=true;
 	   		}	
 	  		else{
				console.log("not ready yet - wating 1000ms");
  				t=setTimeout("timedCount()",1000);
  		  	  connect_server();
				output_message.innerHTML="try connect server ...";
				button_start.disabled=true;
				button_server.disabled=false;
 	   	 }
 		}
 		else
 			{
				//reconnection is off
				console.log("reconnection is off, buttons hcnage and we are done.");
				button_start.disabled=true;
				button_server.disabled=false;
 			}
	}

	function connect_server(){
		navigator.getUserMedia = (navigator.mediaDevices.getUserMedia ||
                          navigator.mediaDevices.mozGetUserMedia ||
                          navigator.mediaDevices.msGetUserMedia ||
                          navigator.mediaDevices.webkitGetUserMedia);
		if(!navigator.getUserMedia){fail('No getUserMedia() available.');}
		if(!MediaRecorder){fail('No MediaRecorder available.');}


		var socketOptions = {secure: true, reconnection: true, reconnectionDelay: 1000, timeout:15000, pingTimeout: 15000, pingInterval: 45000,query: {framespersecond: framerate, audioBitrate: audiobitrate}};
		
		//start socket connection
		socket = io.connect("/", socketOptions);
		// console.log("ping interval =", socket.pingInterval, " ping TimeOut" = socket.pingTimeout);
 		//output_message.innerHTML=socket;
		
		socket.on('connect_timeout', (timeout) => {
   			console.log("state on connection timeout= " +timeout);
			output_message.innerHTML="Connection timed out";
			
		});
		socket.on('error', (error) => {
   			console.log("state on connection error= " +error);
			output_message.innerHTML="Connection error";
		});
		
		socket.on('connect_error', function(){ 
   			console.log("state on connection error= " +state);
			output_message.innerHTML="Connection Failed";
		});

		socket.on('message',function(m){
			console.log("state on message= " +state);
			console.log('recv server message',m);
			show_output('SERVER:'+m);
			
		});

		socket.on('fatal',function(m){

			show_output('Fatal ERROR: unexpected:'+m);
			//alert('Error:'+m);
			console.log("fatal socket error!!", m);
			console.log("state on fatal error= " +state);
			//already stopped and inactive
			console.log('media recorder restarted');
			
			//mediaRecorder.start();
			//state="stop";
			//button_start.disabled=true;
			//button_server.disabled=false;
			//document.getElementById('button_start').disabled=true;　
			//restart the server
	
			if(oo.checked) {
				//timedCount();
				output_message.innerHTML="server is reload!";
				console.log("server is reloading!");
			}
			//should reload?
		});
		
		socket.on('ffmpeg_stderr',function(m){
			//this is the ffmpeg output for each frame
			show_output('FFMPEG:'+m);	
		});

		socket.on('disconnect', function (reason) {
			console.log("state disconec= " +state);
			show_output('ERROR: server disconnected!');
			console.log('ERROR: server disconnected!' +reason);
			//reconnect the server
			connect_server();
			
			//socket.open();
			//mediaRecorder.stop();
			//state="stop";
			//button_start.disabled=true;
			//button_server.disabled=false;
			//	document.getElementById('button_start').disabled=true;　
			//var oo=document.getElementById("checkbox_Reconection");
			if(oo.checked) {
				//timedCount();
				output_message.innerHTML="server is reloading!";
				console.log("server is reloading!");
			}
		});
	
		state="ready";
		console.log("state = " +state);
		button_start.disabled=false;
		button_stop.disabled=false;
		button_server.disabled=true;
		output_message.innerHTML="connect server successful";
}


function requestMedia(){
	
	var constraints = { audio: {sampleRate: audiobitrate, 
								echoCancellation: true},
		video:{
	        width: { min: 100, ideal: width, max: 1920 },
	        height: { min: 100, ideal: height, max: 1080 },
			frameRate: {ideal: framerate}
	    }
	};
	console.log(constraints);
	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {

		//let supported = navigator.mediaDevices.getSupportedConstraints();
		//console.log(supported);
		video_show(stream);//only show locally, not remotely

		socket.emit('config_rtmpDestination',url);
		socket.emit('start','start');
		mediaRecorder = new MediaRecorder(stream);
		mediaRecorder.start(250);
		button_stop.disabled=false;
	 	button_start.disabled=true;
		button_server.disabled=true;
		
		//show remote stream
		var livestream = document.getElementsByClassName("Livestream");
		console.log("adding live stream");
		livestream.innerHtml = "test";

		mediaRecorder.onstop = function(e) {
			console.log("stopped!");
			console.log(e);
			//stream.stop();
				
		}
		
		mediaRecorder.onpause = function(e) {
			console.log("media recorder paused!!");
			console.log(e);
			//stream.stop();
				
		}
		
		mediaRecorder.onerror = function(event) {
			let error = event.error;
			console.log("error", error.name);

  	  };	
		//document.getElementById('button_start').disabled=false;　

		mediaRecorder.ondataavailable = function(e) {
			console.log(e.data);
		  socket.emit("binarystream",e.data);
		  state="start";
		  //chunks.push(e.data);
		}

	}).catch(function(err) {
		console.log('The following error occured: ' + err);
		show_output('Local getUserMedia ERROR:'+err);
		output_message.innerHTML="Local video source size is not support or No camera ?"+output_video.videoWidth+"x"+output_video.videoHeight;
		 state="stop";
		 button_start.disabled=true;
		button_server.disabled=false;
	});
}

function stopStream(){
	console.log("stop pressed:");
	//stream.getTracks().forEach(track => track.stop())
	mediaRecorder.stop();
	button_stop.disabled=true;
 button_start.disabled=true;
button_server.disabled=false;
}

async function startFaceApi(){
	console.log("startFaceApi")
	Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
])
}

function RecognizeFace(){

	output_video.addEventListener('play', () => {
		setInterval(async () => {
			const labels = []
			labels.push(`${userId}`)
            // faceapi.detectFaceLandmarks(output_video).then(landmark68 => {
            //     console.log(landmark68.getMouth())
                
            // })
			const faceDescriptions = await faceapi.detectAllFaces(output_video).withFaceLandmarks().withFaceDescriptors().withFaceExpressions()
			console.log(faceDescriptions)
			const labeledFaceDescriptors = await Promise.all(
				labels.map(async label => {
					if (!loadedImages[label]) {
						const imgUrl = `${backend_url}/upload/${label}.jpg`;
						// 加载图片
						const img = await faceapi.fetchImage(imgUrl);
						// 将图片存储在对象中
						loadedImages[label] = img;
					}
					// 使用已加载的图片
					const img = loadedImages[label];
				//   const imgUrl = `${backend_url}/upload/${label}.jpg`
				//   const img = await faceapi.fetchImage(imgUrl)
				  
				  const faceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
				  if (!faceDescription) {
					throw new Error(`no faces detected for ${label}`)
				  }
				  
				  const faceDescriptors = [faceDescription.descriptor]
				  return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
				})
			)
		
			const threshold = 0.6
			const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, threshold)
		
			const results = faceDescriptions.map(fd => faceMatcher.findBestMatch(fd.descriptor))
		
			console.log(results)
			
			for(const item of results) {
				if(labelNotMatched(item.label)){
					console.log("Cheat detected")
					cheatDetected()
				}
			}
		}, 5000)
	})
}

function buttonFaceStart(){
	startFaceApi().then(() => {
		RecognizeFace()
	})
}

function labelNotMatched(detectedLabel){
	if(detecting === false) {
		return false
	}
	else {
		if(detectedLabel === "unknown"){
		return true
		}
		else return false
	}
}

function cheatDetected() {
	const currentTimeStamp = new Date().getTime()
	cheatDetectedApi(backend_url, userId, examId, currentTimeStamp)
}

// function showMedia() {
// 	var constraints = { audio: {sampleRate: audiobitrate, 
// 			echoCancellation: true},
// 			video:{
// 			width: { min: 100, ideal: width, max: 1920 },
// 			height: { min: 100, ideal: height, max: 1080 },
// 			frameRate: {ideal: framerate}
// 		}
// 	};
// 	console.log(constraints);

// 	navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream) {
// 		avatarCamera.srcObject = mediaStream;
// 		avatarCamera.onloadedmetadata = function(e) {
// 			avatarCamera.play();
// 		};
// 		const track = mediaStream.getVideoTracks()[0];
// 		imageCapture = new ImageCapture(track);

// 		return imageCapture.getPhotoSettings();
// 	})
// 	.then(photoSettings => {
// 		canvas.width = photoSettings.imageWidth;
// 		canvas.height = photoSettings.imageHeight;
// 	})
// 	.catch(function(err) {
// 		console.log(err.name + ": " + err.message);
// 	}); // always check for errors at the end.
	
// }

// var confidence = 0;
// function changeConfidence(){
// 	avatarCamera.addEventListener('play', () => {
// 		setInterval(async () => {
// 			const faceDescriptions = await faceapi.detectSingleFace(avatarCamera)
// 			confidence = faceDescriptions.score
// 			console.log(confidence)
// 		}, 5000)
// 	})
// }

// function avatarRecognize(){
// 	startFaceApi().then(() => {
// 		changeConfidence()
// 	})
// }

// function catchAvatar(){
// 	ctx.drawImage(avatarCamera, 0, 0);
//     var base64Img = canvas.toDataURL();
// 	console.log(base64Img)
//     var oA = document.createElement('a');
//     oA.href = base64Img;
//     oA.download = '截图.png'; // 下载的文件名可以此处修改
//     oA.click();
// }
