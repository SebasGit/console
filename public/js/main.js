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
            if (this.options.pages) {
            	options["pages"] = this.$el.find("pages").val();
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
        	this.clearSelect();
        	var that = this;
        	_.each(this.collection.models, function(item) {
        		that.renderOption(item);
        	});
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
        },
        
        events: {
            'click .filter-verified': function(){this.updateOptions("all"), this.filter()},
        	'change #releases': function(){this.updateOptions("#releases"), this.filter()},
        	'change #pages': function(){this.updateOptions("#pages"), this.filter()},
        	'change #classes' : function(){this.updateOptions("#classes"), this.filter()},
        	'change #tests' : 'filter',
        	'click #reset' : 'filter'
        },
        
        updateOptions: function(origin) {
        	Backbone.pubSub.trigger('renderOptions', origin);
        },
        
        clearScreen: function() {
        	this.$el.find("#screenshotList").empty();
        },
        
        filter: function() {
        	var checked = this.$el.find(".filter-verified").is(":checked");
        	var releases = this.$el.find("#releases").val();
        	var classnames = this.$el.find("#classes").val();
        	var testnames = this.$el.find("#tests").val();
        	this.collection.fetch({
        		data: {
        			verified:checked,
        			release:releases,
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
    var pageListView = new OptionListView({collection:pageList, parentSelect:"#pages"});
    pageListView.getValues();
    
    var classList = new ClassList();
    var classListView = new OptionListView({collection:classList, parentSelect:"#classes", release:"release"});
    classListView.getValues();
    
    var testList = new TestList();
    var testListView = new OptionListView({collection:testList, parentSelect:"#tests", release:"release", classname:"classname"});
    testListView.getValues();
    
    var libraryCollection = new Library();
    var libraryView = new LibraryView({collection:libraryCollection});
    libraryView.filter();

})(jQuery);