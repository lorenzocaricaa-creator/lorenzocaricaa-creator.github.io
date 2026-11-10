// Choose an art-directed composition for each viewport, preserving the portrait's proportions.
export function coverComposition(width,height){
 if(height>width)return {src:'/portfolio-en/assets/entry-portrait-mobile.webp',width:941,height:1672,mouthX:.497,mouthY:.478};
 return {src:'/portfolio-en/assets/entry-portrait-approved.png',width:1910,height:823,mouthX:.483,mouthY:.665,fit:'contain'};
}

// Retained framed layout for previews that explicitly request a complete illustration.
export function artworkFrame(width,height,sourceWidth,sourceHeight){
 const side=12,rail=12;
 const availableWidth=Math.max(1,width-side*2),availableHeight=Math.max(1,height-rail*2);
 const scale=Math.min(availableWidth/sourceWidth,availableHeight/sourceHeight);
 const drawWidth=sourceWidth*scale,drawHeight=sourceHeight*scale;
 return {left:(width-drawWidth)/2,top:(height-drawHeight)/2,width:drawWidth,height:drawHeight,scale};
}
export function artworkSVG(width,height,source,{fullscreen=false}={}){
 const scale=source.fit==='contain'?Math.min(width/source.width,height/source.height):Math.max(width/source.width,height/source.height);
 const frame=fullscreen?{left:(width-source.width*scale)/2,top:(height-source.height*scale)/2,width:source.width*scale,height:source.height*scale,scale}:artworkFrame(width,height,source.width,source.height);
 const border=fullscreen?'':`<rect x="${frame.left+.5}" y="${frame.top+.5}" width="${Math.max(0,frame.width-1)}" height="${Math.max(0,frame.height-1)}" fill="none" stroke="#000" stroke-width="1"/>`;
 return {frame,svg:`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false"><image href="${source.src}" x="${frame.left}" y="${frame.top}" width="${frame.width}" height="${frame.height}" preserveAspectRatio="xMidYMid meet"/>${border}</svg>`};
}
