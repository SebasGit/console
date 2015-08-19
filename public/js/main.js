(function ($) {

	Backbone.pubSub = _.extend({}, Backbone.Events);

    var Screenshot = Backbone.Model.extend({
        idAttribute  : "ssId"
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
        	Backbone.pubSub.on('renderOptions', this.renderOptions, this);
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
            Backbone.pubSub.trigger('filter');
        },
        
        renderOptions:function (parentSelect) {
        	this.getValues();
        },
        
        clearSelect: function() {
        	this.$el.find(this.options.parentSelect).empty();
        },

        events: {
            'click .filter-verified': function(){this.renderOptions("all")},
        	'change #releases': function(){this.renderOptions("#releases")},
        	'change #pages': function(){this.renderOptions("#pages")},
        	'change #classes' : function(){this.renderOptions("#classes")},
        	'change #tests' : function(){Backbone.pubSub.trigger('filter');},
        	'click #reset' : function(){Backbone.pubSub.trigger('filter');}
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
        	return this;
        }
    });

    var Library = Backbone.Collection.extend({
        model:Screenshot,
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
            "click .ssImage": "maximize"
        },
        
        maximize:function () {
        	this.$el.find(".ssImage").toggleClass('ssImageMax');
        	$('html,body').animate({scrollTop: this.$el.offset().top}, 500);
        },

        verifyScreenshot:function () {
        	var qename=$('html,body').find("#qename").val();
        	if (qename) {
        		this.model.save({verified: true, qename:qename});
            	this.$el.find(".verify").hide()
            	this.$el.find(".unverify").show()
        	}
        },
        
        unverifyScreenshot:function () {
        	var qename=$('html,body').find("#qename").val();
        	if (qename) {
        		this.model.save({verified: false, qename:qename});
            	this.$el.find(".verify").show()
            	this.$el.find(".unverify").hide()
        	}
        }
    });

    var LibraryView = Backbone.View.extend({
        el:$("#main"),

        initialize:function () {
        	this.collection.on("reset", this.render, this);
        	Backbone.pubSub.on('filter', this.filter, this);
        },
        
        clearScreen: function() {
        	this.$el.find("#screenshotList").empty();
        },
                 
        filter: function() {
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
        			testname:testnames
        		},
        		reset: true
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
        	this.clearScreen();
        	var that = this;
        	_.each(this.collection.models, function(item) {
        		that.renderScreenshot(item);
        	});
        	return this;
        }
    });
    
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
    libraryView.filter();

})(jQuery);