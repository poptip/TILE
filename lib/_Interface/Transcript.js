(function ($, R, _) {
	var rootNS = this;
	rootNS.Transcript = Transcript;
	function Transcript(args){
		/*
		 * args:
		 * 	text = newLine delimited text file
		 *  loc = element to receive transcript Editor 
		 */
		var self = this;
		
		this.lineArray = args.text;//{"text":(args.text||[]),"info":[],"shapes":[]};
		this.loc = $("#"+args.loc);
		this.infoBox = $("#"+args.infoBox);
		this.manifest=[];
		if(this.lineArray) {
			this._drawText();
			
		}
		this.curLine = null;
		this.curUrl=null;
		
		//global bind for when a shape is drawn in VectorDrawer
		$("body").bind("shapeDrawn",{obj:this},this._shapeDrawnHandle);
		//global bind for when user clicks to delete a shape item in ActiveBox
		$("body").bind("deleteItem",{obj:this},this._deleteItemHandle);
		//global bind for when a shape is changed in VectorDrawer (dragged/resized)
		$("body").bind("shapeChanged",{obj:this},this._updateItemHandle);
		
	}
	Transcript.prototype={};
	$.extend(Transcript.prototype, {
		_drawText: function(){
			var self=this;
			//if(!self.lineArray["links"]) self.lineArray["links"]=[];
			for (var i = 0; i < this.lineArray.length; i++) {
				var randD=new Date(); 
				var uid = "TILE_Transcript_" + i;
			
				if(!this.lineArray[i]) continue;
				//this.lineArray[i]=eval("("+this.lineArray[i]+")");
				if (!(this.lineArray[i].shapes)){
					this.lineArray[i].shapes=[];
				}
				if(!(this.lineArray[i].info)){
					this.lineArray[i].info=[];
				}
			
				$("<div id='" + uid + "' class='line'>" + this.lineArray[i].text + "</div>").appendTo(self.loc).mouseover(function(e){
			
					$(this).addClass("trans_line_hover");
					var index = parseInt($(this).attr("id").substring($(this).attr("id").lastIndexOf("_")+1),10); 
					
				}).mouseout(function(e){
					$(this).removeClass("trans_line_hover");
				}).mousedown(function(e){
					$(this).removeClass("trans_line_hover");
					var index = parseInt($(this).attr("id").substring($(this).attr("id").lastIndexOf("_")+1),10);
					if ($(this).hasClass("line_selected")){
						//line is being de-selected
						$(this).removeClass("line_selected");	
						self._lineDeSelected(index);
					} else{
						$(".line_selected").removeClass("line_selected");
						
						$(this).addClass("line_selected");
						 
					
						self._lineSelected(index);
					}
				});
			}
		},
		_addLines:function(data,url){
			var self=this;
			if(url&&(self.curUrl!=url)){
				if(self.curUrl) self.manifest[self.curUrl].lines=self.lineArray;
				//new manifest area being created
				if(!self.manifest[url]) {
					self.manifest[url]={
						"lines":[],
						"url":url
					};
				}
				self.curUrl=url;
			}
			self.lineArray=data;
			self.manifest[self.curUrl].lines=self.lineArray;
			self.loc.empty();
			self._drawText();
		},
		//called when shapeDrawn is triggered
		_shapeDrawnHandle:function(e,data){
			var self=e.data.obj;
			if(self.lineArray[self.curLine]==null){
				//delete shape - no line selected
				$("body:first").trigger("VD_REMOVESHAPE",[data.id]);
				return;
			}
			
			self.lineArray[self.curLine].shapes.push(data);
			self._lineSelected(self.curLine);
			//$("body:first").trigger("UpdateLine",JSON.stringify(this.lineArray[index]));
		},
		//called when a user clicks to delete an item in ActiveBox
		_deleteItemHandle:function(e,id){
			var self=e.data.obj;
			//first need to find the shape
 			if(!self.lineArray[self.curLine]){
				//we hopefully don't get here
				$("body:first").trigger("VD_REMOVESHAPE",[id]);
				return;
			}
			for(s in self.lineArray[self.curLine].shapes){
				if(self.lineArray[self.curLine].shapes[s].id==id){
					//found shape
					$("body:first").trigger("VD_REMOVESHAPE",[id]);
					self.lineArray[self.curLine].shapes[s]=null;
					self.lineArray[self.curLine].shapes=$.grep(self.lineArray[self.curLine].shapes,function(o){
						return ($(o)!=null);
					});
				}
			}
			
			
		},
		//called when a user changes something on an item attached to a line 
		//right now only works for shapes
		_updateItemHandle:function(e,shapes){
			var self=e.data.obj;
			if(!self.lineArray[self.curLine]){
				//we hopefully don't get here
				$("body:first").trigger("VD_REMOVESHAPE",[shape.id]);
				return;
			}
			self.lineArray[self.curLine].shapes=shapes;
			$("body:first").trigger("TranscriptLineSelected",JSON.stringify(self.lineArray[self.curLine]));
		},
		//called when a line object is selected
		//users can select on or multiple lines
		_lineSelected:function(index){
			var self=this;
		 	//	vd.clearShapes();
				if(index!=self.curLine) {
					self.curLine=index;
					
					//clear all shapes
					$("body:first").trigger("clearShapes");
					//load any shapes from curLine
					if(self.lineArray[self.curLine].shapes){
						$("body:first").trigger("loadShapes",[self.lineArray[self.curLine].shapes]);
					}
				
				}
				$("body:first").trigger("TranscriptLineSelected",JSON.stringify(this.lineArray[index]));
			
		},
		_lineDeSelected:function(index){
			var self=this;
			self.curLine=null;
			$("body:first").trigger("TranscriptLineSelected",[null]);
		},
		exportLines:function(){
			var self=this;
			return self.lineArray;
		},
		bundleData:function(json){
			var self=this;
			//take json and modify it
			for(p in json.pages){
				//match up lines with transcript manifest
				if(self.manifest[json.pages[p].url]) {
					for(r in self.manifest[json.pages[p].url].lines){
						self.manifest[json.pages[p].url].lines[r].text=self.manifest[json.pages[p].url].lines[r].text.replace("'","\'");
					}
					json.pages[p].lines=self.manifest[json.pages[p].url].lines;
				}
			}
			return json;
		}
	}
	);})(jQuery, Raphael, _);