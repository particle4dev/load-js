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
  		var PathShortcutFactory = function(){			
			// Eg : $lib = 'source/libs'
			this.shortcut = {};
			this.addPath = function(inName, inPath) {
				return this.shortcut[inName] = inPath;
			};
			this.addPaths= function(inPaths) {
				if (inPaths) {
					for (var n in inPaths) {
						this.addPath(n, inPaths[n]);
					}
				}
			};
			// enyo/lib => enyo/lib/
			this.includeTrailingSlash= function(inPath) {
				return (inPath && inPath.slice(-1) !== "/") ? inPath + "/" : inPath;
			};
			// match $name
			this.rewritePattern= /\$([^\/\\]*)(\/)?/g;
			// replace macros of the form $pathname with the mapped value of shortcut.pathname
			this.rewrite= function (inPath) {
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
		};
		LoadJS.PathShortcutFactory = new PathShortcutFactory();
  		// Interface
  		var pathLastModule = "";
  		var Element = (function(){
  			var f = function(){
  				// Public
  				this.src = "";
  				this.type= null;
  				this.path= null;
  				this.file= "";
  				// JS DOM
  				this.script = null;
  				// Create html element
  				this.create = function(){
  					console.log('not implemented');
					return this;
  				};
  				this.write = function(){
  					console.log('not implemented');
  					return this;
  				};
				this.append = function(){
  					if(this.script)
  					document.getElementsByTagName('head')[0].appendChild(this.script);
  					return this;
  				};
  				this.rewritePath = function(){
  					this.src = LoadJS.PathShortcutFactory.rewrite( this.src );
  					return this;
  				};
  				this.analyzePath = function(){
  					if(this.path) return this.path;
  					var parts = this.filterPath().split("/");
  					this.file = parts.pop();
  					this.path = this.getPathPrefix() + parts.join("/");
					if(this.path !="")
  						this.src = this.path + "/" + this.file;
					else
						this.src = this.file;
  				};
  				this.getPathPrefix = function() {
					var delim = this.src.slice(0, 1);					
					if ((delim != "/") && (delim != "\\") && (delim != "$") && !/^https?:/i.test(this.src)) {
						return pathLastModule;
					}
					return "";
				};
				this.filterPath = function(){
					return this.src.replace(/\\/g, "/").replace(/\/\//g, "/").replace(/:\//, "://");					
				}
  			};
  			return f;
  		})(); 
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
  			_init:  function(src){
  				this.src = src;
  				this.analyzePath();
  				this.type= LoadJS.Type.CSS;
				console.log("load css :" + this.src);
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
  			_init:  function(src){
  				this.src = src;
  				this.analyzePath();
  				this.type= LoadJS.Type.JS;
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
  			_init:  function(src){
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
			}
  		});
		var ModuleLoader = Create({
			_init : function(){
				// Store elements
				this.elements = [];
				this.index = 0;
			},
			push: function(e){
				this.elements.push(e);
			},
			// Xuat ban element
			published : function(){
				var len = this.elements.length;
				for(;this.index < len; this.index++){
					if(this.elements[this.index] instanceof LoadJS.Module){
						this.elements[this.index].rewritePath().create().append();
						return false;
					}
					this.elements[this.index].rewritePath().create().append();
				};	
				return true;
			}
		});
		// Nha may san xuat
		var FactoryLoader = Create({
			
			_init : function(){				
				// Store path
				this.path = [];				
				// Store Module
				this.module = [];
			},
			// Luu tru Path cua module;
			pushPath: function(string){
				this.path.push(LoadJS.PathShortcutFactory.rewrite( LoadJS.PathShortcutFactory.includeTrailingSlash(string) ));
			},
			// Lay Path Module
			getPath: function(){
				return this.path.shift();
			},
			// Kiem tra xem con load khong ?
			isStillLoadModule: function(){
				if(this.path.length == 0){
					return false;
				}
				return true;
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
					pathLastModule = LoadJS.FactoryLoader.getPath();
					if(!this.module[len].published()) break;
					this.module.pop();
					console.log(len);
				};
				return this;
			}
		});
		LoadJS.FactoryLoader = new FactoryLoader();

  		LoadJS.Type = {};
  		LoadJS.Type.CSS = 0;
  		LoadJS.Type.LESS = 1;
  		LoadJS.Type.JS = 2;
		
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
			function createElement(inPath){
				var e = null;
				if ((inPath.slice(-4) == ".css")) {				
					e = new LoadJS.CSS( inPath );
				}
				else if ((inPath.slice(-5) == ".less")) {

				}														//package.js
				else if (inPath.slice(-3) == ".js" && inPath.slice(-9) != "module.js") {				
					e = new LoadJS.JS( inPath );
				}
				else {				
					// load module.js
					e = new LoadJS.Module( inPath );
					LoadJS.FactoryLoader.pushPath(e.path);
				}
				return e;
			}
			
	  		var f = function(){
				console.log('=======================new');
	  			/** 
			     * Public property
			    **/
			    var i = arguments.length,len = i-1, path, e, m = new ModuleLoader();
				LoadJS.FactoryLoader.saveModule(m);
				if(i > 0){
					while(i--){
			    		path = arguments[len-i];
			    		e = createElement(path);
			    		if(e){		    		
			    			m.push(e);
			    		}					
			    	}
				}
				if(m.published()||!LoadJS.FactoryLoader.isStillLoadModule()){
						LoadJS.FactoryLoader.published();
				}
				pathLastModule = LoadJS.FactoryLoader.getPath();
				console.log(LoadJS.FactoryLoader);  			
	  		}
	  
	 		return f;
		})();
		
		//shortcut
		if(!window.LoadJS){window.LoadJS = LoadJS;}
})();
