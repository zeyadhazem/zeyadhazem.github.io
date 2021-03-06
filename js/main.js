/**
 * ===================================================================
 *                                Main js
 * ===================================================================
 */

/**
 * ====================================================================
 *                           3D shapes animation
 * ====================================================================
 */

var {atan2,sqrt,sin,cos,PI,acos} = Math;

function project3D(x,y,z,vars){

    x-=vars.camX,y-=vars.camY,z-=vars.camZ;
    p=atan2(x,z),d=sqrt(z*z+x*x),x=sin(p-vars.yaw)*d,z=cos(p-vars.yaw)*d;
    p=atan2(y,z),d=sqrt(y*y+z*z),y=sin(p-vars.pitch)*d,z=cos(p-vars.pitch)*d;
    n=-9,b=1,l=9,d=1,e=0,f=0,g=x,h=z,k=(h-f)*(l-n)-(g-e)*(d-b),m=((g-e)*(b-f)-(h-f)*(n-e))/k;
    return {x:vars.cx+(n+m*(l-n))*vars.scale,y:vars.cy+y/z*vars.scale,d:sqrt(x*x+y*y+z*z)};
}

function elevation(x,y,z){

    return acos(z / sqrt(x*x+y*y+z*z));
}


function subdivide(shape,subdivisions){

    var t=shape.segs.length;
    for(var i=0;i<t;++i){
        var x1=shape.segs[i].a.x;
        var y1=shape.segs[i].a.y;
        var z1=shape.segs[i].a.z;
        var x2=(shape.segs[i].b.x-x1)/subdivisions;
        var y2=(shape.segs[i].b.y-y1)/subdivisions;
        var z2=(shape.segs[i].b.z-z1)/subdivisions;
        shape.segs[i].b.x=x1+x2;
        shape.segs[i].b.y=y1+y2;
        shape.segs[i].b.z=z1+z2;
        var x3=x2;
        var y3=y2;
        var z3=z2;
        for(var k=0;k<subdivisions-1;++k){
            shape.segs.push(new Seg(x1+x2,y1+y2,z1+z2,x1+x2+x3,y1+y2+y3,z1+z2+z3));
            x2+=x3;
            y2+=y3;
            z2+=z3;
        }
    }
}

function Vert(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
}


function Seg(x1,y1,z1,x2,y2,z2){
    this.a = new Vert(x1,y1,z1);
    this.b = new Vert(x2,y2,z2);
    this.dist=0;
}


function Polygon(){

    this.verts=new Array();
    this.dist=0;
}


function process(vars){

    p = atan2(vars.camX, vars.camZ);
    d = sqrt(vars.camX * vars.camX + vars.camZ * vars.camZ);
    d -= sin(vars.frameNo / 80) / 50;
    t = sin(vars.frameNo / 200) / 100;
    vars.camX = sin(p + t) * d;
    vars.camZ = cos(p + t) * d;
    vars.camY -= cos(vars.frameNo / 160) / 80;
    vars.yaw = PI + p + t;
    vars.pitch = elevation(vars.camX, vars.camZ, vars.camY) - PI / 2;
}

