(function ($) {

    var Screenshot = Backbone.Model.extend({
        idAttribute  : "ssId"
    });
    
    var Release = Backbone.Model.extend({
    	
    });

    var ReleaseList = Backbone.Collection.extend({
        model:Release,
        url:'../tools/releases'
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
            this.model.save({unverified: false});
            this.$el.find(".verify").hide()
            this.$el.find(".unverify").show()
        },
        
        unverifyScreenshot:function () {
            this.model.save({unverified: true});
            this.$el.find(".verify").show()
            this.$el.find(".unverify").hide()
        }
    });

    var LibraryView = Backbone.View.extend({
        el:$("#screenshots"),

        initialize:function () {
        	this.collection.on("reset", this.render, this);
        },
        
        events: {
            'click .filter-verified': 'filter'
        },
        
        clearScreen: function() {
        	this.$el.find("#screenshotList").empty();
        },
        
        filter: function() {
        	var checked = this.$el.find(".filter-verified").is(":checked");
        	this.collection.fetch({
        		data: {verified:checked}, 
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
    
    var libraryCollection = new Library();
    var libraryView = new LibraryView({collection:libraryCollection});
    libraryView.filter();

})(jQuery);