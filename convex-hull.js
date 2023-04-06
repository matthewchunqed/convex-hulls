//const SVG_NS = "http://www.w3.org/2000/svg";

//analogous to the Vertex function
function Point (x, y, id) {
    this.x = x;
    this.y = y;
    this.id = id;

    // Compare this Point to another Point p for the purposes of
    // sorting a collection of points. The comparison is according to
    // lexicographical ordering. That is, (x, y) < (x', y') if (1) x <
    // x' or (2) x == x' and y < y'.
    this.compareTo = function (p) {
	if (this.x > p.x) {
	    return 1;
	}

	if (this.x < p.x) {
	    return -1;
	}

	if (this.y > p.y) {
	    return 1;
	}

	if (this.y < p.y) {
	    return -1;
	}

	return 0;
    }

    // return a string representation of this Point
    this.toString = function () {
	return "(" + x + ", " + y + ")";
    }
}


// An object that represents a set of Points in the plane. The `sort`
// function sorts the points according to the `Point.compareTo`
// function. The `reverse` function reverses the order of the
// points. The functions getXCoords and getYCoords return arrays
// containing x-coordinates and y-coordinates (respectively) of the
// points in the PointSet.
function PointSet () {
    this.points = [];
    this.curPointID = 0;

    // create a new Point with coordintes (x, y) and add it to this
    // PointSet
    this.addNewPoint = function (x, y) {
	this.points.push(new Point(x, y, this.curPointID));
	this.curPointID++;
    }

    // add an existing point to this PointSet
    this.addPoint = function (pt) {
	this.points.push(pt);
    }

    // sort the points in this.points 
    this.sort = function () {
	this.points.sort((a,b) => {return a.compareTo(b)});
    }

    // reverse the order of the points in this.points
    this.reverse = function () {
	this.points.reverse();
    }

    // return an array of the x-coordinates of points in this.points
    this.getXCoords = function () {
	let coords = [];
	for (let pt of this.points) {
	    coords.push(pt.x);
	}

	return coords;
    }

    // return an array of the y-coordinates of points in this.points
    this.getYCoords = function () {
	let coords = [];
	for (pt of this.points) {
	    coords.push(pt.y);
	}

	return coords;
    }

    // get the number of points 
    this.size = function () {
	return this.points.length;
    }

    // return a string representation of this PointSet
    this.toString = function () {
	let str = '[';
	for (let pt of this.points) {
	    str += pt + ', ';
	}
	str = str.slice(0,-2); 	// remove the trailing ', '
	str += ']';

	return str;
    }
}

//determines whether the angle abc represents a right turn or not
//is used to determine which elements should belong to the convex hull of the pointset
function orientation(a,b,c){
    //done via the cross product
    let crossProduct = ((b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y)); //calculates the cross product of ab and bc to determine the value of the angle abc
                if (crossProduct == 0){return 0;}  //the points a,b,c are colinear, so this is not a right turn
                else if (crossProduct > 0){return 1;}//the angle abc denotes a right turn, so c can be added to the convex hull
                else{return 2;//the angle abc denotes a left turn, so this is not a right turn
                }
}

function ConvexHullViewer (svg, ps) {
    this.svg = svg;  // an svg object where the visualization is drawn
    this.ps = ps;    // a point set of the points to be visualized
    this.pointCount = 0;    //counts number of points
    this.edgesCount = 0;    //counts number of edges
    this.vertices = []; //stores vertices for later reference
    this.edges = [];       //stores edges for later reference
    // define the behavior for clicking on the svg element
    this.svg.addEventListener("click", (e) => {
    // create a new vertex
    /*    if(this.pointCount >= 1){
            (this.vertices.pop()).classList.remove("vertex");
        } */

        const rect = this.svg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        var elt = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        elt.classList.add("vertex");
        //adds in the point and adds the styling
        elt.setAttributeNS(null, "cx", x);
        elt.setAttributeNS(null, "cy", y);
        elt.setAttributeNS(null, "r", 10);
        //sets its location right
        this.vertices.push(elt);
        svg.appendChild(elt);
        //adds it to the svg
        ps.addPoint(new Point(x, 400-y, this.pointCount));
        //400-y because y is flipped for the viewer.
        //stores it in the pointset
        this.pointCount++;
        //increases point count

    });
    
}