function draw(vars){

    vars.ctx.globalAlpha=1;
    vars.ctx.fillStyle="#012";
    vars.ctx.fillRect(0, 0, vars.canvas.width, vars.canvas.height);

    var x1,y1,z1,x2,y2,z2,point1,point2;

    for(var i=0;i<vars.shapes.length;++i){
        for(var j=0;j<vars.shapes[i].polys.length;++j){
            if(i%2){
                vars.ctx.globalAlpha=.75;
                vars.ctx.fillStyle="#fff";
                x=vars.shapes[i].x+vars.shapes[i].polys[j].cx;
                y=vars.shapes[i].y+vars.shapes[i].polys[j].cy;
                z=vars.shapes[i].z+vars.shapes[i].polys[j].cz;
                point1=project3D(x,y,z,vars);
                if(point1.d != -1){
                    var s=15/(1+point1.d);
                    vars.ctx.fillRect(point1.x-s/2,point1.y-s/2,s,s);
                }
            }else{
                vars.ctx.globalAlpha=.1;
                for(var k=0;k<vars.shapes[i].polys[j].segs.length;++k){
                    x=vars.shapes[i].x+vars.shapes[i].polys[j].segs[k].a.x;
                    y=vars.shapes[i].y+vars.shapes[i].polys[j].segs[k].a.y;
                    z=vars.shapes[i].z+vars.shapes[i].polys[j].segs[k].a.z;
                    point1=project3D(x,y,z,vars);
                    if(point1.d != -1){
                        vars.shapes[i].polys[j].segs[k].dist=point1.d;
                        x=vars.shapes[i].x+vars.shapes[i].polys[j].segs[k].b.x;
                        y=vars.shapes[i].y+vars.shapes[i].polys[j].segs[k].b.y;
                        z=vars.shapes[i].z+vars.shapes[i].polys[j].segs[k].b.z;
                        point2=project3D(x,y,z,vars);
                        if(point2.d != -1){
                            vars.ctx.strokeStyle="#0f8";
                            vars.ctx.lineWidth=15/(1+point1.d);
                            vars.ctx.beginPath();
                            vars.ctx.moveTo(point1.x,point1.y);
                            vars.ctx.lineTo(point2.x,point2.y);
                            vars.ctx.stroke();
                        }
                    }
                }
            }
        }
    }
}

function pushVert(p1,p2,dist,poly){

    x=sin(p1)*sin(p2)*dist;
    z=cos(p1)*sin(p2)*dist;
    y=cos(p2)*dist;
    poly.verts.push(new Vert(x,y,z));
}


function expandShape(shape,convexity){

    for(j=0;j<shape.polys.length;++j){
        x=shape.polys[j].cx;
        y=shape.polys[j].cy;
        z=shape.polys[j].cz;
        d=sqrt(x*x+y*y+z*z);
        p1=atan2(x,y);
        p2=elevation(x,y,z);
        d2=d+(1-d)*convexity;
        shape.polys[j].cx=sin(p1)*sin(p2)*d2;
        shape.polys[j].cy=cos(p1)*sin(p2)*d2;
        shape.polys[j].cz=cos(p2)*d2;
        for(k=0;k<shape.polys[j].verts.length;++k){
            x=shape.polys[j].verts[k].x;
            y=shape.polys[j].verts[k].y;
            z=shape.polys[j].verts[k].z;
            d=sqrt(x*x+y*y+z*z);
            p1=atan2(x,y);
            p2=elevation(x,y,z);
            d2=d+(1-d)*convexity;
            shape.polys[j].verts[k].x=sin(p1)*sin(p2)*d2;
            shape.polys[j].verts[k].y=cos(p1)*sin(p2)*d2;
            shape.polys[j].verts[k].z=cos(p2)*d2;
        }
    }
    return shape;
}

function segmentize(source){

    var polys=[],x1,y1,z1,x2,y2,z2;
    for(var i=0;i<source.length;++i){
        var poly={};
        poly.segs=[];
        for(var j=0;j<source[i].verts.length;++j){
            x1=source[i].verts[j].x;
            y1=source[i].verts[j].y;
            z1=source[i].verts[j].z;
            if(j<source[i].verts.length-1){
                x2=source[i].verts[j+1].x;
                y2=source[i].verts[j+1].y;
                z2=source[i].verts[j+1].z;
            }else{
                x2=source[i].verts[0].x;
                y2=source[i].verts[0].y;
                z2=source[i].verts[0].z;
            }
            poly.segs.push(new Seg(x1,y1,z1,x2,y2,z2));
        }
        polys.push(poly);
    }
    return polys;
}


function Shape(x,y,z){

    this.polys=[];
    this.x=x, this.y=y, this.z=z;
}


