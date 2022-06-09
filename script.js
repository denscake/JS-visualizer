var context;
var src;
var analyser;
var delay;

var bufferLength;
var dataArray;

let upper_level = -22;
let lower_level = -60;
let audio_smoothing = 0.00;
let sync_up_delay = 0.12;

let freq_range_low = 30; 
let freq_range_high = 100;
let freq_range = freq_range_high - freq_range_low;

var loaded = false;

var audio;
var path1;

let circle_offset = 100;
let center_x = 250;
let center_y = 250;
	
let max_radius = 200;


var buffer = [];
let buffer_steps = 2;
let buffer_len = buffer_steps * 6;
var buffer_fill = 0;

var last = 500;

const map = (value, inMin, inMax, outMin, outMax) => {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
};

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

function setup(){
	if (!loaded){
		audio = document.getElementById('audio');
		context = new AudioContext();
		src = context.createMediaElementSource(audio);
		analyser = context.createAnalyser();
		delay = context.createDelay();

		src.connect(analyser);
		analyser.connect(delay);
		delay.connect(context.destination);

		analyser.fftSize = 32768;
		analyser.minDecibels = lower_level;
		analyser.maxDecibels = upper_level;
		delay.delayTime.value = sync_up_delay;
		analyser.smoothingTimeConstant = audio_smoothing;

		bufferLength = analyser.frequencyBinCount;
		dataArray = new Uint8Array(bufferLength);
		
		loaded = true;
	}
}

function getCircleX(radians, dis) {
  return Math.sin(radians) * (circle_offset + dis);
}

function getCircleY(radians, dis) {
  return -Math.cos(radians) * (circle_offset + dis);
}

function draw_circle(outdataArray){
	var out = "";
	
	
	for (var i = 0; i < freq_range; i++){
		
		if (i == 0){
			out += "M ";
		}else{
			out += "L ";
		}
		 
		var angle = Math.PI * (i / freq_range);
		
		var spike = map(outdataArray[i], 0, 255, 0, max_radius - circle_offset);
		
		out += center_x + getCircleX(angle , spike);
		out += " ";
		out += center_y + getCircleY(angle , spike);
		out += " ";
		
	}
	
	for (var i = freq_range - 1; i >= 0; i--){
		
		out += "L ";
		 
		var angle = Math.PI * (i / freq_range);
		
		var spike = map(outdataArray[i], 0, 255, 0, max_radius - circle_offset);
		
		out += center_x - getCircleX(angle , spike);
		out += " ";
		out += center_y + getCircleY(angle , spike);
		out += " ";
		
	}
	out += "Z ";
	return out;
}

function draw(){
	analyser.getByteFrequencyData(dataArray);
    var outdataArray = dataArray.slice(freq_range_low, freq_range_high);
	
	var sum = 0;
	
	for (var i = 0; i < freq_range; i++){
		sum += outdataArray[i];
	}
	var derivative = sum - last;
	last = sum - derivative * 0.9;
	
	
	var scale = map(derivative, 0, 2000, 1, 1.1).clamp(1, 1.5);
	
	var elem = document.getElementById("group");
	var bBox = elem.getBBox();
	var scaleX = scale;
	var scaleY = scale;
	group.setAttribute("transform", "scale("+scaleX+", "+scaleY+")");
	
	
	//transform="scale(1 0.5), translate(-36 45.5)"
	//transform="matrix(0.972598, 0, 0, 1.560976, 10.449213, -124.188278)"
	
	
	var out = draw_circle(outdataArray);
	
	
	
	buffer.push(out);
	
	if(buffer_fill == buffer_len + 1){
		buffer.shift();
		
		path1 = document.getElementById('path1');
		path1.setAttribute("d", buffer[buffer_steps * 6]);
		
		path2 = document.getElementById('path2');
		path2.setAttribute("d", buffer[buffer_steps * 5]);
		
		path3 = document.getElementById('path3');
		path3.setAttribute("d", buffer[buffer_steps * 4]);
		
		path4 = document.getElementById('path4');
		path4.setAttribute("d", buffer[buffer_steps * 3]);
		
		path5 = document.getElementById('path5');
		path5.setAttribute("d", buffer[buffer_steps * 2]);
		
		path6 = document.getElementById('path6');
		path6.setAttribute("d", buffer[buffer_steps * 1]);
		
		path7 = document.getElementById('path7');
		path7.setAttribute("d", buffer[buffer_steps * 0]);
		
		
		
	}else{
		buffer_fill++;
	}
	
	
	
	

}



function touchStarted() {
	setup();
	var intervalId = window.setInterval(function(){
	 draw();
	}, 16);
}