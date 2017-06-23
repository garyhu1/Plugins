class Drag {
	constructor(el,imgs) {
		this.el = el;
		this.imgs = imgs;
		this.init();
		this.active();
	}
	
	init() {
		var child = '';
		for(var i = 0;i < this.imgs.length;i++){
			child +=`
			  <li>
				 <div class="item"> <img src=${this.imgs[i]} /> </div>
			  </li>
			`;
		}
		this.el.html(child);
	}
	
	active() {
		var that = this;
		$('.item').each(function(index,element){
			//this为当前类名为item的div
			this.box = $(element).parent();
			//重置每个div的样式
			$(element).attr('index',index).css({
				position: 'absolute',
				left: this.box.offset().left,
				top: this.box.offset().top
			}).appendTo('.item_content');
			that.drag(element);
		});
	}
	
	drag(element) {
		var oldPointer = new Pointer();
		var oldPosition = new Position();
		
		var isDrag = false;
		var currentItem = null;
		var that = this;
		$(element).mousedown(function(e){
			e.preventDefault();
			oldPointer.x = e.clientX;
			oldPointer.y = e.clientY;
			oldPosition.left = $(element).position().left;
			oldPosition.top = $(element).position().top;
			
			isDrag = true;
			currentItem = element;
		});
		$(document).mousemove(function(e){
			var currentPointer = new Pointer(e.clientX,e.clientY);
			if(!isDrag){return false}
			$(currentItem).css({
				'opacity': '0.8',
				'z-index': 999
			});
			var left = currentPointer.x - oldPointer.x + oldPosition.left;
			var top = currentPointer.y - oldPointer.y + oldPosition.top;
			$(currentItem).css({
				left: left,
				top: top
			});
			
			currentItem.pointer = currentPointer;
			
			that.collisionCheck(currentItem);
		});
		$(document).mouseup(function(e){
			if(!isDrag){return false}
			isDrag = false;
			that.move(currentItem,function(){
				$(currentItem).css({
					"opacity": "1",
					"z-index": 0
				});
			});
		});
	}
	collisionCheck(element) {
		var currentItem = element;
		var direction = null;
		var that = this;
		$(currentItem).siblings(".item").each(function(){
			if(
				currentItem.pointer.x > this.box.offset().left&&
				currentItem.pointer.y > this.box.offset().top&&
				(currentItem.pointer.x < this.box.offset().left+this.box.width())&&
				(currentItem.pointer.y < this.box.offset().top+this.box.height())
			){
				if(currentItem.box.offset().top < this.box.offset().top){
					direction = "down";
				}else if(currentItem.box.offset().top > this.box.offset().top){
					direction = "up";
				}else {
					direction = "normal";
				}
				that.swap(this,currentItem,direction);
			}
		});
	}
	swap(el1,el2,direction){
		//el2为手指拖动的元素
		if(el1.moving){
			return false;
		}
		var that = this;
		var directions = {
			normal: function(){
				var saveBox = this.box;
				this.box = el2.box;
				el2.box = saveBox;
				that.move(el1);
				$(this).attr('index',this.box.index());
				$(el2).attr('index',el2.box.index());
			},
			up: function() {
				var box = el1.box;
				var node = el1;
				var startIndex = node.box.index();
				var endIndex = el2.box.index();
				for(var i = startIndex; i < endIndex; i++) {
					var nextNode = $(".item_content .item[index=" + (i + 1) + "]")[0];
					node.box = nextNode.box;
					$(node).attr("index", node.box.index());
						that.move(node);
						node = nextNode;
					}
					el2.box = box;
					$(el2).attr("index", box.index());
			},
			down: function() {
				var box = el1.box;
				var node  = el1;
				var startIndex = el2.box.index();
				var endIndex = el1.box.index();
				for(var i = endIndex;i > startIndex;i--){
					var prevNode = $(".item_content .item[index=" + (i - 1) + "]")[0];
					node.box = prevNode.box;
					$(node).attr('index',node.box.index());
					that.move(node);
					node = prevNode;
				}
				el2.box = box;
				$(el2).attr('index',box.index());
			}
		}
		directions[direction].call(el1);
	}
	move(element,callback){
		$(element).stop(true).animate({
			left: element.box.offset().left,
			top: element.box.offset().top
		},500,function(){
			if(callback){
				callback.call(this);
			}
		});
	}
}

function Pointer (x,y){
	this.x = x;
	this.y = y;
}

function Position(left,top) {
	this.left = left;
	this.top = top;
}