function Icosahedron(x,y,z){

    var size=1, phi = 1.61803398875;
    this.polys=[];
    this.x=x, this.y=y, this.z=z, this.dist=0;
    x1=-phi, y1=-1, z1=0, x2=phi, y2=-1, z2=0, x3=phi, y3=1, z3=0, x4=-phi, y4=1, z4=0,
        y5=-phi, z5=-1, x5=0, y6=phi, z6=-1, x6=0, y7=phi, z7=1, x7=0, y8=-phi, z8=1, x8=0,
        z9=-phi, x9=-1, y9=0, z10=phi, x10=-1, y10=0, z11=phi, x11=1, y11=0, z12=-phi, x12=1, y12=0;
    p={}; p.verts=[];
    p.verts.push(new Vert(x1,y1,z1));
    p.verts.push(new Vert(x5,y5,z5));
    p.verts.push(new Vert(x8,y8,z8));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x2,y2,z2));
    p.verts.push(new Vert(x5,y5,z5));
    p.verts.push(new Vert(x8,y8,z8));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x3,y3,z3));
    p.verts.push(new Vert(x6,y6,z6));
    p.verts.push(new Vert(x7,y7,z7));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x4,y4,z4));
    p.verts.push(new Vert(x6,y6,z6));
    p.verts.push(new Vert(x7,y7,z7));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x9,y9,z9));
    p.verts.push(new Vert(x12,y12,z12));
    p.verts.push(new Vert(x5,y5,z5));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x9,y9,z9));
    p.verts.push(new Vert(x12,y12,z12));
    p.verts.push(new Vert(x6,y6,z6));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x10,y10,z10));
    p.verts.push(new Vert(x11,y11,z11));
    p.verts.push(new Vert(x7,y7,z7));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x10,y10,z10));
    p.verts.push(new Vert(x11,y11,z11));
    p.verts.push(new Vert(x8,y8,z8));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x1,y1,z1));
    p.verts.push(new Vert(x9,y9,z9));
    p.verts.push(new Vert(x4,y4,z4));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x1,y1,z1));
    p.verts.push(new Vert(x10,y10,z10));
    p.verts.push(new Vert(x4,y4,z4));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x2,y2,z2));
    p.verts.push(new Vert(x11,y11,z11));
    p.verts.push(new Vert(x3,y3,z3));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x2,y2,z2));
    p.verts.push(new Vert(x12,y12,z12));
    p.verts.push(new Vert(x3,y3,z3));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x2,y2,z2));
    p.verts.push(new Vert(x11,y11,z11));
    p.verts.push(new Vert(x8,y8,z8));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x2,y2,z2));
    p.verts.push(new Vert(x12,y12,z12));
    p.verts.push(new Vert(x5,y5,z5));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x1,y1,z1));
    p.verts.push(new Vert(x10,y10,z10));
    p.verts.push(new Vert(x8,y8,z8));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x1,y1,z1));
    p.verts.push(new Vert(x9,y9,z9));
    p.verts.push(new Vert(x5,y5,z5));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x4,y4,z4));
    p.verts.push(new Vert(x9,y9,z9));
    p.verts.push(new Vert(x6,y6,z6));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x3,y3,z3));
    p.verts.push(new Vert(x12,y12,z12));
    p.verts.push(new Vert(x6,y6,z6));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x4,y4,z4));
    p.verts.push(new Vert(x10,y10,z10));
    p.verts.push(new Vert(x7,y7,z7));
    this.polys.push(p);
    p={}; p.verts=[];
    p.verts.push(new Vert(x3,y3,z3));
    p.verts.push(new Vert(x11,y11,z11));
    p.verts.push(new Vert(x7,y7,z7));
    this.polys.push(p);
}