function ConvexHull (ps, viewer) {
    this.ps = ps;          // a PointSet storing the input to the algorithm
    this.viewer = viewer;  // a ConvexHullViewer for this visualization
    this.curAnimation = null;
    //stores the setInterval object
    this.stepCount = 1;
    //set to 1 so that edges start by connecting point][1] to point[0].
    
     //initialize array that stores step instructions.  
    var steps=[];
    //stores instructions for this.step() to call one by one.
    this.steps=steps;
    
    this.start = function () {
    
        // todo: un-highlight previously highlighted stuff
        while(viewer.edgesCount >= 1){
            (viewer.edges.pop()).classList.remove("edge");
            //removes an edge from the edge storage in viewer
            viewer.edgesCount--;
            //lowers the edge count
        }
        while(this.steps.length >= 1){
            this.steps.pop();
            //erases all the instructions stored into the steps array
        }
        this.stepCount = 1;
        //resets the step count to 1

    }

    this.step = function () {
	
        //getConvexHull needs to be calculated before this.
        if(this.steps.length <= 1){
            this.getConvexHull();
            //computes stack[] and populates step[] with corresponding instructions.
        }
        //stepCount already finished steps edge case
        if(this.stepCount >= this.steps.length){
            //you've already completed the scan algorithm.
            return;
        }
        //one point edge case
        if(this.ps.size()==1){
            return;
        }
        //console.log(this.steps);
        //places edges in steps in, deciding to remove if it's a duplicate step or adding the edge otherwise.
            if((this.steps[this.stepCount].x == this.steps[this.stepCount-1].x) && (this.steps[this.stepCount].y == this.steps[this.stepCount-1].y)){
                (this.viewer.edges.pop()).classList.remove("edge");
                this.viewer.edgesCount--;
                //removes the edge from the edge list and decrements the count
                this.steps.splice(this.stepCount-1,1);
                this.steps.splice(this.stepCount-1,1);
                //remove the point at the indices, and the index changes as you remove points
                this.stepCount--;
                this.stepCount--;
                //decrements by two because it will add by one later down in the array,
            }else{
            var edgeElt = document.createElementNS("http://www.w3.org/2000/svg", "line");
            edgeElt.setAttributeNS(null, "x1", steps[this.stepCount-1].x);
	        edgeElt.setAttributeNS(null, "y1", 400-steps[this.stepCount-1].y);
	        edgeElt.setAttributeNS(null, "x2", steps[this.stepCount].x);
	        edgeElt.setAttributeNS(null, "y2", 400-steps[this.stepCount].y);
	        edgeElt.classList.add("edge");
            //makes the new edge and adds the styling
            this.viewer.edges.push(edgeElt);
            svg.appendChild(edgeElt);
            //adds it to edge points, appends to svg
            this.viewer.edgesCount++;
            //increments edge counter
            }

        //console.log(this.steps);
        //console.log(this.stepCount);
        //move to next step.
        this.stepCount++;
        //this.steps=this.steps.reverse();
    }

    this.animate = function () {
        this.getConvexHull();
        //to populate step[] for reference to steps.length shortly
        this.stepCount = 1;
        //resets stepcount in case it was not right.
        if (this.curAnimation == null) {
            this.curAnimation = setInterval(() => {
            this.animateStep();
            }, 1000);
            //adds the delay.
        }
        }
    
    this.animateStep = function () {
        if (this.stepCount < this.steps.length) {
            //repeats until does all instructions in steps[].

            //console.log("taking a step");
            this.step();
        } else {
            this.stopAnimation();
            //then stops animation
        }
        }
    
    this.stopAnimation = function () {
        clearInterval(this.curAnimation);
        this.curAnimation = null;
        //resets curAnimation
        //console.log("animation completed");
        }
    

    this.getConvexHull = function () {
        
        //array for saving convex hull points
        let stack=[];

        //if the pointset is a single point, return that same point as the hull
        if(this.ps.size()==1){
            return this.ps;
        }

        //sort the pointset and push the 2 elements with the lowest x-coordinate on the stack
        this.ps.sort();
        //this.ps.reverse();
        stack.push(this.ps.points[0]);
        stack.push(this.ps.points[1]);

        //adds to steps instructions
        steps.push(this.ps.points[0]);
        steps.push(this.ps.points[1]);
        //console.log("Initial push to steps ",this.ps.points[0]);
        //console.log("Initial push to steps ",this.ps.points[1]);
        

        //if the pointset is two points, return the corresponding hull
        if(this.ps.size()==2){
            stack.push(this.ps.points[0]);

            //adds to steps instructions
            steps.push(this.ps.points[0]);
            //console.log(this.steps);

            //initializes a new PointSet and copies the stack elements into it
            let PS = new PointSet;
            for(let a=0;a<stack.length;a++){
                PS.addNewPoint(stack[a].x,stack[a].y);
            }
            //once both the upper and lower hulls have been completed and stored in the stack, returns the stack
            return PS;
        }

        //check whether all points in a given pointset are colinear
        //saves x,y coordinates of first point in pointset and initializes two boolean flags
        var x0=this.ps.points[0].x;
        var y0=this.ps.points[0].y;
        var x1=this.ps.points[1].x;
        var y1=this.ps.points[1].y;
        var isColinear=true;
        var slopeRef = (y1-y0)/(x1-x0);

        //if any point in the pointset has a different x/coordinate from the first point, change the respective flags to false and exit the loop
        for(let z=2;z<this.ps.size();z++){
            //calculates the slope between the first point and the point at index z
            xR=this.ps.points[z].x;
            yR=this.ps.points[z].y;
            slope=(yR-y0)/(xR-x0);

            //modifies the colinearity flag accordingly
            if(slope!=slopeRef){
                isColinear=false;
                //checks collinearity case.
            }
        }

        //initializes a new array for storing convex hull of colinear points
        //if the x or y coordinate of all points in pointset are the same, creates the corresponding convex hull using the first point and furthest point
        let stackC=[];
        if(isColinear==true){
            stackC.push(this.ps.points[0]);
            stackC.push(this.ps.points[this.ps.size()-1]);
            stackC.push(this.ps.points[0]);

            //adding to steps
            steps = [];
            steps.push(this.ps.points[0]);
            steps.push(this.ps.points[this.ps.size()-1]);
            steps.push(this.ps.points[0]);

            //initializes a new PointSet and copies the stack elements into it
            let PS = new PointSet;
            for(let a=0;a<stackC.length;a++){
                PS.addNewPoint(stackC[a].x,stackC[a].y);
            }
            //once both the upper and lower hulls have been completed and stored in the stack, returns the stack
            return PS;
        } 
        
        //completes the upper section of the convex hull
        for(let i=2;i<this.ps.size();i++){
            var c=this.ps.points[i];
            
            //if the stack has length 1, push the next element of this.ps onto it
            if (stack.length==1){
                stack.push(c);

                //adding to steps
                steps.push(c);
                //console.log("push to steps at start of 1st for loop ",c);

                //console.log(this.steps);
            }
            else{
                //defines variables a and b as the top 2 elements of the stack
                var a = stack[stack.length-2];
                var b = stack[stack.length-1];
                
                //while the stack is more than one element and angle abc is not a right turn, pop the top element off the stack and update a,b accordingly
                while((stack.length>1)&&(orientation(a,b,c)!=1)){
                    var remove = stack.pop();
                    steps.push(remove);
                   // console.log("push to steps when poppin from array ",remove);
                    //if a vertex in steps is already defined, it will be deleted in step().
                    var a = stack[stack.length-2];
                    var b = stack[stack.length-1];
                }
                //push c onto the stack
                stack.push(c);
                
                //add c to steps
                steps.push(c);
                //console.log("pushing c at end of loop iteration ",c);
                //console.log(this.steps);
            }
        }

        //this section of the code creates the lower portion of the convex hull
        //reverses the ordering of pointset so that it is sorted by descending x coordinate
        this.ps.reverse();

        //pushes the second element of pointset onto the stack
        stack.push(this.ps.points[1]);
        //console.log(this.ps.points[1]);

        //adds to steps
        steps.push(this.ps.points[1]);
        //console.log("pushing initial point before 2nd loop ",this.ps.points[1]);

        //completes the lower section of the convex hull
        for(let i=2;i<this.ps.size();i++){
            var c=this.ps.points[i];

            //if the stack has length 1, push the next element of this.ps onto it
            if (stack.length==1){
                stack.push(c);

                steps.push(c);
                //console.log("this.steps");
            }
            else{
                //defines variables a and b as the top 2 elements of the stack
                var a = stack[stack.length-2];
                var b = stack[stack.length-1];
                
                //while the stack is more than one element and angle abc is not a right turn, pop the top element off the stack and update a,b accordingly
                while((stack.length>1)&&(orientation(a,b,c)!=1)){
                    var remove2 = stack.pop();
                    steps.push(remove2);
                    //console.log("push to steps when popping from array ",remove2);
                    //adds the popped stack element to steps 
                    var a = stack[stack.length-2];
                    var b = stack[stack.length-1]; 
                }
                //push c onto the stack
                stack.push(c);

                //adds to steps
                steps.push(c);
                //console.log("final push of c ",c);
            }
        }
        //initializes a new PointSet and copies the stack elements into it
        let PS = new PointSet;
        for(let a=0;a<stack.length;a++){
            PS.addNewPoint(stack[a].x,stack[a].y);
        }
        this.ps.reverse();
        //reverses it again for later use in step().


        //console.log(stack);
        //console.log(this.steps);
        //once both the upper and lower hulls have been completed and stored in the stack, returns the stack
        return PS;
    }
}

//code for running the tester
try {
    exports.PointSet = PointSet;
    exports.ConvexHull = ConvexHull;
  } catch (e) {
    console.log("not running in Node");
  }

  var svg = null;
  var gv = null;
  //var ps = null;
  var ch = null;

  function draw(){
    svg = document.querySelector("#convex-hull-box");;
    var ps = new PointSet;
    gv = new ConvexHullViewer(svg, ps);
    ch = new ConvexHull(ps, gv); 
  }
