//so this was my first backbone project and it isn't architected well at all
// ScreenshotView handles each screenshot and the objects next to it
// Library View handles most of the events on the page
// OptionsView is shared by the dropdowns
//
//issues:
// 1. The dropdowns should have their own collection instead of sharing one
// 2. The watcherView deals with one of the side effects of this, which was that rendering was happening in the wrong order
// 3. Referencing objects directly is a no no, instead the collections should be watching each other to see what happens
// 
// no plans to refactor, instead it will be rebuilt when new requirements come in

(function ($) {

    var Screenshot = Backbone.Model.extend({
        idAttribute  : "ssId"
    });
    
    var TotalCount = Backbone.Model.extend({
    	url: '../tools/screenshot/total'
    });

    var ReleaseList = Backbone.Collection.extend({
        url:'../tools/releases'
    });
    
    var PageList = Backbone.Collection.extend({
        url:'../tools/pages'
    });
    
    var ClassList = Backbone.Collection.extend({
        url:'../tools/classnames'
    });
    
    var TestList = Backbone.Collection.extend({
        url:'../tools/testnames'
    });
    
    var WatcherView = Backbone.View.extend({
    	el:$("#main"),
    	
    	events: {
    	    'click .filter-verified': 'rerenderFilter',
        	'change #releases': 'rerenderRelease',
        	'change #pages': 'rerenderPages',
        	'change #classes' : 'rerenderClasses',
        	'change #tests' : 'rerenderTests',
        },
        
        //the timeouts :(
        //they have to go
        rerenderFilter: function() {
        	releaseListView.getValues();
        	pageListView.getValues();
        	classListView.getValues();
        	testListView.getValues();
        	libraryView.collection.batch = 1;
        	triggerPoint = 100;
        	setTimeout(function() { libraryView.clearAndRender() }, 200);
       },
        
        rerenderRelease: function() {
        	pageListView.getValues();
        	classListView.getValues();
        	testListView.getValues();
        	libraryView.collection.batch = 1;
        	triggerPoint = 100;
        	setTimeout(function() { libraryView.clearAndRender() }, 200);
        },
        
        rerenderPages: function() {
        	classListView.getValues();
        	testListView.getValues();
        	libraryView.collection.batch = 1;
        	triggerPoint = 100;
        	setTimeout(function() { libraryView.clearAndRender() }, 200);
        },
        
        rerenderClasses: function() {
        	testListView.getValues();
        	libraryView.collection.batch = 1;
        	triggerPoint = 100;
        	setTimeout(function() { libraryView.clearAndRender() }, 200);
        },
        
        rerenderTests: function() {
        	libraryView.collection.batch = 1;
        	triggerPoint = 100;
        	setTimeout(function() { libraryView.clearAndRender() }, 200);
        }
    });
    	
    
    var OptionView = Backbone.View.extend({
        tagName:"option",

        render:function () {
        	this.$el.attr('value', this.model.get('value')).html();
        	this.$el.text(this.model.get('value'));
      		return this;
        }
	});
	
	var OptionListView = Backbone.View.extend({
        el:$("#main"),
        
        initialize:function (options) {
        	this.options = options;
        	this.collection.on("reset", this.render, this);
        },
        
        getValues: function() {
            var options = {};
            var checked = this.$el.find(".filter-verified").is(":checked");
            options["verified"] = checked; 
            if (this.options.release) {
            	options["release"] = this.$el.find("#releases").val();
            }
            if (this.options.classname) {
            	options["classname"] = this.$el.find("#classes").val();
            }
            if (this.options.page) {
            	options["page"] = this.$el.find("#pages").val();
            }
        	this.collection.fetch({data:options, reset: true});
        },

        renderOption:function (item) {
            var optionView = new OptionView({
                model:item
            });
            this.$el.find(this.options.parentSelect).append(optionView.$el);
            optionView.render();
        },
        
        renderOptions:function (parentSelect) {
        	if ((parentSelect != this.options.parentSelect 
        			&& this.options.parentSelect != "#releases")
        			|| parentSelect == "all") {
        		this.getValues();
        	}
        },
        
        clearSelect: function() {
        	this.$el.find(this.options.parentSelect).empty();
        },

        render:function () {
        	var selectValue = this.$el.find(this.options.parentSelect).val();
        	this.clearSelect();
        	var that = this;
        	_.each(this.collection.models, function(item) {
        		that.renderOption(item);
        	});
        	var dd = document.getElementById(this.options.parentSelect.substr(1))
        	for (var i = 0; i < dd.options.length; i++) {
    			if (dd.options[i].text === selectValue) {
        			dd.selectedIndex = i;
        			break;
    			}
			}
        }
    });

    var Library = Backbone.Collection.extend({
        model:Screenshot,
        batch:1,
        url:'../tools/screenshot'
    });

    var ScreenshotView = Backbone.View.extend({
        tagName:"div",
        className:"screenshotContainer",
        template:$("#screenshotTemplate").html(),


        render:function () {
            var tmpl = _.template(this.template); 
            this.$el.html(tmpl(this.model.toJSON())); 
        	return this;
        },
        
        events: {
            "click .verify": "verifyScreenshot",
            "click .unverify": "unverifyScreenshot",
            "click .ssImage": "maximize",
            "change #comment": "updateComment"
        },
        
        updateComment: function() {
        	var qename=$('html,body').find("#qename").val();
        	var comment=this.$el.find("#comment").val();
        	console.log(comment);
        	if (qename && qename != "Select Name") {
        		this.model.save({comment: comment, qename:qename});
        	}
        },
        
        maximize:function () {
        	this.$el.find(".ssImage").toggleClass('ssImageMax');
        	this.$el.toggleClass('ssImageMax');
        	$('html,body').animate({scrollTop: this.$el.offset().top}, 500);
        	
        },

        verifyScreenshot:function () {
        	var qename=$('html,body').find("#qename").val();
        	var checked = $('html,body').find(".hide-when-verified").is(":checked");
        	if (qename && qename != "Select Name") {
        		this.model.save({verified: true, qename:qename});
            	this.$el.find(".verify").hide()
            	this.$el.find(".unverify").show()
        	}
        	if (checked) {
        		this.remove();
        		libraryView.checkScroll();
        		this.unbind();
        		libraryView.collection.remove(this.model);
        		$('#currentDisplayed').text(libraryView.collection.length);
        		$("#total").text(String(parseInt($("#total").text())-1))
        		
        	}
        },
        
        unverifyScreenshot:function () {
        	var qename=$('html,body').find("#qename").val();
        	if (qename && qename != "Select Name") {
        		this.model.save({verified: false, qename:qename});
            	this.$el.find(".verify").show()
            	this.$el.find(".unverify").hide()
        	}
        }
    });

    var LibraryView = Backbone.View.extend({
        el:$("#main"),

        initialize:function () {
        	this.isLoading = false;
        	this.collection.on("reset", this.render, this);
        	this.collection.on("add", this.renderScreenshot, this);
        	_.bindAll(this, 'checkScroll');
        	$(window).scroll(this.checkScroll);
        },
        
        events: {
        	'click #reset' : 'clearAndRender',
            'click #increase': 'increaseSize',
            'click #decrease': 'decreaseSize',
            'click #verifyAll': 'verifyAll',
            'click #unverifyAll': 'unverifyAll'
        },
        
        verifyAll:function () {
        	var qename=$('html,body').find("#qename").val();
        	var checked = $('html,body').find(".hide-when-verified").is(":checked");
        	if (qename && qename != "Select Name") {
        		_.each(this.collection.models, function(item) {
        			var screenshotView = new ScreenshotView({model:item});
        			screenshotView.model.save({verified: true, qename:qename});

        		});
        	    if (checked) {
					this.clearAndRender();
        		} else {
        			this.$el.find('.verify').hide();
        			this.$el.find('.unverify').show();
        		}
        	} 
        },
        
        unverifyAll:function () {
        	var qename=$('html,body').find("#qename").val();
        	var checked = $('html,body').find(".hide-when-verified").is(":checked");
        	if (qename && qename != "Select Name") {
        		_.each(this.collection.models, function(item) {
        			var screenshotView = new ScreenshotView({model:item});
        			screenshotView.model.save({verified: false, qename:qename});

        		});
        	    if (checked) {
					this.clearAndRender();
        		} else {
        			this.$el.find('.verify').show();
        			this.$el.find('.unverify').hide();
        		}
        	} 
        },
        
        increaseSize: function() {
        	var maxWidth = this.$el.find(".ssImage").css('max-width');
        	if (parseInt(maxWidth) < 1500) {
        		this.$el.find(".ssImage").css('max-width', parseInt(maxWidth)+100+'px');
        	}
        	
        	maxWidth = $(".screenshotContainer").css('max-width');
        	if (parseInt(maxWidth) < 1600) {
        		$(".screenshotContainer").css('max-width', parseInt(maxWidth)+100+'px');
        	}
        	
        	var height = this.$el.find(".verify").css('height');
        	if (parseInt(height) < 150) {
        		this.$el.find(".verify").css('height', parseInt(height)+8+'px');
				this.$el.find(".unverify").css('height', parseInt(height)+8+'px');
        	}
        	
        	var fontSize = this.$el.find(".labelContainer").css('font-size');
        	if (parseInt(fontSize) < 16) {
        	    this.$el.find(".labelContainer").css('font-size', parseInt(fontSize)+2+'px');
				this.$el.find(".labelContainer").css('font-size', parseInt(fontSize)+2+'px');
        	}
        },
        
        decreaseSize: function() {
        	var maxWidth = $(".ssImage").css('max-width');
        	if (parseInt(maxWidth) > 100) {
        		this.$el.find(".ssImage").css('max-width', parseInt(maxWidth)-100+'px');
        	}
        	
        	maxWidth = $(".screenshotContainer").css('max-width');
        	if (parseInt(maxWidth) > 200) {
        		this.$el.find(".screenshotContainer").css('max-width', parseInt(maxWidth)-100+'px'); 
        	}    	
        	
        	var height = this.$el.find(".verify").css('height');
        	if (parseInt(height) > 50) {
        		this.$el.find(".verify").css('height', parseInt(height)-8+'px');
				this.$el.find(".unverify").css('height', parseInt(height)-8+'px');
        	}
        	
        	var fontSize = this.$el.find(".labelContainer").css('font-size');
        	if (parseInt(fontSize) > 10) {
        	    this.$el.find(".labelContainer").css('font-size', parseInt(fontSize)-2+'px');
				this.$el.find(".labelContainer").css('font-size', parseInt(fontSize)-2+'px');
        	}
        },
        
        checkSize: function() {
        	//infinite scrolling adds models, this makes sure they are all the same size (TODO: maybe add a css rule instead?)
        	var maxWidth = $(".ssImage").css('max-width');
        	this.$el.find(".ssImage").css('max-width', parseInt(maxWidth)+'px');
        	
        	maxWidth = $(".screenshotContainer").css('max-width');
        	this.$el.find(".screenshotContainer").css('max-width', parseInt(maxWidth)+'px'); 	
        	
        	var height = this.$el.find(".verify").css('height');
        	this.$el.find(".verify").css('height', parseInt(height)+'px');
			this.$el.find(".unverify").css('height', parseInt(height)+'px');
        	
        	var fontSize = this.$el.find(".labelContainer").css('font-size');
        	this.$el.find(".labelContainer").css('font-size', parseInt(fontSize)+'px');
			this.$el.find(".labelContainer").css('font-size', parseInt(fontSize)+'px');
        },
        
        clearAndRender: function() {
        	this.$el.find("#screenshotList").empty();
        	this.filter(true);
        },
        
        //infinite scrolling
        checkScroll: function () {
			if( !this.isLoading && $(window).scrollTop() + $(window).height() + triggerPoint > $(document).height() ) {
				this.collection.batch += 1; // Load next page
				this.filter(false);
        	}

    	},
                 
        filter: function(reset) {
         	this.isLoading = true;
        	var checked = this.$el.find(".filter-verified").is(":checked");
        	var releases = this.$el.find("#releases").val();
        	var pages = this.$el.find("#pages").val();
        	var classnames = this.$el.find("#classes").val();
        	var testnames = this.$el.find("#tests").val();
        	this.collection.fetch({
        		data: {
        			verified:checked,
        			release:releases,
        			page:pages,
        			classname:classnames,
        			testname:testnames,
        			batch:this.collection.batch
        		},
        		reset: reset,
        		remove: reset,
        		success: function(res) {
        			if (res.length < 15) {
						triggerPoint = -100;
        			}
        			$('#currentDisplayed').text(res.length.toString());
        			libraryView.checkSize();
        		}
        	});
        	if (reset) {
        		this.updateTotal();
        	}
        	this.isLoading = false;
        },
        
        updateTotal: function() {
        	var totalCount = new TotalCount();
        	var checked = this.$el.find(".filter-verified").is(":checked");
        	var releases = this.$el.find("#releases").val();
        	var pages = this.$el.find("#pages").val();
        	var classnames = this.$el.find("#classes").val();
        	var testnames = this.$el.find("#tests").val();
        	totalCount.fetch({
        	    data: {
        			verified:checked,
        			release:releases,
        			page:pages,
        			classname:classnames,
        			testname:testnames
        		},
        		success: function(res) {
        			$("#total").text(res.get('total'))
        		}
        	});
        	
        },

        renderScreenshot:function (item) {
            var screenshotView = new ScreenshotView({
                model:item
            });
            this.$el.find("#screenshotList").append(screenshotView.$el);
            screenshotView.render();
        },
        
        render:function () {
        	var that = this;
        	_.each(this.collection.models, function(item) {
        		that.renderScreenshot(item);
        	});
        	return this;
        }
    });
    
    var triggerPoint = 100;
    
    var releaseList = new ReleaseList();
    var releaseListView = new OptionListView({collection:releaseList, parentSelect:"#releases"});
    releaseListView.getValues();
    
    var pageList = new PageList();
    var pageListView = new OptionListView({collection:pageList, parentSelect:"#pages", release: true, classname:true});
    pageListView.getValues();
    
    var classList = new ClassList();
    var classListView = new OptionListView({collection:classList, parentSelect:"#classes", release:true, page:true});
    classListView.getValues();
    
    var testList = new TestList();
    var testListView = new OptionListView({collection:testList, parentSelect:"#tests", release:true, page:true, classname:true});
    testListView.getValues();
    
    var libraryCollection = new Library();
    var libraryView = new LibraryView({collection:libraryCollection});
    libraryView.filter(true);
    
    var WatcherView = new WatcherView();

})(jQuery);