function subdivide(shape,subdivisions){

    for(var j=0;j<subdivisions;++j){
        newShape=new Shape(shape.x,shape.y,shape.z);
        for(var k=0;k<shape.polys.length;++k){
            x1=(shape.polys[k].verts[1].x+shape.polys[k].verts[0].x)/2;
            y1=(shape.polys[k].verts[1].y+shape.polys[k].verts[0].y)/2;
            z1=(shape.polys[k].verts[1].z+shape.polys[k].verts[0].z)/2;
            x2=(shape.polys[k].verts[2].x+shape.polys[k].verts[1].x)/2;
            y2=(shape.polys[k].verts[2].y+shape.polys[k].verts[1].y)/2;
            z2=(shape.polys[k].verts[2].z+shape.polys[k].verts[1].z)/2;
            x3=(shape.polys[k].verts[0].x+shape.polys[k].verts[2].x)/2;
            y3=(shape.polys[k].verts[0].y+shape.polys[k].verts[2].y)/2;
            z3=(shape.polys[k].verts[0].z+shape.polys[k].verts[2].z)/2;
            p=new Polygon();
            p.verts.push(new Vert(shape.polys[k].verts[0].x,shape.polys[k].verts[0].y,shape.polys[k].verts[0].z));
            p.verts.push(new Vert(x1,y1,z1));
            p.verts.push(new Vert(x3,y3,z3));
            p.cx=(p.verts[0].x+p.verts[1].x+p.verts[2].x)/3;
            p.cy=(p.verts[0].y+p.verts[1].y+p.verts[2].y)/3;
            p.cz=(p.verts[0].z+p.verts[1].z+p.verts[2].z)/3;
            newShape.polys.push(p);
            p=new Polygon();
            p.verts.push(new Vert(x1,y1,z1));
            p.verts.push(new Vert(shape.polys[k].verts[1].x,shape.polys[k].verts[1].y,shape.polys[k].verts[1].z));
            p.verts.push(new Vert(x2,y2,z2));
            p.cx=(p.verts[0].x+p.verts[1].x+p.verts[2].x)/3;
            p.cy=(p.verts[0].y+p.verts[1].y+p.verts[2].y)/3;
            p.cz=(p.verts[0].z+p.verts[1].z+p.verts[2].z)/3;
            newShape.polys.push(p);
            p=new Polygon();
            p.verts.push(new Vert(x3,y3,z3));
            p.verts.push(new Vert(x2,y2,z2));
            p.verts.push(new Vert(shape.polys[k].verts[2].x,shape.polys[k].verts[2].y,shape.polys[k].verts[2].z));
            p.cx=(p.verts[0].x+p.verts[1].x+p.verts[2].x)/3;
            p.cy=(p.verts[0].y+p.verts[1].y+p.verts[2].y)/3;
            p.cz=(p.verts[0].z+p.verts[1].z+p.verts[2].z)/3;
            newShape.polys.push(p);
            p=new Polygon();
            p.verts.push(new Vert(x3,y3,z3));
            p.verts.push(new Vert(x1,y1,z1));
            p.verts.push(new Vert(x2,y2,z2));
            p.cx=(p.verts[0].x+p.verts[1].x+p.verts[2].x)/3;
            p.cy=(p.verts[0].y+p.verts[1].y+p.verts[2].y)/3;
            p.cz=(p.verts[0].z+p.verts[1].z+p.verts[2].z)/3;
            newShape.polys.push(p);
        }
        shape=newShape;
    }
    return shape;
}


function loadScene(vars){

    var x,y,z,x1,y1,z1,x2,y2,z2,x3,y3,z3;
    vars.shapes=[];

    for(var i=0;i<3;++i){
        var p=PI*2/3*i;
        x=sin(p)*1.5;
        y=0
        z=cos(p)*1.5;

        shape=new Icosahedron(x,y,z);
        shape=subdivide(shape,i);
        shape=expandShape(shape,1)
        shape.polys=segmentize(shape.polys);
        vars.shapes.push(shape);

        shape=new Icosahedron(x,y,z);
        shape=subdivide(shape,i);
        shape=expandShape(shape,1);
        shape=subdivide(shape,1);
        vars.shapes.push(shape);
    }
}


function frame(vars) {

    if(vars === undefined){
        var vars={};
        vars.canvas = c;
        vars.ctx = vars.canvas.getContext("2d");
        vars.canvas.width = document.body.clientWidth;
        vars.canvas.height = document.body.clientHeight;
        window.addEventListener("resize", function(){
            vars.canvas.width = document.body.clientWidth;
            vars.canvas.height = document.body.clientHeight;
            vars.cx=vars.canvas.width/2;
            vars.cy=vars.canvas.height/2;
        }, true);
        vars.frameNo=0;
        vars.rFrameNo=0;
        vars.camX = 0;
        vars.camY = 0;
        vars.camZ = -4;
        vars.yaw=2;
        vars.pitch=0;


        vars.mx=0;
        vars.my=0;
        vars.omx=vars.mx;
        vars.omy=vars.my;
        vars.cx=vars.canvas.width/2;
        vars.cy=vars.canvas.height/2;
        vars.scale=800;
        vars.floor=2.5;
        loadScene(vars);
    }

    vars.frameNo++;
    requestAnimationFrame(function() {
        frame(vars);
    });

    process(vars);
    draw(vars);
}



