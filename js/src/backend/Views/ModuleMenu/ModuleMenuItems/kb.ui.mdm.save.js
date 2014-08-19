KB.Backbone.ModuleSave = KB.Backbone.ModuleMenuItemView.extend({
    initialize: function(options){
        var that = this;
        this.options = options || {};
        this.parentView = options.parent;

        this.listenTo(this.parentView, 'kb::module.input.changed', this.getDirty);
        this.listenTo(this.parentView, 'kb::module.data.updated', this.getClean);

    },
    className: 'kb-save block-menu-icon',
    events: {
        'click': 'saveData'
    },
    saveData: function() {

        tinyMCE.triggerSave();

        KB.Ajax.send({
            action: 'updateModuleData',
            module: this.model.toJSON(),
            data: this.parentView.serialize(),
            _ajax_nonce: KB.Config.getNonce('update')
        }, this.success, this);

    },
    getDirty: function(){
        this.$el.addClass('is-dirty');
    },
    getClean: function(){
        this.$el.removeClass('is-dirty');
    },
    isValid: function() {

        if (this.model.get('master')){
            return false;
        }

        if (!this.model.get('disabled') &&
                KB.Checks.userCan('edit_kontentblocks')) {
            return true;
        }

        return false;
    },
    success: function(res){
        this.parentView.model.set('moduleData', res.newModuleData);
        console.log(this.parentView.model);
        KB.Notice.notice('Data saved', 'success');
    }
});