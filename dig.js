/* dig.js contains functions for digging a rectangular area (digRect), a crater (digCrater),
 * or a base area (digBase) in the map.
 */

/* globals bufferCtx, bgData, shapesData, fgData, digData, mapImage,
 * lens, sparks,
 * MAP_WIDTH, MAP_HEIGHT,
 * collides, playSound, sndDigRandom, baseDigData
 */

// Remove pixels in this area. (x,y should be in the top-left.) Return false when nothing to dig
function digRect(x7, y7, w, h) {

  // Get cutout from the buffer
  const cutout = bufferCtx.getImageData(x7, y7, w, h);
  const data = cutout.data;
  let dug = 0;

  let rx = 0, ry = 0;

  // Loop through each pixel (rgba values) in the cutout
  for (let i = 0; i < data.length; i += 4) {

    // Calculate where we are in [digData] / [bgData]
    let ptr1 = ((y7 + ry) * MAP_WIDTH) + (x7 + rx);
    let ptr4 = ((y7 + ry) * MAP_WIDTH * 4) + ((x7 + rx) * 4);

    // When this pixel in [digData] has not been digged yet (value 0), update it to 1
    if (digData[ptr1] == 0) {
      digData[ptr1] = 1;
      dug++;

      // Copy pixel from [bgData] into the cutout
      for (let rgba = 0; rgba < 4; rgba++) {
        data[i + rgba] = bgData[ptr4 + rgba];
      }
    }

    // Move to next relative x,y coordinate
    if (++rx >= w) {
      rx = 0;
      ry++;
    }
  }

  // Put cutout back in the buffer
  if (dug) {
    bufferCtx.putImageData(cutout, x7, y7);
    if (collides({x: x7, y: y7, w: w, h: h}, lens)) {
      playSound(sndDigRandom());
    }
  }
  return dug;
}

// Remove random pixels in this area. (x,y should be in the center.) Return false when nothing to dig
function digCrater(x5, y5, w, h) {
  const x7 = x5 - Math.floor(w / 2);
  const y7 = y5 - Math.floor(h / 2);

  const cutout = bufferCtx.getImageData(x7, y7, w, h);
  const data = cutout.data;
  let dug = false;

  let rx = 0, ry = 0;

  // Seed a random number generator with the crator coordinates
  const rand = sfc32(x5, y5, w, h);

  // Loop through each pixel (rgba values) in the cutout
  for (let i = 0; i < data.length; i += 4) {

    // Calculate where we are in [digData] / [bgData]
    let ptr1 = ((y7 + ry) * MAP_WIDTH) + (x7 + rx);
    let ptr4 = ((y7 + ry) * MAP_WIDTH * 4) + ((x7 + rx) * 4);

    // When this pixel in [digData] has not been digged yet (value 0), update it to 1
    if (digData[ptr1] == 0) {

      if (Math.round(rand() * 0.75)) {
        digData[ptr1] = 1;
        dug = true;
        sparks.push({x: (x7 + rx), y: (y7 + ry), color: Math.round(Math.random() * 3), age: w});

        // Copy color values from [bgData] into the cutout
        for (let rgba = 0; rgba < 4; rgba++) {
          data[i + rgba] = bgData[ptr4 + rgba];
        }
      }
    }

    // Move to next relative x,y coordinate
    if (++rx >= w) {
      rx = 0;
      ry++;
    }
  }

  // Put cutout back in the buffer
  if (dug) {
    bufferCtx.putImageData(cutout, x7, y7);
  }
  return dug;
}

// sfc32 seeded random number generator from the PractRand random number testing suite.
// Code from user bryc on StackOverflow, who granted permission to "use the code for whatever purpose".
// We seed this PRNG with the crater's x,y,w,h points so it will generate the same random numbers on all clients. 
function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
    var t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

// Mark transparent pixels on the map image as digged
function digTransparentAreas() {

  // Draw the map image on a temporary canvas
  const buf = document.createElement('canvas');
  buf.id = 'tmp_canvas';
  buf.width = MAP_WIDTH;
  buf.height = MAP_HEIGHT;
  const bufCtx = buf.getContext('2d');
  bufCtx.imageSmoothingEnabled = false;
  bufCtx.drawImage(mapImage, 0, 0);

  // Get the image data from the map image canvas
  const fgData = bufCtx.getImageData(0, 0, MAP_WIDTH, MAP_HEIGHT).data;

  // Loop through the image data, and mark transparent pixels as dug in the digData array
  for (let i = 0; i < fgData.length; i += 4) {
    if (fgData[i + 3] != 255) {
      digData[i / 4] = 1;
    }
  }
}

// Dig the pixels inside a base
function digBase(base) {

  // Get pixel layout of the base
  const baseData = baseDigData();

  // Get cutout from the map buffer
  const cutout = bufferCtx.getImageData(base.x, base.y, base.w, base.h);
  const data = cutout.data;

  let rx = 0, ry = 0;

  // Loop through each pixel (rgba values) in the cutout
  for (let i = 0; i < data.length; i += 4) {

    // Calculate where we are in [digData] / [bgData]
    let ptr1 = ((base.y + ry) * MAP_WIDTH) + (base.x + rx);
    let ptr4 = ((base.y + ry) * MAP_WIDTH * 4) + ((base.x + rx) * 4);

    let d = baseData[ry][rx];
    if (d == '1' || d == '3') {
      // When this pixel in [digData] has not been digged yet (value 0), update it to 1
      if (digData[ptr1] == 0) {
        digData[ptr1] = 1;

        // Copy pixel from [bgData] into the cutout
        for (let rgba = 0; rgba < 4; rgba++) {
          data[i + rgba] = bgData[ptr4 + rgba];
        }
      }
    }

    // Move to next relative x,y coordinate
    if (++rx >= base.w) {
      rx = 0;
      ry++;
    }
  }

  // Put cutout back in the buffer
  bufferCtx.putImageData(cutout, base.x, base.y);
}
