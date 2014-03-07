var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleModel = Backbone.Model.extend({
	idAttribute: 'instance_id',
    destroy: function() {
        var that = this;
        KB.Ajax.send({
            action: 'removeModules',
            instance_id: that.get('instance_id')
        }, that.destroyed);
    },
    destroyed: function() {

    },
    setArea: function(area){
        this.area = area;
    },
    areaChanged: function() {
        // @see backend::views:ModuleView.js
        this.view.updateModuleForm();
   }
});