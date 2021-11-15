//https://itp.nyu.edu/physcomp/labs/labs-serial-communication/lab-serial-input-to-the-p5-js-ide/#Program_thenbspMicrocontroller

//WITH MOUSE https://editor.p5js.org/MANKA/present/NxBnn0zHb
//https://editor.p5js.org/MANKA/sketches/NxBnn0zHb

let serial; // hold instance of the serialport library
let portName = "/dev/tty.usbserial-02145696";
let inData; // incoming serial data

let mask;
let vid;
let bg;

let pos;
let noiseVal = 0.5;
let noiseScale = 0.01;

//SENSOR VALUES
let xTem, yHum; //sensor values for TEMP and HUM
let xPos, yPos; //mapped sensor values
let lowHum, highHum, lowTem, highTem;
let avgTem = 0;
let avgHum = 0;
let tempArr = [];
let humArr = [];
let index = 0;

function preload() {
  mask = loadImage("hole3.png");
  vid = createVideo("Butoh_flip.mov");
  vid.hide();
  bg = loadImage("teeth4.png");
}

let options = {
  baudrate: 9600,
};


function setup() {
  createCanvas(windowWidth, windowHeight);
  pos = createVector();
  image(bg, 0, 0);
}

function draw() {
  
  let margin = 100; 
  generateSensorValues();
  
  let perc = 0.01; // 5% speed of easing
  let targetVector = createVector(xPos, yPos);

  pos = p5.Vector.lerp(pos, targetVector, perc);

  push();
  imageMode(CENTER);
  image(vid, pos.x, pos.y, 640, 360);
  pop();

  // ocean color
  background(64, 176, 231, 5); 
  
  // mask image
  noiseVal = noise((xPos + width / 2.2) * noiseScale, 10 * noiseScale);
  let yoffset = 30;
  image(mask, 0, noiseVal * -yoffset, width, height + yoffset);
}

function generateSensorValues() {
  let margin = 100;
  
  // temp: 28 - 30 deg
  lowTem = 28;
  highTem = 30;
  avgTem = map(mouseX, 0, width, lowTem, highTem);
  xPos = map(avgTem, lowTem, highTem, 0 + margin, width - margin, true);
  
  // humidity: 340 - 360  
  lowHum = 340;
  highHum = 700;
  avgHum = map(mouseY, 0, height, lowHum, highHum);
  yPos = map(avgHum, lowHum, highHum, 0 + margin, height - margin, true);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  vid.loop();
  //sound.loop();
}

function serialEvent() {
  let inData = serial.readLine();
  if (inData.length > 0) {
    //console.log(inData);
    let sensors = split(inData, ","); // splits the inData string on the commas
    if (sensors.length > 1) {
      xTem = sensors[0];
      yHum = sensors[1];

      //console.log("xTem= " + xTem + " yHum= " + yHum);

      tempArr[index] = xTem;
      humArr[index] = yHum;
      index++;
      if (index > 20) {
        index = 0;
      }
      lowTem = min(tempArr); //p5 function
      highTem = max(tempArr);
      lowHum = min(humArr);
      highHum = max(humArr);

      let temSum = 0;
      let humSum = 0;
      for (let i = 0; i < tempArr.length; i++) {
        //console.log(tempArr[i]);
        temSum = temSum + parseFloat(tempArr[i]); //turn string to floating point number
        humSum = humSum + parseFloat(humArr[i]);
      }

      avgTem = temSum / tempArr.length;
      avgHum = humSum / humArr.length;

      //console.log(temSum);
      //console.log(humSum);
    }
  }
}

function setupSerial() {
  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on("list", printList);
  serial.on("connected", serverConnected); // callback for connecting to the server (p5 serial control and browser)
  serial.on("open", portOpen); // callback for the port opening
  serial.on("data", serialEvent); // callback for when new data arrives
  serial.on("error", serialError); // callback for errors
  serial.on("close", portClose); // callback for the port closing
  serial.open(portName, options); // open a serial port
}

// get the list of ports:
function printList(portList) {
  // portList is an array of serial port names
  for (var i = 0; i < portList.length; i++) {
    // Display the list the console:
    console.log(i + " " + portList[i]);
  }
}

function serverConnected() {
  console.log("connected to server.");
}

function portOpen() {
  console.log("the serial port opened.");
}

function serialError(err) {
  console.log("Something went wrong with the serial port. " + err);
}

function portClose() {
  console.log("The serial port closed.");
}
