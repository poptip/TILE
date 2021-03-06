/*
 * 
 * YCodaSlider 3.0
 * @requires jQuery v1.3.2
 * 
 * Copyright (c) 2008 Massimiliano Balestrieri
 * Examples and docs at: http://maxb.net/blog/
 * Licensed GPL licenses:
 * http://www.gnu.org/licenses/gpl.html
 *
 * Based on Gian Carlo Mingati's slideViewer
 * http://www.gcmingati.net/wordpress/wp-content/lab/jquery/imagestrip/imageslide-plugin.html
 * Based on Niall Doherty's coda-slider
 * http://www.ndoherty.com/coda-slider  
 * Inspired by the clever folks at http://www.panic.com/coda
 */

//jQuery.noConflict();

;(function($){
	

YCodaSlider = {};

YCodaSlider.Init = function(options, data){
	if(typeof options == "string"){
		return YCodaSlider.Api[options](this, data);
	}else{
		return this.each(function(){
			new YCodaSlider.Core(this, options);
		});
	}	
};

YCodaSlider.Api = {
	current : function(el){
		return $(el).data("current");
	},
	width : function(el){
		return $(el).data("width");
	},
	count : function(el){
		return $(el).data("count");
	},
	left : function(el){
		return $(el).trigger("left");
	},
	right : function(el){
		return $(el).trigger("right");
	},
	go : function(el, nr){
		return $(el).trigger("go", nr);
	}
};

YCodaSlider.Core = function(el, options){
	
	var _metadata = {};
	if($.metadata)
		_metadata = $(el).metadata();
	
	var _options = $.extend({             
		height   :   false,
		width    :   false,
        shortcut :  [37,39],
        id       :   false,
        scroll   :   false,//false
        history  :   false,//false REMOVE?
        arrows	 :   true,
        navigator:   true,
        easeFunc :   false,
        easeTime :   false,
        after	 :   false,
        tracking :   false,
        tracking_pre :  false,
        debug    :   false//false
	},_metadata,options);
	
	var that = el;
	
	if(!$.ajaxHistory)
		_options.history = false;
	
	//private attrs
	var _pw = false;//panels width
	var _pc = false;//panels count
	var _vw = false;//viewer width
	//#?var _nw = false;//? width
	var _current = 1;
	
		
	//INIT PUBLIC ATTRS
	_data("width", 0);
	_data("current", _current);
	
	//PUBLIC EVENTS
	$(that).bind("left", _left);
	$(that).bind("right", _right);
	$(that).bind("go", _go);
	$(that).bind("after", _after);
	
	
	
	//$(that).data("panel_width", _pw);
	
	_html();
	_set_options();
	_set_panel_width();
	_set_container_width();
	_set_current_panel();
	_check_arrows();
	_arrows();
	_keyword();
	_navigator();
	_move();
	
	_debug();
	
	
	
	function _left(){
		var _goto = 0;
		var _position = _current - 1; 
		if (_current == 1) {
			_goto = _pc - 1;
        } else {
            _goto = _position - 1;
        };
        //console.log(_goto);
        
        $(that).trigger("go", [_goto]);
          
        var _history = _goto + 1;        
        if(_options.history)
            location.hash = _history;
            
	}
	function _right(){
		var _goto = 0; 
		var _position = _current - 1; 
		if (_current == _pc) {
            _goto = 0;
        } else {
            _goto = _position + 1;
        };
        //console.log(_goto);
		
		$(that).trigger("go", [_goto]);
		
        if(_options.history)
            location.hash = _current;
            
	}
	function _go(ev, nr){
		
		//console.log(ev);
		//console.log(nr);
		//console.log(_current);
		//if(!ev && (nr + 1) == _current)
		//	return;
			
			
		var _x = - ( _pw * nr);
        _current = _data("current", nr + 1);	
        
        $("div.yslider-viewer",that).animate({scrollTop : 0 },_options.easeTime,_options.easeFunc);
    
        $("div.yslider-container",that)
        .animate({left: _x } ,_options.easeTime,_options.easeFunc);
        
		$(that).trigger("after");
	}
	function _after(){
		if(_options.after)
			_after();
	}
	
	function _is_valid_current(){
		return _options.history && location.hash && parseInt(location.hash.slice(1)) <= _pc;   
	}
	
	function _move(){
		$(that).trigger("go", [(_current - 1)]);
		
		if(_options.history)
            location.hash = _current;

	}
	function _debug(){
		if(_options.debug){
			$('div.yslider-viewer',that).css({
				width : 10653,
				overflow : 'auto'
			});
		}
	}
	function _keyword(){
		var sc = _options.shortcut;
        if(sc && sc[0] && sc[1]){
            $(document).keydown(function(e){
                if (e == null) { // ie
                    keycode = event.keyCode;
                } else { // mozilla
                    keycode = e.which;
                }
                //settabili - se non è nascosto muovi
                if(!($(that).css("display") === "none")){
                    if(keycode == sc[0]){ // display previous image
                       //$("div.yslider-navl a",el).trigger("click", el);
                       $(that).ycodaslider("left");
                    } else if(keycode == sc[1]){ // display next image
                       //$("div.yslider-navr a",el).trigger("click", el);
                       $(that).ycodaslider("right");
                    }  
                }
            });
        }
	}
	function _arrows(){
		if(_options.arrows)
			new YCodaSlider.Arrows(that, _options);
	}

	function _navigator(){
		if(_options.navigator){
			new YCodaSlider.Navigator(that, _options);
		}
	}
	function _check_arrows(){
		if(_pc <= 1)
			_options.arrows = false;
	}
	function _set_current_panel(){
		if(_is_valid_current()){
			_current   = parseInt(location.hash.slice(1)) || 1;
		}
		
	}
	function _set_container_width(){
		var _container = $("div.yslider-container",that);
        _container.css("width" , _vw);
	}
	function _set_panel_width(){
		var _panels = $(that).find("div.yslider-panel");
        _pw = _options.width || _panels.width();
        _pc = _panels.size();//panel
        _vw = _pw * _pc;//viewer
        //#?_nw = _pw;//el.ycodaslider.pc * 2 ?
        
        _data("width", _pw);
        //??_data("viewer", _vw);
        //??_data("count", _pc)
        
	}
	function _set_options(){

		if(_options.width){
            _set_width(_options.width);
        }

        if(_options.height){
        	_set_height(_options.height);
        }
        
        if(_options.scroll){
        	_set_scroll();
        }

	}
	function _html(){
		//#?el.id = el.ycodaslider.options.id || el.id || 'yslider-' + YCodaSlider.Base.cnt;//id
        
        var _html = '<div class="yslider-wrap"><div class="yslider-viewer"><div class="yslider-container">';
        var _panels = $(".yslider-panelwrapper", that);
        
        $(that).empty();
        $(that)
        .append(_html);
        
        $('.yslider-container', that).append(_panels);
        _panels.wrap('<div class="yslider-panel">');
        
        //#?if(!_options.sidebars)
        //#?    $(".yslider-wrap", el).width($(".yslider-wrap", that).width() - 100);
	}	

	function _set_scroll(){
		$('.yslider-viewer', that).css({"overflow-y":"auto"});
	}
	function _set_height(height){
		$('.yslider-viewer', that).css("height", height);
	}
	function _set_width(width){
		$(that).css("width", width + 100);
        $('.yslider-panel,.yslider-viewer', that).css("width", width);
	}
	function _data(key,val){
		if(val){
			$(that).data(key,val);
			return val;
		}else{
			return $(that).data(key);
		} 
	}
	
};

YCodaSlider.Utils = {
	css : function(url){
		$('head').append('<link type="text/css" href="'+url+'" rel="stylesheet" />');
	}
};

YCodaSlider.Arrows = function(el, options){
	
	var that = el;
	
	_arrows();
	_debug();
	_bind();
	
	function _arrows(){
		var _viewer = $("div.yslider-viewer",that);
	    _viewer.before('<div class="yslider-navl"><a href="#">Left</a></div>');
	    _viewer.after('<div class="yslider-navr"><a href="#">Right</a></div>');
	}
    function _debug(){
    	if(options.debug){
    		$(".yslider-navl" , that).css("left","-50px");
    	}
    }
    function _bind(){
    	
        $("div.yslider-navl a",that).click(function(){
        	$(that).ycodaslider("left");
            return false;
        });
        $("div.yslider-navr a",that).click(function(){
        	$(that).ycodaslider("right");
            return false;
        });
        
    }
    
};

YCodaSlider.Navigator = function(el, options){
	
	var that = el;
	
	_navigator();
	_bind();
	
	//PUBLIC EVENTS
	$(that).bind("go", _go);
	
	function _go(ev,nr){
		//alert("GO NAVIGATOR");
		$(".yslider-nav",that).find("a").not(nr).removeClass("current");
		$(".yslider-nav",that).find("a").eq(nr).addClass("current");
	}
	
	function _navigator(){
		
		var _viewer = $("div.yslider-viewer",that);
		_viewer.before('<div class="yslider-nav"><ul></ul></div>');
	    
	    var _nav = $("div.yslider-nav ul",that);
	    
	    $("div.yslider-panel",that)
	    .each(function(n) {
	        var _lp = $("div.yslider-panelwrapper",this).attr("title") || (n+1);
	        var _class = '';
	        var _prefix = '';
	        if(options.tracking_pre)
	        	_prefix = options.tracking_pre + '/';
	        	 
	        if(options.tracking && $.fn.janalytics)
	        	_class = "tracking {label : '/ycodaslider/"+_prefix+_lp+"'}";
	        
	        if(options.history){
	            $('<li><a class="'+_class+'" href="#' + (n + 1) + '">' + _lp + '</a></li>')
	            .appendTo(_nav);
	            // doppia invocazione. sia con il vecchio history che con il nuovo.
	            //.click(function(){
	            //   return false;//semp    
	            //}); 
	        }else{
	            $('<li><a class="'+_class+'" href="#">' + _lp + '</a></li>')
	            .appendTo(_nav)
	            .click(function(){
	               return false;    
	            });
	        }
	    });
	    
	    
	    if(options.width){
	    	_nav.parent().css("width" , options.width);
	    }else{
	        _nav.parent().css("width" , $(that).ycodaslider("width"));
	    } 
	}
	
	function _bind(){
		        
        // Tab nav
        $("div.yslider-nav a",that).each(function(z) {
            //console.log(this);
            $(this).bind("click", function() {
            	//console.log("invoco go");
            	$(that).ycodaslider("go", [z]);
            	//return false;
            });
        });
        
        
	}
	
};

YCodaSlider.Gallery = function(){
	return this.each(function(nr){
            var that = this;
            var _img = $('img', that);
           _img.each(function(z){
                $(this).wrap('<div style="padding:0px" class="yslider-panelwrapper" title="'+ (z + 1) +'">');
            });
    });
};

YCodaSlider.Lazy = function(options){
	
	var _options = $.extend({
	     selector   : 'img',
	     //type       : "img",
	     placeholder: "",
	     classcss	: "placeholder",
	     threshold  : 1,
	     effect     : "fadeIn",
	     effectspeed: "slow"
	}, options);
	
	return this.each(function(nr){
		var that = this;
		var _target = $(_options.selector, that);
		var _total = _target.size();
		var _current = _get_current();
		var _call = 0;
		
		
		_parse(false, _current);
		//PUBLIC EVENTS
		$(that).bind("after", _parse);
		
		function _parse(ev, current){
			/*
			 * il costruttore non aspetta ycodaslider. se devo risparmiare bytes lo devo fare subito.
			 * ycodaslider all'avvio invocherà l'evento after.
			 * il primo lo ignoro per evitare di fare lo stesso parsing due volte. 
			 */
			_call++;
			if(_call != 2){//ignoro il primo evento.
				var _c = ev ? ($(that).ycodaslider("current") - 1) : current;
				//console.log(_c);
				_target.each(function(nr){
					if(!_is_near(nr, _c, _total, _options.threshold)){
						//console.log("nascondo" + nr);
						_disappear(this, ev);
					}else{
						_appear(false, nr);
					}
				});
			}
		}
		
		function _appear(ev, nr){
			var _img = _target.eq(nr);
			var _src = _img.attr("original");
			if(_src){
				_img
				.hide()
				.attr("src", _src)
				.attr("original", "")
				[_options.effect](_options.effectspeed)
				.removeClass(_options.classcss);
			}
		}
		
		function _disappear(el, ev){
			var _src = el.src;
			//console.log(_src);
			if(!ev){
				$(el)
				.attr("src", _options.placeholder)
				.attr("original", _src)
				.addClass(_options.classcss);
			}
		}
		
		function _get_current(){
			return location.hash && location.hash.slice(1) <= _total ? (location.hash.slice(1) - 1) : 0;//mmmh
		}
		
		function _is_near(nr, current, total, threshold){
			var _tmax = current + threshold;
	        var _tmin = current - threshold;
	        if(_tmin < 0) _tmin = 0; 
	        if(_tmax > total)  _tmax = total;
	        var _left = !((current - threshold) >= 0);
	        var _right = (current + threshold) >= total;
	        var _flag = false;
	        if(threshold == 0){
	            return nr == current;
	        }else{
	            if(_left || _right)
	                _flag = _expr(nr, total, threshold, _left, _right); 
	            return(
	                nr === current ||                //1 : current è uguale 
	                (nr >= _tmin && nr <= _tmax) ||  //nr è compreso nella soglia?
	                _flag
	            );
	        }
		}
		
		function _expr(nr, total, threshold, left, right){
			if(left){
	            return (nr >= (total - threshold) && nr <= total);// se siamo a sinistra
	        }  
	        if(right){
	            return (nr >= 0 && nr <= threshold);// se siamo a sinistra
	        }
		}
	});
};

YCodaSlider.Code = function(){
	return this.each(function(nr){
			
		var that = this;
		
		var _js = $("a",this);
	    var _j = $(this).parent();
	    
		_js.each(function(nr){
		   var _href = $(this).attr("href");
		   var _that = this;
		   var _css = $(this).attr("class");
		   var _html = '<div class="yslider-panelwrapper" title="'+ $(_that).text() +'">';
		   $(_that).wrap(_html);
	       var _panel = $(_that).parent();
	       //console.log(panel);
	       _panel.empty();
	       $.get(_href, function(data){
		   	   _panel.html('<pre><code class="'+_css+'">'+(_html_encode(data))+'</code></pre>');
		   	   if($.fn.chili)
		   	   	$("code", _panel).chili();
		   });
		   
		});

		function _html_encode(s) {
	        var str = new String(s);
	        str = str.replace(/&/g, "&amp;");
	        str = str.replace(/</g, "&lt;");
	        str = str.replace(/>/g, "&gt;");
	        str = str.replace(/"/g, "&quot;");
	        return str;
    	}
    	
	});
};

YCodaSlider.Feeds = function(){
	return this.each(function(nr){
		if(!$.fn.gFeed){
			alert("Include jQuery gFeed plugin");
			return;
		}
		
		var that = this;
        var _feeds = $("a",this);
        _feeds.each(function(nr){
            var _that = this;
            var _href = $(_that).attr("href");
            var _html = '<div class="yslider-panelwrapper" title="'+ $(_that).text() +'">';
            $(_that).wrap(_html);
            var _panel = $(_that).parent();
            _panel.empty();
            
            $(_that).gFeed( { title : _href, target: _panel } ); 
        });
	});
};


$.fn.ycodaslider = YCodaSlider.Init;
$.fn.ycodagallery = YCodaSlider.Gallery;
$.fn.ycodalazy = YCodaSlider.Lazy;
$.fn.ycodacode = YCodaSlider.Code;
$.fn.ycodafeeds = YCodaSlider.Feeds;
$.fn.ycodacss = YCodaSlider.Utils.css;

//return YCodaSlider;

})(jQuery);