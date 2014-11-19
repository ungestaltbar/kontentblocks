//_.extend(KB, Backbone.Events);

KB.currentModule = {};
KB.currentArea = {};
// ---------------
// Collections
// ---------------

/*
 * ViewsCollection, not a Backbone collection
 * simple getter/setter access point to views
 */
KB.Views = {
    Modules: new KB.ViewsCollection(),
    Areas: new KB.ViewsCollection(),
    Context: new KB.ViewsCollection()
};
/*
 * All Modules are collected here
 * Get by 'id'
 */
KB.Modules = new Backbone.Collection([], {
    model: KB.Backbone.ModuleModel
});

/*
 *  All Areas are collected in this Backbone Collection
 *  Get by 'instance_id'
 */
KB.Areas = new Backbone.Collection([], {
    model: KB.Backbone.AreaModel
});

/*
 * Init function
 * Register event listeners
 * Create Views for areas and modules
 * None of this functions is meant to be used directly
 * from outside the function itself.
 * Use events on the backbone items instead
 * handle UI specific actions
 */
KB.App = (function () {

    function init() {
        // Register basic events
        KB.Modules.on('add', createModuleViews);
        KB.Areas.on('add', createAreaViews);
        KB.Modules.on('remove', removeModule);

        // Create views
        addViews();
        // get the UI on track
        KB.Ui.init();
    }

    /**
     * Iterate and throught raw areas as they were
     * output by toJSON() method on each area upon
     * server side page creation
     *
     * Modules are taken from the raw areas and
     * collected seperatly in their own collection
     *
     * View generation is handled by the 'add' event callback
     * as registered above
     * @returns void
     */
    function addViews() {
        // iterate over raw areas
        _.each(KB.payload.Areas, function (area) {
            // create new area model
            KB.Areas.add(new KB.Backbone.AreaModel(area));
        });

        // create models from already attached modules
        _.each(KB.payload.Modules, function (module) {
            var m = KB.Modules.add(module);
            var areaView = KB.Areas.get(m.get('envVars').area).view;
            areaView.addModuleView(m.view);
        });

    }


    /**
     * Create views for modules and add them
     * to the custom collection
     * @param module Backbone Model
     * @returns view
     */
    function createModuleViews(module) {
        _K.info('ModuleViews: new added');
        // assign the full corresponding area model to the module model
        //module.set('area', KB.Areas.get(module.get('area')));

        // create view
       KB.Views.Modules.add(module.get('instance_id'), new KB.Backbone.Backend.ModuleView({
            model: module,
            el: '#' + module.get('instance_id')
        }));

        // re-init tabs
        // TODO: don't re-init globally
        KB.Ui.initTabs();
    }


    /**
     * Create Area Views
     * @param area Backbone Model
     * @returns void
     */
    function createAreaViews(area) {
        KB.Views.Areas.add(area.get('id'), new KB.Backbone.Backend.AreaView({
            model: area,
            el: '#' + area.get('id') + '-container'
        }));
    }


    /**
     * Removes a view from the collection.
     * The collection will destroy corresponding views
     * @param model Backbone Model
     * @returns void
     */
    function removeModule(model) {
        KB.Views.Modules.remove(model.get('instance_id'));
    }


    // revealing module pattern
    return {
        init: init
    };

}(jQuery));

// get started
KB.App.init();


jQuery(document).ready(function () {

    if (KB.appData && !KB.appData.config.frontend) {
        _K.info('Backend Modules Ready Event fired');
        KB.Views.Modules.ready();
    }

});