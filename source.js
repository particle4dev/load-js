/**
 *	Name		: loadjs.js
 *	Description	: 
 *	Licenses 	: 
 *	Authors 	: Steve Hoang <particles4dev>
 *	Inspiration	: 
 *	Provides	: [LoadJS]
 *  Status		: []
 *--------------------------------------------------------------------------*/

(function(){


	var LoadJS = window.LoadJS || {};
	/**   		 
   	 *  
   	 *
   	 *  ##### Examples
   	 *
   	 *	
   	 *
  	**/
  	var PathShortcutFactory = Create({			
		
		_init: function(){
			// Eg : $lib = 'source/libs'
			this.shortcut = {};
			// match $name
			this.rewritePattern= /\$([^\/\\]*)(\/)?/g;
		},

		addPath: function(inName, inPath) {
			return this.shortcut[inName] = inPath;
		},

		addPaths: function(inPaths) {
			if (inPaths) {
				for (var n in inPaths) {
					this.addPath(n, inPaths[n]);
				}
			}
		},

		// enyo/lib => enyo/lib/
		includeTrailingSlash: function(inPath) {
			return (inPath && inPath.slice(-1) !== "/") ? inPath + "/" : inPath;
		},
		
		// replace macros of the form $pathname with the mapped value of shortcut.pathname
		rewrite: function (inPath) {
			var working, its = this.includeTrailingSlash, paths = this.shortcut;
			var fn = function(macro, name) {
				working = true;
				return its(paths[name]) || '';
			};
			//reason why we need a loop
			// $source = $lib."/source"
			// $source = $root."/lib"."/source"
			// $source = '/root'."/lib"."/source"
			var result = inPath;			
			do {					
				working = false;
				result = result.replace(this.rewritePattern, fn);					
			} while (working);
			return result;
		}
	});
	LoadJS.PathShortcutFactory = new PathShortcutFactory();

	var Element = Create({
  		
  		_init: function(module){
  			// Public
  			this.src = "";
  			this.type= null;
  			this.path= null;
  			this.file= "";
  			// JS DOM
  			this.script = null;
  			// Module
  			if(module)
  				this.module = module;
  		},
  		// Create html element
  		create: function(){
  			console.log('not implemented');
			return this;
  		},
  		write: function(){
  			console.log('not implemented');
  			return this;
  		},
		append: function(){
  			if(this.script)
  				document.getElementsByTagName('head')[0].appendChild(this.script);
  			return this;
  		},
  		// Rewrite path .Ex $lib/script.js => source/lib/script.js
  		rewritePath: function(){
  			this.src = LoadJS.PathShortcutFactory.rewrite( this.src );
  			return this;
  		},
  		// If you load file in sub folder, it will return path of sub folder
  		// Ex log.js => ../log_system/source/log.js
  		analyzePath: function(){
  			this.rewritePath();

  			if(this.path) return this.path;
  			var parts = this.filterPath().split("/");
  			this.file = parts.pop();
  			this.path = this.getPathPrefix() + parts.join("/");
			if(this.path !="")
  				this.src = this.path + "/" + this.file;
			else
				this.src = this.file;
  		},

  		getPathPrefix: function() {
  			// Get a first char
			var delim = this.src.slice(0, 1);
			// != /, \\, $, https			
			if ((delim != "/") && (delim != "\\") && (delim != "$") && !/^https?:/i.test(this.src)) {
				return this.module.path;
			}
			return "";
		},
		filterPath: function(){
			return this.src.replace(/\\/g, "/").replace(/\/\//g, "/").replace(/:\//, "://");					
		}
  	});
	/**   		 
   		 *  Element CSS
   		 *
   		 *  ##### Examples
   		 *  
   		 *		var boot = new LoadJS.CSS('lib/boot.css');		
   		 *  	boot.create().write();
   		 *
  		**/
  		LoadJS.CSS = Extends(Element, {
  			_init:  function(src, module){
  				this._super(module);
  				this.src = src;
  				this.analyzePath();
				
  			},
  			// 1.CSS {<link href="onyx.css" media="screen" rel="stylesheet" type="text/css">}
  			create: function(){
  				this.script = document.createElement('link');
  				this.script.href  = this.filterPath();
  				this.script.media = "screen";
  				this.script.rel   = "stylesheet";
  				this.script.type  = "text/css";
  				return this;
  			},
			write: function(){
				document.write('<link href="' + this.filterPath() + '" media="screen" rel="stylesheet" type="text/css" />');
				
			}
  		});  		
  		/**   		 
   		 *  Element JS
   		 *
   		 *  ##### Examples
   		 *  
   		 *		var boot = new LoadJS.JS('lib/boot.js');	
   		 *  	boot.create().write();
   		 *
  		**/
  		LoadJS.JS = Extends(Element, {
  			_init:  function(src, module){
  				this._super(module);
  				this.src = src;
  				this.analyzePath();
				console.log("load js :" + this.src);
  			},
  			// 2.JS {<script src="package.js"></script>}
  			create: function(){
  				this.script = document.createElement('script');
  				this.script.src = this.filterPath();
  				return this;
  			},
			write: function(){
				document.write('<scri' + 'pt src="' + this.filterPath() + '"></scri' + 'pt>');
			}
  		});
  		/**   		 
   		 *  Load module
   		 *
   		 *  ##### Examples  
   		 *		
   		 *
  		**/
  		LoadJS.Module = Extends(Element, {
  			_init:  function(src, module){
  				this._super(module);
  				this.src = src + "/" + "module.js";  							
  				this.analyzePath();  				
  				console.log("load model :" + this.src);
  			},
  			create: function(){
  				this.script = document.createElement('script');
  				this.script.src = this.filterPath();
  				return this;
  			},
			write: function(){
				document.write('<scri' + 'pt src="' + this.filterPath() + '"></scri' + 'pt>');
				if(this.path != "")
					LoadJS.FactoryLoader.getLastPath = this.path + "/";
				else
					LoadJS.FactoryLoader.getLastPath = "";	
			}
  		});
	var ModuleLoader = Create({
		_init : function(path){
			// Store elements
			this.elements = [];
			// Path of module
			this.path = path;			
		},
		push: function(e){
			this.elements.push(e);
		},
		// Xuat ban element
		published : function(){			
			var len = this.elements.length;
			for(var i = 0;i < len; len-- ){
				if(this.elements[i] instanceof LoadJS.Module){
					this.elements[i].create().write();					
					this.elements.shift();
					return false;
				}
				if(len > 0){
					this.elements[i].create().write();
					this.elements.shift();
				}					
			};
			LoadJS.FactoryLoader.module.pop();
			return true;
		}
	});

	var FactoryLoader = Create({
		_init : function(){			
			// Store Module
			this.module = [];

			this.getLastPath = "";
		},
		// Them 1 Module 
		saveModule: function(module){
			this.module.push(module);
			return this;
		},
		// Xuat ban module
		published : function(){
			var len = this.module.length;
			
			while(len--){
				if(len >= 0){			
					if(!this.module[len].published()) break;
					console.log(this.module);
				}
			};
			return this;
		}
	});
	LoadJS.FactoryLoader = new FactoryLoader();
	LoadJS.Load = (function(){
  		/**
		 * Define class 
		 * 
		 * @author      Steve Hoang
		 * @version     
		 * @since       0.1
		 *
		 * @param 
		 *
		**/
		function createElement(inPath, m){
			var e = null;
			if ((inPath.slice(-4) == ".css")) {				
				e = new LoadJS.CSS(inPath, m);
			}
			else if ((inPath.slice(-5) == ".less")) {

			}														//package.js
			else if (inPath.slice(-3) == ".js" && inPath.slice(-9) != "module.js") {				
				e = new LoadJS.JS(inPath, m);
			}
			else {				
				// load module.js
				e = new LoadJS.Module(inPath, m);
			}
			return e;
		}
		var stepStop = 3;	
	  	var f = function(){
			console.log('=======================');
	  		/** 
			 * Public property
			**/
			var i = arguments.length,len = i-1, path, e, m = new ModuleLoader(LoadJS.FactoryLoader.getLastPath);			
			if(i > 0){
				while(i--){
			    	path = arguments[len-i];
			    	e = createElement(path, m);
			    	if(e){		    		
			    		m.push(e);
			    	}					
			    }
			}
			LoadJS.FactoryLoader.saveModule(m);
			if(m.published() && stepStop){
				stepStop--;
				console.log('========Done==========');					
				LoadJS.FactoryLoader.published();
			}
			
			console.log(LoadJS.FactoryLoader);  			
	  	}
	   	return f;
	})();
		
	//shortcut
	if(!window.LoadJS){window.LoadJS = LoadJS;}

})();	