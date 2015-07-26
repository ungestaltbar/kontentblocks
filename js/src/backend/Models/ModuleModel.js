//KB.Backbone.ModuleModel
module.exports = Backbone.Model.extend({
  idAttribute: 'mid',
  initialize: function () {
    this.type = 'module';
    this.listenTo(this, 'change:area', this.areaChanged);
    this.subscribeToArea();
  },
  destroy: function () {
    this.unsubscribeFromArea();
    this.stopListening(); // remove all listeners
  },
  setArea: function (area) {
    this.setEnvVar('area', area.get('id'));
    this.setEnvVar('areaContext', area.get('context'));
    this.set('areaContext', area.get('context'));
    this.set('area', area.get('id'));
    this.Area = area;
    this.subscribeToArea(area);
    //this.areaChanged();
  },
  areaChanged: function () {
    // @see backend::views:ModuleView.js
    this.View.updateModuleForm();
  },
  subscribeToArea: function (AreaModel) {
    if (!AreaModel) {
      AreaModel = KB.Areas.get(this.get('area'));
    }
    if (AreaModel){
      AreaModel.View.attachModuleView(this);
      this.Area = AreaModel;
    }
  },
  unsubscribeFromArea: function () {
    this.Area.View.removeModule(this);
  },
  setEnvVar: function (attr, value) {
    var ev = _.clone(this.get('envVars'));
    ev[attr] = value;
    this.set('envVars', ev);
  }
});