var first = true;
var fpsInterval, startTime, now, then, elapsed;

function positionTitleAnimation(index)
{
    var positions = ["Junior Comp Eng Student @McGillU", "Musician", "Amateur filmmaker"];
    var next = index;

    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval || first) {
        first = false;

        // Get ready for next frame by setting then=now, but...
        // Also, adjust for fpsInterval not being multiple of 16.67
        then = now - (elapsed % fpsInterval);

        // draw stuff here
        var newTitle = document.createElement("span");
        var title = document.getElementById("position-title");
        var text = document.createTextNode(positions[index]);
        var titleParent = title.parentNode;

        newTitle.setAttribute("id", "position-title");
        newTitle.appendChild(text);

        // Fade Out, Fade In text animation
        $(".intro-position").fadeOut("quick", function () {
            titleParent.removeChild(title);
            titleParent.appendChild(newTitle);
            $(".intro-position").fadeIn();
        });

        next = (index + 1) % positions.length;
    }

    requestAnimationFrame(function() {
        positionTitleAnimation(next);
    });
}

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    positionTitleAnimation(0);
}


(function($) {

	"use strict";

	/*---------------------------------------------------- */
	/* Preloader
	------------------------------------------------------ */ 
   $(window).load(function() {

      // will first fade out the loading animation 
    	$("#loader").fadeOut("slow", function(){

        // will fade out the whole DIV that covers the website.
        $("#preloader").delay(300).fadeOut("slow");

            frame();
            startAnimating(0.3);

      });       

  	})


  	/*---------------------------------------------------- */
  	/* FitText Settings
  	------------------------------------------------------ */
  	setTimeout(function() {

   	$('#intro h1').fitText(1, { minFontSize: '42px', maxFontSize: '84px' });

  	}, 100);


	/*---------------------------------------------------- */
	/* FitVids
	------------------------------------------------------ */ 
  	$(".fluid-video-wrapper").fitVids();


	/*---------------------------------------------------- */
	/* Owl Carousel
	------------------------------------------------------ */ 
	$("#owl-slider").owlCarousel({
        navigation: false,
        pagination: true,
        itemsCustom : [
	        [0, 1],
	        [700, 2],
	        [960, 3]
	     ],
        navigationText: false
    });


	/*----------------------------------------------------- */
	/* Alert Boxes
  	------------------------------------------------------- */
	$('.alert-box').on('click', '.close', function() {
	  $(this).parent().fadeOut(500);
	});	


	/*----------------------------------------------------- */
	/* Stat Counter
  	------------------------------------------------------- */
   var statSection = $("#stats"),
       stats = $(".stat-count");

   statSection.waypoint({

   	handler: function(direction) {

      	if (direction === "down") {       		

			   stats.each(function () {
				   var $this = $(this);

				   $({ Counter: 0 }).animate({ Counter: $this.text() }, {
				   	duration: 4000,
				   	easing: 'swing',
				   	step: function (curValue) {
				      	$this.text(Math.ceil(curValue));
				    	}
				  	});
				});

       	} 

       	// trigger once only
       	this.destroy();      	

		},
			
		offset: "90%"
	
	});	


	/*---------------------------------------------------- */
	/*	Masonry
	------------------------------------------------------ */
	var containerProjects = $('#folio-wrapper');

	containerProjects.imagesLoaded( function() {

		containerProjects.masonry( {		  
		  	itemSelector: '.folio-item',
		  	resize: true 
		});

	});


	/*----------------------------------------------------*/
	/*	Modal Popup
	------------------------------------------------------*/
   $('.item-wrap a').magnificPopup({

      type:'inline',
      fixedContentPos: false,
      removalDelay: 300,
      showCloseBtn: false,
      mainClass: 'mfp-fade'

   });

   $(document).on('click', '.popup-modal-dismiss', function (e) {
   	e.preventDefault();
   	$.magnificPopup.close();
   });

	
	/*-----------------------------------------------------*/
  	/* Navigation Menu
   ------------------------------------------------------ */  
   var toggleButton = $('.menu-toggle'),
       nav = $('.main-navigation');

   // toggle button
   toggleButton.on('click', function(e) {

		e.preventDefault();
		toggleButton.toggleClass('is-clicked');
		nav.slideToggle();

	});

   // nav items
  	nav.find('li a').on("click", function() {   

   	// update the toggle button 		
   	toggleButton.toggleClass('is-clicked'); 
   	// fadeout the navigation panel
   	nav.fadeOut();   		
   	     
  	});


   /*---------------------------------------------------- */
  	/* Highlight the current section in the navigation bar
  	------------------------------------------------------ */
	var sections = $("section"),
	navigation_links = $("#nav-wrap a");	

	sections.waypoint( {

       handler: function(direction) {

		   var active_section;

			active_section = $('section#' + this.element.id);

			if (direction === "up") active_section = active_section.prev();

			var active_link = $('#nav-wrap a[href="#' + active_section.attr("id") + '"]');			

         navigation_links.parent().removeClass("current");
			active_link.parent().addClass("current");

		}, 

		offset: '25%'
	});


	/*---------------------------------------------------- */
  	/* Smooth Scrolling
  	------------------------------------------------------ */
  	$('.smoothscroll').on('click', function (e) {
	 	
	 	e.preventDefault();

   	var target = this.hash,
    	$target = $(target);

    	$('html, body').stop().animate({
       	'scrollTop': $target.offset().top
      }, 800, 'swing', function () {
      	window.location.hash = target;
      });

  	});  
  

   /*---------------------------------------------------- */
	/*  Placeholder Plugin Settings
	------------------------------------------------------ */ 
	$('input, textarea, select').placeholder()  


  	/*---------------------------------------------------- */
	/*	contact form
	------------------------------------------------------ */

	/* local validation */
	$('#contactForm').validate({

		/* submit via ajax */
		submitHandler: function(form) {

			var sLoader = $('#submit-loader');

			$.ajax({      	

		      type: "POST",
		      url: "inc/sendEmail.php",
		      data: $(form).serialize(),
		      beforeSend: function() { 

		      	sLoader.fadeIn(); 

		      },
		      success: function(msg) {

	            // Message was sent
	            if (msg == 'OK') {
	            	sLoader.fadeOut(); 
	               $('#message-warning').hide();
	               $('#contactForm').fadeOut();
	               $('#message-success').fadeIn();   
	            }
	            // There was an error
	            else {
	            	sLoader.fadeOut(); 
	               $('#message-warning').html(msg);
		            $('#message-warning').fadeIn();
	            }

		      },
		      error: function() {

		      	sLoader.fadeOut(); 
		      	$('#message-warning').html("Something went wrong. Please try again.");
		         $('#message-warning').fadeIn();

		      }

	      });     		
  		}

	});


 	/*----------------------------------------------------- */
  	/* Back to top
   ------------------------------------------------------- */ 
	var pxShow = 300; // height on which the button will show
	var fadeInTime = 400; // how slow/fast you want the button to show
	var fadeOutTime = 400; // how slow/fast you want the button to hide
	var scrollSpeed = 300; // how slow/fast you want the button to scroll to top. can be a value, 'slow', 'normal' or 'fast'

   // Show or hide the sticky footer button
	jQuery(window).scroll(function() {

		if (!( $("#header-search").hasClass('is-visible'))) {

			if (jQuery(window).scrollTop() >= pxShow) {
				jQuery("#go-top").fadeIn(fadeInTime);
			} else {
				jQuery("#go-top").fadeOut(fadeOutTime);
			}

		}		

	});	

})(jQuery);