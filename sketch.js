// Special thanks to...
// 	- Mimi Yi for pointing me towards noise()
// 	- Dan Shiffman for saying it is okay to give up on 
//   	measuring specific frequencies through fft analysis
//  - Aarón Montoya for giving me the math to get amplitude
//   	to correspond to strokeWeight
//  - Mathura for giving me the math to smooth it out
//	- Mathura again for showing me how to do CSS animations 
//		with @keyframes: https://developer.mozilla.org/en-US/docs/Web/CSS/%40keyframes
//  - Leon for helping me remember what classes are 
//  - Allison Parrish for showing me the importance of https

let mic, amp, vol, fft, peakDetect;
let strokeVol = 0; 
let volHist = []; // holds all amp.getLevel readings
let seedlings = []; // holds all instances of Seedling 
let s; // calls a new Seedling
let bin = 0; // the starting bin for buttonTexts[]
let buttonTexts = ["Sing to us and we grow.",
  "They tried to bury us.",
  "They forgot we were seeds.",
  "Si nos cantas, crecemos.",
  "Quisieron enterrarnos.",
  "Se les olvidaron que somos semillas.",
];


function setup() {
  createCanvas(600, 600);
  
  // turn on mic
  mic = new p5.AudioIn(print("mic detected"),
    function() {
      print("no mic detected")
    });
  mic.start(print("mic on"),
    function() {
      print("mic off")
    });

  // connect Amplitude to mic
  amp = new p5.Amplitude();
  amp.setInput(mic);

  // connect FFT to mic
  fft = new p5.FFT();
  fft.setInput(mic);
  peakDetect = new p5.PeakDetect(0.99);

}


function draw() {
  background(240);

  // measure Amplitude and push it to volHist[]
  vol = amp.getLevel();
  volHist.push(vol);

  // measure the frequency spectrum and detect peaks in higher frequencies
  fft.analyze();
  peakDetect.update(fft);

  // draw each segment of the seedling
  for (i = seedlings.length-1; i >=0; i--) {
    
    // only draw if volume is a above 0.05
    if (vol > 0.05) {
      seedlings[i].grow();
      
      // draw a bud if a peak in higher frequencies is detected
      if (peakDetect.isDetected) {
        print("PEAK DETECTED!");
        seedlings[i].bud();
      }
    }
    seedlings[i].display();
      
  	if (seedlings[i].length > height) {
    	seedlings.splice(i, 1);
  	}
  }

}

// SEEDLING
class Seedling {

  constructor() {
    this.x = random(5, width - 5);
    this.y = height;
    this.t = 0; // starting time of the noise() oscillation
    this.history = []; // holds all vectors for every seedling
    this.buds = []; // holds all buds for every seedling
  }

  // GROW
  grow() {
    this.t += 0.03;
    this.x += noise(this.t) - 0.5; // x-position of each new segment oscillates between two points
    
    // map every recorded amplitude to the y-position of each new segment
    this.y -= map(volHist[volHist.length - 1], 0, 1, 0, 15); 

    // use vectors to determine the x and y positions
    // push those vectors to the this.history[] array
    let v = createVector(this.x, this.y);
    this.history.push(v);
  }

  bud() {
    
    // draw each bud at the same vector of the seedling
    // push those vectors to the buds[] array
    let v = createVector(this.x, this.y);
    this.buds.push(v);
  }

  // DISPLAY
  display() {

    if (this.history.length > 1) {
      for (let i = 1; i < this.history.length; i++) {

        //width is dependent on volume
        strokeVol = (volHist[i - 1] * 0.05) + (0.95 * strokeVol);
        strokeWeight(map(strokeVol, 0, 0.6, 3, 50));
        
        //color is dependent on y position
        stroke(0,
          255 / 2 + 255 / 2 * this.history[i].y / height,
          0);
        if (i != 0) {
          line(this.history[i].x,
            this.history[i].y,
            this.history[i - 1].x,
            this.history[i - 1].y);
        }
      }
      
      // the bud is drawn as a flower based on this: https://p5js.org/examples/hello-p5-simple-shapes.html
      for (let i = 0; i < this.buds.length; i++) {
        push();
        translate(this.buds[i].x, this.buds[i].y);
        noStroke();
        for (var j = 0; j < 12; j ++) {
          fill(255-(j*3), 134-(j*3), 180, 240)
        	ellipse(0, 8, 7, 16);
          rotate(PI/5);
        }
        pop();
      }
    }
  }
}

// Sprout
function Sprout() {
  
  // draw a new Seedling
  // and push it to the seedlings[] array
  s = new Seedling();
  seedlings.push(s);
  
  	// DOM elements that make the text appear and disappear
    select('#text').position(random(width/2 - 200, width/2-50), random(250, 500));
  	select('#text').html(buttonTexts[bin]);
    select('#text').addClass('fade');
   	setTimeout(function() {select('#text').removeClass('fade');}, 6000);

  	bin ++;
  
  // cycle through the buttonTexts[] array
  if (bin > 5) {
    bin = 0;
  }
    
}
  
