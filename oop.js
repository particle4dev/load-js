(function(){
	var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	/**
	 *	Every functions has _initializing property which allows object(a new instance of function) to run init function.
	 */	
	Function.prototype._initializing = false;
	Function.prototype._setInitializing = function(value){
		this._initializing = value;
		return this;
	}
	/**
	 *	Return the pattern function
	 */
	PatternFunction = function(){
		var f = (function(){			
			var p = function(){
				// Clone this
				var self = this;				
				// Run _init
				if ( !this.constructor._initializing && this._init )
					this._init.apply(this, arguments);					
			};			
			return p;
		})();
		return f;
	}
	Create = function( target ){
		var f = PatternFunction();
		var result = new f();
		if(typeof target == 'function')
			target = new target();
		for(var prop in target) {	        	
	    	if (target.hasOwnProperty(prop)){
	    		if(typeof target[prop] == "function" && typeof result[prop] == "function" && fnTest.test(target[prop])){
		    			var tgFunc = (function(sourceFunc, targeFunc){
		    				return function(){
		    					var tmp = this._super;
		    					this._super = sourceFunc;	    				
		    					var ret = targeFunc.apply(this, arguments);
		    					this._super = tmp;
		    					return ret;
		    				}
		    			})(result[prop],target[prop]);
						result[prop] = tgFunc;	    						    			
		    		}	    		
		    	else{		    			
	    			result[prop] = target[prop];
	    		}
		    }	
	    }
	    f.prototype = result;
	    //get f is parent
		f.prototype.constructor = f;
		return f;
	};
	Extends = function(source, target){
		source._setInitializing(true);		
		var result = new source();
		source._setInitializing(false);
		var f = PatternFunction();
		if(typeof target == 'function')
			target = new target();
		for(var prop in target) {	        	
	    	if (target.hasOwnProperty(prop)){
	    		if(typeof target[prop] == "function" && typeof result[prop] == "function" && fnTest.test(target[prop])){
		    			var tgFunc = (function(sourceFunc, targeFunc){
		    				return function(){
		    					var tmp = this._super;
		    					this._super = sourceFunc;	    				
		    					var ret = targeFunc.apply(this, arguments);
		    					this._super = tmp;
		    					return ret;
		    				}
		    			})(result[prop],target[prop]);
						result[prop] = tgFunc;	    						    			
		    		}	    		
		    	else{		    			
	    			result[prop] = target[prop];
	    		}
		    }	
	    }
	    f.prototype = result;
	    //get f is parent
		f.prototype.constructor = f;
		return f;	
	};

})();
/**
console.group("Step 1 : Create object");
var PERSON = Create(function(){
	this._init = function(firstName, lastName){
		this.firstName = firstName;
		this.lastName  = lastName;
	};
	this.information = function(){
		console.log('my name is ' + this.firstName + " " + this.lastName);
	};
})
var m = new PERSON('Steve', "Hoang");
m.information();
console.groupEnd();

console.group("Step 2 : Extends");
var AUS = Extends(PERSON, function(){
	this._init = function(firstName, lastName, sex){
		this._super(firstName, lastName);
		this.sex = sex;
	};
	this.information = function(){
		this._super();
		console.log('i am ' + this.sex);
	};
})
var z = new AUS('Steve', "Hoang", "male");
z.information();
console.groupEnd();
console.log(z instanceof PERSON);
*/

